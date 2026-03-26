import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createNodeWebSocket } from "@hono/node-ws";
import path from "node:path";
import fs from "node:fs";
import { experimentsRouter } from "./routes/experiments.js";
import { loopsRouter } from "./routes/loops.js";
import { researchRouter } from "./routes/research.js";
import { debugRouter } from "./routes/debug.js";
import { insightsRouter } from "./routes/insights.js";
import { startFileWatcher } from "./watchers/file-watcher.js";

const args = process.argv.slice(2);
let host = "localhost";
let port = 8877;
let projectRoot = process.env.PROJECT_ROOT || process.cwd();

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--host" && args[i + 1]) host = args[++i];
  else if (args[i] === "--port" && args[i + 1]) port = parseInt(args[++i], 10);
  else if (args[i] === "--project" && args[i + 1]) projectRoot = args[++i];
}

export { projectRoot };

export const storageRoot: string | null = process.env.RESEARCHPAD_STORAGE_ROOT || null;

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use("/api/*", cors());

const wsClients = new Set<{ send: (data: string) => void; close: () => void }>();

export function broadcast(data: object) {
  const payload = JSON.stringify(data);
  for (const ws of wsClients) {
    try {
      ws.send(payload);
    } catch {
      wsClients.delete(ws);
    }
  }
}

app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onOpen(_event, ws) {
      wsClients.add(ws);
    },
    onClose(_event, ws) {
      wsClients.delete(ws);
    },
  }))
);

app.route("/api", experimentsRouter);
app.route("/api", loopsRouter);
app.route("/api", researchRouter);
app.route("/api", debugRouter);
app.route("/api", insightsRouter);

app.get("/api/health", (c) =>
  c.json({ status: "ok", project_root: projectRoot, clients: wsClients.size })
);

function resolveStaticRoot(): string {
  const thisDir = path.dirname(new URL(import.meta.url).pathname);
  const candidates = [
    path.resolve(thisDir, "static"),
    path.resolve(thisDir, "..", "static"),
    path.resolve(thisDir, "..", "..", "..", "researchpad", "server", "static"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "index.html"))) return dir;
  }
  return candidates[0];
}

const staticRoot = resolveStaticRoot();

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };
  return types[ext] ?? "application/octet-stream";
}

app.get("*", (c) => {
  const reqPath = new URL(c.req.url).pathname;
  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(staticRoot, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const content = fs.readFileSync(filePath);
    return c.body(content, 200, {
      "Content-Type": getMimeType(filePath),
      "Cache-Control": safePath.startsWith("assets/") ? "public, max-age=31536000, immutable" : "no-cache",
    });
  }

  const indexPath = path.join(staticRoot, "index.html");
  if (fs.existsSync(indexPath)) {
    return c.body(fs.readFileSync(indexPath), 200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });
  }
  return c.text("Frontend not built. Run 'make build-frontend' first.", 404);
});

const server = serve({ fetch: app.fetch, hostname: host, port }, (info) => {
  console.log(`\n  ResearchPad running at http://${info.address}:${info.port}`);
  console.log(`  Project root: ${projectRoot}`);
  if (storageRoot) {
    console.log(`  Storage root: ${storageRoot}`);
  } else {
    console.log(`  Warning: RESEARCHPAD_STORAGE_ROOT not set — eval artifact paths may not resolve`);
  }
  console.log(`  Watching: experiment_log*.tsv, .researchpad/experiments/{research,debug}/\n`);
});

injectWebSocket(server);

startFileWatcher(projectRoot);
