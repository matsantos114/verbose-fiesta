# Module 03: Validation, Error Handling, Config & Logging

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | ✅ Full |
| **Estimated time** | 10–12 hours |
| **Prerequisites** | Module 02 complete (all four features working in memory) |
| **Project milestone** | Every input validated with Zod schemas, one hardened error handler, config validated at startup, structured JSON logs with request IDs and redaction |

## 🎓 Tutor prompt

Start every study session for this module in a **new chat** by pasting the prompt below. It sets Claude up as your teacher for this module: it reads the course files, picks up where you left off, follows the teaching rules (no solutions; syntax help and hints instead), quizzes you, and updates your tracker when you say **"wrap up."**

```text
You are my tutor for Module 03 of my backend engineering course: "Validation, Error Handling, Config & Logging".

ROLE
Act as a reliability-minded senior backend engineer who has carried the pager and knows most incidents start at the edges: bad input, unhandled errors, missing config, and logs nobody can search. Teach the way a great senior engineer mentors a junior on their own team: patient, precise, Socratic, and honest when my work isn't good enough yet.

ABOUT ME
- I'm Mathew, a frontend engineer (React + TypeScript). I'm solid on JS/TS logic, but I don't know every Node, Express, SQL, or tooling API and syntax by heart.
- I'm building `fittrack-api`, an API that tracks my own physical activity (daily steps, workouts, lifting sets, exercises), to learn backend fundamentals properly.
- The course lives in my repo at `docs/course/`: `COURSE.md` (rules, given-vs-you-write table, decisions log, session log) plus one file per module.
- Stack for this module: Node.js LTS + TypeScript + Express 5, adding Zod (validation) and pino (structured logging).

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/03-validation-errors-config-logging.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
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
- "Parse, don't validate": `unknown` at the boundary becomes typed data or a 400. Schemas are the single source of truth for both runtime checks and types.
- Replacing my hand-written `parse…` helpers from Module 02 with Zod schemas parsed inside each handler (Express 5's `req.query` is read-only), and comparing the two so I see what the library automates.
- What belongs in a schema (shape, types, formats, size limits) vs. in the service (business rules that need data or must also apply outside HTTP).
- Operational vs. programmer errors; the central error handler; never leaking internals in a 500.
- Config validated at startup (fail fast), with nothing outside `config.ts` reading `process.env`.
- Structured logs with request IDs and redaction. Ask me what question each log field helps answer.
- The "break your own API" exercise: push me to be adversarial with my own endpoints.
- Watch for these common misconceptions and correct them when they show up: believing TypeScript types protect at runtime; treating query values as numbers; swallowing errors in `catch`; logging passwords, cookies, or tokens; keeping the process running after an uncaught exception.
- Hold me to this standard before I move on: no handler touches unvalidated input, every error is problem+json, logs share a request ID and contain no secrets, and a missing env var stops the server at boot with a clear message.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

## How to use this module

| Part | What you do | Kind |
|---|---|---|
| 1. Concepts | Trust boundaries, errors, config, and logging: why each one exists | 📖 Read |
| 2. Setup | Install Zod and pino; create `.env` | ⌨️ Type along |
| 3. Worked example A | `config.ts`: typed, validated configuration | ⌨️ Type along |
| 4. Worked example B | Logger + request-context middleware + a hardened error handler | ⌨️ Type along |
| 5. Worked example C | Steps routes rewritten with Zod schemas | ⌨️ Type along |
| 6. Toolbox | Zod and pino syntax | 🧰 Reference |
| 7. Challenges | Schemas for exercises, workouts, and sets; logging; breaking your own API | 🧩 You write |
| Checkpoint | 10 questions | ✍️ Quiz |

**The pattern this module teaches:** in Module 02 you wrote hand-made `parse…` helpers and `isRecord` checks. Here you'll see how a schema library replaces all of that with one declaration per input. That declaration is also where your TypeScript types come from. As before, the **steps** feature is the worked example, and you apply the pattern to the other three features.

## What you'll be able to do by the end
- Explain why TypeScript types don't protect a server at runtime, and where the trust boundary is.
- Write Zod schemas for bodies, params, and query strings, and derive TS types from them.
- Prevent mass assignment by construction.
- Distinguish operational errors from programmer errors, and handle both in one place.
- Load configuration from environment variables, validate it at startup, and fail fast.
- Emit structured JSON logs with a request ID on every line, and keep secrets out of them.

---

# Part 1 — 📖 Concepts

## 1.1 The trust boundary

Everything that comes from outside your process is **untrusted**: the request body, query string, path params, headers, cookies, uploaded files, and even environment variables. The edge where untrusted data enters is the **trust boundary**.

```
            UNTRUSTED                      │                 TRUSTED
                                           │
 curl / React app / attacker ── bytes ──▶  │ ──▶ parsed, validated, typed values ──▶ services ──▶ DB
 env vars (set by a human)  ────────────▶  │ ──▶ config object
                                           │
                               the trust boundary:
                         validate here, ONCE, thoroughly
```

**Why TypeScript doesn't help here:** types are erased when your code compiles. At runtime, `req.body` is whatever JSON the client sent. If you write:

```ts
const body = req.body as CreateWorkoutBody;   // ❌ a promise to the compiler that nobody checks
```

you've told TypeScript "trust me." TypeScript stops complaining, and the server crashes (or silently stores garbage) the first time someone sends `{"kind": 42}`.

## 1.2 "Parse, don't validate"

There are two styles of checking input:

| Validate (what M2's helpers did) | Parse |
|---|---|
| Check the input, then keep using the original `unknown` value | Turn the `unknown` value into a **new, typed value**, or fail |
| Each piece of code has to remember what was already checked | Past the boundary, the *type* records what was checked |
| Easy to check one field and forget another | Every field is described in one place |

```ts
// Parse: the result is a typed value, or an exception is thrown
const input = PutStepsBody.parse(req.body);   // input: { steps: number }
service.setDay(userId, date, input.steps);     // nothing downstream needs to re-check the type
```

## 1.3 Zod in one picture

Zod is a library for describing the shape of data. You describe it once, and you get two things:

```
                      const PutStepsBody = z.strictObject({ steps: z.number().int() })
                                   │
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
   RUNTIME: PutStepsBody.parse(req.body)       COMPILE TIME: type PutStepsBody = z.infer<typeof PutStepsBody>
   → returns { steps: number } or throws          → { steps: number }
