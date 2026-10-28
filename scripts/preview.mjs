import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";

const root = fileURLToPath(
  new URL(
    process.argv.includes("--dist") ? "../dist/" : "../",
    import.meta.url,
  ),
);
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT inválida.");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".json": "application/json",
};
const server = createServer(async (req, res) => {
  const headers = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store",
  };
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { ...headers, Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const path = resolve(
      root,
      `.${pathname === "/" ? "/index.html" : pathname}`,
    );
    const relative = path.slice(root.length);
    if (
      !path.startsWith(`${root.endsWith(sep) ? root : root + sep}`) ||
      relative.split(/[\\/]/).some((part) => part.startsWith(".")) ||
      ![
        ".html",
        ".css",
        ".js",
        ".png",
        ".webp",
        ".jpg",
        ".svg",
        ".woff2",
      ].includes(extname(path))
    ) {
      res.writeHead(404, headers).end("Não encontrado.");
      return;
    }
    const info = await stat(path);
    if (!info.isFile()) {
      res.writeHead(404, headers).end("Não encontrado.");
      return;
    }
    const content = await readFile(path);
    res.writeHead(200, {
      ...headers,
      "Content-Type": types[extname(path)] || "application/octet-stream",
      "Content-Length": content.length,
    });
    res.end(req.method === "HEAD" ? undefined : content);
  } catch {
    res.writeHead(404, headers).end("Não encontrado.");
  }
});
server.on("error", (error) => {
  console.error(`Não foi possível iniciar a prévia: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Local: http://127.0.0.1:${port}`),
);
