# Module 10: Deployment, Operations & Capstone

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | ✅ Full |
| **Estimated time** | 16–20 hours, plus 2 weeks of real use |
| **Prerequisites** | Module 09 complete (the stack runs in Docker; CI is green and protects `main`) |
| **Project milestone** | API + worker + Postgres + Redis live on HTTPS, deployed automatically from `main` with migrations as a release step; a zero-downtime schema change done in production; a timed backup restore drill; alerting; a runbook; a portfolio README; two weeks of your real training data |

## 🎓 Tutor prompt

Start every study session for this module in a **new chat** by pasting the prompt below. It sets Claude up as your teacher for this module: it reads the course files, picks up where you left off, follows the teaching rules (no solutions; syntax help and hints instead), quizzes you, and updates your tracker when you say **"wrap up."**

```text
You are my tutor for Module 10 of my backend engineering course: "Deployment, Operations & Capstone".

ROLE
Act as an SRE lead who has shipped and operated production services, runs blameless postmortems, and treats every irreversible change with respect. For the capstone README, you also review like a hiring manager. Teach the way a great senior engineer mentors a junior on their own team: patient, precise, Socratic, and honest when my work isn't good enough yet.

ABOUT ME
- I'm Mathew, a frontend engineer (React + TypeScript). I'm solid on JS/TS logic, but I don't know every Node, Express, SQL, or tooling API and syntax by heart.
- I'm building `fittrack-api`, an API that tracks my own physical activity (daily steps, workouts, lifting sets, exercises), to learn backend fundamentals properly.
- The course lives in my repo at `docs/course/`: `COURSE.md` (rules, given-vs-you-write table, decisions log, session log) plus one file per module.
- Stack for this module: Everything from Modules 01–09, deployed to a PaaS with managed Postgres and Redis.

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/10-deployment-and-capstone.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
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
- Hosting choice: compare current providers using web search for today's pricing and limits, never from memory.
- Build once, promote the same artifact; release-phase migrations; rollback paths.
- Expand/contract: make me write out every deploy step (and what old and new code each see) before running anything.
- Cross-origin setup for the future React app: same-site vs. same-origin, CORS with credentials, cookie attributes, custom domains vs. platform subdomains.
- Backups and a timed restore drill; symptom-based alerting; a runbook someone else could follow.
- SAFETY: before any irreversible production action (dropping or renaming columns, deleting data, rotating secrets, restoring over live data), have me write the plan and the rollback, and wait for my explicit confirmation.
- Watch for these common misconceptions and correct them when they show up: rolling back code after a destructive migration; `Access-Control-Allow-Origin: *` with credentials; assuming two apps on a platform subdomain are same-site; untested backups; alerting on CPU instead of user-facing symptoms.
- Hold me to this standard before I move on: the API is live on HTTPS and deploys from `main`, a zero-downtime migration and a timed restore drill are done, alerts are tested, two weeks of real data are in production, and the README and runbook let someone else run the service.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

## How to use this module

| Part | What you do | Kind |
|---|---|---|
| 1. Concepts | Hosting models, environments, the deploy pipeline, zero-downtime migrations, HTTPS and proxies, CORS and cookies, backups, alerting, capacity | 📖 Read |
| 2. Worked example A | Production config: `trust proxy`, CORS for your React app, cookie settings | ⌨️ Type along |
| 3. Worked example B | A complete expand/contract plan for a real schema change, with tested SQL | ⌨️ Type along |
| 4. Given infrastructure | An example deploy config (Fly.io), a CD workflow, a smoke test, backup and restore commands, document templates | ⌨️ Type along |
| 5. Toolbox | Platform mapping, secrets, connection math, alert recipes, the frontend handoff | 🧰 Reference |
| 6. Challenges | Choose a host, deploy, CD, the runner upgrade, expand/contract in production, the restore drill, alerts, runbook, 2 weeks of real use, the capstone README, a retro | 🧩 You write |
| Checkpoint | 10 questions | ✍️ Quiz |

**A safety rule for this whole module:** you're now working with a **production database that holds your real data**. Before any action that can't be undone (dropping or renaming a column, deleting data, restoring over a live database, rotating a secret), **write the plan and the rollback first**, and do it on a copy before doing it for real. The tutor prompt enforces this.

## What you'll be able to do by the end
- Choose a hosting model, and justify it with current numbers.
- Keep environments and secrets separate and safe.
- Ship through a pipeline that builds once, migrates first, rolls out gradually, and can roll back.
- Change a live schema with expand/contract, with no downtime and no lost data.
- Configure HTTPS, proxies, CORS, and cookies for a browser frontend on another origin.
- Prove your backups work with a timed restore.
- Alert on what users feel, write a runbook, and run a blameless postmortem.

---

# Part 1 — 📖 Concepts

## 1.1 Hosting models

| Model | Examples | You manage | Good when |
|---|---|---|---|
| **PaaS** (platform as a service) | Fly.io, Render, Railway, Heroku | Your app and its config. The platform handles machines, TLS, routing, rolling deploys | A small team, or one person, wants to ship and not run servers |
| **Managed containers** | Google Cloud Run, AWS ECS/Fargate, Azure Container Apps | Container config, networking, IAM, often the load balancer | You need more control, or your company already lives in that cloud |
| **Virtual machines** | EC2, a VPS from any provider | Everything: OS patches, TLS certificates, process supervision, backups | You need full control, or you want to learn the layer below |
| **Kubernetes** | GKE, EKS, AKS | A whole orchestration system | Many services and a team to run it. Overkill here. |

For this course: **a PaaS with managed Postgres and managed Redis** (from the platform itself or from a specialist provider). The things that matter for *your* choice:
- **Managed Postgres with automated backups and point-in-time recovery**, and **Postgres 18** (your migrations use the built-in `uuidv7()`; see toolbox 5.6 if your provider is on an older version).
- **A separate worker process** from the same image.
- **A "release command"** that runs migrations once per deploy, before the new version takes traffic.
- **Health checks** wired to your readiness endpoint.
- **Region:** close to you (and the API close to the database).
- **Current pricing and free-tier limits.** These change often, so look them up live; don't trust a blog post (or this course) for numbers.

## 1.2 Environments and secrets

| Environment | Database | Who uses it |
|---|---|---|
| development | `docker compose` on your Mac | You |
| test | `fittrack_test` (local) / CI's service container | The test suite |
| production | Managed Postgres | You, for real, every day for two weeks |
| *(staging, optional)* | A separate managed database | Rehearsing risky changes |

- **Completely separate data and secrets per environment.** Never point a test or a local script at production by accident. (Your test setup refuses any URL without `_test` in it: Module 06.)
- **Secrets live in the platform's secret store** and arrive as environment variables. Never in the image, the repo, CI logs, or your app's logs.
- **`.env.example` documents every setting**; production values are set once, deliberately.

## 1.3 The deploy pipeline

```
push to main
   │
   ▼
