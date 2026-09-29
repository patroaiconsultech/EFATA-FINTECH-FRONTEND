import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");
const port = Number(process.env.PORT || 8080);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".ico": "image/x-icon",
};

const securityHeaders = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https: http:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { ...securityHeaders, "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      ...securityHeaders,
      "content-type": contentTypes[ext] || "application/octet-stream",
      "cache-control": ext === ".html" ? "no-store" : "public, max-age=31536000, immutable",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, { ...securityHeaders, "content-type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }
  if (pathname.includes("..")) {
    res.writeHead(400, { ...securityHeaders, "content-type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  const candidate = path.join(distDir, pathname === "/" ? "index.html" : pathname);
  fs.stat(candidate, (error, stat) => {
    if (!error && stat.isFile()) {
      sendFile(res, candidate);
      return;
    }
    sendFile(res, path.join(distDir, "index.html"));
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Efatà 777 frontend listening on 0.0.0.0:${port}`);
});
