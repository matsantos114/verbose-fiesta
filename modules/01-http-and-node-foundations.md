# Module 01: HTTP & Node.js Foundations

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Estimated time** | 6–8 hours |
| **Prerequisites** | Setup checklist in `COURSE.md` |
| **Project milestone** | `GET /health` and `POST /echo` in raw `node:http`, then rebuilt in Express 5 |

## Why this matters
Every backend framework is a convenience layer over HTTP. Once you understand the raw request and response, frameworks stop being magic, and bugs like "headers already sent", a hanging request, or an empty body become easy to read.

## Learning objectives
By the end you can:
- Trace a request from `curl` to your code and back.
- Read and write raw HTTP messages: method, target, headers, body, and status.
- Choose correct methods and status codes, and explain safety and idempotency.
- Explain the Node.js event loop and why blocking it hurts *every* user.
- Set up a strict, well-structured TypeScript Node project.

---

## Learn

### 1.1 What happens when you hit an endpoint
`curl http://localhost:3000/health`:
1. **Name resolution:** `localhost` → `127.0.0.1` (for a real domain, this is a DNS lookup).
2. **TCP connection:** a three-way handshake to port 3000. (In production, a **TLS** handshake follows so the traffic is encrypted.)
3. **The request bytes** are written to the socket.
4. **Node accepts the connection.** Its HTTP parser turns the bytes into a `req` object and gives you a `res` object to write to.
5. **Your handler runs** and writes the status line, headers, and body.
6. **The response bytes** go back over the socket. The connection may be kept alive for reuse.

### 1.2 Anatomy of an HTTP message
A request is plain text (in HTTP/1.1):
```
POST /v1/workouts HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 71

{"kind":"run","startedAt":"2026-10-11T07:00:00-07:00","distanceM":5000}
```
- **Request line:** method, target (path + query string), and version.
- **Headers:** key/value metadata. Names are case-insensitive.
- **Blank line**, then the **body**. The body is optional; GET requests normally have none.

A response:
```
HTTP/1.1 201 Created
Content-Type: application/json
Location: /v1/workouts/8f3c...

{"id":"8f3c...","kind":"run","distanceM":5000}
```

### 1.3 Methods and their semantics
| Method | Purpose | Safe? | Idempotent? |
|---|---|---|---|
| GET | Read | ✅ | ✅ |
| POST | Create, or trigger an action | ❌ | ❌ |
| PUT | Replace (or create at a known URL) | ❌ | ✅ |
| PATCH | Partial update | ❌ | Not guaranteed |
| DELETE | Remove | ❌ | ✅ |

- **Safe** means the request doesn't change server state.
- **Idempotent** means doing it once or N times leaves the same server state.

This matters because clients, proxies, and flaky mobile networks *retry*. A retried PUT is harmless. A retried POST might create a duplicate workout. You'll solve that in M8.

### 1.4 Status codes you'll actually use
| Code | Meaning | Example in this app |
|---|---|---|
| 200 OK | Success with a body | GET a workout |
| 201 Created | Resource created (include `Location`) | POST a workout |
| 202 Accepted | Accepted for async processing | CSV import (M8) |
| 204 No Content | Success, no body | DELETE a workout |
| 304 Not Modified | Client's cached copy is still valid | Stats with ETag (M8) |
| 400 Bad Request | Malformed or invalid input | `distanceM: "five km"` |
| 401 Unauthorized | Not authenticated (who are you?) | No session cookie |
| 403 Forbidden | Authenticated but not allowed | Non-admin editing built-in exercises |
| 404 Not Found | No such resource (for this user) | Unknown workout ID |
| 405 Method Not Allowed | Path exists, method doesn't (send `Allow`) | DELETE /health |
| 409 Conflict | Conflicts with current state | Duplicate custom exercise name |
| 413 Content Too Large | Body exceeds the limit | 50 MB JSON body |
| 422 Unprocessable Content | Well-formed but semantically invalid | `endedAt` before `startedAt` (if you choose to separate this from 400) |
| 429 Too Many Requests | Rate limited (send `Retry-After`) | Login brute force (M7) |
| 500 Internal Server Error | Your bug | Unhandled exception |
| 503 Service Unavailable | Temporarily unable to serve | DB down, readiness failing (M9) |

**4xx means the client did something wrong. 5xx means the server did.** Never return 500 for bad input.

### 1.5 Headers that matter
`Content-Type` (what the body is) · `Accept` (what the client wants back) · `Content-Length` · `Location` (where a new resource lives) · `Authorization` · `Cookie` / `Set-Cookie` (M7) · `Cache-Control`, `ETag`, `If-None-Match` (M8) · `X-Request-Id` (M3) · `Allow` (with 405) · `Retry-After` (with 429/503).

### 1.6 Statelessness
Each request carries everything the server needs to handle it: identity (a cookie or token), the input, and the target. The server keeps **no memory between requests in process memory**; state lives in the database or a cache. This is what lets you run multiple instances behind a load balancer (M10). In-memory storage in M2 is a deliberate temporary exception.

### 1.7 The Node.js event loop
- Your JavaScript runs on **one main thread**.
- I/O (sockets, files, DB queries) is handed off to the OS or libuv. When it completes, a callback or a resolved promise is queued.
- `await db.query(...)` **does not block**. While Postgres works, the event loop serves other requests.
- **CPU-bound synchronous work does block.** Examples: a tight loop computing stats over a million rows in JS, `JSON.parse` on a huge string, or synchronous crypto (`bcrypt.hashSync`). While it runs, *every* request waits, including `/health`.
- The fixes: do heavy aggregation in the database (M5), move work to background jobs (M8), or use worker threads for unavoidable CPU work.