```

**One source of truth.** If you add a field to the schema, the type updates automatically. That's why you'll delete the hand-written input types from Module 02 as you go.

## 1.4 Mass assignment

```ts
// ❌ Client sends: {"notes": "easy run", "userId": "someone-else", "createdAt": "1999-01-01T00:00:00Z"}
await repo.update(userId, id, { ...req.body });
```

Spreading client input into stored data lets the client set **any field**, including ones the server should own (`id`, `userId`, `createdAt`). This is **mass assignment**, and it's in the OWASP API Top 10 (you'll review that list in Module 07).

The fix is structural:
- Use **strict** schemas that *reject* unknown keys, or schemas that *strip* them.
- Pass **only the parsed result** onward, never `req.body`.
- The **server** sets server-owned fields.

## 1.5 Two kinds of errors

| Operational errors (expected) | Programmer errors (bugs) |
|---|---|
| Workout not found; duplicate exercise name; invalid input; body too large; rate limited; database briefly unreachable | `TypeError: Cannot read properties of undefined`; a wrong SQL column name; a missed `await` |
| Part of normal life. The client can do something about it. | Your code is wrong. Nothing the client does will fix it. |
| → a specific **4xx** (or **503**) with a helpful message | → a generic **500** with **no internal details** |
| Log at `info` or `warn` | Log at `error`, with the full stack trace, then fix the code |

You built the core of this in Module 02: services throw `AppError` subclasses, and **one** error handler turns them into responses. This module adds Zod's errors to that handler and makes sure every log line about a failure can be traced back to its request.

**Why never send internals in a 500:** a stack trace or raw error message can reveal file paths, library versions, SQL, table names, or even secrets. That's a gift to an attacker and useless to a legitimate client. The details go to **your logs**. The client gets a request ID it can quote when reporting the problem.

## 1.6 Process-level failures

Express catches errors that happen *during a request*. But some code runs outside any request: startup code, timers, background work. If that code throws, or a promise rejects with nobody listening:

- `uncaughtException`: a synchronous throw that nothing caught.
- `unhandledRejection`: a rejected promise that nothing awaited or `.catch()`ed.

Either one means the process is in an **unknown state**. Maybe a connection is half-open, or some data was half-written. The safe response: **log it at `fatal` and exit with a non-zero code.** A process manager (Docker, your platform) restarts a fresh, clean process. "Keep running and hope" is how small bugs turn into corrupted data.

## 1.7 Configuration: the twelve-factor way

Configuration is everything that changes between environments: port, log level, database URL, secrets.

- **Read it from environment variables.** The same build runs in development, test, and production with different env vars. You never edit code to deploy.
- **Validate it at startup.** If `DATABASE_URL` is missing, you want to find out **in the first second** of a deploy, not at 3am when the first query runs.
- **One typed `config` object.** Nothing else in the codebase reads `process.env`. That makes it easy to see every setting the app has.
- **`.env` files are for local development only.** Commit `.env.example` (names and safe example values); **never** commit `.env` (real values and secrets).

Node 24 can load `.env` files itself with the `--env-file` flag, so you don't need an extra library.

## 1.8 Structured logging

Compare:

```
console.log("user created workout")        →  user created workout

logger.info({ workoutId, kind, durationMs }, "workout created")
  →  {"level":30,"time":1760313600000,"requestId":"7f2c…","workoutId":"8f3c…","kind":"run","durationMs":12,"msg":"workout created"}
```

The second is a **structured log**: one JSON object per line. Log tools (and `grep` + `jq` on your laptop) can filter and aggregate it. You can ask questions like:
- "Show every 5xx on `/v1/workouts` in the last hour."
- "What's the slowest request today?"
- "Show me every log line for request `7f2c…`."

**Log levels**, from most to least severe: `fatal` → `error` → `warn` → `info` → `debug` → `trace`. Production usually runs at `info`; local development at `debug`. Setting the level to `warn` hides `info` and below.

**pino** is a fast, widely used JSON logger for Node. In development you pipe its output through `pino-pretty` for human-readable colored lines. In production you keep the raw JSON.

## 1.9 Request IDs and correlation

A single request may produce several log lines: the request started, a business event, an error, the request finished. A **request ID** is one random value attached to *all* of them.

```
{"requestId":"7f2c","msg":"workout created",...}
{"requestId":"7f2c","msg":"request completed","status":201,...}
{"requestId":"a91d","msg":"request rejected","status":400,...}
```

- **Generate one per request** (a UUID), unless the client sent an `X-Request-Id` header. Accepting one lets a request be traced across several services (a gateway, this API, a worker). **Validate it**: it's untrusted input that you're about to copy into every log line.
- **Echo it back** in the response's `X-Request-Id` header. When your React app shows "Something went wrong (ref 7f2c…)", you can find the exact log lines.

## 1.10 What must never be logged

Passwords, session tokens, cookies, `Authorization` headers, API keys, and full credit card or ID numbers. **A secret in a log is a leaked secret.** Logs are copied to log services, read by many people, and kept for a long time.

pino's **redaction** replaces chosen fields with `"[REDACTED]"` before the line is written. Redaction is a safety net, though, not a strategy. The real defense is never passing secrets to the logger in the first place: log IDs, not whole objects.

✅ **Before moving on:** explain 1.1, 1.4, and 1.5 out loud, without notes.

---

# Part 2 — ⌨️ Setup

```bash
npm install zod pino
npm install --save-dev pino-pretty
```

| Package | What it does |
|---|---|
| `zod` | Schemas → runtime parsing + TypeScript types. This course uses **Zod 4** syntax. |
| `pino` | Fast structured JSON logger |
| `pino-pretty` | Dev-only: turns JSON log lines into readable colored output |

Create **`.env`** (gitignored since Module 01) and **`.env.example`** (committed) with the same contents for now:

```dotenv
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

