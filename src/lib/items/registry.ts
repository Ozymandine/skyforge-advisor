import itemRegistry from "./generated-items.json";

const registry = itemRegistry as Record<string, string>;

export function getRegisteredItemTexture(key: string): string | undefined {
  return registry[key.toLowerCase()];
}

export { registry as generatedItemRegistry };

