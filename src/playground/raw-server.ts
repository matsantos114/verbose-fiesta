import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

const PORT = 3000;

// One helper so every JSON response is built the same way.
function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  extraHeaders: Record<string, string> = {},
): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    ...extraHeaders,
  });
  res.end(payload);
}

function handleHealth(_req: IncomingMessage, res: ServerResponse): void {
  sendJson(res, 200, {
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
  });
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  // req.url is only "path?query", so URL needs a base to parse it.
  const url = new URL(req.url ?? "/", "http://localhost");
  const method = req.method ?? "GET";

  console.log(`${method} ${url.pathname}`);

  if (url.pathname === "/health") {
    if (method === "GET") {
      handleHealth(req, res);
      return;
    } else {
      sendJson(res, 405, { error: "Method Not Allowed" }, { Allow: "GET" });
      return;
    }
    // Challenge 1: replace this comment with a 405 response.
  }

  sendJson(res, 404, { error: "Not Found", path: url.pathname });
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`raw server listening on http://localhost:${PORT}`);
});
