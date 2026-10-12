# Module 03: Validation, Error Handling, Config & Logging

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Estimated time** | 6–8 hours |
| **Prerequisites** | Module 02 |
| **Project milestone** | Every input validated with Zod, one central error handler emitting problem+json, config validated at startup, structured request logs |

## Why this matters
Most production incidents start at the edges: unexpected input, unhandled errors, missing config, or logs nobody can search. This module makes your API predictable: bad input gets a clear 4xx, bugs get a safe 500 plus a useful log line, and a misconfigured deploy fails on boot instead of at 2am.

## Learning objectives
- Explain why TypeScript types alone don't protect a server.
- Validate body, query, and params with Zod, and derive TS types from the schemas.
- Prevent mass assignment.
- Separate operational errors from programmer errors, and handle both centrally.
- Load and validate configuration from the environment (12-factor).
- Emit structured JSON logs with request IDs and redaction.

---

## Learn

### 3.1 The trust boundary
TypeScript types are erased at runtime. `req.body` is whatever bytes the client sent, parsed into *something*. Typing it as `CreateWorkoutInput` is a lie the compiler can't catch.

**"Parse, don't validate":** at the boundary, turn `unknown` into a typed value, or reject the request. Past that point, the rest of your code can trust its types.

### 3.2 Zod schemas
```ts
import { z } from "zod";

export const WorkoutKind = z.enum(["strength", "run", "walk", "cycle", "other"]);

export const CreateWorkoutBody = z
  .object({
    kind: WorkoutKind,
    startedAt: z.iso.datetime({ offset: true }),
    endedAt: z.iso.datetime({ offset: true }).optional(),
    distanceM: z.number().int().nonnegative().max(500_000).optional(),
    notes: z.string().trim().max(2_000).optional(),
  })
  .strict()
  .refine((w) => !w.endedAt || new Date(w.endedAt) > new Date(w.startedAt), {
    message: "endedAt must be after startedAt",
    path: ["endedAt"],
  });

export type CreateWorkoutBody = z.infer<typeof CreateWorkoutBody>;
```
- **One source of truth:** the schema defines both the runtime check and the static type. Delete any hand-written duplicate types.
- **Query strings are always strings.** Use `z.coerce.number().int().min(1).max(100).default(20)` for `limit`.
- Validate **params** too: `:id` must be a UUID, and `:date` must be a real `YYYY-MM-DD` date.
- Set bounds on everything (string lengths, number ranges, array sizes). Unbounded input is an attack surface.

### 3.3 Mass assignment
```ts
// ❌ The client sends {"notes":"…","userId":"someone-else"}
await repo.update(userId, id, { ...req.body });
```
Use `.strict()` (reject unknown keys) or Zod's default stripping, and pass only the parsed object onward. The **server** decides fields like `userId`, `id`, and `createdAt`. Clients never get to set them.

### 3.4 A validation middleware
Write one reusable helper, such as `validate({ body, query, params })`. It parses each part, puts the typed results somewhere your handler can use them, and turns a `ZodError` into a 400 problem response listing every field error (`path` + `message`).

### 3.5 Two kinds of errors
| Operational (expected) | Programmer (bugs) |
|---|---|
| Workout not found, duplicate name, invalid input, rate limited, DB temporarily unreachable | `undefined is not a function`, a wrong SQL column, a missed null check |
| → a meaningful 4xx (or 503), with a message the client can act on | → a generic 500 with **no internal details**; log everything; fix the code |

Create an `AppError` hierarchy (`NotFoundError`, `ConflictError`, `ValidationError`, `ForbiddenError`…) that carries a status and problem type. Services `throw new NotFoundError("Workout")`, and only the **central error handler** turns errors into HTTP responses.

Express 5 forwards rejected promises from async handlers to the error middleware. Error middleware is recognized by having **four parameters**: `(err, req, res, next)`.

Two other cases:
- **Malformed JSON:** `express.json()` throws a `SyntaxError`. Map it to 400, not 500.
- **Unknown route:** add a catch-all 404 handler, registered after every route.

### 3.6 Process-level failures
- An `unhandledRejection` or `uncaughtException` means the process is in an unknown state. Log it at `fatal` and **exit**, and let the process manager or platform restart you.
- Trying to "keep running" after an unknown failure is how you end up corrupting data.

### 3.7 Configuration (12-factor)
- Config comes from **environment variables**: `PORT`, `NODE_ENV`, `LOG_LEVEL`, and later `DATABASE_URL`, `REDIS_URL`, and `SESSION_SECRET`.
- Parse it with Zod at startup into one typed `config` object. **If it's invalid, crash immediately** with a clear message.
- Commit `.env.example`. Never commit `.env`.
- Nothing outside `config.ts` reads `process.env`.

