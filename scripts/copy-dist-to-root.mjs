import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const distIndex = join(dist, "index.html");
const rootAssets = join(root, "assets");

if (!existsSync(distIndex)) {
  throw new Error("dist/index.html was not found. Run npm run build first.");
}

const html = readFileSync(distIndex, "utf8");
const referencedAssets = new Set(
  Array.from(html.matchAll(/\/assets\/([^"']+)/g), (match) => match[1])
);

cpSync(dist, root, { recursive: true });

if (existsSync(rootAssets)) {
  for (const filename of readdirSync(rootAssets)) {
    if (/^index-.*\.(js|css)$/.test(filename) && !referencedAssets.has(filename)) {
      rmSync(join(rootAssets, filename));
    }
  }
}