Update two scripts in `package.json` so Node loads `.env` when it exists:

```json
"dev": "tsx watch --env-file-if-exists=.env src/server.ts",
"start": "node --env-file-if-exists=.env dist/server.js",
```

`--env-file-if-exists` is a built-in Node flag: it reads `KEY=value` lines into `process.env` and does nothing if the file is missing. In production there's no `.env` file; the platform sets real environment variables instead.

---

# Part 3 — ⌨️ Worked example A: `src/config.ts`

```ts
import { z } from "zod";

// 1. Describe every setting the app reads from the environment.
//    Environment variables are ALWAYS strings, so numbers need z.coerce.
const ConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

// 2. The TypeScript type comes from the schema. There is no separate interface to keep in sync.
export type Config = z.infer<typeof ConfigSchema>;

// 3. Parse process.env once, at startup. If anything is wrong, print every problem and stop.
function loadConfig(): Config {
  const result = ConfigSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid configuration. Fix these environment variables:");
    for (const issue of result.error.issues) {
      const name = issue.path.map(String).join(".");
      console.error(`  - ${name}: ${issue.message}`);
    }
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();
```

**Reading it piece by piece:**
- **`z.object({...})`** describes an object. Unknown keys are **stripped** (dropped from the result). That's exactly what we want here, because `process.env` contains dozens of unrelated variables (`PATH`, `HOME`…).
- **`z.enum([...])`** allows only the listed strings.
- **`z.coerce.number()`** converts the string `"3000"` to the number `3000` *before* validating it. Without `coerce`, every env var would fail a number check, because env vars are always strings.
- **`.default(3000)`** is used when the variable is **missing** (`undefined`).
- **`safeParse`** never throws. It returns `{ success: true, data }` or `{ success: false, error }`. We use it here because we want to print *all* the problems nicely, not crash with a stack trace.
- **`issue.path.map(String).join(".")`** turns a path like `["PORT"]` into `"PORT"`. The `map(String)` is there because Zod paths may technically contain symbols, and `.join` can't handle those.
- **`process.exit(1)`** means fail fast: exit code 1 tells Docker or your platform that startup failed.
- **`export const config = loadConfig()`** runs once, the first time any file imports `config.ts`. Every other file imports `config`; **nothing else reads `process.env`.**

**Use it in `src/server.ts`:** replace `const PORT = Number(process.env.PORT ?? 3000);` with:

```ts
import { config } from "./config.js";
// ...
app.listen(config.PORT, (error?: Error) => { /* ... */ });
```

✅ **Try it**

```bash
npm run dev                           # starts normally
PORT=abc npm run dev                  # "PORT: Invalid input: expected number, received NaN" → exits
LOG_LEVEL=loud npm run dev            # lists the allowed values → exits
```

(Your exact message wording may differ slightly between Zod versions. What matters is that you get a clear message and an immediate exit.)

---

# Part 4 — ⌨️ Worked example B: logger, request context, and a hardened error handler

The data flows through these files in this order: **`logger.ts`** (create the logger) → **`types/express.d.ts`** (tell TypeScript about per-request values) → **`request-context.ts`** (attach a request ID and child logger to every request) → **`error-handler.ts`** (log errors and answer with problem+json) → **`server.ts`** (catch process-level failures).

## 4.1 `src/logger.ts`

```ts
import { pino } from "pino";
import { config } from "./config.js";

export const logger = pino({
  level: config.LOG_LEVEL,

  // Replace these fields with "[REDACTED]" wherever they appear in a log object.
  // A safety net: the real rule is "don't pass secrets to the logger."
  redact: {
    paths: [
      "password",
      "*.password",
      "headers.authorization",
      "headers.cookie",
      "*.headers.authorization",
      "*.headers.cookie",
    ],
    censor: "[REDACTED]",
  },

  // In development, pretty-print. Everywhere else, raw JSON lines on stdout.
  transport: config.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
});
```

- **`level`** comes from config, so you can turn on `debug` logs without changing code.
- **`redact.paths`**: `"*.password"` means "a `password` key one level deep in any object," for example `{ body: { password: "…" } }`.
- **`transport`** runs `pino-pretty` in a separate worker thread so formatting never slows down request handling.

## 4.2 `src/types/express.d.ts`

Express gives every response a `res.locals` object for **per-request data**. This file tells TypeScript what we'll put there.

```ts
import type { Logger } from "pino";

declare global {
  namespace Express {
    interface Locals {
      /** Unique ID for this request; also sent back as the X-Request-Id header. */
      requestId: string;
      /** A logger that automatically adds requestId to every line. */
      log: Logger;
    }
  }
}

export {};
```

- **`declare global { namespace Express { interface Locals {...} } }`** is *declaration merging*: you're adding fields to an interface that Express's types already declare. After this, `res.locals.log` is typed everywhere.
- **`export {}`** makes this file a module. TypeScript requires that for `declare global` to work.
- It's a **`.d.ts`** (declaration-only) file, so it produces no JavaScript.