### 3.8 Structured logging
- `console.log("user did thing")` gives you a string you can only grep.
- **pino** gives you JSON: `{"level":30,"time":…,"reqId":"…","route":"/v1/workouts","status":201,"durationMs":12}`. Now you can query "all 5xx on `/v1/steps` in the last hour."
- **Levels:** `fatal`, `error`, `warn`, `info`, `debug`, `trace`. Use `info` in prod and `debug` locally.
- **Request ID:** accept an incoming `X-Request-Id` (so IDs can be traced across services) or generate one. Attach it to every log line for that request via a child logger, and echo it in the response header.
- **Redact** the `authorization` and `cookie` headers and any `password` field. A secret written to a log is a leaked secret.
- Pretty printing is for dev only. Production logs stay raw JSON on stdout.

---

## Build

- [ ] **B1** Write Zod schemas for every endpoint's body, query, and params. Derive the TS types from them, and delete the duplicate hand-written input types.
- [ ] **B2** Write the `validate` middleware. It returns 400 problem+json with field-level `errors`.
- [ ] **B3** Build the `AppError` hierarchy and a central error handler. Replace every ad-hoc error response from M2.
- [ ] **B4** Map malformed JSON to 400, and add a catch-all 404 for unknown routes.
- [ ] **B5** Write `src/config.ts` with Zod. Invalid or missing env crashes on boot with a readable message. Commit `.env.example`.
- [ ] **B6** Add pino + pino-http with request IDs (incoming or generated), redaction, and pretty printing in dev only.
- [ ] **B7** Add `unhandledRejection` / `uncaughtException` handlers that log and exit.
- [ ] **B8** **Break your own API.** Send: wrong types, extra fields (`userId`), huge numbers, negative weights, `2026-02-30`, an empty body, malformed JSON, a 5,000-character `notes` field, a non-UUID `:id`. Record each request and the response you got in your notes. Fix anything that returned 500.

## Definition of done
- No handler reads `req.body`, `req.query`, or `req.params` without validation.
- Every error response is problem+json, and no 500 response contains a stack trace or internal message.
- Every log line for a request shares one request ID, and secrets never appear in logs.
- Removing a required env var stops the server at boot with a clear message.

---

## Checkpoint

1. The code is fully typed. Why do you still need runtime validation?
2. What is mass assignment? Show how a client could abuse `PATCH /v1/workouts/:id` if you spread `req.body` into the update.
3. A client sends a malformed JSON body. Which part of the stack produces the error, and what status should the client receive?
4. Classify each as operational or programmer error, and give the status code: (a) workout not found; (b) DB connection refused; (c) `TypeError: Cannot read properties of undefined`; (d) duplicate custom exercise name; (e) a Zod parse failure.
5. Why shouldn't a 500 response include the error message or stack trace? Where should that information go instead?
6. Why fail fast at startup when `DATABASE_URL` is missing, instead of failing on the first query?
7. Why structured JSON logs instead of `console.log` strings? Write a question you could answer from structured logs that you couldn't easily answer otherwise.
8. What is a request ID for, and why accept one from an incoming header?
9. How do you correctly handle `?limit=20`, given that query values are strings? What should `?limit=abc` and `?limit=10000` do?
10. **Code reading.** Why does this error handler never run?
    ```ts
    app.use((err: Error, req: Request, res: Response) => {
      res.status(500).json({ error: "Something broke" });
    });
    ```

**Explain it back:** Trace a request with `"weightKg": -20` from arrival to the response the client sees, naming every piece of code it passes through, plus what gets logged.

---

## Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Concepts understood
- [ ] 3.1 Trust boundary, "parse, don't validate"
- [ ] 3.2 Zod schemas and inferred types
- [ ] 3.3 Mass assignment
- [ ] 3.4 Validation middleware
- [ ] 3.5 Operational vs programmer errors, central handler
- [ ] 3.6 Process-level failures
- [ ] 3.7 12-factor config
- [ ] 3.8 Structured logging, request IDs, redaction

### Checkpoint weak spots
—

### "Break your API" findings (B8)
| Input sent | Response before fix | Fix |
|---|---|---|
| | | |

### Notes
—

### Error log
| Error | Cause | Fix |
|---|---|---|
| | | |

### Open questions
—

## Resources
- Zod: https://zod.dev/
- Express error handling: https://expressjs.com/en/guide/error-handling.html
- pino: https://getpino.io/
- The Twelve-Factor App, Config: https://12factor.net/config
- "Parse, don't validate" (Alexis King): https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/
