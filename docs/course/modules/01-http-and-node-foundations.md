# Module 01: HTTP & Node.js Foundations

| | |
|---|---|
| **Status** | 🟨 In progress |
| **Content depth** | ✅ Full |
| **Estimated time** | 10–14 hours |
| **Prerequisites** | None. This module includes all setup. |
| **Project milestone** | A strict TypeScript project; `GET /health` and `POST /echo` built first in raw `node:http`, then rebuilt in Express 5 |

## 🎓 Tutor prompt

Start every study session for this module in a **new chat** by pasting the prompt below. It sets Claude up as your teacher for this module: it reads the course files, picks up where you left off, follows the teaching rules (no solutions; syntax help and hints instead), quizzes you, and updates your tracker when you say **"wrap up."**

```text
You are my tutor for Module 01 of my backend engineering course: "HTTP & Node.js Foundations".

ROLE
Act as a senior backend engineer who has run Node.js services in production for over a decade and loves teaching how HTTP actually works on the wire. You make people predict before they run, and you never let "it works" substitute for "I understand why." Teach the way a great senior engineer mentors a junior on their own team: patient, precise, Socratic, and honest when my work isn't good enough yet.

ABOUT ME
- I'm Mathew, a frontend engineer (React + TypeScript). I'm solid on JS/TS logic, but I don't know every Node, Express, SQL, or tooling API and syntax by heart.
- I'm building `fittrack-api`, an API that tracks my own physical activity (daily steps, workouts, lifting sets, exercises), to learn backend fundamentals properly.
- The course lives in my repo at `docs/course/`: `COURSE.md` (rules, given-vs-you-write table, decisions log, session log) plus one file per module.
- Stack for this module: Node.js LTS + TypeScript (strict, NodeNext ES modules). This module builds a server with raw `node:http` first, then Express 5.

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/01-http-and-node-foundations.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
2. If you can see my code (attached, or the repo is connected), skim `src/` to see where I actually am.
3. Then open the session with: (a) where I left off, from the session log and tracker, in 2–3 bullets; (b) the plan for this session; (c) one quick question to check what I remember from last time.

HOW TO TEACH ME
- Follow the module's order: 📖 Read → ⌨️ Type along → 🧰 Toolbox → 🧩 Challenges → ✍️ Checkpoint. Don't skip ahead unless I ask.
- Concepts: explain using examples from my fitness app. After each major idea, check understanding with one question before moving on. Diagrams and small runnable examples are welcome.
- ⌨️ Type-along code is meant to be given. Explain any line I ask about, in as much depth as I want.
- Syntax questions are always fair game ("how do I…in TypeScript/Express/SQL?"). Answer directly with a small standalone example that is NOT my challenge solution. Not knowing syntax should never be what blocks me.
- 🧩 Challenges: do NOT write the solution. When I'm stuck, first ask what I tried, what I expected, and what actually happened. Then climb the hint ladder one rung at a time: Hint 1 direction → Hint 2 approach in plain English → Hint 3 pseudocode → Hint 4 a review of my actual code (point at specific lines, ask leading questions) → a full solution only if I explicitly ask after Hint 4, and then I retype it.
- Code reviews: check against the spec and the ✅ acceptance tests first, then design/layering, then naming and style. Be specific and honest. Don't approve work that doesn't meet the Definition of done.
- Errors: teach me to read the error first (message, stack trace, status code, log line) and form a hypothesis before fixing anything. Remind me to add it to the module's Error log.
- Keep replies focused: one step at a time, then let me do the work. Ask before dumping long explanations.

FOCUS FOR THIS MODULE
- HTTP is text with rules. Have me read `curl -v` output and predict status codes and headers before I run a request.
- Raw `node:http`: headers before body, exactly one `res.end()` per request, and `return` after responding.
- Streams: why there's no `req.body`, and why counting received bytes matters even when `Content-Length` exists.
- Express middleware: registration order, `next()` vs. responding, 4-parameter error handlers, Express 5 forwarding async errors.
- The event loop: make me predict output order before running anything, and connect `/block` vs. `/wait` to real backend work (DB queries vs. JS loops).
- Tooling: `tsx` runs but doesn't type-check; `tsc` checks. If I hit an import or module-resolution error, teach the NodeNext `.js` rule instead of just fixing it.
- Watch for these common misconceptions and correct them when they show up: mixing up 4xx (client's fault) and 5xx (server's fault); 401 vs. 403; believing `await` blocks the whole server; believing `tsx` catches type errors; measuring `Content-Length` in characters; leaking error messages in 500 responses.
- Hold me to this standard before I move on: every acceptance test in Challenges 1–5 passes, `typecheck` and `lint` are clean, and no 500 response reveals internal details.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

## How to use this module

Work through the parts in order. Each one builds on the one before.

| Part | What you do | Kind |
|---|---|---|
| 1. Concepts | Read and understand | 📖 Read |
| 2. Project setup | Type along. All the code is given and explained. | ⌨️ Type along |
| 3. Raw HTTP server | Study one worked example, then write two features yourself | ⌨️ then 🧩 |
| 4. Express | Study one worked example, then port your features | ⌨️ then 🧩 |
| 5. Event loop lab | Predict, run, explain | 🧪 Lab |
| Checkpoint | 10 questions, no notes | ✍️ Quiz |

**Legend**
- 📖 **Read:** concepts to understand.
- ⌨️ **Type along:** the code is given. **Type it; don't paste it.** Read every explanation, because the checkpoint asks about them.
- 🧰 **Toolbox:** syntax and APIs you'll need for the next challenge, shown in small standalone examples. Use them as building blocks.
- 🧩 **Challenge:** you write the code. Each one has a spec, acceptance tests, and hidden hints.
- 💡 **Hints:** open them in order, and only after you've genuinely tried. Hint 1 points you in a direction. Hint 2 gives the approach in plain English. Hint 3 gives pseudocode.
- ✅ **Acceptance test:** run these. When they all pass, the challenge is done.

## What you'll be able to do by the end
- Explain what a backend does, and trace a request from `curl` to your code and back.
- Read raw HTTP messages and choose correct methods and status codes.
- Set up a strict TypeScript Node project from an empty folder, and explain every config line.
- Write an HTTP server with no framework: routing, reading a request body, and sending JSON responses.
- Explain what Express adds (routing, middleware, body parsing, error handling) because you'll have built each piece by hand first.
- Explain the event loop, and show what blocking it does to every user.

---

# Part 1 — 📖 Concepts

## 1.1 What a backend actually is

In React you've written something like `fetch("/api/workouts")`. The backend is the program on the other end of that call. It's a long-running process that:

1. **listens** on a network port for requests,
2. **routes** each request to the right code based on its method and path,
3. **validates** the input, because anything from the outside world can be wrong or malicious,
4. **applies business rules** ("a run can't end before it starts"),
5. **reads and writes data** in a database, so it survives restarts,
6. **sends a response** with a status code, headers, and usually JSON.

```
React app (browser)                  fittrack-api (Node process)                 Postgres
                                     ┌────────────────────────────────┐
fetch POST /v1/workouts  ──────────▶ │ 1. parse the HTTP request      │
                                     │ 2. route  → the right handler  │   M1, M2
                                     │ 3. validate input              │   M3
                                     │ 4. business rules              │   M2
                                     │ 5. query the database ─────────┼──▶ SQL     M4, M5
                                     │ 6. build the response ◀────────┼─── rows
◀────────── 201 Created + JSON ───── └────────────────────────────────┘
```

**Why not let the React app talk to the database directly?** Code in the browser runs on the user's machine, and the user controls it. They can open DevTools and change anything. So the backend is the **trust boundary**: it holds the secrets (database password), enforces the rules in one place, and decides what each user is allowed to see.

## 1.2 Processes, ports, and localhost

- A **server** is just a program that doesn't exit. It keeps a network port open and waits for requests.
- A **port** is a numbered "door" on a machine (0–65535). Your Vite dev server is on port 5173; this API will use **3000**. Only one process can listen on a port at a time. If you see `EADDRINUSE`, something is already using it. Find it with `lsof -i :3000` and stop it.
- **`localhost`** (`127.0.0.1`) means "this machine."
- The process keeps running because it has an open server "handle." Pressing **Ctrl+C** sends the `SIGINT` signal, which stops it. (In M9 you'll handle signals gracefully.)

## 1.3 The request lifecycle

What happens when you run `curl http://localhost:3000/health`:

