import http from "node:http";
import { readFileSync, statSync, existsSync } from "node:fs";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const defaultConfig = {
  title: "AAC Speech & Communication",
  description:
    "A simple, powerful AAC board for nonverbal individuals and people with speech challenges. Offline symbol boards, natural text-to-speech, and one-time premium unlocks with no subscription.",
  url: "http://127.0.0.1:4000",
  baseurl: "",
  google_play_url: "https://play.google.com/store/apps/details?id=com.cm.aac",
};

function parseConfig(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const config = {};
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, value] = match;
    if (value === ">-" || value === "|" || value === "|-") {
      continue;
    }

    config[key] = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }

  return config;
}

const config = {
  ...defaultConfig,
  ...parseConfig(path.join(rootDir, "_config.yml")),
  ...parseConfig(path.join(rootDir, "_config_dev.yml")),
};

function renderTemplate(content) {
  const withoutFrontMatter = content.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/, "");
  return withoutFrontMatter.replace(/{{\s*site\.([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
    return config[key] ?? "";
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
  }[ext] || "application/octet-stream";
}

function resolveRequestPath(requestPath) {
  const cleanedPath = requestPath.split("?")[0].replace(/^\/+/, "");

  if (!cleanedPath) {
    return path.join(rootDir, "index.html");
  }

  const candidate = path.join(rootDir, cleanedPath);
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    return path.join(candidate, "index.html");
  }

  if (existsSync(candidate)) {
    return candidate;
  }

  const htmlCandidate = `${candidate}.html`;
  if (existsSync(htmlCandidate)) {
    return htmlCandidate;
  }

  return candidate;
}

const port = Number(process.env.PORT || 4000);

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }

  const filePath = resolveRequestPath(req.url);

  if (!existsSync(filePath)) {
    res.statusCode = 404;
    res.end("Not Found");
    return;
  }

  const contentType = getContentType(filePath);
  res.setHeader("Content-Type", contentType);

  if (contentType.startsWith("text/") || contentType.includes("xml") || contentType.includes("html")) {
    const content = readFileSync(filePath, "utf8");
    res.end(renderTemplate(content));
    return;
  }

  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`AAC local dev server running at http://127.0.0.1:${port}/`);
});
