# Module 09: Production Readiness: Observability, Containers & CI

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | ✅ Full |
| **Estimated time** | 14–18 hours |
| **Prerequisites** | Module 08 complete (API + worker + Postgres + Redis, all tested) |
| **Project milestone** | Liveness and readiness checks, graceful shutdown, Prometheus metrics, a multi-stage non-root Docker image, the whole stack in Compose, GitHub Actions CI, an OpenAPI spec, and load-test numbers |

## 🎓 Tutor prompt

Start every study session for this module in a **new chat** by pasting the prompt below. It sets Claude up as your teacher for this module: it reads the course files, picks up where you left off, follows the teaching rules (no solutions; syntax help and hints instead), quizzes you, and updates your tracker when you say **"wrap up."**

```text
You are my tutor for Module 09 of my backend engineering course: "Production Readiness: Observability, Containers & CI".

ROLE
Act as a site reliability / platform engineer who has containerized and operated Node.js services in production. You care about services that are observable, disposable, reproducible, and verified on every change. Teach the way a great senior engineer mentors a junior on their own team: patient, precise, Socratic, and honest when my work isn't good enough yet.

ABOUT ME
- I'm Mathew, a frontend engineer (React + TypeScript). I'm solid on JS/TS logic, but I don't know every Node, Express, SQL, or tooling API and syntax by heart.
- I'm building `fittrack-api`, an API that tracks my own physical activity (daily steps, workouts, lifting sets, exercises), to learn backend fundamentals properly.
- The course lives in my repo at `docs/course/`: `COURSE.md` (rules, given-vs-you-write table, decisions log, session log) plus one file per module.
- Stack for this module: Node.js LTS + TypeScript + Express 5 + PostgreSQL + Redis + my job worker, adding Docker, Docker Compose, GitHub Actions, prom-client metrics, and OpenAPI.

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/09-production-readiness.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
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
- Per COURSE.md, Dockerfiles, Compose files, and CI YAML are given with explanations. Make sure I can explain every line. The app-side code (health checks, graceful shutdown, metrics) is mine to write.
- Liveness vs. readiness, and what the platform does with each.
- Graceful shutdown: have me prove it with a real SIGTERM during a slow request.
- Image layering, multi-stage builds, non-root users, and `.dockerignore`.
- Metrics: RED per route template; label cardinality; reading p50/p95/p99 from my own load tests.
- OpenAPI as the contract for the future React frontend, generated from my Zod schemas with `z.toJSONSchema`.
- Watch for these common misconceptions and correct them when they show up: liveness checks that depend on the database; running migrations on every boot; trusting averages instead of percentiles; `npm install` in CI; running containers as root; putting user IDs in metric labels.
- Hold me to this standard before I move on: a fresh clone + `docker compose up` gives a working, migrated stack; CI is green and protects `main`; SIGTERM never drops an in-flight request; the OpenAPI spec matches the API.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

## How to use this module

| Part | What you do | Kind |
|---|---|---|
| 1. Concepts | Logs/metrics/traces, health checks, graceful shutdown, containers, CI, API contracts, percentiles | 📖 Read |
| 2. Worked example A | Liveness + readiness checks | ⌨️ Type along |
| 3. Worked example B | Graceful shutdown for the API, and how to test it | ⌨️ Type along |
| 4. Worked example C | A metrics registry and `/metrics` | ⌨️ Type along |
| 5. Given infrastructure | Dockerfile, `.dockerignore`, the full Compose stack, CI, Dependabot, every line explained | ⌨️ Type along |
| 6. Worked example D | OpenAPI generated from your Zod schemas, for the steps endpoints | ⌨️ Type along |
| 7. Toolbox | HTTP metrics, route labels, OpenAPI helpers, load testing | 🧰 Reference |
| 8. Challenges | Request metrics, worker hardening, the stack in Docker, CI green, the full API spec, load testing | 🧩 You write |
| Checkpoint | 10 questions | ✍️ Quiz |

**What's given here and what's yours** (per `COURSE.md`): the Dockerfile, Compose file, and CI workflow are configuration, so they're given in full. **Your job is to understand every line**, because the checkpoint asks about them. The app-side code (health, shutdown, metrics, the spec) is taught with one worked example each, then extended by you.

## What you'll be able to do by the end
- Choose between logs, metrics, and traces for a given question.
- Implement liveness and readiness correctly, and explain what the platform does with each.
- Shut down without dropping in-flight requests or abandoning jobs.
- Build a small, secure, cache-friendly Docker image and run the whole stack with Compose.
- Run a CI pipeline that lints, typechecks, tests against real services, and builds the image.
- Publish an OpenAPI spec as the contract for your React app.
- Load-test an endpoint and read p50/p95/p99 latency.

---

# Part 1 — 📖 Concepts

## 1.1 Observability: three signals

| Signal | What it is | Answers questions like | You have |
|---|---|---|---|
| **Logs** | One event, with context | "Why did *this* import fail?" | pino JSON lines with request IDs (Module 03) |
| **Metrics** | Numbers aggregated over time | "Did p95 latency double after yesterday's deploy?" "How many 5xx per minute?" | This module |
| **Traces** | One request's journey through components, with timings | "Inside this slow request, where did the 900 ms go?" | Mentioned; OpenTelemetry is the standard |

For request metrics, track **RED** for each route:
- **R**ate: requests per second
- **E**rrors: how many of them fail (5xx)
- **D**uration: how long they take, as a **histogram** so you can compute percentiles

**Label cardinality, the one rule that bites.** Every unique combination of label values creates a separate time series in your metrics system.
- `route="/v1/workouts/:id"`, `method="GET"`, `status_code="200"` → a handful of series. ✅
- `path="/v1/workouts/8f3c…"` (the raw URL) or `userId="…"` → **one series per workout, or per user**. Unbounded, and it can overwhelm a metrics backend. ❌

Label by the **route template**, never by IDs.

## 1.2 Liveness vs. readiness

| | Liveness (`/health/live`) | Readiness (`/health/ready`) |
|---|---|---|
| Question | "Is this process alive and responsive?" | "Should this instance receive traffic **right now**?" |
| Checks | Nothing external: the process just answers | Database reachable, Redis reachable, not shutting down |
| On failure, the platform… | **Restarts** the instance | **Stops routing traffic** to it (no restart) |

**Why liveness must not check the database:** if the database goes down for 30 seconds and liveness depends on it, the platform restarts *every* instance, over and over. Restarting doesn't fix the database, and now you also have a cold-start storm when it comes back. Readiness is the right signal: "don't send me traffic for a bit."

## 1.3 Graceful shutdown

Every deploy stops your old instances. The platform sends **`SIGTERM`**, waits a grace period (often 10–30 seconds), then sends **`SIGKILL`**, which can't be caught. In that window:

```
SIGTERM arrives
  1. mark "shutting down" → readiness returns 503
  2. wait a few seconds    → the load balancer notices and stops sending NEW requests
  3. server.close()        → stop accepting connections; in-flight requests finish normally
  4. close the DB pool and Redis
  5. exit(0)
  (a hard timer exits anyway if something hangs: better than being SIGKILLed mid-write)
