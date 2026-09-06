import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

copyFileSync(resolve(root, "index.source.html"), resolve(root, "index.html"));