### 1.8 A raw `node:http` server
```ts
import { createServer } from "node:http";

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(3000, () => console.log("listening on :3000"));
```
Notice everything you have to do yourself here:
- `req.url` includes the query string, so you have to parse it.
- There's no routing with path params (`/workouts/:id`).
- **The body is a readable stream.** You have to collect the chunks, enforce a size limit, and parse the JSON.
- There's no error handling: a thrown error in a handler can crash the process.

Express solves exactly these problems. After this module you'll know what `express.json()` and `app.get('/x/:id')` are doing for you.

### 1.9 Project setup essentials
- `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"module": "nodenext"`, `"moduleResolution": "nodenext"`, `"target": "es2023"`, `"outDir": "dist"`, `"rootDir": "src"`, `"verbatimModuleSyntax": true`. With `nodenext`, relative imports need the `.js` extension (`import { app } from "./app.js"`).
- Dev runner: `tsx watch src/server.ts`. Build: `tsc`. Prod: `node dist/server.js`. (Recent Node versions can strip TypeScript types natively; `tsx` is still the smoothest dev experience.)
- ESLint (typescript-eslint) + Prettier.
- `.gitignore`: `node_modules`, `dist`, `.env`.
- Split **`app.ts`** (builds and exports the app) from **`server.ts`** (calls `listen`). Tests (M6) import the app without opening a port.

---

## Build

- [ ] **B1** Create the `fittrack-api` repo. Run `git init` and add `.gitignore`, `.nvmrc`, and `package.json` with `"type": "module"`.
- [ ] **B2** Configure strict TypeScript, ESLint, and Prettier. Add scripts: `dev`, `build`, `start`, `typecheck`, `lint`.
- [ ] **B3** **Raw `node:http`:** `GET /health` returns `{ status: "ok", uptimeSeconds }`. Any other path returns 404 JSON. Any non-GET method on `/health` returns 405 with an `Allow: GET` header.
- [ ] **B4** **Raw `node:http`:** `POST /echo` reads the body stream, parses the JSON, and echoes it back. Invalid JSON → 400. Body over 100 KB → 413 (stop reading as soon as the limit is exceeded). Wrong `Content-Type` → 415.
- [ ] **B5** Inspect the traffic with `curl -v`. Save every request you've built so far in `requests.http` (or a Bruno collection).
- [ ] **B6** Rebuild B3 and B4 in **Express 5** with an `app.ts` / `server.ts` split. Use `express.json({ limit: "100kb" })`. Move the raw version into `playground/`.
- [ ] **B7** **Experiment:** add `GET /block` that busy-loops for 5 seconds. Hit `/block`, then immediately hit `/health` from a second terminal. Write down what you observe and why. Then delete the route.
- [ ] **B8** Commit with meaningful messages.

## Definition of done
- `npm run dev`, `npm run build && npm start`, `npm run typecheck`, and `npm run lint` all work.
- The Express app correctly handles 200, 404, 405, 400, 413, and 415.
- The B7 observation is written in your notes, in your own words.

---

## Checkpoint

1. List what happens between running `curl http://localhost:3000/health` and seeing the output. Name at least 5 steps.
2. Define *safe* and *idempotent*. Which of GET, POST, PUT, PATCH, and DELETE are idempotent? Why does that matter for a phone syncing over a flaky connection?
3. Which status code fits each case, and why? (a) `distanceM: "five km"`; (b) `GET /v1/workouts/<id that doesn't exist>`; (c) creating a custom exercise whose name you already used; (d) `DELETE /health`.
4. 401 vs 403: explain the difference with an example from a fitness app.
5. Why doesn't `await db.query()` block other requests, while a synchronous loop that computes stats over 1M rows does?
6. In raw `node:http`, why isn't the request body available as `req.body`? What is it instead, and what must you guard against while reading it?
7. **Code reading.** What's wrong here, and what error will Node throw?
   ```ts
   const server = createServer((req, res) => {
     if (req.url === "/health") {
       res.writeHead(200);
       res.end("ok");
     }
     res.writeHead(404);
     res.end("not found");
   });
   ```
8. Why separate `app.ts` (which builds the app) from `server.ts` (which calls `listen`)?
9. On a request, what does `Content-Type: application/json` tell the server, compared with `Accept: application/json`?
10. What does "stateless" mean for an HTTP API, and why does it matter when you run two instances of your server?

**Explain it back:** In 3–5 sentences, explain what Express does for you that raw `node:http` doesn't.

---

## Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Concepts understood
- [ ] 1.1 Request lifecycle
- [ ] 1.2 HTTP message anatomy
- [ ] 1.3 Methods, safety, idempotency
- [ ] 1.4 Status codes
- [ ] 1.5 Key headers
- [ ] 1.6 Statelessness
- [ ] 1.7 Event loop and blocking
- [ ] 1.8 Raw `node:http` (streams, routing, errors)
- [ ] 1.9 Project setup

### Checkpoint weak spots
—

### Notes
—

### Error log
| Error | Cause | Fix |
|---|---|---|
| | | |

### Open questions
—

## Resources
- MDN, HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP
- MDN, status codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- Node.js, the event loop: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
- Node.js `http` module: https://nodejs.org/api/http.html
- Express: https://expressjs.com/
