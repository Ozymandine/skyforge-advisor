export interface SkyBlockItem {
  id: string;
  name: string;
  texture?: string;
  rarity?: string;
  category?: string;
  lore?: string[];
  enchanted?: boolean;
}

export type TextureSource =
  | "manual-override"
  | "exact-id"
  | "registry"
  | "alias"
  | "normalized-filename"
  | "vanilla"
  | "skycrypt"
  | "placeholder";

export interface ResolvedTexture {
  src?: string;
  candidates?: string[];
  source: TextureSource;
  attempted: string[];
}