## 4.3 `src/middleware/request-context.ts` (replaces `request-logger.ts`)

```ts
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger.js";

// An incoming X-Request-Id is untrusted: accept only short, plain IDs.
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,100}$/;

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  // 1. Pick the request ID: reuse a safe incoming one, or make a new one.
  const incomingId = req.get("x-request-id");
  let requestId: string;
  if (incomingId !== undefined && SAFE_REQUEST_ID.test(incomingId)) {
    requestId = incomingId;
  } else {
    requestId = randomUUID();
  }

  // 2. Store it, plus a child logger that stamps it onto every line.
  res.locals.requestId = requestId;
  res.locals.log = logger.child({ requestId });
  res.set("X-Request-Id", requestId);

  // 3. When the response finishes, write one summary line.
  const start = performance.now();
  res.on("finish", () => {
    const details = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(performance.now() - start),
    };

    if (res.statusCode >= 500) {
      res.locals.log.error(details, "request failed");
    } else if (res.statusCode >= 400) {
      res.locals.log.warn(details, "request rejected");
    } else {
      res.locals.log.info(details, "request completed");
    }
  });

  next();
}
```

- **`logger.child({ requestId })`** creates a logger that adds `requestId` to every line it writes. Any code holding `res.locals.log` gets correlation for free.
- **pino's call shape is `log.info(object, message)`**: structured fields first, then a short constant message. Keep messages constant ("request completed") and put variable data in the object, so you can search for all lines with that message.
- **The summary line's level depends on the status**, so `level >= 50` (error) finds every 5xx.

In `app.ts`, replace `app.use(requestLogger)` with `app.use(requestContext)` and delete `request-logger.ts`. It must stay the **first** middleware, so that everything after it has `res.locals.log`.

## 4.4 `src/middleware/error-handler.ts` (hardened)

Changes from Module 02:
1. A single `sendProblem` helper, instead of repeating the response-building code in each branch.
2. A **`ZodError` branch** that turns schema failures into a 400 with field errors.
3. A **request ID** in every problem response, so users can report it.
4. **Logging** through `res.locals.log`: client errors at `info`, unexpected ones at `error` with the stack trace.

```ts
import { STATUS_CODES } from "node:http";
import type { ErrorRequestHandler, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../logger.js";
import { AppError, PROBLEM_JSON, type FieldError } from "../shared/errors.js";

interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: FieldError[];
}

function sendProblem(req: Request, res: Response, problem: Problem): void {
  res
    .status(problem.status)
    .type(PROBLEM_JSON)
    .json({
      ...problem,
      instance: req.originalUrl,
      requestId: res.locals.requestId,
    });
}

/** Converts Zod's issues into our FieldError shape: [{ path: "steps", message: "..." }] */
function toFieldErrors(error: ZodError): FieldError[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.map(String).join(".") : "(root)";
    return { path, message: issue.message };
  });
}

/** Errors created by express.json(): malformed JSON (400) or a body over the limit (413). */
function isBodyParserError(err: unknown): err is { status: number; type: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof err.status === "number" &&
    "type" in err &&
    typeof err.type === "string" &&
    err.type.startsWith("entity.")
  );
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Fall back to the root logger if the error happened before requestContext ran.
  const log = res.locals.log ?? logger;

  if (res.headersSent) {
    log.error({ err }, "error after response started");
    next(err);
    return;
  }

  // 1. Schema validation failed at the trust boundary.
  if (err instanceof ZodError) {
    log.info({ errors: toFieldErrors(err) }, "validation failed");
    sendProblem(req, res, {
      type: "https://fittrack.dev/problems/validation",
      title: "Invalid request",
      status: 400,
      detail: "One or more fields are invalid",
      errors: toFieldErrors(err),
    });
    return;
  }

  // 2. Expected errors thrown by services or routes.
  if (err instanceof AppError) {
    log.info({ errorName: err.name, status: err.status }, err.message);
    const problem: Problem = {
      type: err.type,
      title: err.title,
      status: err.status,
      detail: err.message,
    };
    if (err.fieldErrors) {
      problem.errors = err.fieldErrors;
    }
    sendProblem(req, res, problem);
    return;
  }

  // 3. Body parser errors from express.json().
  if (isBodyParserError(err)) {
    let detail = "The request body could not be read";
    if (err.type === "entity.parse.failed") detail = "Request body is not valid JSON";
    if (err.type === "entity.too.large") detail = "Request body is too large";
    sendProblem(req, res, {
      type: "about:blank",
      title: STATUS_CODES[err.status] ?? "Bad Request",
      status: err.status,
      detail,
    });
    return;
  }

  // 4. Anything else is a bug: log everything, reveal nothing.
  log.error({ err }, "unhandled error");
  sendProblem(req, res, {
    type: "about:blank",
    title: "Internal Server Error",
    status: 500,
    detail: "Something went wrong. Quote the requestId if you report this.",
  });
};
```

- **`log.error({ err }, ...)`**: pino has a built-in serializer for the key `err`. It writes the error's `type`, `message`, and `stack` as JSON fields.
- **`res.locals.log ?? logger`** covers errors raised before `requestContext` ran (rare, but possible).
- **The body-parser check narrowed in M2** now also requires `type` to start with `"entity."`, so it only matches errors that really came from `express.json()`.
- **Order matters:** specific branches first, the 500 fallback last.

## 4.5 `src/server.ts`: process-level safety nets

Add these near the top of `server.ts`, after the imports:

```ts
import { logger } from "./logger.js";

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "unhandled promise rejection; exiting");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "uncaught exception; exiting");
  process.exit(1);
});
```

And replace the `console.log` in the `listen` callback with `logger.info({ port: config.PORT }, "fittrack-api listening")`.

**Only `server.ts` registers these.** It's the process entry point. Library code never calls `process.exit`.

