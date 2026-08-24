// tests/nbt.test.ts
// Minimal NBT decoder coverage: happy path with hand-crafted gzipped NBT,
// nested compounds/lists, and graceful failure on garbage input.

import { describe, expect, it } from "vitest";
import { decodeNbt } from "../src/lib/nbt.server";

// --- tiny NBT encoder (test fixture builder) -------------------------------

function u16(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}
function i32(value: number): number[] {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}
function str(text: string): number[] {
  const bytes = [...new TextEncoder().encode(text)];
  return [...u16(bytes.length), ...bytes];
}
function tagString(name: string, value: string): number[] {
  return [0x08, ...str(name), ...str(value)];
}
function tagInt(name: string, value: number): number[] {
  return [0x03, ...str(name), ...i32(value)];
}
function tagCompound(name: string, inner: number[]): number[] {
  return [0x0a, ...str(name), ...inner, 0x00];
}
function tagListOfStrings(name: string, values: string[]): number[] {
  const items = values.flatMap((v) => str(v));
  return [0x09, ...str(name), 0x08, ...i32(values.length), ...items];
}

async function gzip(bytes: number[] | Uint8Array): Promise<string> {
  // Flatten (fixture builders return nested arrays of byte-arrays).
  const flat =
    bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes.flat(Infinity) as number[]);
  const stream = new Blob([flat as unknown as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const buf = await new Response(stream).arrayBuffer();
  let binary = "";
  const view = new Uint8Array(buf);
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary);
}

// ---------------------------------------------------------------------------

describe("decodeNbt", () => {
  it("decodes a gzipped root compound with strings and ints", async () => {
    const nbt = tagCompound("", [tagString("Item", "STONE"), tagInt("Count", 5)]);
    const decoded = await decodeNbt(await gzip(nbt));
    expect(decoded["Item"]).toBe("STONE");
    expect(decoded["Count"]).toBe(5);
  });

  it("decodes nested compounds and string lists", async () => {
    const inner = tagCompound("meta", [tagString("id", "ASPECT_OF_THE_END")]);
    const list = tagListOfStrings("enchants", ["sharpness", "looting"]);
    const decoded = await decodeNbt(await gzip(tagCompound("", [inner, list])));

    const meta = decoded["meta"] as Record<string, unknown>;
    expect(meta["id"]).toBe("ASPECT_OF_THE_END");
    expect(decoded["enchants"]).toEqual(["sharpness", "looting"]);
  });

  it("rejects data whose root tag is not a compound", async () => {
    // 0x03 = TAG_Int at root, followed by garbage.
    const bytes = [0x03, ...str("x"), ...i32(1)];
    await expect(decodeNbt(await gzip(bytes))).rejects.toThrow(/not a compound/i);
  });

  it("throws on non-garbage-safe input (corrupt blob)", async () => {
    // Valid gzip wrapper around random junk.
    const junk = Array.from({ length: 64 }, (_, i) => (i * 37 + 11) % 256);
    await expect(decodeNbt(await gzip(junk))).rejects.toThrow();
  });

  it("rejects invalid base64", async () => {
    await expect(decodeNbt("!!!not base64!!!")).rejects.toThrow();
  });
});