1. **Name resolution.** `localhost` → `127.0.0.1`. (For `api.fittrack.dev` this would be a DNS lookup.)
2. **TCP connection.** curl and your server do a three-way handshake on port 3000. In production, a **TLS handshake** follows so the traffic is encrypted (that's the "S" in HTTPS).
3. **Request bytes.** curl writes the request as text onto the connection.
4. **Parsing.** Node's built-in HTTP parser turns those bytes into a request object (`req`) and gives you a response object (`res`) to write to.
5. **Your code runs.** It decides what to do and writes a status, headers, and a body to `res`.
6. **Response bytes.** They travel back over the same connection. The connection may stay open ("keep-alive") so the next request can skip step 2.

## 1.4 URLs, piece by piece

```
https://api.fittrack.dev:443/v1/workouts/8f3c?kind=run&limit=20#top
└─┬──┘   └──────┬───────┘└┬┘└───────┬───────┘ └───────┬────────┘└┬─┘
scheme         host     port      path              query     fragment
```

- **Path:** identifies *which resource*: `/v1/workouts/8f3c` is "workout 8f3c."
- **Query string:** *modifies* the request: filtering, sorting, paging (`?kind=run&limit=20`).
- **Fragment** (`#top`): browser-only. **It's never sent to the server.**
- **Path parameter vs query parameter.** If a value identifies the thing, put it in the path (`/workouts/:id`). If it filters or shapes a list, put it in the query (`/workouts?kind=run`).
- **Percent-encoding.** Some characters must be encoded in URLs: a space becomes `%20`, for example. You won't hand-parse this; `new URL()` does it for you.
- In Node, `req.url` holds **only the path and query**: `/v1/workouts/8f3c?kind=run&limit=20`. The scheme and host aren't included.

## 1.5 Anatomy of an HTTP message (real output)

Here's real output from `curl -v` against the server you'll build. **`>` lines are what curl sent, `<` lines are what came back, `*` lines are curl's commentary.**

```
$ curl -v -X POST http://localhost:3000/echo -H "Content-Type: application/json" -d '{"steps":9412}'
*   Trying 127.0.0.1:3000...
* Connected to localhost (127.0.0.1) port 3000
> POST /echo HTTP/1.1                       ← request line: METHOD  TARGET  VERSION
> Host: localhost:3000                      ← headers start here (Name: value)
> User-Agent: curl/8.7.1
> Accept: */*
> Content-Type: application/json            ← "the body I'm sending is JSON"
> Content-Length: 14                        ← "the body is exactly 14 bytes"
>                                           ← blank line = end of headers; body follows (curl doesn't print it)
< HTTP/1.1 200 OK                           ← status line: VERSION  CODE  REASON
< Content-Type: application/json; charset=utf-8
< Content-Length: 27
< Date: Mon, 12 Oct 2026 16:00:00 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
<
{"received":{"steps":9412}}                 ← response body
```

So a message is: **a start line, headers, a blank line, then an optional body.** HTTP/1.1 is literally text over a TCP connection. HTTP/2 and HTTP/3 send binary frames instead, but they have the same methods, headers, and status codes. Everything in this course applies to all of them.

**How does the receiver know where the body ends?** Either `Content-Length` says how many bytes to read, or the sender uses `Transfer-Encoding: chunked` and sends the body in pieces with a final empty chunk. You'll handle both in Challenge 2.

## 1.6 Methods: what the client wants to do

| Method | Purpose | Example | Safe? | Idempotent? |
|---|---|---|---|---|
| GET | Read | `GET /v1/workouts/8f3c` | ✅ | ✅ |
| POST | Create, or trigger an action | `POST /v1/workouts` (log a run) | ❌ | ❌ |
| PUT | Replace the whole thing at a known URL (or create it there) | `PUT /v1/steps/2026-10-11` | ❌ | ✅ |
| PATCH | Change some fields | `PATCH /v1/workouts/8f3c` (fix the distance) | ❌ | not guaranteed |
| DELETE | Remove | `DELETE /v1/workouts/8f3c` | ❌ | ✅ |

- **Safe:** the request doesn't change anything on the server.
- **Idempotent:** sending it once or ten times leaves the server in the **same state**.

**Why you care:** networks fail, and clients retry. Say your phone sends "log this run" and the connection drops before the response arrives. The phone can't tell whether the server saved it. If it retries a **PUT** ("set Oct 11's steps to 9,412"), nothing bad happens. If it retries a **POST** ("create a workout"), you might get **two identical runs**. You'll design around this in M2 and solve it fully in M8.

## 1.7 Status codes: what happened

The first digit tells you the category: **2xx** success · **3xx** redirect or "use your cache" · **4xx** the *client* did something wrong · **5xx** the *server* failed.

| Code | Meaning | In this app |
|---|---|---|
| 200 OK | Success, with a body | GET a workout |
| 201 Created | Created a new resource. Include a `Location` header pointing to it. | POST a workout |
| 202 Accepted | Accepted; the work will happen later | CSV import (M8) |
| 204 No Content | Success, with nothing to return | DELETE a workout |
| 304 Not Modified | Your cached copy is still good | Stats with ETag (M8) |
| 400 Bad Request | The input is malformed or invalid | `"distanceM": "five km"` |
| 401 Unauthorized | Not logged in ("who are you?") | No session cookie (M7) |
| 403 Forbidden | Logged in, but not allowed | Editing a built-in exercise |
| 404 Not Found | No such resource | Unknown workout ID |
| 405 Method Not Allowed | The path exists but not with this method. Send an `Allow` header. | `DELETE /health` |
| 409 Conflict | Conflicts with current data | A custom exercise name you already used |
| 413 Content Too Large | The body is too big. (Node prints the older name, "Payload Too Large.") | A 50 MB JSON body |
| 415 Unsupported Media Type | Wrong body format | Sending `text/plain` where JSON is expected |
| 422 Unprocessable Content | Well-formed, but makes no sense | A set that references an exercise that doesn't exist |
| 429 Too Many Requests | Rate limited. Send `Retry-After`. | Login brute force (M7) |
| 500 Internal Server Error | Your bug | An unhandled exception |
| 503 Service Unavailable | Temporarily can't serve | Database down (M9) |

A decision path you can run in your head:

```
Did it work?
├── Yes ─┬─ Created something?          → 201 (+ Location header)
│        ├─ Nothing to send back?       → 204
│        └─ Otherwise                   → 200
└── No ──┬─ Client's fault?
         │    ├─ Can't parse / invalid  → 400   (422 if valid but nonsensical)
         │    ├─ Not logged in          → 401   Not allowed → 403
         │    ├─ Doesn't exist          → 404   Wrong method → 405
         │    ├─ Clashes with data      → 409
         │    ├─ Too big                → 413   Wrong format → 415
         │    └─ Too many requests      → 429
         └─ Server's fault?             → 500 (bug) · 503 (temporarily unavailable)
```

**Never return 500 for bad input.** A 500 means "we have a bug." Bad input is a 4xx.

## 1.8 Headers you'll use

| Header | Sent by | Meaning |
|---|---|---|
| `Content-Type` | both | What format the body is in (`application/json`) |
| `Content-Length` | both | Body size in **bytes** |
| `Accept` | client | What format it would like back |
| `Location` | server | URL of a newly created resource (with 201) |
| `Allow` | server | Which methods a path supports (with 405) |
| `Retry-After` | server | When to try again (with 429/503) |
| `Cookie` / `Set-Cookie` | client / server | Sessions (M7) |
| `Cache-Control`, `ETag`, `If-None-Match` | both | Caching (M8) |
| `X-Request-Id` | both | Correlating logs (M3) |

Header **names are case-insensitive**. Node lowercases them for you: `req.headers["content-type"]`.

## 1.9 JSON on the wire

A body is just bytes. For JSON, the sender runs `JSON.stringify(obj)` and encodes the string as UTF-8 bytes. The receiver collects the bytes, decodes them to a string, and runs `JSON.parse`.

Things that surprise people:
- JSON has **no date type**. A `Date` becomes a string. That's why APIs send ISO 8601 strings like `"2026-10-11T14:00:00.000Z"`.
- `undefined` properties are **dropped**; `NaN` becomes `null`; `BigInt` **throws**.
- `JSON.parse` on invalid text **throws a `SyntaxError`**. On a server, that must become a 400, not a crash.
- **Characters ≠ bytes.** `"🏃".length` is `2`, but it takes `4` bytes in UTF-8. `Content-Length` counts bytes, so use `Buffer.byteLength(str)`.

## 1.10 Statelessness

Each request must carry everything the server needs to handle it: who you are (a cookie or token), the input, and the target. The server keeps **no memory of previous requests** in its own process. State lives in the database or a cache.

That's what lets you run two copies of your server behind a load balancer (M10): any copy can handle any request. In M2 you'll store data in memory temporarily. That's a deliberate shortcut, and you'll see its flaw the moment you restart the server.

## 1.11 What Node.js is

- **Node = the V8 JavaScript engine + libuv + a standard library.** V8 runs your JS. libuv handles the event loop and asynchronous I/O. The standard library includes modules like `node:http`, `node:fs`, and `node:crypto`.
- **No DOM.** There's no `window` or `document`. Instead you get `process` (env vars, signals, exit) and `Buffer` (raw bytes).
- **Built-in modules** are imported with the `node:` prefix: `import { createServer } from "node:http"`.
- **Two module systems exist:** CommonJS (`require`, older) and ES modules (`import`, modern). This course uses **ES modules**, switched on by `"type": "module"` in `package.json`.

## 1.12 The event loop

**Your JavaScript runs on one thread.** So how does one thread serve hundreds of users? By never waiting.

**Analogy:** a restaurant with one waiter. The waiter takes an order, hands it to the kitchen (the OS and the database), and immediately goes to the next table. When a dish is ready, the waiter delivers it. One waiter can serve many tables, *as long as the waiter never stops to cook*. If the waiter spends 20 minutes cooking one dish, every table waits.

In Node terms:
- **I/O is handed off.** Network calls, database queries, and file reads are done by the OS or libuv. Node gets notified when they finish.
- **`await db.query(...)` does not block.** While Postgres works, your function is paused and the event loop serves other requests.
- **Synchronous CPU work does block.** Examples: a big `for` loop crunching a million rows, `JSON.parse` on a 50 MB string, synchronous crypto (`bcrypt.hashSync`). While it runs, **every** request waits, including `/health`.
- **Fixes:** let the database do heavy aggregation (M5), move slow work to background jobs (M8), or use worker threads for CPU-heavy work you can't avoid.

**Queues and order.** When the current synchronous code finishes, Node runs callbacks in a particular order:
1. **Microtasks first:** promise callbacks (`.then`, and code after `await`).
2. **Then macrotasks:** timers (`setTimeout`), I/O callbacks, and so on, one at a time, draining microtasks again after each.

You'll test your understanding of this in Part 5.

## 1.13 async/await on a server: what matters

You know `async`/`await` from React. Server-specific points:
- An `async` function **always returns a promise**. If it throws, the promise rejects.
- **Forgetting `await`** means the code carries on before the work finishes. On a server, that can mean responding before data is saved, or an error that nobody catches.
- An **unhandled promise rejection crashes Node** by default. This is good: a crash is loud. But it means every async path needs error handling somewhere.
- Independent work can run in parallel: `const [a, b] = await Promise.all([getSteps(), getWorkouts()])`.

## 1.14 Streams and Buffers (just enough)

A request body might be 10 bytes or 10 GB, so Node doesn't hand it to you all at once. **`req` is a readable stream**: the body arrives in **chunks**, and each chunk is a **`Buffer`** (raw bytes).

```ts
// The event-based way to read a stream (shown for understanding; you'll use a shorter form)
let size = 0;
req.on("data", (chunk: Buffer) => {
  size += chunk.length;          // .length of a Buffer = number of bytes
});
req.on("end", () => {
  console.log(`body was ${size} bytes`);
});
```

Because the body streams in, you can **count bytes as they arrive and stop early** if someone sends 50 MB. That's exactly what body-size limits do, and you'll build one.

✅ **Before moving on:** you should be able to explain sections 1.6, 1.7, and 1.12 out loud without looking.

---

# Part 2 — ⌨️ Project setup (type along)

This part is scaffolding, so everything is given. Your job is to **understand each piece**. Type it out instead of pasting, and read every explanation.

## 2.1 Install the tools

**Node.js via a version manager.** Different projects need different Node versions, and a version manager lets you switch per project.

1. Install **nvm** using the one-line install command in its README: https://github.com/nvm-sh/nvm. (On a Mac with Homebrew, `fnm` works the same way: `brew install fnm`.)
2. Restart your terminal, then:
   ```bash
   nvm install --lts      # installs the current Long-Term Support version
   nvm use --lts
   node -v                # expect v24.x (or a newer even-numbered LTS)
   npm -v
   ```
   **Why LTS?** Even-numbered Node releases become "Long-Term Support" with years of security fixes. Production servers run LTS.

**Editor extensions (VS Code):** ESLint, Prettier, and REST Client (by Huachao Mao). REST Client lets you send requests from a `.http` file.

**curl** is already on macOS. Check with `curl --version`.

You won't need Docker until Module 04.

## 2.2 Create the project

```bash
mkdir fittrack-api
cd fittrack-api
git init
node -v > .nvmrc       # pins the Node version for this project; `nvm use` reads it
npm init -y            # creates a starter package.json
```

## 2.3 Install the TypeScript toolchain

```bash
npm install --save-dev typescript tsx @types/node
```

| Package | What it is | Why you need it |
|---|---|---|
| `typescript` | The compiler, `tsc` | Type-checks your code, and turns `.ts` into `.js` for production |
| `tsx` | A fast TypeScript runner | Runs `.ts` files directly during development, and restarts on save |
| `@types/node` | Type definitions for Node's built-ins | So TypeScript knows what `node:http`, `process`, and `Buffer` look like |

`--save-dev` (or `-D`) puts them in **devDependencies**: tools needed to *build and develop*, not to *run* the server in production. That distinction matters when you build a slim Docker image in M9.

> ⚠️ **Important:** `tsx` **does not type-check.** It strips the types and runs the code. Your code can have type errors and still run under `tsx`. That's why there's a separate `typecheck` script below. You'll see this for yourself in 2.8.

## 2.4 `package.json`, explained

Open `package.json` and edit it to look like this. Keep whatever version numbers npm put under `devDependencies`.

```json
{
  "name": "fittrack-api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=24"
  },
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "dev:raw": "tsx watch src/playground/raw-server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "tsx": "^4.0.0",
    "typescript": "^6.0.0"
  }
}
```

| Field | Meaning |
|---|---|
| `"private": true` | Stops you from accidentally publishing this to the npm registry |
| `"type": "module"` | `.js` files are **ES modules** (`import`/`export`), not CommonJS (`require`) |
| `"engines"` | Documents which Node versions this app supports |
| `"scripts"` | Named commands, run with `npm run <name>` (`npm start` works without `run`) |
| `^24.0.0` | "Caret" range: any `24.x.x` at or above that version, but not `25`. The exact installed versions are pinned in `package-lock.json`. **Commit the lockfile.** |

**What each script does:**

| Script | Command | When you use it |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Daily development. Runs TypeScript directly and restarts on every save. |
| `dev:raw` | `tsx watch src/playground/raw-server.ts` | Part 3 only (the no-framework server) |
| `build` | `tsc` | Compiles `src/**/*.ts` → `dist/**/*.js` for production |
| `start` | `node dist/server.js` | Runs the compiled output. This is what production runs. |
| `typecheck` | `tsc --noEmit` | Checks types without writing files. Run it often. |
| `lint` | `eslint .` | Finds likely bugs and bad patterns |
| `format` | `prettier --write .` | Reformats every file consistently |

```
Development:   src/server.ts ──tsx (strip types, run)──▶ running server     (no type check!)
Production:    src/**/*.ts ──tsc (check + compile)──▶ dist/**/*.js ──node──▶ running server
```

## 2.5 `tsconfig.json`, explained

Create `tsconfig.json` in the project root. (This file may contain comments.)

```jsonc
{
  "compilerOptions": {
    /* What JavaScript to produce, and which built-in types exist */
    "target": "ES2023",
    "lib": ["ES2023"],
    "types": ["node"],

    /* How imports work */
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "verbatimModuleSyntax": true,

    /* Where files go */
    "rootDir": "src",
    "outDir": "dist",
    "sourceMap": true,

    /* How strict the type checker is */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,

    /* Compatibility and speed */
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

| Option | What it does | Why this value |
|---|---|---|
| `target: "ES2023"` | Which JS version the output uses | Node 24 supports all of ES2023, so nothing needs to be rewritten for older engines |
| `lib: ["ES2023"]` | Which built-in *types* exist (Array, Map, Promise…) | Deliberately **excludes `DOM`**. On a server, `document` and `window` don't exist, so TypeScript should flag them. |
| `types: ["node"]` | Which `@types/*` packages are loaded globally | Gives you `process`, `Buffer`, and `node:*` modules. (Newer TypeScript versions load none by default.) |
| `module` / `moduleResolution: "NodeNext"` | Follow Node's real rules for ES modules | Your imports behave exactly as Node will run them. See the note below about `.js` extensions. |
| `verbatimModuleSyntax` | Type-only imports must say so | You write `import type { Request } from "express"` or `import { type Request }`. This makes it obvious which imports exist at runtime. |
| `rootDir` / `outDir` | Source in `src/`, compiled output in `dist/` | `src/server.ts` → `dist/server.js` |
| `sourceMap` | Writes `.js.map` files | Stack traces in production point to your `.ts` lines |
| `strict` | Turns on all the strict checks, including `strictNullChecks` | Catches `undefined` bugs at compile time, not at 2am |
| `noUncheckedIndexedAccess` | `arr[0]` has type `T \| undefined` | Because the array might be empty. You'll see this often with `req.headers[...]`. |
| `noImplicitOverride` | Overriding a parent class method requires the `override` keyword | Prevents accidental overrides |
| `noFallthroughCasesInSwitch` | Each `case` must `break` or `return` | Prevents a classic bug |
| `esModuleInterop` | Lets you `import express from "express"` even though Express is a CommonJS package | Standard setting |
| `skipLibCheck` | Don't type-check inside `node_modules` type files | Faster; they're not your code |
| `forceConsistentCasingInFileNames` | `./App.js` vs `./app.js` is an error | macOS ignores case but Linux (production) doesn't, so this catches deploy-only bugs |
| `include: ["src"]` | Only compile what's in `src/` | Config files at the root aren't compiled into `dist/` |

**The `.js` extension rule (this trips everyone up).** With `NodeNext`, relative imports must include the extension of the **output** file:

```ts
import { buildApp } from "./app.js";   // ✅ correct, even though the file on disk is app.ts
import { buildApp } from "./app";      // ❌ error: Node's ES module loader needs the full file name
```

TypeScript doesn't rewrite import paths when it compiles. At runtime Node loads `dist/app.js`, so you write the name of the file that will exist at runtime.

## 2.6 `.gitignore`

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
*.log
.DS_Store
```

`node_modules` is rebuilt from the lockfile, and `dist` is rebuilt by `tsc`. `.env` files will hold secrets (M3), so they're never committed. The `!.env.example` line makes an exception for the template, which *is* committed.

## 2.7 Lint and format

```bash
npm install --save-dev eslint @eslint/js typescript-eslint prettier
```

| Tool | What it catches | Example |
|---|---|---|
| **TypeScript** (`typecheck`) | Type errors | Passing a `string` where a `number` is expected |
| **ESLint** (`lint`) | Likely bugs and bad patterns | An unused variable, an empty `catch`, using `any` |
| **Prettier** (`format`) | Nothing. It only formats. | Quotes, indentation, line length |

Create `eslint.config.js` (a JavaScript file):

```js
// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  // Never lint compiled output.
  { ignores: ["dist/"] },

  // Recommended rule sets for JavaScript and TypeScript.
  eslint.configs.recommended,
  tseslint.configs.recommended,

  // Our own tweaks.
  {
    rules: {
      // Allow unused function parameters whose names start with "_".
      // Express error handlers must declare 4 parameters even when you don't use all of them.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
);
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100
}
```

And `.prettierignore`:

```
dist
package-lock.json
```

Optional, but recommended: create `.vscode/settings.json` so files format on save.

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 2.8 First run, and see why `typecheck` exists

Create `src/server.ts`:

```ts
const name: string = "fittrack-api";
console.log(`${name} booting…`);
```

Now try each command and **observe**:

```bash
npm run dev          # prints the message and keeps watching. Edit the text and save: it restarts.
                     # Ctrl+C to stop.
npm run build        # creates dist/server.js. Open it and compare it with the .ts file.
npm start            # runs the compiled JavaScript
npm run lint         # should print nothing (no problems)
npm run format       # reformats files
```

Now the important experiment. Change the first line to a type error:

```ts
const name: number = "fittrack-api";   // a string assigned to a number
```

```bash
npm run dev          # 😮 still runs! tsx only strips types; it never checks them.
npm run typecheck    # ❌ error TS2322: Type 'string' is not assignable to type 'number'.
```

**Lesson:** `tsx` is for speed and `tsc` is for correctness. Run `npm run typecheck` before every commit. (In M9, CI runs it on every push automatically.) Fix the line before moving on.

## 2.9 First commit

```bash
git add -A
git commit -m "chore: initialize TypeScript Node project"
```

**Commit message convention (Conventional Commits):** `type: short description`, where the type is one of:
- `feat` — a new feature
- `fix` — a bug fix
- `chore` — tooling and setup
- `docs` — documentation
- `test` — tests
- `refactor` — restructuring without changing behavior

Create a **private** GitHub repo named `fittrack-api` and push to it. Either use the GitHub website and follow its "push an existing repository" instructions, or run `gh repo create fittrack-api --private --source=. --push` if you have the GitHub CLI.

Copy this course folder into the repo at `docs/course/` and commit it too.

✅ **Setup acceptance:** `npm run dev`, `npm run build && npm start`, `npm run typecheck`, and `npm run lint` all work, and the repo is on GitHub.

Your project now looks like this:

```
fittrack-api/
├── docs/course/        ← this course
├── src/
│   └── server.ts
├── .gitignore
├── .nvmrc
├── .prettierignore
├── .prettierrc
├── eslint.config.js
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

# Part 3 — A server with no framework

You'll build a server using only Node's built-in `node:http` module. It's more work than Express, and that's the point. After this, you'll know what every line of Express is doing for you.

## 3.1 📖 The `node:http` API

```ts
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

const server = createServer((req, res) => {
  // Called once for EVERY request.
});
server.listen(3000, () => console.log("listening"));
```

**`req: IncomingMessage`** is the request. You read from it.

| Property | Type | Example value |
|---|---|---|
| `req.method` | `string \| undefined` | `"POST"` |
| `req.url` | `string \| undefined` | `"/v1/workouts?kind=run"` (path + query only) |
| `req.headers` | object, **lowercase** names | `req.headers["content-type"]` → `"application/json"` |
| *(the body)* | a readable stream | read with `for await` (see 3.4) |

**`res: ServerResponse`** is the response. You write to it.

| Method | What it does |
|---|---|
| `res.writeHead(status, headers)` | Sets the status code and headers **and sends them** |
| `res.setHeader(name, value)` / `res.statusCode = 404` | Set them one at a time (sent with the first body write) |
| `res.end(body?)` | Sends the optional body and **finishes the response** |
| `res.headersSent` | `true` once the headers have gone out |

**Two rules you must never break:**
1. **Headers go before the body.** Once headers are sent, they can't be changed. Trying throws `ERR_HTTP_HEADERS_SENT`.
2. **Every request must end with exactly one `res.end()`.** If you forget it, the client hangs until it times out. If you call it twice, you get an error.

## 3.2 ⌨️ Worked example: `GET /health`

Create `src/playground/raw-server.ts`:

```ts
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
    }
    // Challenge 1: replace this comment with a 405 response.
  }

  sendJson(res, 404, { error: "Not Found", path: url.pathname });
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`raw server listening on http://localhost:${PORT}`);
});
```

**Reading it piece by piece:**

1. **`import { createServer, type IncomingMessage, type ServerResponse }`.** `createServer` is a real value used at runtime. The other two are only types, so they're marked `type` (required by `verbatimModuleSyntax`).
2. **`sendJson(...)`.** Without a framework, you'd repeat these four lines for every response. The helper:
   - turns the body into a JSON string,
   - sets `Content-Type` so clients know how to read it,
   - sets `Content-Length` in **bytes** (`Buffer.byteLength`, not `.length`; see 1.9),
   - spreads in any extra headers,
   - and ends the response.

   `body: unknown` means "anything." It's safer than `any`, because TypeScript won't let you use an `unknown` value without checking it first.
3. **`_req`.** `handleHealth` doesn't use the request, so the parameter name starts with `_`. That tells ESLint it's unused on purpose.
4. **`process.uptime()`.** Seconds since the process started. Handy proof the server is alive.
5. **`new URL(req.url ?? "/", "http://localhost")`.** `req.url` might be `undefined` (according to its type), so `?? "/"` provides a fallback. `URL` needs a full address, so we add a dummy base. Now `url.pathname` is the path and `url.searchParams.get("kind")` reads the query.
6. **The `if` chain is your router.** Express replaces this with `app.get("/health", ...)`.
7. **`return` after handling.** Without it, execution falls through to the 404 code and calls `res.end()` a second time.
8. **The final `sendJson(res, 404, ...)`.** If nothing matched, it's a 404. Every path through this function must end the response exactly once.

**Run it.** Open two terminals.

```bash
# Terminal 1
npm run dev:raw

# Terminal 2
curl -i localhost:3000/health          # -i shows the status line and headers
curl -i localhost:3000/nope
curl -i -X POST localhost:3000/health  # -X sets the method
```

**Expected:** `200` with `{"status":"ok","uptimeSeconds":...}`, then `404`. The POST also returns 404, **which is wrong**. The path exists, just not for POST. You'll fix that next.

**curl cheat sheet:**

| Flag | Meaning |
|---|---|
| `-i` | Show response headers |
| `-v` | Show everything sent and received |
| `-X POST` | Set the method |
| `-H 'Name: value'` | Add a header |
| `-d '...'` | Send a body. Without your own `-H`, curl labels it `application/x-www-form-urlencoded`, not JSON. |
| `--data-binary @file.json` | Send a file's contents exactly as-is |
| `-s` | Silent (no progress meter) |
| `-o /dev/null -w "%{http_code}\n"` | Print only the status code |

## 3.3 🧩 Challenge 1: 405 Method Not Allowed

**Spec:** any method other than GET on `/health` returns:
- status `405`,
- the header `Allow: GET`,
- the body `{ "error": "Method Not Allowed" }`.

✅ **Acceptance tests**

```bash
curl -i -X POST   localhost:3000/health   # → HTTP/1.1 405 Method Not Allowed, with an "Allow: GET" header
curl -i -X DELETE localhost:3000/health   # → 405
curl -i           localhost:3000/health   # → still 200
```

<details><summary>💡 Hint 1</summary>

There's a comment in `handleRequest` marking exactly where this goes. Look at `sendJson`'s fourth parameter.
</details>

<details><summary>💡 Hint 2</summary>

Inside the `/health` branch, after the `GET` case, call `sendJson` with status 405 and an extra-headers object containing `Allow`. Don't forget to `return`.
</details>

## 3.4 🧰 Toolbox: reading a request body

These are the building blocks for Challenge 2. Each snippet stands alone, and none of them is the solution. You'll combine them.

**① Reading a stream into one Buffer with `for await`**

```ts
async function readAll(stream: AsyncIterable<Buffer>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);            // each chunk is a Buffer of raw bytes
  }
  return Buffer.concat(chunks);    // join all the chunks into one Buffer
}

// req is a stream, so this works:  const raw = await readAll(req);
// bytes → text:                    raw.toString("utf8")
// size in bytes:                   raw.length   (or chunk.length per chunk)
```

- `for await` only works inside an `async` function.
- **Throwing inside the loop stops reading immediately.** That's how you enforce a size limit while the data is still arriving.

**② Reading headers safely**

```ts
const contentType = req.headers["content-type"];       // string | undefined
// Content-Type can carry parameters: "application/json; charset=utf-8"
const isJson = contentType?.startsWith("application/json") ?? false;

const declared = req.headers["content-length"];         // string | undefined, e.g. "14"
const declaredBytes = Number(declared ?? "0");          // Number("14") → 14
```

**Watch out:** `Content-Length` is **missing** when the client sends a chunked body. And a client can **lie** about it. So it's useful for rejecting early, but you must still count the bytes you actually receive.

**③ Parsing JSON without crashing**

```ts
let parsed: unknown;
try {
  parsed = JSON.parse(text);       // throws SyntaxError on invalid JSON
} catch {
  // handle the bad input here (the `catch` binding is optional when you don't need the error)
}
```

**④ A custom error class that carries an HTTP status**

```ts
class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);                // sets this.message
    this.status = status;
  }
}

// Throw it from deep inside any function:
throw new HttpError(415, "Content-Type must be application/json");

// Catch it in one place and check which kind of error it is:
try {
  /* ... */
} catch (err) {
  if (err instanceof HttpError) {
    // a known, expected error: respond with err.status
  } else {
    throw err;                     // unknown: let the 500 safety net handle it
  }
}
```

Throwing means you don't have to pass "did it fail?" values back up through every function.

**⑤ Making async handlers safe**

`createServer` doesn't know about promises. If your handler is `async` and throws, nobody catches the rejection, and Node **crashes**. This wrapper is infrastructure, so it's given. Use it:

```ts
const server = createServer((req, res) => {
  handleRequest(req, res).catch((err: unknown) => {
    console.error(err);                                     // the details go to YOUR terminal…
    if (!res.headersSent) {
      sendJson(res, 500, { error: "Internal Server Error" }); // …the client gets a generic message
    } else {
      res.destroy();                                        // too late for a clean response: cut the connection
    }
  });
});
```

For this to work, `handleRequest` must become `async` and return a `Promise<void>`.

**⑥ Closing the connection after rejecting an upload**

If you reject a body *before reading it all* (413), the client may still be uploading. Add `Connection: close` to that response so the connection isn't reused:

```ts
sendJson(res, 413, { error: "..." }, { Connection: "close" });
```

## 3.5 🧩 Challenge 2: `POST /echo`

Build an endpoint that reads a JSON body and sends it back. It sounds trivial, but it's the core of every POST endpoint you'll write. Every body has to be read, limited, and parsed safely.

**Spec**

| Situation | Status | Response body |
|---|---|---|
| Valid JSON body (≤ 100 KB) | 200 | `{ "received": <the parsed JSON> }` |
| `Content-Type` isn't `application/json` | 415 | `{ "error": "Content-Type must be application/json" }` |
| Declared `Content-Length` > 100 KB (102,400 bytes) | 413 | `{ "error": "Body exceeds 102400 bytes" }`. Reject **without reading** the body. |
| Bytes actually received exceed 100 KB (e.g., chunked, no Content-Length) | 413 | Same. **Stop reading** as soon as you pass the limit. |
| Body isn't valid JSON | 400 | `{ "error": "Body is not valid JSON" }` |
| Any method other than POST on `/echo` | 405 | Include `Allow: POST` |
| An unexpected error | 500 | `{ "error": "Internal Server Error" }`, with the real error logged to the terminal |

**Suggested structure.** These are only signatures; you write the bodies.

```ts
const MAX_BODY_BYTES = 100 * 1024;