✅ **Try it:** with `npm run dev` running:

```bash
curl -i localhost:3000/v1/steps/2026-10-11                    # see X-Request-Id in the response headers
curl -i -H 'X-Request-Id: test-123' localhost:3000/health      # the same ID comes back, and appears in your terminal
curl -i -H 'X-Request-Id: <script>' localhost:3000/health      # unsafe → replaced with a fresh UUID
```

Temporarily add `app.get("/boom", () => { throw new Error("db password is hunter2"); });` and request it. The client sees a generic 500 with a `requestId`; your terminal shows the full stack under the same ID. Then delete the route.

---

# Part 5 — ⌨️ Worked example C: steps routes with Zod

## 5.1 `src/modules/steps/steps.schemas.ts`

```ts
import { z } from "zod";
import { isCalendarDate } from "../../shared/dates.js";

/** A real calendar date in YYYY-MM-DD form. Reuses the helper from Module 02. */
export const CalendarDate = z.string().refine(isCalendarDate, {
  message: "must be a real calendar date in YYYY-MM-DD format",
});

// PUT /v1/steps/:date  and  GET/DELETE /v1/steps/:date
export const StepsDateParams = z.object({
  date: CalendarDate,
});

// PUT /v1/steps/:date body
export const PutStepsBody = z.strictObject({
  steps: z.number().int(),
});
export type PutStepsBody = z.infer<typeof PutStepsBody>;

// GET /v1/steps?from=&to=
export const ListStepsQuery = z.object({
  from: CalendarDate,
  to: CalendarDate,
});
export type ListStepsQuery = z.infer<typeof ListStepsQuery>;
```

**The design decisions:**
- **`z.strictObject` for bodies** rejects unknown keys with a 400. That blocks mass assignment and catches client typos like `{"step": 9412}`.
- **`z.object` (not strict) for query strings** ignores unknown query parameters. Browsers, proxies, and analytics tools sometimes add their own (`?utm_source=…`), and rejecting those would cause pointless failures.
- **What the schema checks vs. what the service checks:**

  | Schema (route layer): shape, types, formats | Service: business rules |
  |---|---|
  | `steps` is a whole number | `steps` is 0–100,000 |
  | `date` is a real `YYYY-MM-DD` date | `date` isn't in the future |
  | Only known fields are present | `from` ≤ `to`, range ≤ 366 days |

  The service rules must also hold for inputs that never pass through HTTP (the CSV import in Module 08), so they stay in the service.
- **`export const PutStepsBody` and `export type PutStepsBody` share a name.** That's legal in TypeScript (one is a value, one is a type), and it's a common Zod convention.
- **Shared schemas:** when a second feature needs `CalendarDate` (workouts do, in Challenge 2), move it to `src/shared/schemas.ts` and import it from both places.

## 5.2 `src/modules/steps/steps.routes.ts` (rewritten)

```ts
import express, { type Router } from "express";
import { DEV_USER_ID } from "../../shared/dev-user.js";
import { ListStepsQuery, PutStepsBody, StepsDateParams } from "./steps.schemas.js";
import type { StepsService } from "./steps.service.js";

export function createStepsRouter(service: StepsService): Router {
  const router = express.Router();

  // GET /v1/steps?from=YYYY-MM-DD&to=YYYY-MM-DD
  router.get("/", async (req, res) => {
    const query = ListStepsQuery.parse(req.query);
    const days = await service.listRange(DEV_USER_ID, query.from, query.to);
    res.json({ data: days });
  });

  // GET /v1/steps/:date
  router.get("/:date", async (req, res) => {
    const params = StepsDateParams.parse(req.params);
    const record = await service.getDay(DEV_USER_ID, params.date);
    res.json(record);
  });

  // PUT /v1/steps/:date   body: { "steps": 9412 }
  router.put("/:date", async (req, res) => {
    const params = StepsDateParams.parse(req.params);
    const body = PutStepsBody.parse(req.body);

    const result = await service.setDay(DEV_USER_ID, params.date, body.steps);

    if (result.created) {
      res.location(`${req.baseUrl}/${params.date}`);
      res.status(201);
    } else {
      res.status(200);
    }
    res.json(result.record);
  });

  // DELETE /v1/steps/:date
  router.delete("/:date", async (req, res) => {
    const params = StepsDateParams.parse(req.params);
    await service.deleteDay(DEV_USER_ID, params.date);
    res.sendStatus(204);
  });

  return router;
}
```

**What changed, and why it's better:**
- `parseDate`, `parseStepsBody`, and the `isRecord` checks are **gone**. Each handler starts with one `.parse(...)` per input.
- **`.parse` throws a `ZodError` on bad input.** You don't catch it: Express 5 forwards it to `errorHandler`, which answers with a 400 listing every problem.
- **Why parse inside the handler instead of in a separate "validate" middleware?** In Express 5, `req.query` is read-only, so a middleware can't replace it with the parsed version. Parsing in the handler also keeps the typed result (`params`, `query`, `body`) right where it's used, so you can see at a glance what each handler accepts.

✅ **Try it:** rerun the Module 02 steps table (Part 3.6). Every status should be the same. Then compare the error bodies:

```bash
curl -s -X PUT localhost:3000/v1/steps/2026-10-11 -H 'Content-Type: application/json' \
  -d '{"steps":"lots","stepz":1}'
# → 400 with errors listing BOTH the bad type of "steps" and the unrecognized key "stepz"
```

```bash
git add -A && git commit -m "feat: zod validation, typed config, structured logging for steps"
```

---

# Part 6 — 🧰 Toolbox

## 6.1 Zod cheat sheet