```

**Without this,** every deploy cuts off whatever requests happen to be running: a `POST /v1/workouts` might commit but never respond (and the phone retries: hello, idempotency keys), or get cut off before committing. The worker is the same story: Module 08's `stop()` already finishes the current job before exiting.

## 1.4 Containers

A **Docker image** is a packaged filesystem: an OS base, Node, your `node_modules`, your compiled code. A **container** is a running instance of an image. Same image on your laptop, in CI, and in production, so "works on my machine" becomes "works in this image."

**Layers and caching.** Each Dockerfile instruction makes a layer. Docker reuses a layer if nothing it depends on changed. So you copy `package.json` + the lockfile and run `npm ci` **before** copying your source: code changes then skip the slow install step.

**Multi-stage builds.** Stage 1 has everything needed to *build* (TypeScript, dev dependencies). Stage 2 copies only what's needed to *run*. The result is smaller, faster to deploy, and has less inside for an attacker to use.

**Non-root.** By default, processes in a container run as root. If your app were ever compromised, the attacker would be root inside the container. The official Node images include a `node` user; use it.

**Signals.** Start the process as `CMD ["node", "dist/server.js"]` (the JSON "exec form"). Then Node is PID 1 and receives `SIGTERM` directly. `CMD npm start` (shell form, or via npm) puts another process in between that may not forward signals, and graceful shutdown silently never runs.

## 1.5 Twelve-factor, revisited

| Factor | In fittrack |
|---|---|
| Config in the environment | `config.ts` (Module 03) |
| Logs to stdout as event streams | pino (Module 03); the platform collects stdout |
| Processes are stateless and disposable | Sessions and cache in Postgres/Redis; graceful shutdown (this module) |
| Dev/prod parity | The same image and the same Postgres/Redis versions everywhere |
| **Admin processes as one-off tasks** | Migrations run as a **separate step**, not inside `server.ts` at boot |

**Why not run migrations on every boot?** With 3 instances starting at once, all 3 try to migrate at the same moment (your advisory lock from Module 04 helps, but it's still a race at startup). A slow migration also delays every instance's startup, and a failed one crash-loops them all. Running it once, before the new version takes traffic, is cleaner.

## 1.6 Continuous integration

On every push and pull request, a fresh machine:
1. checks out the code,
2. installs **exactly** what the lockfile says (`npm ci`, which fails if `package.json` and the lockfile disagree),
3. lints → typechecks → builds,
4. runs the tests against **real Postgres and Redis** (service containers),
5. builds the Docker image.

Then you **protect `main`**: merging requires a green CI run. Nobody (including you, at 1am) can merge something that doesn't build.

## 1.7 The API contract: OpenAPI

An **OpenAPI** document describes every endpoint: paths, methods, parameters, request bodies, responses, and error shapes, as JSON. It's a contract between your API and its clients:
- Your React app can **generate a typed client** from it, so it can't call a field that doesn't exist.
- Tools like Swagger UI, Scalar, or Redocly render it as interactive docs.
- In review, a change to the spec makes breaking changes visible (Module 02's rules).

You already describe every input as a Zod schema. Zod 4 can turn those into **JSON Schema** (`z.toJSONSchema`), which is what OpenAPI 3.1 uses. So the spec comes from the same source of truth as your validation.

## 1.8 Percentiles

The **average** latency hides the users who suffer. If 99 requests take 20 ms and 1 takes 2 seconds, the average is about 40 ms, which looks fine, yet one in a hundred users waited 2 seconds.

| Percentile | Meaning |
|---|---|
| p50 (median) | Half of requests are faster than this |
| p95 | 95% are faster; the slowest 1 in 20 is slower |
| p99 | The slowest 1 in 100 |

A page that makes 10 API calls hits each call's p90 behavior often. **Watch the tail.**

## 1.9 Dependency hygiene

- **Commit the lockfile**, and use `npm ci` in CI and Docker.
- **Update in small, frequent steps.** A weekly Dependabot PR that CI checks for you is easy. A 2-year jump is a project.
- **`npm audit`** lists known vulnerabilities. Not every finding applies (a dev-only tool, a code path you don't use); read them and decide.

✅ **Before moving on:** explain 1.2, 1.3, and 1.4 out loud.

---

# Part 2 — ⌨️ Worked example A: liveness and readiness

## 2.1 `src/lifecycle.ts`

```ts
/**
 * Process-wide "are we shutting down?" flag. server.ts sets it on SIGTERM; the readiness
 * check reads it, so the load balancer stops sending new requests before we stop listening.
 */
let shuttingDown = false;

export function markShuttingDown(): void {
  shuttingDown = true;
}

export function isShuttingDown(): boolean {
  return shuttingDown;
}
```

## 2.2 `src/modules/health/health.routes.ts`

```ts
import express, { type Router } from "express";
import { isShuttingDown } from "../../lifecycle.js";