CI: lint → typecheck → build → tests (real Postgres + Redis) → docker build      (Module 09)
   │ green
   ▼
CD: build the image ONCE ──▶ release step: run migrations (old version still serving)
                                 │ success                       │ failure → stop; old version keeps running
                                 ▼
                        rolling restart: start a new instance → wait for /health/ready
                        → send it traffic → SIGTERM an old one (graceful shutdown) → repeat
                                 │
                                 ▼
                        smoke test against the live URL
```

- **Build once, promote that exact artifact.** Rebuilding per environment can give different results (a new dependency version was published in between), so the thing you tested isn't quite the thing you ship.
- **Migrations run before the new code.** For a while, **old code runs against the new schema** (during the rollout, and after a rollback). Every migration must be safe for the old code. That's the whole reason for 1.4.
- **Rollback = redeploy the previous image.** That's quick and safe *only if* the schema still works with the old code.

## 1.4 Zero-downtime schema changes: expand/contract

| Change | Safe in one step? | Why |
|---|---|---|
| Add a nullable column, or one with a constant default | ✅ | Old code ignores it |
| Add a new table | ✅ | Old code doesn't know it exists |
| `CREATE INDEX CONCURRENTLY` | ✅ | Builds without blocking writes (slower, can't run in a transaction) |
| Plain `CREATE INDEX` on a big table | ⚠️ | Blocks **writes** to the table until it's done |
| Rename a column | ❌ | Old code still uses the old name → errors |
| Drop a column | ❌ | Old code still reads or writes it → errors. And rolling back the code doesn't bring the data back. |
| Add `NOT NULL` to an existing column | ❌ (as one step) | Scans the whole table under a lock that blocks everything; and fails if any NULLs remain |
| Change a column's type | ❌ | Often rewrites the whole table under a heavy lock |

**Expand/contract** turns an unsafe change into several safe ones, each its own deploy:

```
EXPAND    add the new thing alongside the old         (old and new code both work)
MIGRATE   new code writes both / backfill old rows    (in small batches)
ENFORCE   add constraints once the data is complete
CONTRACT  remove the old thing, once no running code uses it
```

**Locks matter.** Almost every `ALTER TABLE` briefly takes the strongest lock (ACCESS EXCLUSIVE), and if it has to *wait* for that lock behind a long query, every other query on the table queues up behind *it*. Start DDL migrations with `SET lock_timeout = '5s';`: if the lock isn't available quickly, the migration fails (and you retry later) instead of freezing your app.

## 1.5 HTTPS and proxies

On a PaaS, a load balancer terminates TLS and forwards plain HTTP to your container, adding headers:

```
browser ──HTTPS──▶ platform proxy ──HTTP + X-Forwarded-For: <client IP>, X-Forwarded-Proto: https──▶ your app
```

Express ignores those headers unless you tell it to trust the proxy (`app.set("trust proxy", 1)`). Without that:
- `req.ip` is the **proxy's** address, so every user shares one rate-limit bucket (Module 07's login limiter would lock out *everyone* after 5 failures).
- `req.secure` is `false`, even though the user is on HTTPS.

**Trust exactly as many hops as you actually have.** Trusting more lets a client fake its IP by sending its own `X-Forwarded-For`. Also consider HSTS (helmet sends `Strict-Transport-Security`), so browsers refuse plain HTTP for your domain afterwards.

## 1.6 CORS and cookies for a separate frontend

Your React app will live at one URL and the API at another. Two different questions apply:

| | Means | Example | Controls |
|---|---|---|---|
| **Same-origin** | Same scheme + host + port | `https://app.fittrack.dev` vs `https://api.fittrack.dev` → **different origins** | **CORS**: whether the page may *read* the API's responses |
| **Same-site** | Same scheme + *registrable domain* | `app.fittrack.dev` and `api.fittrack.dev` → **same site** (both `fittrack.dev`) | **SameSite cookies**: whether the browser *sends* your session cookie |

- **On a custom domain** (`app.fittrack.dev` + `api.fittrack.dev`): cross-origin, but same-site. `SameSite=Lax` cookies work. You just need CORS to allow the app's origin, **with credentials**.
- **On platform default domains** (`fittrack-app.<platform>.app` + `fittrack-api.<platform>.app`): many platform domains are on the **Public Suffix List**, which makes each subdomain its own "site." Then the two are **cross-site**, and your cookie needs `SameSite=None; Secure`, which gives up the CSRF protection `Lax` provided. **A custom domain avoids this.** Check https://publicsuffix.org for your platform's domain.

**CORS with credentials, the rules the browser enforces:**
- The response must say `Access-Control-Allow-Origin: <the exact origin>` (**never `*`** when credentials are involved, because "any site may read responses sent with this user's cookies" is exactly the attack CORS exists to prevent), and `Access-Control-Allow-Credentials: true`.
- Requests with JSON bodies or custom headers (`Idempotency-Key`) trigger a **preflight**: the browser first sends `OPTIONS` asking permission, and only sends the real request if the answer allows it.
- The frontend opts in with `fetch(url, { credentials: "include" })`.

## 1.7 Backups

- Managed Postgres usually takes **automatic daily backups**, and often supports **point-in-time recovery (PITR)**: "restore to 14:32 yesterday, right before the bad migration."
- Two numbers to know: **RPO** (recovery point objective: how much data can you afford to lose? Daily backups only = up to 24 hours) and **RTO** (recovery time objective: how long can you be down while restoring?).
- **A backup you've never restored is a hope, not a backup.** Practice: restore into a **scratch** database, verify row counts, and time it.
- `pg_dump` gives you a portable copy *you* control, independent of the provider.

## 1.8 Operating the service

**Alert on symptoms users feel**, not on causes:

| Alert | Good? | Why |
|---|---|---|
| Readiness failing for 2+ minutes | ✅ | Users can't use the app |
| 5xx rate > 2% for 5 minutes | ✅ | Users are seeing errors |
| p95 latency > 1s for 10 minutes | ✅ | Users are waiting |
| Jobs failing permanently (any) | ✅ | Someone's export or import silently failed |
| CPU > 80% | ❌ (as a page) | Might be completely fine. Useful on a dashboard, not as a wake-up call. |

Every alert must be **actionable**: when it fires, the runbook says what to look at first.

**A runbook** is the written answer to "it's broken, what do I do?": how to deploy, roll back, rotate a secret, restore the database, and the first steps for each alert.

**A blameless postmortem** after an incident covers what happened, the impact, the timeline, the contributing causes, and action items. It asks "how did our system allow this?", not "who did it?". People hide mistakes they'll be blamed for, and hidden mistakes repeat.

## 1.9 Capacity: connection math

```
Postgres connections used = (API instances × DB_POOL_MAX) + (workers × their pool max) + migrations + you in psql
```

Managed plans cap connections, and small plans cap them low. **2 API instances × 10 + 1 worker × 10 = 30** can already exceed a small plan's limit. Then new connections fail at peak, and readiness flaps. The options: lower `DB_POOL_MAX` (often 5 is plenty: queries are fast), add a connection pooler (PgBouncer, often built into managed Postgres), or move to a bigger plan.