```ts
import { z } from "zod";

// Primitives and formats
z.string().trim().min(1).max(60)          // trims whitespace first, then checks the length
z.number().int().min(0).max(500_000)
z.boolean()
z.uuid()                                   // a UUID string
z.iso.datetime({ offset: true })           // ISO 8601 instant; allows "Z" or "+hh:mm" / "-hh:mm"

// Enums from your existing constant arrays
export const WORKOUT_KINDS = ["strength", "run", "walk", "cycle", "other"] as const;
z.enum(WORKOUT_KINDS)                      // only those strings; the type is the union

// Missing vs. null
z.string().optional()                      // string | undefined   (the key may be missing)
z.string().nullable()                      // string | null        (the key must be present)
z.string().nullable().optional()           // string | null | undefined  (PATCH-friendly)

// Defaults (used when the value is undefined)
z.number().default(20)

// Query strings are strings: coerce them
z.coerce.number().int().min(1).max(100).default(20)
//   "20"  → 20      ✔
//   "abc" → NaN     ✘ fails .int()
//   ""    → 0       ✘ fails .min(1)   (Number("") is 0, the trap from M2)

// Objects
z.object({ ... })                          // unknown keys are STRIPPED
z.strictObject({ ... })                    // unknown keys are REJECTED (use for bodies)
Schema.partial()                           // every key becomes optional (handy for PATCH)

// Transform after validating: normalize instants to UTC
z.iso.datetime({ offset: true }).transform((value) => new Date(value).toISOString())

// One custom rule
z.number().refine((n) => Math.round(n * 100) === n * 100, { message: "at most 2 decimal places" })

// A rule involving several fields: refine the whole object, and point at one field
z.strictObject({ a: z.number(), b: z.number() })
  .refine((obj) => obj.b > obj.a, { message: "b must be greater than a", path: ["b"] })

// "At least one field" for PATCH bodies
UpdateSchema.refine((obj) => Object.keys(obj).length > 0, { message: "provide at least one field" })

// Parsing
Schema.parse(value)                        // returns typed data, or THROWS ZodError
Schema.safeParse(value)                    // { success: true, data } | { success: false, error }

// Types
type Output = z.infer<typeof Schema>       // the type AFTER parsing (transforms and defaults applied)
type Input  = z.input<typeof Schema>       // the type BEFORE parsing
```