/** A named dependency check, e.g. { database: () => pool.query("SELECT 1") }. Throws if unhealthy. */
export type HealthChecks = Record<string, () => Promise<unknown>>;

const CHECK_TIMEOUT_MS = 1_000;

/** Rejects if `promise` takes longer than `ms`. A hung dependency must not hang the health check. */
async function withTimeout(promise: Promise<unknown>, ms: number): Promise<void> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms);
  });
  try {
    await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export function createHealthRouter(checks: HealthChecks): Router {
  const router = express.Router();

  // LIVENESS: "is this process alive and its event loop responding?"
  // No dependency checks on purpose: a database outage must not make the platform
  // restart every instance (restarting won't fix the database).
  router.get("/live", (_req, res) => {
    res.json({ status: "ok" });
  });

  // READINESS: "should this instance receive traffic right now?"
  router.get("/ready", async (_req, res) => {
    if (isShuttingDown()) {
      res.status(503).json({ status: "shutting-down" });
      return;
    }

    const results: Record<string, string> = {};
    let allHealthy = true;
    for (const [name, check] of Object.entries(checks)) {
      try {
        await withTimeout(check(), CHECK_TIMEOUT_MS);
        results[name] = "ok";
      } catch {
        results[name] = "unavailable";
        allHealthy = false;
      }
    }

    res.status(allHealthy ? 200 : 503).json({ status: allHealthy ? "ok" : "degraded", checks: results });
  });

  return router;
}
```

- **`HealthChecks`** is a map of named checks, passed in from outside, so tests can pass fake checks (e.g., one that always throws) without stopping a real database.
- **`withTimeout`**: a check that *hangs* (a database that accepts connections but never answers) must not hang the health check too. `Promise.race` settles with whichever finishes first: the real check or the timer.
- **Readiness reports each check by name**, so when it's 503 you can see *which* dependency is down.

## 2.3 Wiring

**`src/composition.ts`**, in the returned object:

```ts
    healthChecks: {
      database: () => pool.query("SELECT 1"),
      redis: () => redis.ping(),
    },
```

**`src/app.ts`:** add `healthChecks: HealthChecks` to `AppDeps`, and **replace your old `/health` route** with:

```ts
  // Operational endpoints
  app.use("/health", createHealthRouter(deps.healthChecks));
```

✅ **Try it**

```bash
curl -i localhost:3000/health/live      # 200 {"status":"ok"}
curl -i localhost:3000/health/ready     # 200 {"status":"ok","checks":{"database":"ok","redis":"ok"}}
docker compose stop redis
curl -i localhost:3000/health/ready     # 503 {"status":"degraded","checks":{"database":"ok","redis":"unavailable"}}
curl -i localhost:3000/health/live      # still 200: don't restart me, just don't send me traffic
docker compose start redis
```

Update any tests that used the old `/health` route.

---

# Part 3 — ⌨️ Worked example B: graceful shutdown

## 3.1 Config

```ts
SHUTDOWN_DRAIN_MS: z.coerce.number().int().min(0).max(60_000).default(0),
SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(20_000),
```

`SHUTDOWN_DRAIN_MS` is 0 locally (nobody to drain), and a few seconds in production. It must be **shorter** than `SHUTDOWN_TIMEOUT_MS`, which must be **shorter** than the platform's grace period.

## 3.2 `src/server.ts`

```ts
import { setTimeout as sleep } from "node:timers/promises";
import { buildApp } from "./app.js";
import { redis } from "./cache/redis.js";
import { createDependencies } from "./composition.js";
import { config } from "./config.js";
import { pool } from "./db/pool.js";
import { markShuttingDown } from "./lifecycle.js";
import { logger } from "./logger.js";
import { systemClock } from "./shared/clock.js";

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "unhandled promise rejection; exiting");
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "uncaught exception; exiting");
  process.exit(1);
});

const app = buildApp(createDependencies(pool, systemClock));

const server = app.listen(config.PORT, (error?: Error) => {
  if (error) throw error;
  logger.info({ port: config.PORT }, "fittrack-api listening");
});

/** Stops accepting new connections and resolves once every in-flight request has finished. */
function closeServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function shutDown(signal: string): Promise<void> {
  logger.info({ signal }, "shutting down");

  // 1. Fail readiness, so the load balancer stops sending us NEW requests…
  markShuttingDown();
  // 2. …and give it time to notice (it polls readiness every few seconds).
  await sleep(config.SHUTDOWN_DRAIN_MS);

  // 3. Stop accepting connections; wait for in-flight requests to finish.
  await closeServer();

  // 4. Close shared resources, then exit cleanly.
  await pool.end();
  await redis.quit();
  logger.info("shutdown complete");
  process.exit(0);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    // A safety net: if something hangs (a stuck request), exit anyway.
    const forceExit = setTimeout(() => {
      logger.error({ timeoutMs: config.SHUTDOWN_TIMEOUT_MS }, "shutdown timed out; forcing exit");
      process.exit(1);
    }, config.SHUTDOWN_TIMEOUT_MS);
    forceExit.unref(); // this timer alone must not keep the process alive

    shutDown(signal).catch((error: unknown) => {
      logger.error({ err: error }, "shutdown failed");
      process.exit(1);
    });
  });
}
```

**Reading it piece by piece:**
- **`const server = app.listen(...)`**: `listen` returns Node's `http.Server`, which is what you need to call `close()` on.
- **`closeServer()`** wraps the callback-style `server.close` in a `Promise` so it can be `await`ed. `close()` stops accepting new connections and calls back once every open request has finished. (Since Node 19 it also closes idle keep-alive connections, so it doesn't wait on browsers that are just holding a connection open.)
- **The order matters:** readiness first (so traffic stops arriving), then close (so in-flight requests finish), then the pool and Redis (only once nothing can use them).
- **`forceExit.unref()`**: a pending timer normally keeps Node alive. `unref()` says "don't keep the process alive just for me," so a clean shutdown exits immediately instead of waiting out the timer.
- **`process.once`**: a second Ctrl+C doesn't start a second shutdown.

## 3.3 ✅ Prove it works

Add a temporary slow route (outside production) to `app.ts`:

```ts
if (config.NODE_ENV !== "production") {
  app.get("/slow", async (_req, res) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    res.json({ done: true });
  });
}
```

**Test it with the compiled build, not `npm run dev`.** The `tsx` command starts your code in a *child* process, so a signal sent to the PID you see may never reach your code. (This exact trap came up while this course was being tested.) Production runs `node dist/server.js` directly, so test that:

```bash
npm run build
SHUTDOWN_DRAIN_MS=1000 node --env-file=.env dist/server.js &   # note the PID it prints, e.g. [1] 5360
curl -s -w ' %{http_code}\n' localhost:3000/slow &              # start a 3-second request
sleep 0.5 && kill -TERM 5360                                     # SIGTERM while it's in flight
curl -s localhost:3000/health/ready                              # {"status":"shutting-down"} (503) during the drain
```

Expected, and verified when this course was written: the readiness check answers 503 during the drain; new connections are refused once the server closes; **the `/slow` request still completes with 200 after about 3 seconds**; the logs show `shutting down` → `shutdown complete`; the process exits with code 0.

Then try the same without graceful shutdown (comment out the signal handlers): Node's default reaction to `SIGTERM` is to exit immediately, so the `/slow` request is cut off and curl reports an error like `Empty reply from server`. Record both in the tracker, and delete `/slow` (or keep it dev-only).

---

# Part 4 — ⌨️ Worked example C: metrics

```bash
npm install @prometheus-io/client
```

(This is Prometheus's official Node client, previously published as `prom-client`. Tutorials using `prom-client` apply directly.)

## 4.1 `src/metrics.ts`

```ts
import { collectDefaultMetrics, Registry } from "@prometheus-io/client";