class HttpError extends Error { /* from the toolbox */ }

/** Reads, limits, and parses a JSON body. Throws HttpError(415/413/400) on bad input. */
async function readJsonBody(req: IncomingMessage, maxBytes: number): Promise<unknown> {
  // 1. Check Content-Type        → 415
  // 2. Check declared length      → 413
  // 3. Read chunks, counting bytes → 413 when over the limit
  // 4. Parse JSON                  → 400 on failure
}

async function handleEcho(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Call readJsonBody, then respond 200 with { received: body }
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Your router: /health, /echo, 404.
  // Catch HttpError here and turn it into a JSON response with err.status.
}

// Plus the safety wrapper from toolbox ⑤ around createServer.
```

✅ **Acceptance tests**

```bash
# Valid → 200 {"received":{"kind":"run","distanceM":5000}}
curl -i -X POST localhost:3000/echo -H 'Content-Type: application/json' -d '{"kind":"run","distanceM":5000}'

# Invalid JSON → 400
curl -i -X POST localhost:3000/echo -H 'Content-Type: application/json' -d '{"kind":'

# Wrong content type → 415
curl -i -X POST localhost:3000/echo -H 'Content-Type: text/plain' -d 'hello'

# No -H at all → curl sends form encoding → 415
curl -i -X POST localhost:3000/echo -d '{"a":1}'

