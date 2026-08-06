import itemRegistry from "./generated-items.json";
import itemMatches from "./generated-item-matches.json";
import vanillaRegistry from "./generated-vanilla.json";

const registry = itemRegistry as Record<string, string>;
const matches = itemMatches as Record<string, string>;
const vanilla = vanillaRegistry as Record<string, string>;

export function getRegisteredItemTexture(key: string): string | undefined {
  return registry[key.toLowerCase()];
}

export function getGeneratedItemMatch(key: string): string | undefined {
  return matches[key.toLowerCase()];
}

export function getRegisteredVanillaTexture(key: string): string | undefined {
  return vanilla[key.toLowerCase()];
}

export { registry as generatedItemRegistry };
export { matches as generatedItemMatches };
export { vanilla as generatedVanillaRegistry };