/** One registry for the whole process: every metric registers here, and /metrics reads from here. */
export const metricsRegistry = new Registry();

// CPU, memory, event-loop lag, garbage collection, open handles… for free.
collectDefaultMetrics({ register: metricsRegistry });
```

## 4.2 Expose them in `src/app.ts`

```ts
import { metricsRegistry } from "./metrics.js";
// ...
  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", metricsRegistry.contentType);
    res.send(await metricsRegistry.metrics());
  });
```

✅ **Try it:** `curl localhost:3000/metrics`. You'll see lines like:

```
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.138062
# HELP nodejs_eventloop_lag_seconds Lag of event loop in seconds.
nodejs_eventloop_lag_seconds 0.003
```

This is the **Prometheus text format**. A Prometheus server (or a hosted metrics service) "scrapes" this URL every 15–60 seconds and stores the numbers over time. **`nodejs_eventloop_lag_seconds`** is Module 01's `/block` experiment, measured: if it climbs, something is blocking the event loop.

**`/metrics` is public right now.** It reveals internals (memory, versions, traffic). Challenge 1 decides how to protect it.

---

# Part 5 — ⌨️ Given infrastructure

## 5.1 `Dockerfile` (project root)

```dockerfile
# ---------- Stage 1: build ----------
# The full toolchain: dev dependencies, the TypeScript compiler, the source code.
FROM node:24-bookworm-slim AS build
WORKDIR /app

# 1. Dependencies first. This layer is cached until package.json or the lockfile changes,
#    so editing your code doesn't trigger a full reinstall.
COPY package.json package-lock.json ./
RUN npm ci

# 2. Then the source, and compile it to dist/
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# 3. Drop dev dependencies (TypeScript, Vitest, ESLint…) before copying node_modules onward
RUN npm prune --omit=dev

# ---------- Stage 2: runtime ----------
# Only what's needed to RUN: production node_modules, compiled JS, and the migrations.
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY migrations ./migrations

# Don't run as root: the official Node image includes an unprivileged "node" user.
USER node

EXPOSE 3000

# Exec form (a JSON array) runs node as PID 1 directly, so it receives SIGTERM.
# The same image runs the worker and the migrations with a different command (see docker-compose.yml).
CMD ["node", "dist/server.js"]
```

| Line | Why |
|---|---|
| `FROM node:24-bookworm-slim AS build` | Official Node 24 on Debian "bookworm," slim variant (fewer packages). Match your `.nvmrc` major version. Debian (glibc) means `argon2`'s prebuilt binary works out of the box. |
| `COPY package.json package-lock.json ./` then `RUN npm ci` | Install from the lockfile only. Cached until those two files change. |
| `COPY … src` then `RUN npm run build` | Compile with `tsconfig.build.json` (Module 06), so tests aren't compiled into the image |
| `RUN npm prune --omit=dev` | Remove TypeScript, Vitest, ESLint… before copying `node_modules` |
| `FROM node:24-bookworm-slim AS runtime` | A fresh, clean stage: nothing from the build stage comes along unless you `COPY --from=build` it |
| `ENV NODE_ENV=production` | The default for anything that runs in this image |
| `COPY migrations ./migrations` | Your runner reads `migrations/` relative to the working directory (`/app`) |
| `USER node` | Run as the unprivileged user (1.4) |
| `CMD ["node", "dist/server.js"]` | Exec form, so Node gets `SIGTERM` directly (1.4) |

## 5.2 `.dockerignore`

```
node_modules
dist
coverage
.git
.github
.env
.env.*
!.env.example
*.log
tests
docs
jar*.txt
*.csv
```

Everything listed here is left out of the **build context** (what `docker build` sends to the builder). Leaving out `node_modules` keeps builds fast and stops your Mac's native binaries from leaking into a Linux image. **Leaving out `.env` keeps your secrets out of the image.**

## 5.3 `docker-compose.yml`: the full stack

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_USER: fittrack
      POSTGRES_PASSWORD: fittrack
      POSTGRES_DB: fittrack_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fittrack -d fittrack_dev"]
      interval: 5s
      timeout: 3s
      retries: 10

  redis:
    image: redis:8
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

  # ── The app itself. These only start with:  docker compose --profile app up --build ──
  migrate:
    profiles: ["app"]
    build: .
    command: ["node", "dist/db/migrate.js"]
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://fittrack:fittrack@db:5432/fittrack_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      db:
        condition: service_healthy

  api:
    profiles: ["app"]
    build: .
    environment:
      NODE_ENV: production
      PORT: "3000"
      LOG_LEVEL: info
      DATABASE_URL: postgres://fittrack:fittrack@db:5432/fittrack_dev
      REDIS_URL: redis://redis:6379
      COOKIE_SECURE: "false" # plain http on localhost; true in real production
      SHUTDOWN_DRAIN_MS: "2000"
    ports:
      - "3000:3000"
    depends_on:
      migrate:
        condition: service_completed_successfully
      redis:
        condition: service_healthy
    healthcheck:
      # The slim image has no curl, so ask Node itself
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/health/live').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 10s
      timeout: 3s
      retries: 3

  worker:
    profiles: ["app"]
    build: .
    command: ["node", "dist/worker.js"]
    environment:
      NODE_ENV: production
      LOG_LEVEL: info
      DATABASE_URL: postgres://fittrack:fittrack@db:5432/fittrack_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      migrate:
        condition: service_completed_successfully

volumes:
  pgdata:
```