# Too big, with Content-Length → 413 (create a ~200 KB file first)
node -e 'console.log(JSON.stringify({ notes: "a".repeat(200000) }))' > big.json
curl -i -X POST localhost:3000/echo -H 'Content-Type: application/json' --data-binary @big.json

# Too big, chunked (no Content-Length): this tests your byte counting → 413
curl -i -X POST localhost:3000/echo -H 'Content-Type: application/json' -H 'Transfer-Encoding: chunked' --data-binary @big.json

# Wrong method → 405 with Allow: POST
curl -i localhost:3000/echo

# /health still works
curl -i localhost:3000/health
```

Delete `big.json` when you're done, or add it to `.gitignore`.

<details><summary>💡 Hint 1: direction</summary>

You need toolbox items ①–⑥. Write `readJsonBody` first and get it working on the happy path. Then add one failure case at a time, running its acceptance test after each one.
</details>

<details><summary>💡 Hint 2: approach</summary>

In `readJsonBody`:
1. Check the content type first. It's the cheapest check.
2. Then reject early if the declared length is too large.
3. Then loop over the chunks with `for await`, adding each `chunk.length` to a running total, and throw as soon as the total passes the limit.
4. After the loop, join the chunks, convert to text, and parse inside try/catch.

Each failure is a `throw new HttpError(...)`.

In `handleRequest`, wrap the `/echo` work in try/catch. If it's an `HttpError`, respond with its status. Otherwise rethrow, so the toolbox ⑤ wrapper produces the 500.
</details>

<details><summary>💡 Hint 3: pseudocode</summary>

```
readJsonBody(req, max):
  type = header content-type
  if type doesn't start with "application/json": throw HttpError(415, ...)
  if Number(header content-length or "0") > max: throw HttpError(413, ...)
  chunks = [], total = 0
  for await chunk of req:
    total += chunk.length
    if total > max: throw HttpError(413, ...)
    chunks.push(chunk)
  text = Buffer.concat(chunks).toString("utf8")
  try: return JSON.parse(text)
  catch: throw HttpError(400, ...)