Memory has a limit too: a small instance might have 256–512 MB. Your import keeps CSV text in memory, which is fine at 5 MB and not at 500 MB. (That's why real systems stream uploads to object storage.)

✅ **Before moving on:** explain 1.3, 1.4, and 1.6 out loud.

---

# Part 2 — ⌨️ Worked example A: production config

## 2.1 New settings in `src/config.ts`

```ts
  // Comma-separated list of web origins allowed to call the API from a browser, e.g.
  // "http://localhost:5173,https://app.fittrack.dev". Empty = no cross-origin browser access.
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),
  // How many proxies sit in front of the app (the platform's load balancer = 1). 0 = none (local dev).
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
```

And a rule that spans two settings, added right after the closing `})` of `z.object({ … })`:

```ts
const ConfigSchema = z
  .object({
    // ...all settings...
  })
  // Browsers reject SameSite=None cookies unless they're also Secure.
  .refine((settings) => settings.COOKIE_SAME_SITE !== "none" || settings.COOKIE_SECURE, {
    message: "COOKIE_SAME_SITE=none requires COOKIE_SECURE=true",
    path: ["COOKIE_SAME_SITE"],
  });
```

With this, a deploy with an invalid cookie combination **refuses to start** (Module 03's fail-fast rule), instead of silently producing cookies that browsers drop.

## 2.2 `src/middleware/cors.ts`

```bash
npm install cors
npm install --save-dev @types/cors
```

```ts
import cors from "cors";
import type { RequestHandler } from "express";

/**
 * Lets the listed web origins (your React app) call the API from a browser, WITH cookies.
 * Requests from any other origin get no CORS headers, so the browser blocks the page from
 * reading the response. (Non-browser clients like curl ignore CORS entirely: it is not auth.)
 */
export function createCorsMiddleware(allowedOrigins: string[]): RequestHandler {
  return cors({
    origin: (origin, callback) => {
      // No Origin header = not a cross-origin browser request (curl, server-to-server, same-origin): allow.
      if (origin === undefined || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false); // no CORS headers → the browser refuses to expose the response
      }
    },
    credentials: true, // send Access-Control-Allow-Credentials: true, so the session cookie is allowed
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Idempotency-Key", "If-None-Match", "If-Match", "X-Request-Id"],
    exposedHeaders: ["ETag", "Location", "Retry-After", "X-Request-Id"],
    maxAge: 600, // browsers may cache a preflight answer for 10 minutes
  });
}
```

- **`origin` as a function** checks the request's `Origin` header against the allowlist. The `cors` package echoes back the *exact* allowed origin, never `*`.
- **No `Origin` header** means it isn't a cross-origin browser request (curl, your smoke test, same-origin), so CORS doesn't apply.
- **`exposedHeaders`**: by default, browser JavaScript can only read a few "safe" response headers. Your frontend needs `ETag`, `Location`, `Retry-After`, and `X-Request-Id`.
- **`allowedHeaders`** lists the request headers the frontend may send, including Module 08's `Idempotency-Key`.

## 2.3 Wire it in `src/app.ts`

```ts
import { createCorsMiddleware } from "./middleware/cors.js";
// ...
  const app = express();

  // Behind the platform's load balancer: trust X-Forwarded-For / -Proto from that many hops,
  // so req.ip is the real client (for rate limiting) and req.secure reflects HTTPS.
  app.set("trust proxy", config.TRUST_PROXY_HOPS);
  app.use(requestContext);
  app.use(createCorsMiddleware(config.CORS_ORIGINS));
  app.use(helmet());
  // ...the rest as before
```

**CORS goes early,** before `requireAuth`, because a preflight `OPTIONS` request carries no cookie and must be answered without logging in.

And in `src/modules/auth/cookies.ts`:

```ts
    sameSite: config.COOKIE_SAME_SITE, // "lax" unless the frontend is on a different SITE (see Module 10)
```

✅ **Try it** (with `CORS_ORIGINS=http://localhost:5173` in `.env`)

```bash
# A preflight from your future React dev server → allowed
curl -i -X OPTIONS localhost:3000/v1/steps/2026-10-11 \
  -H 'Origin: http://localhost:5173' -H 'Access-Control-Request-Method: PUT' -H 'Access-Control-Request-Headers: content-type'
# HTTP/1.1 204 No Content
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Credentials: true
# Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE
# Access-Control-Allow-Headers: Content-Type,Idempotency-Key,If-None-Match,If-Match,X-Request-Id

# A preflight from some other site → no Access-Control-Allow-* headers at all
curl -i -X OPTIONS localhost:3000/v1/steps/2026-10-11 -H 'Origin: https://evil.example' -H 'Access-Control-Request-Method: PUT'
# (the request falls through to your routes and gets a 401; what matters is that there's no
#  Access-Control-Allow-Origin header, so the browser refuses to send the real request)
```

```bash
git add -A && git commit -m "feat(ops): cors, trust proxy, configurable cookies"
```

---

# Part 3 — ⌨️ Worked example B: an expand/contract plan

## 3.1 The problem (from Module 04, checkpoint question 2)

Your weekly stats decide which day a workout belongs to using `users.timezone`, the user's **current** timezone. Fly to New York, update your profile, and last month's 11:30pm San Jose runs move to the next day in your history. The fix: **store the timezone each workout was logged in**, on the workout.

Doing it in one migration (`ADD COLUMN local_timezone text NOT NULL`) fails outright (existing rows have no value), and even with a default it would break old code during the rollout. Here's the expand/contract version. **Every SQL statement below was run against a 500,000-row `workouts` table while this course was written.**

## 3.2 The plan, one deploy per step

**Step 1: EXPAND** (migration `NNN_workouts_local_timezone_add.sql`):

```sql
SET lock_timeout = '5s';
ALTER TABLE workouts ADD COLUMN local_timezone text;   -- nullable: instant, and old code ignores it
```

**Step 2: WRITE IT** (a code deploy): when creating a workout, the service stores the user's current timezone in `local_timezone`. Old rows are still NULL. Both old and new code keep working.

**Step 3: BACKFILL** (a one-off script, run after step 2 is fully live), in batches so no single statement locks many rows for long:

```sql
WITH batch AS (
  SELECT w.id FROM workouts w WHERE w.local_timezone IS NULL LIMIT 5000
)
UPDATE workouts w
SET local_timezone = u.timezone
FROM users u, batch
WHERE w.id = batch.id AND w.user_id = u.id;
-- repeat until it reports UPDATE 0 (for 500,000 rows, about 100 loops)
```

**Step 4: ENFORCE**, as three separate migrations, so the slow part never holds a blocking lock:

```sql
-- NNN_workouts_local_timezone_check.sql: fast; NOT VALID = only checks NEW writes
SET lock_timeout = '5s';
ALTER TABLE workouts
  ADD CONSTRAINT workouts_local_timezone_not_null CHECK (local_timezone IS NOT NULL) NOT VALID;
```

```sql
-- NNN_workouts_local_timezone_validate.sql: scans existing rows, but reads and writes continue meanwhile
ALTER TABLE workouts VALIDATE CONSTRAINT workouts_local_timezone_not_null;
```

```sql
-- NNN_workouts_local_timezone_not_null.sql: fast; Postgres sees the VALID check and skips the full scan
SET lock_timeout = '5s';
ALTER TABLE workouts ALTER COLUMN local_timezone SET NOT NULL;
ALTER TABLE workouts DROP CONSTRAINT workouts_local_timezone_not_null;   -- NOT NULL now does its job
```

Why three files? Your runner wraps each file in a transaction, and locks are held until the transaction ends. If the fast `ADD CONSTRAINT` (strong lock) and the slow `VALIDATE` were in one file, the strong lock would be held for the whole scan, blocking every write to `workouts`.

**Step 5: CONTRACT** (a code deploy): stats queries use the workout's own zone:

```sql
(w.started_at AT TIME ZONE w.local_timezone)::date
```

…instead of `u.timezone`. There's nothing to drop in this example, because the change only *added* things. For a **rename**, the contract step would finally drop the old column, and only after no running code reads it.

## 3.3 What makes every step safe

| After step | Old code | New code | Rollback |
|---|---|---|---|
| 1 | ✅ ignores the column | ✅ | Redeploy the previous image: safe |
| 2 | ✅ (writes NULL; fixed by the backfill) | ✅ | Safe |
| 3 | ✅ | ✅ | Safe (the data stays) |
| 4 | ❌ old code would now fail on insert (no value) | ✅ | Roll back only to step-2 code or later |
| 5 | n/a | ✅ | Safe |

That table is the actual skill: **for each step, ask what the old code does, what the new code does, and what a rollback does.**

---

# Part 4 — ⌨️ Given infrastructure

## 4.1 An example deploy config: `fly.toml` (Fly.io)

You'll choose your own platform in Challenge 1. This is one concrete example, so you can see what each idea from 1.3 looks like in real config. **Check every key against your platform's current docs.** Platforms change their config formats.

```toml
# fly.toml: an EXAMPLE for Fly.io. Check every key against Fly's current docs before relying on it.
app = "fittrack-api"          # your app's name on Fly
primary_region = "sjc"        # San Jose; pick the region closest to you and your database

# Fly's default stop signal is SIGINT; your handlers cover both, but be explicit.
kill_signal = "SIGTERM"
kill_timeout = 30             # seconds between SIGTERM and SIGKILL (longer than SHUTDOWN_TIMEOUT_MS)

[build]
  # Uses the Dockerfile in the project root.

[deploy]
  # Runs ONCE per deploy, in a temporary machine, BEFORE new app machines start.
  # If it fails, the deploy stops and the old version keeps running.
  release_command = "node dist/db/migrate.js"

[env]
  # Non-secret settings only. Secrets (DATABASE_URL, REDIS_URL, …) go in `fly secrets set`.
  NODE_ENV = "production"
  PORT = "3000"
  LOG_LEVEL = "info"
  COOKIE_SECURE = "true"
  TRUST_PROXY_HOPS = "1"
  SHUTDOWN_DRAIN_MS = "5000"
  SHUTDOWN_TIMEOUT_MS = "20000"

# Two process groups from one image: the API and the worker.
[processes]
  app = "node dist/server.js"
  worker = "node dist/worker.js"

[http_service]
  processes = ["app"]          # only the API receives web traffic
  internal_port = 3000
  force_https = true           # redirect http → https
  auto_stop_machines = "off"   # keep it running (the worker and steady latency matter more than idle savings)
  min_machines_running = 1

  [[http_service.checks]]
    method = "GET"
    path = "/health/ready"
    interval = "15s"
    timeout = "2s"
    grace_period = "10s"
```

The same ideas on any PaaS:

| Idea | Fly.io (above) | What to look for elsewhere |
|---|---|---|
| Migrations once per deploy | `[deploy] release_command` | "release command," "pre-deploy command," "job" |
| API + worker from one image | `[processes]` | "background worker" service, "process types" |
| Traffic only to healthy instances | `[[http_service.checks]]` | "health check path" |
| Time to shut down gracefully | `kill_signal`, `kill_timeout` | "grace period," "drain timeout" |
| Secrets | `fly secrets set DATABASE_URL=…` | the dashboard's "environment / secrets" |

## 4.2 An example CD workflow: `.github/workflows/deploy.yml`

```yaml
# .github/workflows/deploy.yml: an EXAMPLE continuous-deployment workflow for Fly.io.
name: Deploy

on:
  workflow_run:
    workflows: [CI]          # run after the CI workflow…
    types: [completed]
    branches: [main]

jobs:
  deploy:
    # …and only if CI passed on main
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    concurrency: deploy-production   # never run two deploys at once
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.workflow_run.head_sha }}   # deploy exactly the commit CI tested

      - uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy (build image → release_command migrations → rolling restart)
        run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

      - name: Smoke test the live API
        run: ./scripts/smoke-test.sh https://fittrack-api.fly.dev
```

- **`workflow_run`**: deploy only after CI succeeded on `main`, and deploy **exactly the commit CI tested** (`head_sha`).
- **`concurrency`**: a second push while a deploy is running waits instead of racing it.
- **`FLY_API_TOKEN`** lives in GitHub → Settings → Secrets, never in the file.

## 4.3 `scripts/smoke-test.sh`

```bash
#!/usr/bin/env bash
# Quick checks that a deployed API is alive and wired correctly.
# Usage: scripts/smoke-test.sh https://your-api.example.com
set -euo pipefail   # stop at the first failure; treat unset variables as errors

BASE_URL="${1:?usage: smoke-test.sh <base-url>}"

# check <name> <expected status> <curl arguments...>
check() {
  local name="$1"
  local expected="$2"
  shift 2
  local actual
  actual=$(curl --silent --output /dev/null --write-out "%{http_code}" --max-time 10 "$@")
  if [ "$actual" != "$expected" ]; then
    echo "FAIL  $name: expected $expected, got $actual"
    exit 1
  fi
  echo "ok    $name ($actual)"
}

check "liveness"            200 "$BASE_URL/health/live"
check "readiness"           200 "$BASE_URL/health/ready"
check "api docs"            200 "$BASE_URL/openapi.json"
check "auth is enforced"    401 "$BASE_URL/v1/workouts"
check "unknown route"       404 "$BASE_URL/definitely-not-a-route"

echo "Smoke test passed for $BASE_URL"
```

This script was run successfully against this course's test build. `set -euo pipefail` makes bash stop at the first failure, which is what you want in CI. Make it executable (`chmod +x scripts/smoke-test.sh`) and commit it.

## 4.4 Backup and restore commands

Your platform's automatic backups are the first line. These commands give you your **own** copy, and they're how you'll do the restore drill. Use client tools of the same major version as the server (or newer): running them from the `postgres:18` image guarantees that.

```bash
# BACKUP: a compressed, portable dump of production (custom format)
docker run --rm -v "$PWD:/backup" postgres:18 \
  pg_dump --format=custom --no-owner --no-privileges \
  --dbname "$PROD_DATABASE_URL" --file "/backup/fittrack-$(date +%F).dump"

# RESTORE DRILL: into a brand-new SCRATCH database, never into production
docker compose exec db createdb -U fittrack fittrack_restore_drill
time docker run --rm -v "$PWD:/backup" postgres:18 \
  pg_restore --no-owner --no-privileges \
  --dbname "postgres://fittrack:fittrack@host.docker.internal:5432/fittrack_restore_drill" \
  "/backup/fittrack-YYYY-MM-DD.dump"
```

(`host.docker.internal` is how a container reaches your Mac's `localhost`, where Compose's Postgres is listening.)

**Verify, don't assume.** Compare row counts in production and in the restore:

```sql
SELECT (SELECT count(*) FROM users)       AS users,
       (SELECT count(*) FROM workouts)    AS workouts,
       (SELECT count(*) FROM daily_steps) AS step_days,
       (SELECT max(name) FROM schema_migrations) AS latest_migration;
```

When this course was written, a dump of 1,000 users / 500,000 workouts / 1,000,000 step days took about 4 seconds (29 MB), and the restore about 7 seconds, with identical counts afterwards. The restore printed one warning about an object that already existed, which is typical and harmless. **Read every warning anyway.** Yours will take longer over the network, which is exactly the number your runbook needs.

**Backup files contain all your data, including password hashes.** Store them encrypted, somewhere private, and delete old ones. Never commit them.

## 4.5 Document templates

**`RUNBOOK.md`**

````markdown
# fittrack-api runbook

## At a glance
- Production URL: …        Dashboard: …        Logs: …        Metrics: …
- Database: provider / plan / region / connection limit / backup retention
- Who to contact: (you!) and the provider's status page: …

## Deploy
Normal path: merge to main → CI → deploy workflow → smoke test. Manual: `…`

## Roll back
1. Redeploy the previous image: `…`
2. Is the schema still compatible with the old code? (Check the last migrations; see expand/contract.)
3. Verify: smoke test + /health/ready + error rate

## Rotate a secret (e.g., the database password)
1. … 2. … 3. Verify: …

## Restore the database
Last drill: YYYY-MM-DD, took N minutes. Steps: …

## Alerts → first steps
| Alert | Look at first | Likely causes | Fix |
|---|---|---|---|
| Readiness failing | /health/ready body: which check? | DB/Redis down; connection limit | … |
| 5xx rate high | logs at level ≥ 50, grouped by route | a bad deploy; DB errors | roll back |
| Jobs failing | `SELECT queue, last_error FROM jobs WHERE status = 'failed' ORDER BY updated_at DESC LIMIT 20` | … | … |

## Top 5 errors I've seen, and what they meant
1. …
````

**`docs/postmortems/YYYY-MM-DD-title.md`**

````markdown
# Postmortem: <title>
**Date:** … **Duration:** … **Impact:** who/what was affected, for how long

## Timeline (all times in UTC)
- 14:02 deploy of abc123 started
- 14:05 first 5xx alert
- …

## What happened
## Contributing causes (the system, not the person)
## What went well
## Action items
| Action | Type (prevent/detect/mitigate) | Done |
|---|---|---|
````

---

# Part 5 — 🧰 Toolbox

## 5.1 Secrets, done right

- Set them in the platform's secret store, one by one, from your terminal (not pasted into chat or docs).
- **Generate** secrets instead of inventing them: `openssl rand -base64 32`.
- After setting one, check that the app **started** (Module 03's config validation will refuse bad ones) and that your logs don't contain it.
- If a secret ever lands in git, a log, or a screenshot: **rotate it**. Deleting the commit doesn't un-leak it.

## 5.2 Choosing connection limits

```
(API instances × DB_POOL_MAX) + (workers × pool) + 1 (migrations) + 2 (your psql + slack) ≤ the plan's connection limit
```

Start with `DB_POOL_MAX=5` per process. Your Module 09 load tests tell you whether that's enough: pool exhaustion shows up as rising latency with idle CPU.

## 5.3 Non-transactional migrations (for `CREATE INDEX CONCURRENTLY`)

`CREATE INDEX CONCURRENTLY` can't run inside a transaction, but your runner wraps every file in one. A common convention is a marker on the **first line** of the file:

```sql
-- no-transaction
CREATE INDEX CONCURRENTLY IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);
```

The runner then runs that file **without** `BEGIN`/`COMMIT`, and records it in `schema_migrations` afterwards. The trade-off: if a non-transactional migration fails halfway, there's no rollback. A failed `CONCURRENTLY` build leaves an **invalid** index behind that you must drop by hand. Keep these files to a single statement, and use `IF NOT EXISTS` so a retry is safe.

## 5.4 Backfills in code

```ts
// src/db/backfills/<name>.ts: run once with tsx (or `node dist/...`), after the code that writes the new column is live
let total = 0;
while (true) {
  const result = await pool.query(`WITH batch AS (… LIMIT 5000) UPDATE … FROM batch …`);
  const updated = result.rowCount ?? 0;
  total += updated;
  console.log(`updated ${updated} (total ${total})`);
  if (updated === 0) break;
  await sleep(200);   // a short pause between batches leaves room for normal traffic
}
```

## 5.5 Calling the API from your React app (the handoff)

```ts
// One function for every call: cookies included, problem+json errors surfaced
async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...init,
    credentials: "include",                                   // send the session cookie cross-origin
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) {
    const problem = await response.json();                    // { type, title, status, detail, errors, requestId }
    throw Object.assign(new Error(problem.detail ?? problem.title), { problem });
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}
```

And generate types from your spec, so the frontend can't drift from the API:

```bash
npx openapi-typescript https://<your-api>/openapi.json -o src/api/schema.d.ts
```

## 5.6 If your provider's Postgres is older than 18

`uuidv7()` is built into Postgres 18. On an older version, your migrations fail at the first `DEFAULT uuidv7()`. Add this as your **first** migration on such a server (it's a widely used pure-SQL implementation, and it was tested while writing this course: it produces valid, time-ordered version-7 UUIDs):

```sql
-- Only needed on Postgres < 18, which has uuidv7() built in.
CREATE OR REPLACE FUNCTION uuidv7() RETURNS uuid
LANGUAGE sql VOLATILE AS $$
  -- 48-bit Unix time in milliseconds, then random bits, with the version nibble set to 7
  SELECT encode(
    set_bit(
      set_bit(
        overlay(uuid_send(gen_random_uuid())
                placing substring(int8send((extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3)
                FROM 1 FOR 6),
        52, 1),
      53, 1),
    'hex')::uuid;
$$;
```

---

# Part 6 — 🧩 Challenges

## Challenge 1: Choose a host ★☆☆

Research **2–3 platforms** (for example Fly.io, Render, Railway, or Cloud Run + a managed Postgres provider). Use their **current** docs and pricing pages; write the date you checked. Fill in the tracker table: managed Postgres (version, backups, PITR, connection limit), Redis, worker support, release command, health checks, region near you, and the monthly cost of your setup. Pick one, and record the decision and the runner-up in the decisions log.

---

## Challenge 2: Production config, verified ★★☆

1. Add Part 2's settings, middleware, and wiring.
2. Write integration tests for CORS: an allowed origin gets `Access-Control-Allow-Origin` (echoed exactly) + `Access-Control-Allow-Credentials: true`; a disallowed origin gets neither; a request without `Origin` still works.
3. Test `trust proxy`: with `TRUST_PROXY_HOPS=1`, a request with `X-Forwarded-For: 203.0.113.9` makes the login rate limiter count under that IP. With `0`, it doesn't.
4. A config test: `COOKIE_SAME_SITE=none` + `COOKIE_SECURE=false` fails validation.

<details><summary>💡 Hint</summary>

- **CORS tests** are plain Supertest: `.options("/v1/steps/2026-10-11").set("Origin", "http://localhost:5173").set("Access-Control-Request-Method", "PUT")`, then assert on `response.headers["access-control-allow-origin"]`. For the disallowed case, assert the header is `undefined`. Set `CORS_ORIGINS` in your test environment (`.env.test` or the Vitest `env` option) so the allowlist is known.
- **`trust proxy`:** `config` is read once at import, so a test can't flip `TRUST_PROXY_HOPS` between cases. The simplest fix is to make it a `buildApp` option (`trustProxyHops`, defaulting to `config.TRUST_PROXY_HOPS`), then build one app with `1` and one with `0`. Make 5 bad logins with `X-Forwarded-For: 203.0.113.9`; the 6th from that IP gets 429, and with hops = 1 a request with a *different* `X-Forwarded-For` doesn't.
- **Config test:** `loadConfig()` calls `process.exit`, which is awkward in a test. Export `ConfigSchema` and assert `ConfigSchema.safeParse({ ...validEnv, COOKIE_SAME_SITE: "none", COOKIE_SECURE: "false" }).success === false`.
</details>

---

## Challenge 3: First deploy ★★★

1. Provision production Postgres and Redis on your chosen platform(s). Note the connection limit (toolbox 5.2) and set `DB_POOL_MAX` accordingly.
2. Set every secret (toolbox 5.1) and non-secret setting. Production must have `NODE_ENV=production`, `COOKIE_SECURE=true`, `TRUST_PROXY_HOPS` set correctly, and `CORS_ORIGINS` set to your future frontend's origin (or empty for now).
3. Deploy the API and the worker from your Docker image, with migrations as the release step.
4. **HTTPS:** use a custom domain if you can (it makes 1.6 much simpler); otherwise the platform's domain.
5. Verify in production: `/health/ready` is 200; register your real account; the `Set-Cookie` header includes `Secure`, `HttpOnly`, and `SameSite=Lax`; log a workout; export your steps (which proves the worker runs).

✅ **Done when:** `scripts/smoke-test.sh https://<your-api>` passes, and the tracker's "Production facts" table is filled in.

---

## Challenge 4: Continuous deployment ★★☆

Automate it: merging to `main` → CI → build → migrations as a release step → rolling deploy → smoke test. Use Part 4.2 as a model and adapt it to your platform.

✅ **Acceptance**
1. A trivial change (say, the API's `info.version` in the OpenAPI document) goes from merge to live with no manual steps. Record how long it takes.
2. **A failed migration stops the deploy:** push a migration with a deliberate error on a branch, run your deploy against a **staging** environment (or watch the release step fail in the logs, if that's all your setup supports), and confirm the old version kept serving.
3. **Roll back** once, on purpose, using your runbook's steps, and time it.

<details><summary>💡 Hint</summary>

Most platforms list past releases with their image or commit, and can redeploy one (`fly releases` and `fly deploy --image <previous image>` on Fly; a "Rollback" or "Redeploy" button on Render and Railway). Write down the *exact* command or clicks the first time. That becomes your runbook's rollback section. For the failing-migration test, `SELECT 1/0;` in a migration file is a harmless, reliable failure.
</details>

---

## Challenge 5: Teach your runner non-transactional migrations ★★☆

Implement toolbox 5.3 in `run-migrations.ts`: if a file's first line is exactly `-- no-transaction`, run it without `BEGIN`/`COMMIT`, and insert the bookkeeping row afterwards.

✅ **Acceptance (tests against the test database):**
1. A `-- no-transaction` file containing `CREATE INDEX CONCURRENTLY …` applies successfully. (The same file *without* the marker fails with "cannot run inside a transaction block.")
2. Normal files still roll back completely on error.
3. Then **use it:** add `CREATE INDEX CONCURRENTLY IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);` and a small job that deletes expired sessions daily (your Module 08 queue, scheduled with `runAt`).

<details><summary>💡 Hint</summary>

- After `readFile`, check `sql.split("\n", 1)[0].trim() === "-- no-transaction"`. Put the two paths in separate branches (or two small functions), so the transactional path stays exactly as it was. Don't let the two share a `try`/`ROLLBACK`.
- The non-transactional path: `await client.query(sql)`, then `INSERT INTO schema_migrations`. If the `INSERT` fails after the index was built, `IF NOT EXISTS` makes the next run safe.
- **"Daily" with a queue that only supports `runAt`:** the handler deletes expired sessions, then enqueues *the next run* for 24 hours later. Seed the first run at worker startup only if no `queued` job for that queue exists, or you'll get one extra chain per restart.
</details>

---

## Challenge 6: Expand/contract in production ★★★

Carry out Part 3's plan **for real**, in production, as separate deploys:

1. Before each step, write in the tracker: the change, what old code does, what new code does, and the rollback (the 3.3 table, for your actual code).
2. Steps 1 → 2 → 3 (the backfill: write it as a script, toolbox 5.4) → 4 (the three migrations) → 5.
3. Keep the app in use during every step: log a workout and run the smoke test between steps.
4. **Prove the payoff:** change your profile's timezone to `America/New_York`, and confirm last month's late-evening runs **stay** on their original days in `/v1/stats/weekly`.

✅ **Done when:** zero errors in the logs during the whole sequence, and the tracker has all five step plans.

<details><summary>💡 Hint</summary>

- Run the backfill script **from your machine against production** only if your platform allows outside connections. Otherwise run it as a one-off command on the platform (`fly ssh console -C "node dist/db/backfills/local-timezone.js"`, or a Render/Railway one-off job). Build it into the image, so it uses the same code and config.
- Before running it on production, run it against your restore-drill copy (Challenge 7) and time it.
- The weekly stats change is in one query in your stats repository: replace `u.timezone` with `w.local_timezone` and check that the `users` join is still needed.
</details>

---

## Challenge 7: The restore drill ★★☆

1. Take a dump of production (toolbox 4.4).
2. Restore it into a scratch database. **Time it.**
3. Verify the row counts match.
4. Point a local copy of the API at the restored database (`DATABASE_URL=…restore_drill npm run dev`) and log in with your real account. This proves the restore is *usable*, not just present.
5. Find out your provider's backup retention and PITR window. Then write down your **RPO** and **RTO** in the runbook.
6. Delete the dump file (it holds all your data).

---

## Challenge 8: Alerts that matter ★★☆

Set up, with whatever your platform or a free monitoring service provides:
1. **An uptime check** on `/health/ready`, every 1–5 minutes, alerting you by email or phone.
2. **An error-rate alert** (5xx above a threshold for a few minutes), from your platform's metrics, a log-based alert, or by scraping `/metrics`.
3. **A failed-jobs signal**: at least a saved query or dashboard; ideally an alert.

✅ **Done when:** you've **triggered each one on purpose** (stop the app for the uptime check; add a temporary route that returns 500 for the error alert), received it, and written its first-steps entry in the runbook.

<details><summary>💡 Hint</summary>

If your platform's metrics don't include HTTP status codes, a log-based alert works: your request-completion log line (Module 03) already has `status`, and 5xx responses are logged at level `error`, so alert on "count of `error`-level request log lines over 5 minutes." For the failed-jobs signal, the simplest version is a metric: a Gauge `jobs_failed` set from `SELECT count(*) FROM jobs WHERE status = 'failed' AND updated_at > now() - interval '1 day'` on each `/metrics` scrape. That query is cheap while the `jobs` table is small; once it grows, add a partial index `ON jobs (updated_at) WHERE status = 'failed'`. Remember to remove the temporary 500 route afterwards.
</details>

---

## Challenge 9: The runbook ★★☆

Fill in `RUNBOOK.md` from the template (4.5), using the real commands from Challenges 3–8. Then test it: **follow your own runbook to rotate the database password** (or another secret), without improvising. Every place you had to improvise is a missing step; add it.

---

## Challenge 10: Two weeks of real use ★★☆

Use `fittrack-api` in production for **14 days** for your real training: every day's steps and every workout. Use `requests.http`, curl, or a tiny script, since the React app comes after the course.

Keep the **friction log** in the tracker every time something is awkward, slow, wrong, or missing. That log is your frontend backlog, and the proof that you built something real.

At the end, look at your own data through your API: your weekly stats, your PRs, your longest streak. Do the numbers match what actually happened?

---

## Challenge 11: The capstone README ★★☆

Rewrite the project's `README.md` for a reader who has **2 minutes**: a hiring manager, or a teammate. Suggested outline:

1. **What it is**, in one sentence, plus the live URL and the docs URL (`/openapi.json` rendered).
2. **An architecture diagram:** API, worker, Postgres, Redis, CI/CD, the platform.
3. **Highlights, with links to the code:** layered architecture; Zod at the trust boundary; your own migration runner; keyset pagination; transactional workout + sets; session auth with an IDOR test suite; a Postgres job queue with idempotent handlers; idempotency keys; ETags and cache-aside; graceful shutdown; expand/contract in production.
4. **Key decisions:** link the decisions log.
5. **Run it locally** (`docker compose up -d`, `npm run db:migrate`, `npm run dev`), **test it** (`npm test`), **deploy it**.
6. **What I'd do next.**

Ask your tutor to review it **as a hiring manager would**: what's unclear, and what's impressive but buried?

---

## Challenge 12: Retro ★☆☆

1. Write a one-page reflection in the tracker: what was hardest, what surprised you, what you'd build differently, and which skill from the ledger in `COURSE.md` you're most confident about now.
2. Write one **postmortem** (template 4.5) about a real incident from the course: a deploy that broke, a failed migration, a drill that went wrong. If nothing went wrong, write it about the drill itself.
3. Tick the skills ledger in `COURSE.md` for everything you've *proved*.

```bash
git add -A && git commit -m "docs: runbook, postmortem, capstone README"
```

---

## Definition of done

- [ ] The API and worker are live on HTTPS and deploy automatically from `main`, with migrations as the release step and a smoke test after.
- [ ] Production config is verified: Secure cookies, correct `trust proxy`, a CORS allowlist, config validation that refuses unsafe combinations.
- [ ] A zero-downtime expand/contract change was done in production, with a written plan for every step.
- [ ] A timed restore drill was done; RPO and RTO are written down.
- [ ] Uptime, error-rate, and failed-job alerts exist, and each was triggered on purpose.
- [ ] `RUNBOOK.md` exists and was used (a secret rotation followed it exactly).
- [ ] Two weeks of your real training data is in production, with a friction log.
- [ ] The README would let a stranger understand, run, and deploy the project.

---

## ✍️ Checkpoint

1. Why build the image once and promote that exact artifact, instead of rebuilding per environment?
2. Your deploy runs migrations, then rolls out new code while old instances still serve traffic. Which kinds of migrations are safe? Give one unsafe example and its expand/contract version.
3. Why use `CREATE INDEX CONCURRENTLY` in production, and why did your runner need a change to support it?
4. Same-origin vs. same-site: is `app.fittrack.dev` → `api.fittrack.dev` same-site? What about two apps on a platform domain that's on the Public Suffix List? What does each mean for your cookies?
5. Why can't `Access-Control-Allow-Origin` be `*` when credentials are included?
6. Your managed Postgres allows 25 connections. You run 2 API instances with a pool max of 10 and a worker with a pool max of 10. What's the problem, and what are your options?
7. Someone says "we have daily backups." What questions should you ask next?
8. Alert A: CPU > 80%. Alert B: 5xx rate > 2% for 5 minutes. Which is better, and why?
9. You deployed a bug along with a migration that dropped a column. Why is rolling back hard, and how would expand/contract have prevented it?
10. What would you change in this architecture if `fittrack` had 100,000 active users?

**Explain it back:** Describe the full lifecycle of a feature, from a new branch to verified in production, including the migration and how you'd know it's healthy.

---

## 📋 Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Progress
- [ ] Part 1: Concepts read (1.1–1.9)
- [ ] Part 2: Production config (CORS, trust proxy, cookies)
- [ ] Part 3: Expand/contract plan understood
- [ ] Part 4: Deploy config, CD, smoke test, backup commands, templates understood
- [ ] Challenge 1: Host chosen
- [ ] Challenge 2: Production config tested
- [ ] Challenge 3: First deploy
- [ ] Challenge 4: Continuous deployment
- [ ] Challenge 5: Non-transactional migrations
- [ ] Challenge 6: Expand/contract in production
- [ ] Challenge 7: Restore drill
- [ ] Challenge 8: Alerts, triggered on purpose
- [ ] Challenge 9: Runbook, used
- [ ] Challenge 10: Two weeks of real use
- [ ] Challenge 11: Capstone README
- [ ] Challenge 12: Retro + postmortem
- [ ] Checkpoint passed (≥ 8/10)

### Concepts I can explain without notes
- [ ] Hosting models (1.1)
- [ ] Environments and secrets (1.2)
- [ ] The deploy pipeline and rollback (1.3)
- [ ] Expand/contract, and locks during DDL (1.4)
- [ ] HTTPS, proxies, `trust proxy` (1.5)
- [ ] Same-origin vs. same-site; CORS with credentials (1.6)
- [ ] Backups, PITR, RPO/RTO, restore drills (1.7)
- [ ] Symptom-based alerting, runbooks, blameless postmortems (1.8)
- [ ] Connection math and memory limits (1.9)

### Host comparison (Challenge 1), checked on: YYYY-MM-DD
| | Option A | Option B | Option C |
|---|---|---|---|
| Platform | | | |
| Postgres (version, backups, PITR, connection limit) | | | |
| Redis | | | |
| Worker process | | | |
| Release command | | | |
| Health checks | | | |
| Region | | | |
| Monthly cost for my setup | | | |

### Production facts
| Item | Value |
|---|---|
| Host | |
| Production URL | |
| Postgres plan / version / connection limit | |
| `DB_POOL_MAX` per process | |
| Backup retention / PITR window | |
| RPO / RTO | |
| Restore drill time | |
| Merge-to-live time | |
| Rollback time | |
| Alerts configured (and tested) | |

### Expand/contract step plans (Challenge 6)
| Step | Change | Old code does | New code does | Rollback |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

### Two-week friction log (Challenge 10)
| Date | Friction | Idea |
|---|---|---|
| | | |

### Retro (Challenge 12)
—

### Checkpoint weak spots
—

### Error log
| Error | Cause | Fix |
|---|---|---|
| | | |

### Open questions
—

## Resources
- PostgreSQL, `ALTER TABLE` (locks, `NOT VALID`, `VALIDATE CONSTRAINT`): https://www.postgresql.org/docs/current/sql-altertable.html
- PostgreSQL, `CREATE INDEX CONCURRENTLY`: https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY
- PostgreSQL, backup and restore: https://www.postgresql.org/docs/current/backup.html
- strong_migrations (Rails, but its list of unsafe operations applies everywhere): https://github.com/ankane/strong_migrations
- Express behind proxies: https://expressjs.com/en/guide/behind-proxies.html
- MDN, CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- web.dev, "Understanding same-site and same-origin": https://web.dev/articles/same-site-same-origin
- Public Suffix List: https://publicsuffix.org/
- Google SRE book, "Postmortem Culture": https://sre.google/sre-book/postmortem-culture/
- openapi-typescript: https://openapi-ts.dev/