- **`profiles: ["app"]`**: plain `docker compose up -d` still starts only `db` and `redis` (your daily dev setup, with the API on your Mac via `npm run dev`). `docker compose --profile app up --build` starts **everything** in containers, production-style. Stop your dev server first, since both use port 3000.
- **Hostnames inside Compose are service names:** the API reaches Postgres at `db:5432` and Redis at `redis:6379`, not `localhost`.
- **`migrate` runs once and exits.** `api` and `worker` wait for it with `condition: service_completed_successfully`. If it fails, they don't start: that's 1.5's "admin process as a one-off," locally.
- **One image, three commands:** `migrate`, `api`, and `worker` all `build: .` and differ only in `command`.
- **The `migrate` container needs `REDIS_URL`** even though it never uses Redis, because `config.ts` requires it for every process. (You could make it optional, but then the API could start without it. Required-everywhere is the simpler, safer rule.)
- **The API healthcheck** uses Node's built-in `fetch`, because the slim image has no `curl`.

```bash
docker compose --profile app up --build
docker compose ps                                   # api "healthy"; migrate "exited (0)"
curl -i localhost:3000/health/ready
docker compose --profile app logs -f worker
docker compose --profile app down                   # SIGTERM → graceful shutdown in each container
```

## 5.4 `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    # Real Postgres and Redis for the integration tests, just like docker-compose locally
    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_USER: fittrack
          POSTGRES_PASSWORD: fittrack
          POSTGRES_DB: fittrack_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U fittrack"
          --health-interval 5s
          --health-timeout 3s
          --health-retries 10
      redis:
        image: redis:8
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 5s
          --health-timeout 3s
          --health-retries 10

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Install exact dependencies from the lockfile
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Build
        run: npm run build

      - name: Test (unit + integration)
        run: npm test
        env:
          TEST_DATABASE_URL: postgres://fittrack:fittrack@localhost:5432/fittrack_test

  docker:
    runs-on: ubuntu-latest
    needs: test # only build the image if the tests passed
    steps:
      - uses: actions/checkout@v4
      - name: Build the production image
        run: docker build -t fittrack-api:ci .
```

- **`on: push` to `main` + `pull_request`**: runs for every PR, and again after merging.
- **`services:`** starts Postgres 18 and Redis 8 next to the job, reachable at `localhost`. The `--health-*` options make the job wait until they're ready.
- **`POSTGRES_DB: fittrack_test`** matches what your global setup expects (it still checks for `_test`, Module 06).
- **`node-version-file: .nvmrc`**: CI uses exactly the Node version you pinned in Module 01. **`cache: npm`** reuses downloaded packages between runs.
- **The order (lint → typecheck → build → test) fails fast** on the cheapest checks first.
- **`docker` job, `needs: test`**: only builds the image if the tests passed. (Pushing it to a registry comes in Module 10.)
- The action versions (`@v4`) are current at the time of writing. Dependabot (below) will propose upgrades.

## 5.5 `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]

  - package-ecosystem: github-actions
    directory: "/"
    schedule:
      interval: weekly

  - package-ecosystem: docker
    directory: "/"
    schedule:
      interval: weekly
```

Weekly PRs for npm packages (minor and patch updates grouped into one PR), GitHub Actions versions, and the Docker base image. CI runs on each one, so you can merge confidently.

---

# Part 6 — ⌨️ Worked example D: OpenAPI from Zod

## 6.1 A docs-only hint on `CalendarDate`

A `.refine()` check can't be expressed in JSON Schema, so `CalendarDate` would show up as just "a string." Add metadata for the docs (it doesn't change validation). In `steps.schemas.ts` (or `shared/schemas.ts`):

```ts
export const CalendarDate = z
  .string()
  .refine(isCalendarDate, { message: "must be a real calendar date in YYYY-MM-DD format" })
  .meta({ format: "date", examples: ["2026-10-11"] }); // .meta only affects the generated API docs
```

## 6.2 `src/openapi/schemas.ts`: response shapes

```ts
import { z } from "zod";

/** Response shapes. Request shapes already exist as the Zod schemas your routes parse with. */
export const DailyStepsResponse = z
  .object({
    date: z.string().meta({ format: "date", description: "The user's local calendar day" }),
    steps: z.number().int(),
    updatedAt: z.string().meta({ format: "date-time" }),
  })
  .meta({ description: "One day's step total" });

export const Problem = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    detail: z.string().optional(),
    instance: z.string().optional(),
    requestId: z.string().optional(),
    errors: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  })
  .meta({ description: "RFC 9457 problem details" });
```

Your routes *parse* requests with Zod, but responses are built by mapping functions, so they need their own schemas for the docs.

## 6.3 `src/openapi/build-document.ts`

```ts
import { z } from "zod";
import { ListStepsQuery, PutStepsBody, StepsDateParams } from "../modules/steps/steps.schemas.js";
import { DailyStepsResponse, Problem } from "./schemas.js";