handleRequest(req, res):
  parse url
  if path is /health: (as before)
  if path is /echo:
    if method is not POST: 405 with Allow: POST; return
    try:
      body = await readJsonBody(req, MAX)
      send 200 { received: body }
    catch err:
      if err is HttpError: send err.status { error: err.message } (+ Connection: close if 413)
      else: throw err
    return
  send 404
```
</details>

## 3.6 🧩 Challenge 3: a request collection

Create `requests.http` in the project root. VS Code's REST Client shows a **"Send Request"** link above each request. Here are two to start you off. Add one for every acceptance test above.

```http
@base = http://localhost:3000

### Health check
GET {{base}}/health

### Echo: valid JSON
POST {{base}}/echo
Content-Type: application/json

{ "kind": "run", "distanceM": 5000 }
```

(`###` separates requests. A blank line separates the headers from the body.)

## 3.7 📖 Reflect: what hurt?

Before moving on, write down **at least three things that were tedious or error-prone** in the tracker's notes. Typical answers: routing with `if` chains, reading the body by hand, remembering to `return`, the async error wrapper, and setting `Content-Length`. Part 4 is a framework that solves exactly these problems.

```bash
git add -A && git commit -m "feat: raw node:http server with /health and /echo"
```

---

# Part 4 — Express 5

