// Minimal big-endian NBT reader for Hypixel gzipped item data. Server-only.

export type NbtValue =
  | number
  | bigint
  | string
  | number[]
  | bigint[]
  | NbtValue[]
  | { [k: string]: NbtValue }
  | null;

class Reader {
  private view: DataView;
  private off = 0;
  constructor(private buf: Uint8Array) {
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  byte() {
    return this.view.getInt8(this.off++);
  }
  ubyte() {
    return this.view.getUint8(this.off++);
  }
  short() {
    const v = this.view.getInt16(this.off);
    this.off += 2;
    return v;
  }
  ushort() {
    const v = this.view.getUint16(this.off);
    this.off += 2;
    return v;
  }
  int() {
    const v = this.view.getInt32(this.off);
    this.off += 4;
    return v;
  }
  long() {
    const v = this.view.getBigInt64(this.off);
    this.off += 8;
    return v;
  }
  float() {
    const v = this.view.getFloat32(this.off);
    this.off += 4;
    return v;
  }
  double() {
    const v = this.view.getFloat64(this.off);
    this.off += 8;
    return v;
  }
  string() {
    const len = this.ushort();
    const slice = this.buf.subarray(this.off, this.off + len);
    this.off += len;
    return new TextDecoder("utf-8").decode(slice);
  }
  payload(type: number): NbtValue {
    switch (type) {
      case 1:
        return this.byte();
      case 2:
        return this.short();
      case 3:
        return this.int();
      case 4:
        return Number(this.long());
      case 5:
        return this.float();
      case 6:
        return this.double();
      case 7: {
        const len = this.int();
        const out: number[] = [];
        for (let i = 0; i < len; i++) out.push(this.byte());
        return out;
      }
      case 8:
        return this.string();
      case 9: {
        const itemType = this.ubyte();
        const len = this.int();
        const out: NbtValue[] = [];
        for (let i = 0; i < len; i++) out.push(this.payload(itemType));
        return out;
      }
      case 10: {
        const obj: { [k: string]: NbtValue } = {};
        for (;;) {
          const t = this.ubyte();
          if (t === 0) break;
          const name = this.string();
          obj[name] = this.payload(t);
        }
        return obj;
      }
      case 11: {
        const len = this.int();
        const out: number[] = [];
        for (let i = 0; i < len; i++) out.push(this.int());
        return out;
      }
      case 12: {
        const len = this.int();
        const out: number[] = [];
        for (let i = 0; i < len; i++) out.push(Number(this.long()));
        return out;
      }
      default:
        throw new Error(`Unsupported NBT tag type ${type}`);
    }
  }
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as unknown as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.replace(/\s/g, ""));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Decode a Hypixel base64+gzip NBT blob into its root compound. */
export async function decodeNbt(base64: string): Promise<Record<string, NbtValue>> {
  const raw = await gunzip(base64ToBytes(base64));
  const reader = new Reader(raw);
  const type = reader.ubyte();
  if (type !== 10) throw new Error("Root NBT tag is not a compound");
  reader.string();
  return reader.payload(10) as Record<string, NbtValue>;
}
