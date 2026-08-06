import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const readJson = async (name) => JSON.parse(await readFile(join(root, "src", "lib", "items", name), "utf8"));
const items = await readJson("generated-items.json");
const vanilla = await readJson("generated-vanilla.json");
const matches = await readJson("generated-item-matches.json");
const ignoredModels = Object.keys(items).filter((key) => key.endsWith("_model"));

console.log(`Item PNG entries: ${Object.keys(items).length}`);
console.log(`Vanilla PNG entries: ${Object.keys(vanilla).length}`);
console.log(`Generated match keys: ${Object.keys(matches).length}`);
console.log(`Ignored _model entries: ${ignoredModels.length}`);
console.log("Generated matcher status: OK");