## 4.1 📖 What Express is (and isn't)

Express is a **thin layer over `node:http`**. Its `req` and `res` are the *same* Node objects you just used, with extra helper methods attached. Here's what it replaces:

| You did it by hand | Express equivalent |
|---|---|
| `if (url.pathname === "/health" && method === "GET")` | `app.get("/health", handler)` |
| Splitting `/workouts/8f3c` into pieces yourself | `app.get("/workouts/:id", …)` → `req.params.id` |
| `url.searchParams.get("kind")` | `req.query.kind` |
| Your `readJsonBody` | `app.use(express.json({ limit: "100kb" }))` → `req.body` |
| `sendJson(res, 200, obj)` | `res.status(200).json(obj)` |
| Your try/catch → 500 wrapper | An **error-handling middleware**. Express 5 also catches errors thrown by `async` handlers for you. |
| The final fallthrough 404 | A last `app.use(...)` that runs when nothing matched |

## 4.2 📖 Middleware: the core idea of Express

A **middleware** is a function with the signature `(req, res, next) => void`. Express keeps an **ordered list** of them. Every request walks down the list **in the order you registered them**, until one of them sends a response.

```
request
  │
  ▼
[requestLogger] ──next()──▶ [express.json()] ──next()──▶ [GET /health handler] ──▶ res.json(...) ✔
                                   │
                                   └── body is invalid JSON ──next(err)──▶ [errorHandler] ──▶ res 400 ✔
```

**The rules:**
1. **Order = registration order.** Put a middleware before the routes that need it.
2. **Each middleware must either send a response OR call `next()`.** Never both, and never neither (or the request hangs forever).
3. **`next(err)` jumps straight to the error-handling middleware**, skipping all the normal ones.
4. **A route handler** (`app.get(...)`) is just a middleware that matches a method and path and usually sends the response.
5. **An error-handling middleware has exactly four parameters**, `(err, req, res, next)`. Express identifies it by counting the parameters. With three parameters, Express treats it as a normal middleware.
6. **In Express 5, if an `async` handler throws (or its promise rejects), Express calls `next(err)` for you.**

## 4.3 ⌨️ Worked example: a request logger middleware

Create `src/middleware/request-logger.ts`:

```ts
import type { NextFunction, Request, Response } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();

  // "finish" fires after the last byte of the response has been handed off.
  // We register the listener now, but it runs later, after a handler has responded.
  res.on("finish", () => {
    const ms = (performance.now() - start).toFixed(1);
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`);
  });

  next(); // hand the request to the next middleware in the list
}
```

**Why this works:** the logger runs *first* (so it records the start time), but it logs at the *end* (when the response finishes). So it can see the final status code, whichever handler produced it. In M3 you'll replace `console.log` with structured logging.

## 4.4 📖 The Express toolbox

**Request**

| Expression | Example value |
|---|---|
| `req.method` | `"POST"` |
| `req.path` | `"/echo"` |
| `req.originalUrl` | `"/echo?debug=1"` |
| `req.params.id` | from a `/:id` route |
| `req.query.kind` | from `?kind=run`. Values are **strings** (or arrays if the key is repeated), or `undefined`. |
| `req.body` | Parsed JSON. It's **`undefined`** if no body parser ran or there was no body. |
| `req.get("content-type")` | Read a header (case-insensitive) |
| `req.is("application/json")` | Returns the matching type if the body is JSON, `false` if it's another type, and `null` if there's no body |

**Response.** `status`, `set`, and `type` return `res`, so they can be chained.

| Expression | Effect |
|---|---|
| `res.status(201)` | Set the status code |
| `res.json(obj)` | Send JSON. Sets `Content-Type` and `Content-Length` and ends the response. |
| `res.set("Allow", "GET")` | Set a header |
| `res.location("/v1/workouts/8f3c")` | Set the `Location` header |
| `res.sendStatus(204)` | Send just a status, with no body |
| `res.headersSent` | Whether it's too late to change the status or headers |

**Routing**

```ts
app.get("/path", handler);                 // also .post .put .patch .delete
app.use(middleware);                       // runs for every request (that reaches it)
app.use("/v1/steps", someRouter);          // mounts a group of routes under a prefix (Module 02)