type JsonObject = Record<string, unknown>;

/** A Zod schema → a JSON Schema object for OpenAPI 3.1 (without the top-level "$schema" key). */
function jsonSchema(schema: z.ZodType, io: "input" | "output"): JsonObject {
  const result = z.toJSONSchema(schema, { io, unrepresentable: "any" }) as JsonObject;
  delete result.$schema;
  return result;
}

/** Turns a z.object of query or path params into OpenAPI "parameters". */
function parameters(schema: z.ZodObject, location: "query" | "path"): JsonObject[] {
  const list: JsonObject[] = [];
  for (const [name, field] of Object.entries(schema.shape)) {
    const isOptional = (field as z.ZodType).safeParse(undefined).success; // optional or has a default
    list.push({
      name,
      in: location,
      required: location === "path" ? true : !isOptional,
      schema: jsonSchema(field as z.ZodType, "input"),
    });
  }
  return list;
}

const problemRef = { $ref: "#/components/schemas/Problem" };
const dailyStepsRef = { $ref: "#/components/schemas/DailySteps" };

function problemResponse(description: string): JsonObject {
  return { description, content: { "application/problem+json": { schema: problemRef } } };
}

export function buildOpenApiDocument(): JsonObject {
  return {
    openapi: "3.1.0",
    info: {
      title: "fittrack-api",
      version: "1.0.0",
      description: "Track daily steps, workouts, and lifting sets.",
    },
    // Every endpoint requires the session cookie unless it says otherwise
    security: [{ sessionCookie: [] }],
    components: {
      securitySchemes: {
        sessionCookie: { type: "apiKey", in: "cookie", name: "fittrack_session" },
      },
      schemas: {
        DailySteps: jsonSchema(DailyStepsResponse, "output"),
        Problem: jsonSchema(Problem, "output"),
      },
    },
    paths: {
      "/v1/steps": {
        get: {
          summary: "List daily step totals in a date range",
          tags: ["Steps"],
          parameters: parameters(ListStepsQuery, "query"),
          responses: {
            "200": {
              description: "The days that have data, oldest first",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { data: { type: "array", items: dailyStepsRef } } },
                },
              },
            },
            "304": { description: "Not modified (send If-None-Match with the ETag you have)" },
            "400": problemResponse("Invalid range"),
            "401": problemResponse("Not logged in"),
          },
        },
      },
      "/v1/steps/{date}": {
        parameters: parameters(StepsDateParams, "path"),
        get: {
          summary: "Get one day",
          tags: ["Steps"],
          responses: {
            "200": { description: "The day", content: { "application/json": { schema: dailyStepsRef } } },
            "401": problemResponse("Not logged in"),
            "404": problemResponse("No record for that day"),
          },
        },
        put: {
          summary: "Set the total steps for one day (idempotent)",
          tags: ["Steps"],
          requestBody: {
            required: true,
            content: { "application/json": { schema: jsonSchema(PutStepsBody, "input") } },
          },
          responses: {
            "200": { description: "Replaced", content: { "application/json": { schema: dailyStepsRef } } },
            "201": { description: "Created", content: { "application/json": { schema: dailyStepsRef } } },
            "400": problemResponse("Invalid date or steps"),
            "401": problemResponse("Not logged in"),
            "415": problemResponse("Body is not JSON"),
          },
        },
        delete: {
          summary: "Delete one day",
          tags: ["Steps"],
          responses: {
            "204": { description: "Deleted" },
            "401": problemResponse("Not logged in"),
            "404": problemResponse("No record for that day"),
          },
        },
      },
    },
  };
}
```

- **`z.toJSONSchema(schema, { io: "input" })`** describes what a client must *send*. For request schemas with `.transform()` (like normalizing instants to UTC), the *output* type can't be described, so always use `"input"` for requests.
- **`unrepresentable: "any"`**: anything JSON Schema can't express becomes "any value" instead of throwing.
- **`parameters(...)`** turns your query and path schemas into OpenAPI's parameter list. `safeParse(undefined).success` is true for fields that are optional or have a default.
- **`$ref: "#/components/schemas/DailySteps"`** points at a shared definition, so every response that returns a day refers to one schema.

## 6.4 Serve it

In `app.ts` (public, before `requireAuth`):

```ts
import { buildOpenApiDocument } from "./openapi/build-document.js";

const openApiDocument = buildOpenApiDocument(); // build once, at startup
app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});
```

✅ **Try it:** `curl -s localhost:3000/openapi.json | head -c 600`. Then view it in a renderer: paste the JSON into https://editor.swagger.io, or run `npx @redocly/cli preview-docs openapi.json` after saving it to a file. Run `npx @redocly/cli lint openapi.json` to check it against the OpenAPI rules.

```bash
git add -A && git commit -m "feat(ops): health checks, graceful shutdown, metrics, docker, ci, openapi"
```

---

# Part 7 — 🧰 Toolbox

## 7.1 An HTTP duration histogram

```ts
import { Histogram } from "@prometheus-io/client";
import { metricsRegistry } from "../metrics.js";

const httpDuration = new Histogram({
  name: "http_request_duration_seconds",                       // Prometheus convention: base unit (seconds) in the name
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5], // upper bounds, in seconds
  registers: [metricsRegistry],
});

const stopTimer = httpDuration.startTimer();       // starts timing now…
// …later:
stopTimer({ method: "GET", route: "/v1/steps", status_code: "200" });   // …records the elapsed seconds with these labels
```

## 7.2 The route template, not the URL

```ts
res.on("finish", () => {
  // req.route exists only if a route matched. Its .path is the pattern INSIDE its router ("/:id"),
  // and req.baseUrl is where that router is mounted ("/v1/workouts").
  const route = req.route ? `${req.baseUrl}${req.route.path}` : "unmatched";
  // → "/v1/workouts/:id"   (never "/v1/workouts/8f3c…")
});
```

## 7.3 Protecting `/metrics`

Two common options:
- **A bearer token:** `METRICS_TOKEN` in config; require `Authorization: Bearer <token>`; compare with `crypto.timingSafeEqual` (comparing with `===` can leak, through timing, how many leading characters matched).
- **Network-level:** expose `/metrics` on a separate internal port that the platform's metrics agent can reach but the internet can't.

## 7.4 Describing more endpoints

```ts
// Request body from your existing schema (input side)
requestBody: { required: true, content: { "application/json": { schema: jsonSchema(CreateWorkoutBody, "input") } } }

