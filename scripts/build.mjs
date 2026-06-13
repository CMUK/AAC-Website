import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\r?\n+/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

const inputPath = path.join(rootDir, "styles.css");
const outputPath = path.join(rootDir, "styles.min.css");
const css = readFileSync(inputPath, "utf8");
const minified = minifyCss(css);
writeFileSync(outputPath, minified, "utf8");
console.log(`Created ${path.relative(rootDir, outputPath)} (${minified.length} bytes)`);