app
  .route("/health")                        // several methods on one path
  .get(handler)
  .all(otherHandler);                      // .all matches any method not handled above
```

**Errors from `express.json()`.** When the body parser fails, it calls `next(err)` with an error object that has a numeric `status` and a string `type`:

| Problem | `err.status` | `err.type` |
|---|---|---|
| Malformed JSON | `400` | `"entity.parse.failed"` |
| Body over the `limit` | `413` | `"entity.too.large"` |

`express.json()` **only parses bodies labeled as JSON.** With any other `Content-Type` it does nothing, and `req.body` stays `undefined`. So a 415 has to be your own check.

**Narrowing an unknown error safely (type guard syntax)**

In an error handler, `err` could be anything. A **type guard** is a function that checks a value's shape and tells TypeScript what it is:

```ts
function hasNumericStatus(value: unknown): value is { status: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    typeof value.status === "number"
  );
}

if (hasNumericStatus(err)) {
  err.status; // TypeScript now knows this is a number
}
```

**Error-handler shape**

```ts
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);  // a response is already streaming; let Express's default handler close the connection
    return;
  }
  // ...decide the status and body based on what `err` is...
};
```

## 4.5 ⌨️ Worked example: Express `/health` with the app/server split

```bash
npm install express
npm install --save-dev @types/express
```

(`express` is a runtime dependency, so no `-D`. Its types are a dev dependency.)

Create `src/app.ts`:

```ts
import express, { type Express } from "express";
import { requestLogger } from "./middleware/request-logger.js";

export function buildApp(): Express {
  const app = express();

  // 1. Middleware that applies to every request
  app.use(requestLogger);

  // 2. Routes
  app.route("/health").get((_req, res) => {
    res.status(200).json({
      status: "ok",
      uptimeSeconds: Math.round(process.uptime()),
    });
  });
  // Challenge 4 adds: .all(...) for 405, the /echo route, a 404 handler, and an error handler.

  return app;
}
```

Replace `src/server.ts`:

```ts
import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);

const app = buildApp();

app.listen(PORT, (error?: Error) => {
  if (error) throw error; // e.g. EADDRINUSE: the port is taken
  console.log(`fittrack-api listening on http://localhost:${PORT}`);
});
```

**Reading it piece by piece:**
- **`buildApp()` builds and returns the app but doesn't start it.** In M6, tests will call `buildApp()` and send requests to it in memory, without opening a port. That's why it's separate from `server.ts`, which is the only file that calls `listen`.
- **`import express, { type Express }`.** `express` is the function that creates an app. `Express` is the type of that app.
- **`(_req, res) => { ... }`.** You don't need to annotate the types; Express's types infer them from `.get(...)`.
- **`.json(...)`** sets the content type and length and ends the response, all the work your `sendJson` did.
- **`process.env.PORT ?? 3000`.** Environment variables are always strings (or `undefined`), hence `Number(...)`. In M3, all config moves into one validated module.
- **`app.listen(PORT, (error?: Error) => ...)`.** In Express 5, startup errors (like a port already in use) are passed to this callback.

**Run it:** `npm run dev`, then `curl -i localhost:3000/health`. Your terminal shows a logger line like `GET /health → 200 (0.4 ms)`.

## 4.6 🧩 Challenge 4: port everything to Express

Rebuild every behavior from Challenges 1 and 2 in Express.

**Spec:** the same table as Challenge 2, plus:
- `GET /health` → 200. Any other method → 405 with `Allow: GET`.
- `POST /echo` → body parsed by `express.json({ limit: "100kb" })`. Any other method on `/echo` → 405 with `Allow: POST`.
- Unknown path → 404 JSON: `{ "error": "Not Found", "path": "<the path>" }`.
- Any unexpected error → 500 JSON `{ "error": "Internal Server Error" }`. **The real message must not reach the client**, but it must be logged with `console.error`.

**Files to create**

```
src/middleware/error-handler.ts   ← exports errorHandler (4 parameters)
src/middleware/not-found.ts       ← exports notFoundHandler
src/app.ts                        ← register everything in the right order
```

**Proving the 500 path works.** Temporarily add these two routes, test them, then **delete them**:

```ts
app.get("/boom", () => {
  throw new Error("secret: db password is hunter2");
});
app.get("/boom-async", async () => {
  await Promise.resolve();
  throw new Error("async failure");
});
```

✅ **Acceptance tests:** run every command from Challenge 2 against the Express server, and get identical statuses. Plus:

```bash
curl -i localhost:3000/does-not-exist   # → 404 JSON with the path
curl -i localhost:3000/boom             # → 500 {"error":"Internal Server Error"}. "hunter2" must NOT appear.
curl -i localhost:3000/boom-async       # → 500 too (Express 5 catches async errors)
# Your terminal shows the full error and stack trace for both.
```

<details><summary>💡 Hint 1: direction</summary>

Everything you need is in 4.2 (the order rules) and 4.4 (the toolbox). The registration order in `app.ts` matters most: global middleware → routes → 404 → error handler.
</details>

<details><summary>💡 Hint 2: approach</summary>

- **415:** `express.json()` ignores non-JSON bodies, so check `req.is("application/json")` yourself inside the `/echo` handler (or in a small middleware just for that route) before using `req.body`.
- **400 and 413:** these come from `express.json()` as errors. Handle them in `errorHandler` by checking `err.status` and `err.type` (see the table in 4.4), using a type guard to narrow `err`.
- **405:** chain `.all(...)` after `.get` or `.post` on `app.route(...)`.
- **404:** a middleware registered *after all the routes*. It only runs if nothing above it responded.
- **500:** the last branch of the error handler: log it, then send the generic message.
</details>

<details><summary>💡 Hint 3: pseudocode for app.ts and the error handler</summary>

```
buildApp:
  app.use(requestLogger)
  app.use(express.json({ limit: "100kb" }))
  route /health: get → 200 ... ; all → 405 Allow GET
  route /echo:   post → if not req.is json → 415 ; else 200 { received: req.body }
                 all  → 405 Allow POST
  app.use(notFoundHandler)
  app.use(errorHandler)

errorHandler(err, req, res, next):
  if res.headersSent → next(err); return
  if err looks like { status: number, type: string } and status is 400 or 413:
     respond with err.status and a friendly message based on err.type
     return
  console.error(err)
  respond 500 { error: "Internal Server Error" }
```
</details>

## 4.7 📖 Compare

Put the raw server and the Express app side by side. In the tracker notes, answer the "explain it back" prompt from the checkpoint. Then commit:

```bash
git add -A && git commit -m "feat: express app with health, echo, 404 and error handling"
```

---

# Part 5 — 🧪 Event loop lab

## 5.1 ⌨️ Predict the order

Create `src/playground/event-loop.ts`:

```ts
console.log("A: sync start");

setTimeout(() => console.log("B: setTimeout 0ms"), 0);

Promise.resolve().then(() => console.log("C: promise.then"));

async function run(): Promise<void> {
  console.log("D: inside async function, before await");
  await null;
  console.log("E: inside async function, after await");
}
run();

console.log("F: sync end");
```

**Before running it,** write your predicted order in the tracker. Then run:

```bash
npx tsx src/playground/event-loop.ts
```

<details><summary>Answer and explanation (open after running)</summary>

Output: **A, D, F, C, E, B**

1. **A**, synchronous.
2. `setTimeout` *schedules* B as a macrotask. It doesn't run yet.
3. `.then` *schedules* C as a microtask.
4. Calling `run()` runs its body **synchronously up to the first `await`**, so **D** prints now. `await null` then schedules the rest of the function (E) as a microtask, *after* C, which was queued earlier.
5. **F**, synchronous.
6. The synchronous code is done, so all microtasks drain in order: **C**, then **E**.
7. Only then does the event loop reach timers: **B**. Even a 0 ms timeout waits for every microtask.

**The server lesson:** code after an `await` runs *later*, and other work can happen in between. That's how one thread serves many requests.
</details>

## 5.2 🧩 Challenge 5: block the event loop on purpose

Temporarily add two routes to `src/app.ts` (before the 404 handler):

```ts
// Synchronous: occupies the one JavaScript thread for 5 seconds.
app.get("/block", (_req, res) => {
  const end = Date.now() + 5000;
  while (Date.now() < end) {
    // busy-wait: deliberately doing nothing, very fast, for 5 seconds
  }
  res.json({ done: "block" });
});