// A reusable component + a $ref
components.schemas.Workout = jsonSchema(WorkoutResponse, "output");
{ $ref: "#/components/schemas/Workout" }

// A paginated list
{ type: "object", properties: {
    data: { type: "array", items: { $ref: "#/components/schemas/Workout" } },
    nextCursor: { type: ["string", "null"] } } }

// A public endpoint (override the document-wide security requirement)
security: []
```

## 7.5 Load testing and reading the results

```bash
npx autocannon -c 50 -d 20 -H "Cookie: fittrack_session=<token>" 'http://localhost:3000/v1/workouts?limit=20'
```

| autocannon shows | Look at |
|---|---|
| **Latency** table: 2.5% / 50% / 97.5% / 99% / Avg / Max | **50%** (typical) and **99%** (the tail) |
| **Req/Sec** | Throughput the instance sustained |
| errors / non-2xx | Must be 0. Errors under load are a finding in themselves. |

**Test against the production-style stack** (`docker compose --profile app up`) with `LOG_LEVEL=warn`, not against `npm run dev`. Pretty logging and file watching make numbers meaningless. While it runs, watch `/metrics` (`http_request_duration_seconds`, `nodejs_eventloop_lag_seconds`) and `docker stats`.

---

# Part 8 — 🧩 Challenges

## Challenge 1: Request metrics ★★☆

Create `src/middleware/http-metrics.ts`: middleware that records **every** request into the histogram from toolbox 7.1, labeled by method, **route template** (7.2), and status code. Register it right after `requestContext`. Then protect `/metrics` (7.3: pick one, and record the decision).

✅ **Acceptance**
1. After a few requests, `/metrics` shows `http_request_duration_seconds_count{method="GET",route="/v1/workouts/:id",status_code="200"}`. **No line ever contains a UUID.**
2. A request to an unknown path is labeled `route="unmatched"`.
3. A unit or integration test checks the label rule: request `/v1/workouts/<real id>` twice with different IDs → **one** series, count 2.
4. `/metrics` without the token (or from outside the internal port) → 401/404.

<details><summary>💡 Hint</summary>

The structure is the same as `requestContext`: start the timer when the request arrives, and record in `res.on("finish")`. `status_code` must be a string: `String(res.statusCode)`.
</details>

---

## Challenge 2: Worker hardening ★★☆

1. **A worker heartbeat metric:** a Gauge `worker_last_poll_timestamp_seconds`, updated on every loop iteration, plus counters `jobs_completed_total` and `jobs_failed_total` labeled by `queue`. The worker has no HTTP server, so expose its metrics on a tiny `node:http` server on a separate port (`WORKER_METRICS_PORT`, e.g. 9100). Module 01's raw-server skills apply directly.
2. **Graceful shutdown under load:** start a long export (or make a handler `await sleep(10_000)` temporarily), send `SIGTERM` to the worker (`docker compose stop worker`, with `stop_grace_period: 30s` on the service). Confirm the job **finishes** before the worker exits, and that it's `completed` in `psql`.
3. **The opposite:** `docker compose kill worker` (SIGKILL) during a job. Confirm a new worker reclaims it after the lock expires, which is Module 08's at-least-once delivery, now in containers.

---

## Challenge 3: The stack in Docker ★★☆

1. Add the Dockerfile, `.dockerignore`, and the full `docker-compose.yml` from Part 5.
2. `docker compose --profile app up --build`. Register, log a workout, and run an export through the containerized API and worker.
3. **Image size:** `docker images` → record the size. Then try changing `bookworm-slim` to `bookworm` (the non-slim image) in both stages and compare. (Switch back.)
4. **Prove the layer cache:** change one line in `src/`, rebuild, and confirm in the build output that `npm ci` was `CACHED`.
5. **Prove non-root:** `docker compose exec api whoami` → `node`.
6. **Prove the secrets stayed out:** `docker compose exec api ls -la /app` → no `.env`, no `tests/`, no `src/`.

---

## Challenge 4: CI, green and enforced ★★☆

1. Add `.github/workflows/ci.yml` and `.github/dependabot.yml`; push.
2. Get the workflow green. (The usual first failures: a test that only passes with your local data, a missing env var, a lint rule you've been ignoring. Each one is a real bug or gap; fix the cause.)
3. Add a CI status badge to your README.
4. **Protect `main`:** in GitHub → Settings → Branches, require the `test` and `docker` checks to pass before merging, and require pull requests.
5. **Prove it:** open a PR that breaks a test on purpose. The merge button is blocked. Close the PR.

✅ **Done when:** `main` is protected and the last run is green. Record how long a CI run takes.

---

## Challenge 5: The full API spec ★★★

Extend `build-document.ts` to cover **every endpoint** in `docs/api.md`: auth, exercises, workouts (with pagination parameters and the list envelope), sets, stats, exports, imports, health. Add response schemas in `src/openapi/schemas.ts` for each resource.

- Public endpoints (`/v1/auth/register`, `/v1/auth/login`, health, `/openapi.json`) override `security: []`.
- Document the `Idempotency-Key` header on `POST /v1/workouts`, and `ETag` / `If-None-Match` on the endpoints that support them.
- Document `202` + `Location` for exports and imports.

✅ **Acceptance**
1. `npx @redocly/cli lint openapi.json` passes (or every remaining warning is understood and noted).
2. **Spot-check five endpoints** against reality with curl: the parameters, status codes, and response shapes match.
3. **A test that keeps the spec honest:** for every route registered in the app, there's a path in the spec. (Write a list of `[method, path]` pairs once, and assert each exists in `buildOpenApiDocument().paths`.)

<details><summary>💡 Hint</summary>

Build the document from small helper functions (`problemResponse`, `parameters`, `jsonSchema`) so each endpoint is a few lines. Order the paths the same way as `docs/api.md`, so the two are easy to compare.
</details>

---

## Challenge 6: Load testing ★★☆

Against the **containerized** stack, with your perf-lab data (Module 05) loaded:

1. Load-test `GET /v1/workouts?limit=20`, `GET /v1/stats/weekly`, and `PUT /v1/steps/<date>` (autocannon with `-m PUT -H 'Content-Type: application/json' -b '{"steps":9000}'`).
2. Record p50 / p99 / requests per second in the tracker.
3. **Find one bottleneck** using `/metrics` and the logs. Common ones: pool exhaustion (raise `DB_POOL_MAX` and compare, but mind Module 10's connection limits), a missing index, or event-loop lag from heavy JSON. Fix it, and re-measure.
4. Write two sentences: what was the bottleneck, and how did you know?

---

## Challenge 7: Dependency hygiene ★☆☆

Run `npm audit`. For each finding, either fix it (`npm audit fix`, or an upgrade) or write down why it doesn't apply (dev-only, an unused code path…). Merge the first batch of Dependabot PRs once CI is green.

---

## Definition of done

- [ ] `/health/live` and `/health/ready` behave as in 1.2 (verified by stopping Redis/Postgres).
- [ ] `SIGTERM` never drops an in-flight request (proved in 3.3), and the worker finishes its current job before exiting.
- [ ] `/metrics` has per-route RED metrics with no IDs in labels, and it's protected.
- [ ] A fresh clone + `docker compose --profile app up --build` gives a working, migrated stack.
- [ ] The image runs as `node`, contains no secrets or tests, and the dependency layer is cached.
- [ ] CI is green, and `main` requires it.
- [ ] The OpenAPI spec covers every endpoint and lints clean.
- [ ] Load-test numbers and one fixed bottleneck are recorded.

---

## ✍️ Checkpoint

1. Logs, metrics, or traces: which would you reach for in each case? (a) "p95 latency of `/stats/weekly` doubled since yesterday's deploy"; (b) "why did my CSV import fail?"; (c) "where does the time go inside one slow request?"
2. The database is down for 30 seconds. What should liveness and readiness each return, and what does the platform do in response to each?
3. Walk through graceful shutdown on SIGTERM, step by step, in your `server.ts`. What happens to in-flight requests and running jobs without it?
4. Why copy `package.json` + the lockfile and run `npm ci` *before* copying the source code in a Dockerfile?
5. What do multi-stage builds and running as non-root each buy you? Why `CMD ["node", "dist/server.js"]` instead of `CMD npm start`?
6. Why run migrations as a separate step rather than on every app boot? How does your Compose file enforce the order?
7. What is p99 latency, and why care about it more than the average?
8. Why use `npm ci` in CI instead of `npm install`?
9. Which labels make good metric labels, and which make bad ones? Why is `userId` a bad label?
10. Why is an OpenAPI spec valuable *before* you start the React frontend? Why generate it from your Zod schemas instead of writing it by hand?

**Explain it back:** Describe everything that happens from `git push` to a green CI check.

---

## 📋 Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Progress
- [ ] Part 1: Concepts read (1.1–1.9)
- [ ] Part 2: Liveness + readiness
- [ ] Part 3: Graceful shutdown, proved
- [ ] Part 4: Metrics registry + `/metrics`
- [ ] Part 5: Dockerfile, `.dockerignore`, Compose, CI, Dependabot understood line by line
- [ ] Part 6: OpenAPI for steps
- [ ] Challenge 1: Request metrics + protected `/metrics`
- [ ] Challenge 2: Worker metrics + shutdown drills
- [ ] Challenge 3: Stack in Docker
- [ ] Challenge 4: CI green + `main` protected
- [ ] Challenge 5: Full API spec
- [ ] Challenge 6: Load testing + one bottleneck
- [ ] Challenge 7: Dependency hygiene
- [ ] Checkpoint passed (≥ 8/10)

### Concepts I can explain without notes
- [ ] Logs vs. metrics vs. traces; RED; label cardinality (1.1)
- [ ] Liveness vs. readiness (1.2)
- [ ] Graceful shutdown (1.3)
- [ ] Image layers, multi-stage, non-root, signals (1.4)
- [ ] Twelve-factor; migrations as one-offs (1.5)
- [ ] The CI pipeline (1.6)
- [ ] OpenAPI as a contract (1.7)
- [ ] Percentiles (1.8)
- [ ] Dependency hygiene (1.9)

### Measurements
| Item | Value |
|---|---|
| Shutdown test: `/slow` with graceful shutdown | |
| Shutdown test: `/slow` without | |
| Docker image size (slim / non-slim) | |
| CI duration | |

### Load test results (Challenge 6)
| Endpoint | p50 (ms) | p99 (ms) | Req/s | After fix: p99 / Req/s |
|---|---|---|---|---|
| `GET /v1/workouts?limit=20` | | | | |
| `GET /v1/stats/weekly` | | | | |
| `PUT /v1/steps/:date` | | | | |

**Bottleneck found and how I knew:** —

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
- The Twelve-Factor App: https://12factor.net/
- Google SRE book, "Monitoring Distributed Systems" (RED/USE, the four golden signals): https://sre.google/sre-book/monitoring-distributed-systems/
- Prometheus, metric and label naming: https://prometheus.io/docs/practices/naming/
- @prometheus-io/client (formerly prom-client): https://github.com/prometheus/client_js
- Docker, multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- Docker Compose, startup order and `depends_on` conditions: https://docs.docker.com/compose/how-tos/startup-order/
- Node.js Docker best practices: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
- GitHub Actions, service containers: https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers
- OpenAPI 3.1 specification: https://spec.openapis.org/oas/v3.1.0
- Zod, JSON Schema: https://zod.dev/json-schema
- OpenTelemetry for Node.js (traces): https://opentelemetry.io/docs/languages/js/
- autocannon: https://github.com/mcollina/autocannon