**PATCH and `null`.** For `PATCH /v1/workouts/:id`, you need "absent" (don't change), "a value" (set it), and `null` (clear it). A schema like `notes: z.string().max(2000).nullable().optional()` gives you exactly that: `undefined` (absent) / `string` / `null`. After parsing, `Object.hasOwn(body, "notes")` still tells you whether the client sent the key at all.

**Where business rules go.** Zod *can* express "endedAt after startedAt" with `.refine`, but for workouts, the M2 rule is "validate the **merged** workout," and that only exists in the service. Keep cross-field business rules in the service. Use schemas for shape, types, formats, and size limits.

## 6.2 pino cheat sheet

```ts
res.locals.log.info({ workoutId: created.id, kind: created.kind }, "workout created");
res.locals.log.warn({ exerciseId }, "exercise name conflict");
res.locals.log.error({ err }, "failed to import row");      // `err` key → message + stack serialized
res.locals.log.debug({ query }, "listing workouts");        // hidden unless LOG_LEVEL=debug

const jobLog = logger.child({ jobId });                      // outside requests (Module 08)
```

**What to log:** IDs, kinds, counts, durations, statuses, the decision that was made.
**What not to log:** whole request bodies, passwords, tokens, cookies, anything a user typed into a free-text field like `notes` (it may contain personal information).

**Reading JSON logs in production style:**

```bash
LOG_LEVEL=info NODE_ENV=production npm start | grep '"requestId":"test-123"'
```

---

# Part 7 — 🧩 Challenges

## Challenge 1: Exercises schemas ★☆☆

Create `src/modules/exercises/exercises.schemas.ts` and rewrite the exercises routes to use it, the same way 5.1–5.2 did for steps.

| Schema | Rules |
|---|---|
| `ExerciseIdParams` | `id`: a UUID |
| `ListExercisesQuery` | `category`: optional, one of the six categories |
| `CreateExerciseBody` | strict; `name`: trimmed string, 1–60 characters; `category`: required enum |
| `UpdateExerciseBody` | strict; `name?`, `category?`; at least one present |

Delete the hand-written parsing helpers and input types the schemas replace.

✅ **Acceptance tests:** every exercises test from Module 02 still passes, plus:

```bash
curl -i localhost:3000/v1/exercises/not-a-uuid               # 400, errors[0].path "id"
curl -i -X PATCH localhost:3000/v1/exercises/<custom id> -H 'Content-Type: application/json' -d '{}'
                                                             # 400 "provide at least one field"
curl -i -X POST localhost:3000/v1/exercises -H 'Content-Type: application/json' \
  -d '{"name":"","category":"arms","id":"x"}'                # 400 listing all three problems
```

> **A decision to make:** in Module 02 a malformed `:id` returned 404. With a UUID schema it becomes 400. Both are defensible. Pick one rule for the whole API and write it in the decisions log.

<details><summary>💡 Hint 1</summary>

Copy the shape of `steps.schemas.ts`. You need `z.uuid()`, `z.enum(...)`, `z.strictObject`, `.partial()`, and `.refine` (toolbox 6.1).
</details>

<details><summary>💡 Hint 2</summary>

Build `CreateExerciseBody` first, then derive the update schema from it: `CreateExerciseBody.partial().refine(...)`. The duplicate-name check stays in the service. It needs data, and schemas only see the input.
</details>

---

## Challenge 2: Workouts schemas ★★☆

`src/modules/workouts/workouts.schemas.ts`:

| Schema | Rules |
|---|---|
| `WorkoutIdParams` | `id`: UUID |
| `CreateWorkoutBody` | strict. `kind`: enum. `startedAt`: ISO instant with offset → **transformed to UTC**. `endedAt`: same, nullable, optional. `distanceM`: integer ≥ 0, nullable, optional. `notes`: trimmed, max 2,000, nullable, optional; an empty string becomes `null`. |
| `UpdateWorkoutBody` | strict; every field optional; at least one present |
| `ListWorkoutsQuery` | `limit`: coerced int 1–100, default 20. `cursor`: optional string. `kind`: optional enum. `from` / `to`: optional calendar dates. `sort`: `"startedAt"` or `"-startedAt"`, default `"-startedAt"`. |

The service keeps the cross-field rules from Module 02 (end after start, the 24-hour limit, distance only for cardio kinds, the 5-minute future limit), because it validates the **merged** workout.

✅ **Acceptance tests:** every Module 02 workouts and pagination test still passes, plus:

```bash
# Normalized to UTC by the schema
curl -s -X POST localhost:3000/v1/workouts -H 'Content-Type: application/json' \
  -d '{"kind":"walk","startedAt":"2026-10-12T18:00:00-07:00"}'            # startedAt "2026-10-13T01:00:00.000Z"

curl -i 'localhost:3000/v1/workouts?limit=abc'      # 400, path "limit"
curl -i 'localhost:3000/v1/workouts?limit='         # 400 (the empty-string trap)
curl -i 'localhost:3000/v1/workouts?utm_source=x'   # 200: unknown query params are ignored
curl -i -X POST localhost:3000/v1/workouts -H 'Content-Type: application/json' \
  -d '{"kind":"run","startedAt":"2026-10-11 07:00"}'                      # 400: no timezone
curl -s -X POST localhost:3000/v1/workouts -H 'Content-Type: application/json' \
  -d '{"kind":"run","startedAt":"2026-10-11T07:00:00Z","notes":"   "}'    # notes: null
```

<details><summary>💡 Hint 1</summary>

Write a reusable `IsoInstant` schema (datetime with offset, transformed to UTC) and use it for both `startedAt` and `endedAt`. For notes: trim, then transform an empty string to `null`.
</details>

<details><summary>💡 Hint 2</summary>

For notes, the order is: `z.string().trim().max(2000).transform(...)`, then `.nullable().optional()`. For the cursor, the schema only checks that it's a string. Decoding stays in your pagination helper from Module 02, which should now throw a `ValidationError` for a bad cursor.
</details>

<details><summary>💡 Hint 3: sketch</summary>

```
IsoInstant = iso datetime (offset allowed) → transform to new Date(v).toISOString()
Notes      = string → trim → max 2000 → transform (v === "" ? null : v)
CreateWorkoutBody = strictObject {
  kind: enum,  startedAt: IsoInstant,
  endedAt: IsoInstant nullable optional,
  distanceM: int ≥ 0 nullable optional,
  notes: Notes nullable optional
}
UpdateWorkoutBody = CreateWorkoutBody.partial() + refine(at least one key)
```
</details>

---

## Challenge 3: Sets schemas ★★☆

`src/modules/sets/sets.schemas.ts`:

| Schema | Rules |
|---|---|
| `WorkoutSetParams` | `workoutId`: UUID; `setId`: UUID (where present) |
| `CreateSetBody` | strict. `exerciseId`: UUID. `reps`: int 1–1000. `weightKg`: number 0–1000, at most 2 decimals. `rpe`: 1–10 in steps of 0.5, nullable, optional. |
| `UpdateSetBody` | strict; partial; at least one field |

Keep the 404, 409, and 422 rules (workout exists and is mine, strength only, usable exercise) in the service. They need data.

✅ **Acceptance:** every Module 02 sets test still passes. `{"reps":5,"weightKg":100,"exerciseId":"x"}` → 400 with path `exerciseId`. `{"setNumber":3,...}` → 400 unrecognized key.

<details><summary>💡 Hint</summary>

Use `.refine` for the 2-decimal rule (toolbox 6.1) and `.multipleOf(0.5)` for RPE. Floating-point math is why the 2-decimal check uses rounding instead of `multipleOf(0.01)`.
</details>

---

## Challenge 4: Prove the edges still hold ★☆☆

You changed a lot of plumbing. Re-verify every edge case **and add each one to `requests.http`**:

| Request | Expected |
|---|---|
| Malformed JSON body | 400, `detail` "Request body is not valid JSON", has `requestId` |
| A 200 KB JSON body | 413 |
| `Content-Type: text/plain` on POST/PUT/PATCH | 415 |
| An unknown route | 404 problem+json |
| A route that throws (temporary `/boom`) | 500, generic message, `requestId`; the stack trace appears in the logs only |
| Every error response | `Content-Type: application/problem+json` |

Also update `not-found.ts` to include `requestId` in its body.

---

## Challenge 5: Useful logs ★★☆

1. **Business events.** After each successful create, update, or delete in workouts, sets, and exercises, log one line at `info` from the route, with IDs and kinds only. For example: `res.locals.log.info({ workoutId, kind }, "workout created")`.
2. **Find a request.** Send a request with `-H 'X-Request-Id: find-me-001'` that fails validation. Find all of its log lines by running the server with `NODE_ENV=production` (raw JSON) and filtering with `grep`. Write in the tracker how many lines it produced and what each one says.
3. **Prove redaction.** Temporarily add `res.locals.log.info({ body: { password: "hunter2" } }, "test")` to a route, check that the output shows `[REDACTED]`, then remove it.

✅ **Done when:** every mutating route logs exactly one business event, and no log line contains request bodies or notes.

<details><summary>💡 Hint</summary>

Production mode has no pretty transport, so each line is JSON. `npm run build && NODE_ENV=production LOG_LEVEL=info npm start | grep find-me-001`. If you have `jq` installed, `| jq .` makes the output readable.
</details>

---

## Challenge 6: Break your own API ★★☆

Spend 30 minutes trying to make your API return a **500** or accept **bad data**. Think like an attacker or a careless client. Ideas:

- Wrong types everywhere (`"steps": true`, `"reps": "5"`, `"kind": ["run"]`)
- Huge values (`"distanceM": 1e308`, a 5,000-character `name`)
- Impossible dates (`2026-02-30`, `2026-13-01`, `"startedAt":"2026-10-11T25:00:00Z"`)
- Repeated query params (`?kind=run&kind=walk`, `?limit=1&limit=2`)
- Server-owned fields (`id`, `userId`, `createdAt`, `setNumber`, `durationS`)
- `null` where an object is expected (body `null`, body `[]`, body `"text"`)
- Unicode (`"name": "🏋️ Squat"`): should it be allowed? Decide.

Record every attempt in the tracker table. **Anything that returned 500 is a bug:** fix it, then add the request to `requests.http`.

---

## Challenge 7: Config discipline ★☆☆

1. Search the codebase for `process.env`. The only hits should be in `config.ts`.
2. Add a setting `BODY_LIMIT` (default `"100kb"`) to the config schema, and use it in `express.json({ limit: config.BODY_LIMIT })`.
3. Make sure `.env.example` lists every setting, with safe example values.

✅ **Done when:** `grep -rn "process.env" src | grep -v config.ts` prints nothing, and starting with `BODY_LIMIT` unset still works (the default applies).

```bash
git add -A && git commit -m "feat: zod schemas for all features, hardened errors, structured logs"
```

---

## Definition of done

- [ ] No handler reads `req.body`, `req.query`, or `req.params` without a schema `.parse`.
- [ ] Hand-written parsing helpers and duplicate input types from Module 02 are deleted.
- [ ] Every error response is problem+json with a `requestId`; no 500 contains internal details.
- [ ] Every log line for a request shares one request ID; secrets and bodies never appear in logs.
- [ ] A bad or missing required env var stops the server at boot with a clear message.
- [ ] Challenge 6 findings are recorded, and every 500 you found is fixed.
- [ ] `typecheck` and `lint` pass.

---

## ✍️ Checkpoint

1. The code is fully typed. Why do you still need runtime validation? Where exactly is the trust boundary in `fittrack-api`?
2. What is mass assignment? Show how a client could abuse `PATCH /v1/workouts/:id` if you spread `req.body` into the update, and name the two things in your code that now prevent it.
3. A client sends a malformed JSON body. Which piece of code produces the error, which branch of your error handler handles it, and what does the client receive?
4. Classify each as operational or programmer error, and give the status code: (a) workout not found; (b) DB connection refused; (c) `TypeError: Cannot read properties of undefined`; (d) duplicate custom exercise name; (e) a Zod parse failure.
5. Why shouldn't a 500 response include the error message or stack trace? Where does that information go instead, and how does a user help you find it?
6. Why fail fast at startup when a required setting is missing, instead of failing on first use?
7. Why structured JSON logs instead of `console.log` strings? Write one question you could answer from your logs that you couldn't easily answer otherwise.
8. What is a request ID for? Why accept one from an incoming header, and why validate it?
9. How does `?limit=20` become a number in your code? What do `?limit=abc`, `?limit=`, and `?limit=10000` do, and why?
10. **Code reading.** What's wrong with this, and what would you write instead?
    ```ts
    router.post("/", async (req, res) => {
      const body = req.body as CreateWorkoutBody;
      const created = await service.create(DEV_USER_ID, body);
      console.log("created workout", created);
      res.status(201).json(created);
    });
    ```

**Explain it back:** Trace a request with `"weightKg": -20` from arrival to the response the client sees. Name every piece of code it passes through, and every log line it produces.

---

## 📋 Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Progress
- [ ] Part 1: Concepts read (1.1–1.10)
- [ ] Part 2: Setup
- [ ] Part 3: `config.ts` typed and tested
- [ ] Part 4: Logger, request context, error handler, process handlers
- [ ] Part 5: Steps routes on Zod
- [ ] Challenge 1: Exercises schemas
- [ ] Challenge 2: Workouts schemas
- [ ] Challenge 3: Sets schemas
- [ ] Challenge 4: Edge cases re-verified
- [ ] Challenge 5: Useful logs
- [ ] Challenge 6: Break your own API
- [ ] Challenge 7: Config discipline
- [ ] Checkpoint passed (≥ 8/10)

### Concepts I can explain without notes
- [ ] The trust boundary; why types don't protect at runtime (1.1)
- [ ] Parse, don't validate (1.2)
- [ ] Schemas as the single source of truth for types (1.3)
- [ ] Mass assignment and its structural fix (1.4)
- [ ] Operational vs. programmer errors (1.5)
- [ ] Why the process exits on unknown failures (1.6)
- [ ] Twelve-factor config and failing fast (1.7)
- [ ] Structured logging and levels (1.8)
- [ ] Request IDs and correlation (1.9)
- [ ] What never to log; redaction as a safety net (1.10)

### "Break your API" findings (Challenge 6)
| Input sent | Response before fix | Fix |
|---|---|---|
| | | |

### Request trace (Challenge 5.2)
| Log line # | Level | Message | What it tells me |
|---|---|---|---|
| | | | |

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
- Zod documentation: https://zod.dev/
- "Parse, don't validate" (Alexis King): https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/
- pino: https://getpino.io/
- Express error handling: https://expressjs.com/en/guide/error-handling.html
- Node.js `--env-file`: https://nodejs.org/api/cli.html#--env-fileconfig
- The Twelve-Factor App, Config: https://12factor.net/config
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