// Asynchronous: waits 5 seconds without occupying the thread.
app.get("/wait", async (_req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  res.json({ done: "wait" });
});
```

**Experiment.** Use two terminals and start the second command *immediately* after the first.

| Run | Terminal A | Terminal B (right away) | How long did B take? |
|---|---|---|---|
| 1 | `curl localhost:3000/block` | `time curl localhost:3000/health` | |
| 2 | `curl localhost:3000/wait` | `time curl localhost:3000/health` | |

Record the times in the tracker, and **explain the difference in your own words** before opening the answer. Then **delete both routes** and commit.

<details><summary>Answer (open after writing your explanation)</summary>

- **Run 1:** `/health` takes about **5 seconds**. The `while` loop never gives the thread back, so the event loop can't even start handling the second request. *Every* user of the server would wait.
- **Run 2:** `/health` returns in **milliseconds**. `await` hands control back to the event loop, which serves `/health` while the timer counts down.

A database query behaves like `/wait`. A heavy calculation in JavaScript behaves like `/block`. That's why Module 05 computes stats in SQL, not in JS loops.
</details>

---

## Definition of done

- [ ] All Part 2 scripts work (`dev`, `build`, `start`, `typecheck`, `lint`, `format`).
- [ ] The raw server passes every Challenge 1–2 acceptance test.
- [ ] The Express app passes every Challenge 4 acceptance test, with no secret text in any 500 response.
- [ ] `requests.http` covers every acceptance test.
- [ ] The event-loop prediction and the blocking experiment are recorded in the tracker with your own explanations.
- [ ] Work is committed and pushed to GitHub.

---

## ✍️ Checkpoint

Answer without notes. Say *"Quiz me on Module 01"* in a chat, and Claude will ask one question at a time and grade each answer.

1. Name at least 5 things that happen between running `curl http://localhost:3000/health` and seeing the output.
2. Define *safe* and *idempotent*. Which of GET, POST, PUT, PATCH, and DELETE are idempotent? Why does that matter for a phone syncing over a flaky connection?
3. Which status code fits each case, and why? (a) `"distanceM": "five km"`; (b) `GET /v1/workouts/<an id that doesn't exist>`; (c) creating a custom exercise with a name you already used; (d) `DELETE /health`; (e) a `text/plain` body sent to a JSON endpoint.
4. Your code has a type error, but `npm run dev` runs it anyway. Why? Which command catches it, and what does each tool (`tsx`, `tsc`) actually do?
5. Why do relative imports in this project end in `.js` when the files on disk end in `.ts`?
6. In raw `node:http`, why isn't the body available as `req.body`? What is it instead, and what two things must you guard against while reading it?
7. **Code reading.** What's wrong here, and what error will Node throw on `GET /health`?
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
8. In Express, what happens if a middleware neither sends a response nor calls `next()`? And how does Express know a function is an *error-handling* middleware?
9. Explain the results of your `/block` and `/wait` experiment in terms of the event loop.
10. Why separate `app.ts` (which builds the app) from `server.ts` (which calls `listen`)?

**Explain it back:** In 3–5 sentences, explain what Express does for you that raw `node:http` doesn't. Name specific things you had to do by hand.

---

## 📋 Tracker

**Status:** 🟨 · **Started:** 2026-10-18 · **Completed:** — · **Quiz score:** — / 10

### Progress
- [ ] Part 1: Concepts read (1.1–1.14). *Done so far: 1.1–1.12 discussed with the tutor. Still to do: 1.13 (async/await on a server) and 1.14 (streams and Buffers).*
- [ ] Part 2: Setup complete and pushed
- [ ] Part 3: Worked example typed and run
- [ ] Challenge 1: 405
- [ ] Challenge 2: `POST /echo` (raw)
- [ ] Challenge 3: `requests.http`
- [ ] Part 4: Logger and Express `/health` typed and run
- [ ] Challenge 4: Express port
- [ ] Part 5: Event loop prediction
- [ ] Challenge 5: Blocking experiment
- [ ] Checkpoint passed (≥ 8/10)

### Concepts I can explain without notes
- [ ] What a backend does and why it's the trust boundary (1.1)
- [ ] The request lifecycle (1.3)
- [ ] URL parts; path vs query parameters (1.4)
- [ ] HTTP message anatomy (1.5)
- [ ] Methods, safety, idempotency (1.6)
- [ ] Choosing status codes (1.7)
- [x] Characters vs bytes; JSON pitfalls (1.9). *Explained that Content-Length counts bytes; chose `Buffer.byteLength`; confirmed `"🏃"` is 2 vs 4.*
- [ ] Statelessness (1.10)
- [ ] The event loop; blocking vs non-blocking (1.12)
- [ ] Streams and Buffers (1.14)
- [ ] Every line of `tsconfig.json` (2.5)
- [ ] Middleware order and `next()` (4.2)

### Event loop prediction (5.1)
| My prediction | Actual | What I got wrong and why |
|---|---|---|
| | A, D, F, C, E, B | |

### Blocking experiment (5.2)
| Run | `/health` time | My explanation |
|---|---|---|
| `/block` | | |
| `/wait` | | |

### What hurt in the raw server (3.7)
1.
2.
3.

### Checkpoint weak spots
- **Path vs query parameters (1.4).** Needed several attempts. Kept putting `user_id` in `/workouts/{user_id}` and wrote bare query words like `asc`. Rule to remember: an ID in the path means one item; query `key=value` pairs shape a list. Plan: write a small `GET /steps/:date` route after Challenge 4 to practice it.
- **Curl flags vs the HTTP message.** Mixed up `-X`/`-H`/`-d` with the request itself. The message is the request line (method, target, version), headers, a blank line, then the body.
- **401 vs 403, and 404 vs 405.** First attempt picked 401 for a logged-in user and 200 for `DELETE /health`. After correction: 401 = not authenticated, 403 = authenticated but not allowed, 405 = path exists but the method isn't supported (with an `Allow` header).
- **4xx vs 5xx.** Called a server `TypeError` on a valid request a client error. Rule: client's input is the problem → 4xx; valid request but our code broke → 5xx.
- **Event loop ordering (1.12).** Got `1, 4, 2, 3` instead of `1, 4, 3, 2`. Confused microtasks beating macrotasks with beating synchronous code. Also thought code after an `await` runs synchronously. Order is: synchronous code, then microtasks, then macrotasks. Run experiments from a file, not the Node REPL.

### Notes
- Session 1 (2026-10-18): covered 1.1–1.12 by discussion, no code written yet. Strong spots: request lifecycle once the terms were explained (DNS, TCP, port), idempotency and why POST needs an idempotency key (M8), characters vs bytes, and thinking to ask what a module system is for.
- Port vs connection: the port is the numbered door that picks the program; the TCP connection is the pipe.
- Node = V8 + libuv + standard library. `node:http` comes from the standard library, not V8.
- Habit to build: write down a prediction before running anything.

### Error log
| Error | Cause | Fix |
|---|---|---|
| Event-loop experiment printed `undefined`, then `C B A` | Pasted the code into the Node REPL, which evaluates input differently from a file | Run the code from a file (`node file.mjs` or `npx tsx file.ts`); correct order was `B C A` |

### Open questions
- How do ES modules and CommonJS differ in practice? (I know `import` vs `require` and that this course uses ES modules; still to see the `.js` extension rule in action.)
- What does the parser actually do with the bytes? (Understood at a high level; revisit when reading the stream in Challenge 2.)

## Resources
- MDN, An overview of HTTP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
- MDN, HTTP status codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- Node.js `http` module: https://nodejs.org/api/http.html
- Node.js, the event loop: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
- TypeScript, TSConfig reference: https://www.typescriptlang.org/tsconfig/
- Express 5 guide (routing, middleware, error handling): https://expressjs.com/en/guide/routing.html
- Express, migrating to v5 (what's new): https://expressjs.com/en/guide/migrating-5.html
