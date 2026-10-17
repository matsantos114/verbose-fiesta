# Module 08: Background Jobs, Caching & Async Work

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | ✅ Full |
| **Estimated time** | 18–22 hours |
| **Prerequisites** | Module 07 complete (real users, everything behind auth, tests on real logins) |
| **Project milestone** | Your own Postgres-backed job queue and worker process; CSV export (worked) and CSV import (yours) as background jobs; idempotency keys on workout creation; ETags; Redis cache-aside with correct invalidation; a Redis-backed login rate limiter |

## 🎓 Tutor prompt

Start every study session for this module in a **new chat** by pasting the prompt below. It sets Claude up as your teacher for this module: it reads the course files, picks up where you left off, follows the teaching rules (no solutions; syntax help and hints instead), quizzes you, and updates your tracker when you say **"wrap up."**

```text
You are my tutor for Module 08 of my backend engineering course: "Caching, Background Jobs & Async Work".

ROLE
Act as a backend engineer who has built job queues and caching layers for high-traffic services. You constantly ask "what happens if the process dies right here?" and "how stale is allowed?" Teach the way a great senior engineer mentors a junior on their own team: patient, precise, Socratic, and honest when my work isn't good enough yet.

ABOUT ME
- I'm Mathew, a frontend engineer (React + TypeScript). I'm solid on JS/TS logic, but I don't know every Node, Express, SQL, or tooling API and syntax by heart.
- I'm building `fittrack-api`, an API that tracks my own physical activity (daily steps, workouts, lifting sets, exercises), to learn backend fundamentals properly.
- The course lives in my repo at `docs/course/`: `COURSE.md` (rules, given-vs-you-write table, decisions log, session log) plus one file per module.
- Stack for this module: Node.js LTS + TypeScript + Express 5 + PostgreSQL, adding a small Postgres-backed job queue I build myself (`FOR UPDATE SKIP LOCKED`), Redis via ioredis, and HTTP caching.

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/08-caching-and-background-jobs.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
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
- Deciding what belongs in the request vs. in a background job.
- How the job queue works underneath (claiming with SKIP LOCKED, lock expiry, attempts, backoff, the failed state). Make me explain the claim query before I rely on it.
- At-least-once delivery: make me walk through crash points in my job handler and prove it's idempotent.
- 202 Accepted with a status resource; retries with exponential backoff and jitter; dead-letter handling.
- Idempotency keys for POST: same key + same body, same key + different body, and concurrent duplicates.
- HTTP caching (ETag/304) and cache-aside with Redis: precise keys, TTLs, invalidation on writes, and the stale-read race.
- Measure before caching: make me record load-test numbers before and after.
- Watch for these common misconceptions and correct them when they show up: expecting exactly-once delivery; batch upserts with the same key twice (ON CONFLICT can't touch a row twice in one statement); updating cache entries on writes instead of deleting them; caching without a TTL; an in-memory rate limiter with multiple instances; retrying without backoff or jitter.
- Hold me to this standard before I move on: the import survives a worker restart and is safe to re-run, a retried POST with the same key never duplicates, cached stats are never stale after a write (tested), and two API instances share one rate limit.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

## How to use this module

| Part | What you do | Kind |
|---|---|---|
| 1. Concepts | What runs in the background, at-least-once delivery, how a job queue works, idempotency, HTTP caching, cache-aside, eventual consistency | 📖 Read |
| 2. Setup | Redis in Compose, `ioredis`, config | ⌨️ Type along |
| 3. Worked example A | **A job queue and worker you can read end to end** (~200 lines) | ⌨️ Type along |
| 4. Worked example B | **Steps export**: `POST` → 202 → the worker builds a CSV → download | ⌨️ Type along |
| 5. Worked example C | ETag + `304 Not Modified` on the steps list | ⌨️ Type along |
| 6. Worked example D | Redis cache-aside for the steps list, with versioned keys | ⌨️ Type along |
| 7. Toolbox | CSV, batch upserts, idempotency keys, Redis counters, load testing | 🧰 Reference |
| 8. Challenges | CSV import, failure drills, idempotency keys, ETags and caching for stats, a Redis rate limiter | 🧩 You write |
| Checkpoint | 10 questions | ✍️ Quiz |

**About the job queue:** you'll build your own on Postgres (as you did with the migration runner) because the core is small, and reading it removes all the mystery. Libraries like **pg-boss** (Postgres) and **BullMQ** (Redis) implement the same ideas with more features. After this module, their docs will read like a description of code you've already written.

## What you'll be able to do by the end
- Decide what belongs in a request and what belongs in a background job.
- Explain how a database-backed job queue claims, locks, retries, and gives up on jobs.
- Write job handlers that are safe to run more than once.
- Design long-running operations with `202 Accepted` and a status resource.
- Make POST endpoints safe to retry with idempotency keys.
- Use HTTP caching (ETags, `Cache-Control`) to skip work and bandwidth.
- Use Redis cache-aside, invalidate correctly, and keep working when Redis is down.
- Explain eventual consistency with a real example from your own app.

---

# Part 1 — 📖 Concepts

## 1.1 The request budget

While a request runs, a person is waiting. Move work **out of the request** when it's:

| Signal | Example in fittrack |
|---|---|
| **Slow** | Parsing three years of step history from a CSV |
| **Flaky** | Calling a third-party API (a wearable's sync service) that sometimes times out |
| **Deferrable** | Building a weekly summary nobody will look at until Sunday |
| **Bursty** | Everyone exports their data on January 1st |

The request records *what should happen* and returns right away. A separate process does the work.

## 1.2 Queues and workers

```
            API process                            Postgres                         Worker process
┌───────────────────────────────┐        ┌──────────────────────┐        ┌───────────────────────────────┐
│ POST /v1/exports              │        │ exports  (status)    │        │ loop:                         │
│  BEGIN                        │──────▶ │ jobs     (queued)    │ ◀───── │   claim the next ready job    │
│    INSERT exports             │        │                      │        │   run its handler             │
│    INSERT jobs                │        │                      │ ─────▶ │   mark completed / retry /    │
│  COMMIT                       │        │                      │        │   failed                      │
│ → 202 Accepted + Location     │        └──────────────────────┘        └───────────────────────────────┘
└───────────────────────────────┘
        GET /v1/exports/:id  ← the client polls this until status = "completed"
```

- **The worker is a separate process:** same codebase, same config, a different entry point (`src/worker.ts`). If a job crashes the worker, the API keeps serving. You can also run more workers when there's more work.
- **The queue is just a table.** A job is a row with a queue name, a JSON payload, a status, and some bookkeeping columns.

## 1.3 At-least-once delivery

Picture the worst moment for a crash:

```
worker: claim job → run handler → ✅ export written → 💥 CRASH, before marking the job completed
```

The job still looks unfinished, so after its lock expires, another worker runs it **again**. Every serious queue works this way (**at-least-once delivery**), because the alternative ("at most once") loses work when something crashes.

So **every handler must be idempotent**: running it twice must give the same result as running it once.

| Handler | Idempotent? | Why |
|---|---|---|
| "Build the CSV and store it on the export row" | ✅ | The second run overwrites with the same content (or sees `completed` and skips) |
| "Upsert these step days" | ✅ | An upsert sets values; doing it twice sets the same values |
| "Insert 30 workouts" | ❌ | A second run creates 30 duplicates |
| "Send a welcome email" | ❌ | The user gets two emails, unless you record "sent" and check it first |

## 1.4 How a Postgres job queue works

**Claiming a job** is the clever part. Two workers must never grab the same job, and a crashed worker's job must eventually be picked up again. Postgres does both in **one statement**:

```sql
UPDATE jobs SET status = 'running', attempts = attempts + 1, locked_until = now() + '5 minutes'
WHERE id = (
  SELECT id FROM jobs
  WHERE queue = 'steps-export'
    AND ((status = 'queued' AND run_at <= now())            -- ready and due
         OR (status = 'running' AND locked_until < now()))  -- a crashed worker's job
  ORDER BY run_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED                                     -- ← the key
)
RETURNING …;
```

- **`FOR UPDATE`** locks the chosen row until this transaction ends.
- **`SKIP LOCKED`** means "if another worker has already locked a row, pretend it isn't there." Two workers running this query at the same instant get **two different jobs**, with no waiting and no errors.

```
Worker A: SELECT … FOR UPDATE SKIP LOCKED → locks job 1
Worker B: SELECT … FOR UPDATE SKIP LOCKED → job 1 is locked, SKIP it → locks job 2
```

- **`locked_until`** is a lease. If the worker dies, nobody renews it, and once it's in the past, any worker can reclaim the job. That's what makes delivery *at least* once.
- **`attempts`** goes up on every claim. Once it reaches `max_attempts`, the job is marked **failed** for good. (That's the "dead-letter" state: parked for a human to look at, instead of retrying forever.)

**Retries use exponential backoff with jitter:**

```
attempt 1 fails → wait random(0, 2s)      ← "jitter": a random part of the maximum delay
attempt 2 fails → wait random(0, 4s)
attempt 3 fails → wait random(0, 8s)      ← "exponential": the maximum doubles each time
…capped at 5 minutes
```

Without jitter, a thousand jobs that failed together (say, while the database restarted) would all retry at the exact same instant and knock it over again: a **thundering herd**.

## 1.5 Why enqueue in the same transaction

Creating an export means two writes: the export row, and its job. If they're separate:

```
INSERT exports … ✅
💥 crash
INSERT jobs … ✗ never happens → an export stuck at "queued" forever
```

Or, with the order reversed, a job for an export that was never saved. This is the **dual-write problem**, and it's a classic source of "stuck" data. **Because your queue lives in Postgres, both writes go in one transaction**: either both exist or neither does. That's a real advantage of Postgres-backed queues over a separate queue system, which can't join your transaction.

## 1.6 Long-running operations: `202 Accepted`

```
POST /v1/exports {"from":"2026-01-01","to":"2026-10-31"}
→ 202 Accepted
  Location: /v1/exports/57ec…
  {"id":"57ec…","status":"queued", …}

GET /v1/exports/57ec…   → {"status":"running", …}
GET /v1/exports/57ec…   → {"status":"completed","rowCount":304,"downloadUrl":"/v1/exports/57ec…/download"}
GET /v1/exports/57ec…/download → 200 text/csv
```

- **202** means "accepted, not finished yet." It's honest: 201 would claim the thing already exists in its final form.
- The response tells the client **where to check** (`Location`), and the status resource tells it **what happened**, including errors.

## 1.7 Idempotency keys

Module 01's problem, finally solved: your phone sends `POST /v1/workouts`, the server commits, the response is lost on a bad connection, and the phone retries → **two identical workouts**.

The fix: the client generates a unique **`Idempotency-Key`** (a UUID) for each *logical* action, and sends the **same key** on every retry of that action.

```
1st try:  POST /v1/workouts   Idempotency-Key: 9c1e…   body {…}
          server: key unseen → record (user, key, hash of body, status "in_progress")
                  → create the workout → store the response (201, body) with the key
          ✗ response lost

retry:    POST /v1/workouts   Idempotency-Key: 9c1e…   same body
          server: key seen, completed, same body hash → return the STORED 201 response
                  → nothing new is created ✅
```

| Situation | Response |
|---|---|
| New key | Process normally, store the response |
| Same key, same body, already completed | **Replay** the stored response |
| Same key, **different** body | **422**: the client reused a key for a different action |
| Same key, still in progress (a concurrent duplicate) | **409**: try again shortly |
| Key older than 24 hours | Treat as new (keys expire) |

Payment APIs (like Stripe's) work exactly this way.

## 1.8 HTTP caching

| `Cache-Control` | Meaning |
|---|---|
| `private` | Only the user's own browser may store it, not shared caches (CDNs, proxies). **Required for per-user data.** |
| `no-cache` | May be stored, but must be **revalidated** with the server before each use |
| `no-store` | Don't store at all (for very sensitive data) |
| `max-age=60` | May be used without asking for 60 seconds |

**ETags and conditional requests:**

```
1. GET /v1/steps?from=…&to=…
   ← 200   ETag: "5-1792267062420"   (+ the body)        the browser stores both

2. GET /v1/steps?from=…&to=…   If-None-Match: "5-1792267062420"
   server: computes the current ETag → same → 304 Not Modified (no body)
   ← 304                                                   the browser reuses its stored copy
```

- **Express already does a version of this.** `res.json()` adds a weak ETag (a hash of the body) and answers 304 when it matches. But to compute that hash, Express has already run your query and built the whole response. It saves bandwidth, not work.
- **To save server work, compute a cheap "version" first.** For a date range of steps: `count(*)` and `max(updated_at)`. Any add, delete, or change alters one of them. Set that as the ETag, check `req.fresh`, and **only run the real query if the client's copy is stale**.

## 1.9 Application caching with Redis: cache-aside

**Redis** is an in-memory key-value store: a very fast shared `Map` that all your processes can reach over the network. Values can expire automatically (a TTL).

**Cache-aside** (also called "lazy loading"):

```
READ:   key in Redis? ──yes──▶ return it                          (a hit: ~0.2 ms)
                 └──no──▶ query Postgres → store it in Redis with a TTL → return it     (a miss)

WRITE:  write to Postgres → then INVALIDATE the cached entries that are now wrong
```

**Invalidation is the hard part.** Changing Oct 3's steps affects every cached *range* that includes Oct 3: Oct 1–31, Sep 15–Oct 15, and so on. Finding and deleting all of them is messy. A cleaner trick is **versioned keys**:

```
steps:version:<userId>                         → "7"
steps:range:<userId>:v7:2026-10-01:2026-10-31  → cached JSON

A write does INCR steps:version:<userId>  → "8"
Readers now build keys with v8 → miss → fresh data. The v7 entries are never read again
and disappear when their TTL runs out.
```

One cheap command invalidates everything for that user. It also avoids the classic **stale-write race**:

```
Reader: miss → reads OLD rows from Postgres ……………………………… → writes them to the cache key
Writer:            updates Postgres → invalidates ↑ (between the reader's read and its write)
```

With plain keys, the reader's late write would put stale data back into the cache. With versioned keys, the reader writes to the *old* version's key, which nobody reads anymore.

**Rules you'll follow:**
- **Always set a TTL.** It's the safety net for every invalidation bug you haven't found yet.
- **Redis being down must not break the API.** A cache is an optimization: on any cache error, log a warning and go to the database. (A Redis outage should make you *slower*, never *broken*.)
- **Measure before caching.** A 2 ms indexed query doesn't need a cache. Caching adds a second copy of the truth, and every copy can be wrong.
- **Stampedes:** when a hot key expires, many requests miss at once and all hit the database. Usually fine at this app's scale. At large scale, use request coalescing or locks.

## 1.10 Eventual consistency

A **summary table** filled in by a job (say, `weekly_summaries`, rebuilt every night) is fast to read, but it **lags behind** the real data until the job runs. The data is *eventually* consistent: correct after a delay, not immediately.

That's fine for some screens ("last week's summary") and wrong for others ("did my set just save?"). The design question is always **"how stale is allowed here?"**. Write the answer down.

## 1.11 Scheduled jobs and timezones

"Build the weekly summary every Sunday at 9pm." **Whose** Sunday? Your users live in different timezones. Two common designs:
- Run a job **every hour**, and process the users for whom it's *now* Sunday 9pm locally.
- Don't schedule it at all: compute it **lazily** on the first request, and cache it.

With your queue, "later" is just a job with a future `run_at`.

## 1.12 Shared state across instances

Module 07's in-memory rate limiter keeps its counters inside one process. With two API instances behind a load balancer, an attacker gets twice the attempts, and a restart resets the counts. **Redis gives every instance one shared counter.** Same interface, different storage: that's why the interface was async from the start.

✅ **Before moving on:** explain 1.3, 1.4, 1.5, 1.7, and 1.9 out loud.

---

# Part 2 — ⌨️ Setup

## 2.1 Redis in Docker Compose

Add a second service to `docker-compose.yml`:

```yaml
  redis:
    image: redis:8
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10
```

```bash
docker compose up -d
docker compose exec redis redis-cli ping      # PONG
```

**`redis-cli` cheat sheet:** `SET k v EX 60` (set with a 60s TTL) · `GET k` · `TTL k` (seconds left) · `INCR k` · `DEL k` · `KEYS 'steps:*'` (fine locally; never in production, because it scans everything) · `FLUSHALL` (wipe everything, locally only).

## 2.2 Install and configure

```bash
npm install ioredis
```

Add to `ConfigSchema` and `.env` / `.env.example`:

```ts
REDIS_URL: z.string().startsWith("redis", { message: "must be a redis:// connection string" }),
```

```dotenv
REDIS_URL=redis://localhost:6379
```

**Tests:** add `REDIS_URL: "redis://localhost:6379"` to `testEnv` in `vitest.config.ts`. Integration test files will also need `afterAll(async () => { await redis.quit(); })`, next to `pool.end()`.

## 2.3 Scripts

```json
"dev:worker": "tsx watch --env-file-if-exists=.env src/worker.ts",
"start:worker": "node --env-file-if-exists=.env dist/worker.js"
```

From now on, local development means **two terminals**: `npm run dev` (the API) and `npm run dev:worker` (the worker).

---

# Part 3 — ⌨️ Worked example A: the job queue

The data flows through these files in order: **the `jobs` table** → **`queue.ts`** (add, claim, complete, fail) → **`backoff.ts`** (when to retry) → **`run-worker.ts`** (the loop) → **`worker.ts`** (the process).

## 3.1 `migrations/NNN_jobs.sql`

```sql
-- A small, reliable job queue that lives in Postgres.
CREATE TABLE jobs (
  id            uuid        PRIMARY KEY DEFAULT uuidv7(),
  queue         text        NOT NULL,                     -- which kind of job, e.g. 'steps-export'
  payload       jsonb       NOT NULL,                     -- the job's input, e.g. {"exportId": "…"}
  status        text        NOT NULL DEFAULT 'queued',
  attempts      integer     NOT NULL DEFAULT 0,           -- how many times a worker has picked it up
  max_attempts  integer     NOT NULL DEFAULT 5,
  run_at        timestamptz NOT NULL DEFAULT now(),       -- don't start before this (used for retries)
  locked_until  timestamptz,                              -- a worker owns it until then
  last_error    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT jobs_status_valid CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  CONSTRAINT jobs_attempts_valid CHECK (attempts >= 0 AND max_attempts >= 1)
);

-- Workers constantly ask "what's ready in my queue?". A partial index keeps that fast
-- and small: finished jobs (the vast majority, over time) aren't in it at all.
CREATE INDEX jobs_ready_idx ON jobs (queue, run_at) WHERE status IN ('queued', 'running');
```

- **`payload jsonb`** stores the job's input as JSON, e.g. `{"exportId": "57ec…"}`. Keep payloads small: IDs, not whole objects. The handler loads fresh data when it runs.
- **`run_at`** is when the job may start. New jobs use `now()`; retries and scheduled jobs use the future.
- **A partial index** (`WHERE status IN (…)`) only contains unfinished jobs. Completed jobs pile up over time, and the index stays small anyway.

## 3.2 `src/jobs/queue.ts`

```ts
import type { Queryable } from "../db/queryable.js";

/** A job a worker has claimed and must now run. */
export interface ClaimedJob {
  id: string;
  queue: string;
  payload: unknown; // validate it with a schema before using it: it's data from the past
  attempts: number; // including this one
  maxAttempts: number;
}

export interface JobQueue {
  /** Adds a job. Pass a transaction's client as `db` to enqueue atomically with other writes. */
  enqueue(
    queue: string,
    payload: Record<string, unknown>,
    options?: { runAt?: Date; maxAttempts?: number },
  ): Promise<string>;

  /** Claims the next ready job in `queue` for `lockSeconds`, or returns null if there is none. */
  claimNext(queue: string, lockSeconds: number): Promise<ClaimedJob | null>;

  complete(jobId: string): Promise<void>;

  /** Records a failure. With a `retryAt`, the job is retried then; with null, it's failed for good. */
  fail(jobId: string, errorMessage: string, retryAt: Date | null): Promise<void>;
}

export function createPgJobQueue(db: Queryable): JobQueue {
  return {
    async enqueue(queue, payload, options = {}) {
      const result = await db.query<{ id: string }>(
        `INSERT INTO jobs (queue, payload, run_at, max_attempts)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [queue, JSON.stringify(payload), options.runAt ?? new Date(), options.maxAttempts ?? 5],
      );
      const row = result.rows[0];
      if (!row) throw new Error("insert into jobs returned no row");
      return row.id;
    },

    async claimNext(queue, lockSeconds) {
      // One statement does three things atomically:
      //  1. find the oldest ready job: queued and due, OR running but its lock expired (a crashed worker)
      //  2. lock that row, SKIPPING rows other workers have already locked (so workers never collide)
      //  3. mark it running, count the attempt, and set a new lock expiry
      const result = await db.query<{
        id: string;
        queue: string;
        payload: unknown;
        attempts: number;
        max_attempts: number;
      }>(
        `UPDATE jobs
         SET status = 'running',
             attempts = attempts + 1,
             locked_until = now() + make_interval(secs => $2),
             updated_at = now()
         WHERE id = (
           SELECT id FROM jobs
           WHERE queue = $1
             AND (
               (status = 'queued' AND run_at <= now())
               OR (status = 'running' AND locked_until < now())
             )
           ORDER BY run_at
           LIMIT 1
           FOR UPDATE SKIP LOCKED
         )
         RETURNING id, queue, payload, attempts, max_attempts`,
        [queue, lockSeconds],
      );
      const row = result.rows[0];
      if (!row) return null;
      return {
        id: row.id,
        queue: row.queue,
        payload: row.payload,
        attempts: row.attempts,
        maxAttempts: row.max_attempts,
      };
    },

    async complete(jobId) {
      await db.query(
        `UPDATE jobs SET status = 'completed', locked_until = NULL, updated_at = now() WHERE id = $1`,
        [jobId],
      );
    },

    async fail(jobId, errorMessage, retryAt) {
      if (retryAt) {
        await db.query(
          `UPDATE jobs
           SET status = 'queued', run_at = $2, locked_until = NULL, last_error = $3, updated_at = now()
           WHERE id = $1`,
          [jobId, retryAt, errorMessage],
        );
      } else {
        await db.query(
          `UPDATE jobs
           SET status = 'failed', locked_until = NULL, last_error = $2, updated_at = now()
           WHERE id = $1`,
          [jobId, errorMessage],
        );
      }
    },
  };
}
```

- **`createPgJobQueue(db: Queryable)`**: like your repositories, it accepts a pool *or* a transaction client. Passing a transaction's client is what lets Part 4 enqueue atomically with other writes (1.5).
- **The claim query** is 1.4, line for line. `make_interval(secs => $2)` turns a number of seconds into a Postgres `interval`.
- **`ORDER BY run_at`**: oldest-due first, so jobs are roughly first-in, first-out.
- **`payload: unknown`** in `ClaimedJob`: the queue doesn't know what's inside, so handlers must validate it (Part 4).

## 3.3 `src/jobs/backoff.ts`

```ts
/**
 * How long to wait before retry number `attempt` (1, 2, 3…), using exponential backoff with
 * "full jitter": a random delay between 0 and min(cap, base × 2^(attempt-1)).
 * The randomness spreads retries out, so a thousand failed jobs don't all retry at the same instant.
 */
export function computeRetryDelayMs(
  attempt: number,
  options: { baseMs?: number; capMs?: number; random?: () => number } = {},
): number {
  const baseMs = options.baseMs ?? 2_000;
  const capMs = options.capMs ?? 5 * 60_000;
  const random = options.random ?? Math.random;

  const exponential = baseMs * 2 ** (attempt - 1); // 2s, 4s, 8s, 16s, …
  const ceiling = Math.min(capMs, exponential);
  return Math.round(random() * ceiling);
}
```

The `random` option exists for tests: pass `() => 1` and the result is the deterministic maximum (2000, 4000, 8000…).

## 3.4 `src/jobs/run-worker.ts`

```ts
import { setTimeout as sleep } from "node:timers/promises";
import type { Logger } from "pino";
import type { Clock } from "../shared/clock.js";
import { computeRetryDelayMs } from "./backoff.js";
import type { ClaimedJob, JobQueue } from "./queue.js";

export interface JobHandler {
  /** Does the work. Throwing means "failed: retry later (or give up)". Must be safe to run twice. */
  run(job: ClaimedJob, log: Logger): Promise<void>;
  /** Optional: called once when the job has failed for the last time. */
  onGiveUp?(job: ClaimedJob, errorMessage: string, log: Logger): Promise<void>;
}

export interface WorkerOptions {
  queue: JobQueue;
  handlers: Record<string, JobHandler>; // queue name → handler
  clock: Clock;
  log: Logger;
  pollIntervalMs?: number; // how long to sleep when there's nothing to do
  lockSeconds?: number; // how long a claimed job stays ours before others may take it
}

export interface RunningWorker {
  /** Finishes the current job (if any), then stops. */
  stop(): Promise<void>;
}

export function startWorker(options: WorkerOptions): RunningWorker {
  const pollIntervalMs = options.pollIntervalMs ?? 1_000;
  const lockSeconds = options.lockSeconds ?? 300;
  const queueNames = Object.keys(options.handlers);
  let running = true;

  async function processOne(job: ClaimedJob): Promise<void> {
    const handler = options.handlers[job.queue];
    const log = options.log.child({ jobId: job.id, queue: job.queue, attempt: job.attempts });
    if (!handler) {
      await options.queue.fail(job.id, `no handler for queue ${job.queue}`, null);
      return;
    }

    try {
      await handler.run(job, log);
      await options.queue.complete(job.id);
      log.info("job completed");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (job.attempts >= job.maxAttempts) {
        await options.queue.fail(job.id, message, null);
        log.error({ err: error }, "job failed permanently");
        if (handler.onGiveUp) await handler.onGiveUp(job, message, log);
      } else {
        const delayMs = computeRetryDelayMs(job.attempts);
        const retryAt = new Date(options.clock.now().getTime() + delayMs);
        await options.queue.fail(job.id, message, retryAt);
        log.warn({ err: error, retryInMs: delayMs }, "job failed; will retry");
      }
    }
  }

  async function loop(): Promise<void> {
    while (running) {
      let didWork = false;
      for (const queueName of queueNames) {
        if (!running) break;
        try {
          const job = await options.queue.claimNext(queueName, lockSeconds);
          if (job) {
            didWork = true;
            await processOne(job);
          }
        } catch (error) {
          // The queue itself failed (e.g., the database is down). Log it and keep the loop alive.
          options.log.error({ err: error, queue: queueName }, "worker loop error");
        }
      }
      if (!didWork && running) {
        await sleep(pollIntervalMs);
      }
    }
  }

  const loopDone = loop();
  options.log.info({ queues: queueNames }, "worker started");

  return {
    async stop() {
      running = false;
      await loopDone;
      options.log.info("worker stopped");
    },
  };
}
```

**Reading it piece by piece:**
- **`JobHandler`** is the contract every kind of job implements: `run` (required) and `onGiveUp` (optional, e.g. to mark an export as failed so the user sees it).
- **The loop:** for each queue, try to claim one job; if there was nothing to do anywhere, sleep for `pollIntervalMs`. Polling once a second is simple and cheap for this app. (Postgres's `LISTEN/NOTIFY` can wake workers instantly, as an upgrade.)
- **Success** → `complete`. **Failure** → retry later (with backoff) or, after the last attempt, `fail` for good and call `onGiveUp`.
- **The outer `try/catch` in `loop`** keeps the worker alive if the *queue itself* fails (say, the database restarts). Without it, one database blip would kill the worker process.
- **`stop()`** sets `running = false` and **waits for the current job to finish**. The worker never abandons a job halfway when it's told to stop. (Module 09 hooks this into deploys.)
- **`import { setTimeout as sleep } from "node:timers/promises"`** is the promise version of `setTimeout`: `await sleep(1000)` pauses this function for a second *without blocking the event loop* (Module 01's `/wait`, not `/block`).

## 3.5 `src/worker.ts`

```ts
import { pool } from "./db/pool.js";
import { createPgJobQueue } from "./jobs/queue.js";
import { startWorker } from "./jobs/run-worker.js";
import { logger } from "./logger.js";
import { STEPS_EXPORT_QUEUE } from "./modules/exports/exports.service.js";
import { createPgExportsRepository } from "./modules/exports/exports.pg-repo.js";
import { createStepsExportHandler } from "./modules/exports/steps-export.job.js";
import { createPgStepsRepository } from "./modules/steps/steps.pg-repo.js";
import { systemClock } from "./shared/clock.js";

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "unhandled promise rejection; exiting");
  process.exit(1);
});

// The worker is a separate PROCESS: same codebase, same config, different entry point.
const worker = startWorker({
  queue: createPgJobQueue(pool),
  clock: systemClock,
  log: logger.child({ process: "worker" }),
  handlers: {
    [STEPS_EXPORT_QUEUE]: createStepsExportHandler({
      exportsRepo: createPgExportsRepository(pool),
      stepsRepo: createPgStepsRepository(pool), // the worker reads straight from the database
      clock: systemClock,
    }),
    // Challenge 1 adds the import handler here
  },
});

// A basic clean stop on Ctrl+C or a platform stop signal (Module 09 hardens this).
async function shutDown(signal: string): Promise<void> {
  logger.info({ signal }, "worker shutting down");
  await worker.stop(); // finish the current job first
  await pool.end();
  process.exit(0);
}
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    shutDown(signal).catch((error: unknown) => {
      logger.error({ err: error }, "worker shutdown failed");
      process.exit(1);
    });
  });
}
```

- **The handler registry** maps queue names to handlers. Part 4 adds the first one; your import handler is the second.
- **The worker builds its own dependencies**, just like `server.ts` does. It reads steps straight from Postgres (no cache): it's a background process, and it should see the truth.
- **`process.once(signal, …)`**: Ctrl+C sends `SIGINT`; platforms send `SIGTERM` before stopping a process. `.catch(…)` handles a failed shutdown explicitly instead of leaving a floating promise.

---

# Part 4 — ⌨️ Worked example B: steps export

## 4.1 `migrations/NNN_exports.sql`

```sql
-- One row per "export my steps as CSV" request. The worker fills in the result.
CREATE TABLE exports (
  id            uuid        PRIMARY KEY DEFAULT uuidv7(),
  user_id       uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status        text        NOT NULL DEFAULT 'queued',
  from_day      date        NOT NULL,
  to_day        date        NOT NULL,
  row_count     integer,
  csv_text      text,                       -- small files only; real apps would use object storage (S3)
  error         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz,

  CONSTRAINT exports_status_valid CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  CONSTRAINT exports_range_valid CHECK (from_day <= to_day)
);

CREATE INDEX exports_user_created_idx ON exports (user_id, created_at DESC);
```

## 4.2 Types and repository

**`src/modules/exports/exports.types.ts`:**

```ts
export type ExportStatus = "queued" | "running" | "completed" | "failed";

/** An export as the API shows it. The CSV itself is downloaded separately. */
export interface StepsExport {
  id: string;
  status: ExportStatus;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  rowCount: number | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}
```

**`src/modules/exports/exports.repository.ts`:**

```ts
import type { StepsExport } from "./exports.types.js";

export interface ExportsRepository {
  create(userId: string, from: string, to: string): Promise<StepsExport>;
  /** Scoped to the user: another user's export is "not found". */
  findById(userId: string, id: string): Promise<StepsExport | null>;
  /** For the worker, which acts on behalf of whoever requested the export. */
  findByIdForWorker(id: string): Promise<(StepsExport & { userId: string }) | null>;
  findCsv(userId: string, id: string): Promise<string | null>;
  markRunning(id: string): Promise<void>;
  markCompleted(id: string, csvText: string, rowCount: number, completedAt: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}
```

**`src/modules/exports/exports.pg-repo.ts`:**

```ts
import type { Queryable } from "../../db/queryable.js";
import type { ExportsRepository } from "./exports.repository.js";
import type { ExportStatus, StepsExport } from "./exports.types.js";

interface ExportRow {
  id: string;
  user_id: string;
  status: ExportStatus;
  from_day: string;
  to_day: string;
  row_count: number | null;
  error: string | null;
  created_at: Date;
  completed_at: Date | null;
}

const EXPORT_COLUMNS = "id, user_id, status, from_day, to_day, row_count, error, created_at, completed_at";

function toStepsExport(row: ExportRow): StepsExport {
  return {
    id: row.id,
    status: row.status,
    from: row.from_day,
    to: row.to_day,
    rowCount: row.row_count,
    error: row.error,
    createdAt: row.created_at.toISOString(),
    completedAt: row.completed_at ? row.completed_at.toISOString() : null,
  };
}

export function createPgExportsRepository(db: Queryable): ExportsRepository {
  return {
    async create(userId, from, to) {
      const result = await db.query<ExportRow>(
        `INSERT INTO exports (user_id, from_day, to_day) VALUES ($1, $2, $3) RETURNING ${EXPORT_COLUMNS}`,
        [userId, from, to],
      );
      const row = result.rows[0];
      if (!row) throw new Error("insert into exports returned no row");
      return toStepsExport(row);
    },

    async findById(userId, id) {
      const result = await db.query<ExportRow>(
        `SELECT ${EXPORT_COLUMNS} FROM exports WHERE id = $1 AND user_id = $2`,
        [id, userId],
      );
      const row = result.rows[0];
      return row ? toStepsExport(row) : null;
    },

    async findByIdForWorker(id) {
      const result = await db.query<ExportRow>(`SELECT ${EXPORT_COLUMNS} FROM exports WHERE id = $1`, [id]);
      const row = result.rows[0];
      return row ? { ...toStepsExport(row), userId: row.user_id } : null;
    },

    async findCsv(userId, id) {
      const result = await db.query<{ csv_text: string | null }>(
        `SELECT csv_text FROM exports WHERE id = $1 AND user_id = $2 AND status = 'completed'`,
        [id, userId],
      );
      return result.rows[0]?.csv_text ?? null;
    },

    async markRunning(id) {
      await db.query(`UPDATE exports SET status = 'running' WHERE id = $1 AND status <> 'completed'`, [id]);
    },

    async markCompleted(id, csvText, rowCount, completedAt) {
      await db.query(
        `UPDATE exports
         SET status = 'completed', csv_text = $2, row_count = $3, completed_at = $4, error = NULL
         WHERE id = $1`,
        [id, csvText, rowCount, completedAt],
      );
    },

    async markFailed(id, error) {
      await db.query(`UPDATE exports SET status = 'failed', error = $2 WHERE id = $1`, [id, error]);
    },
  };
}
```

- **`findByIdForWorker` has no `userId` filter**, because the worker acts on behalf of whoever created the export. That's the *only* method like that, it's named to make that obvious, and no route ever calls it.
- **`csv_text` isn't in `EXPORT_COLUMNS`**: status checks never load a potentially large file. Only `findCsv` does.

## 4.3 `src/modules/exports/exports.service.ts`

```ts
import type { Clock } from "../../shared/clock.js";
import { addDays } from "../../shared/dates.js";
import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors.js";
import type { JobQueue } from "../../jobs/queue.js";
import type { ExportsRepository } from "./exports.repository.js";
import type { StepsExport } from "./exports.types.js";

export const STEPS_EXPORT_QUEUE = "steps-export";
const MAX_EXPORT_DAYS = 3660; // about 10 years

/** Runs `work` atomically with transaction-bound repositories (Module 05's unit of work). */
export type RunExportTransaction = <T>(
  work: (repos: { exports: ExportsRepository; queue: JobQueue }) => Promise<T>,
) => Promise<T>;

export interface ExportsService {
  requestExport(userId: string, from: string, to: string): Promise<StepsExport>;
  getExport(userId: string, id: string): Promise<StepsExport>;
  getCsv(userId: string, id: string): Promise<string>;
}

export function createExportsService(deps: {
  exportsRepo: ExportsRepository;
  runInTransaction: RunExportTransaction;
  clock: Clock;
}): ExportsService {
  const { exportsRepo, runInTransaction } = deps;

  return {
    async requestExport(userId, from, to) {
      if (from > to) {
        throw new ValidationError("from must be on or before to", [{ path: "from", message: "must be on or before to" }]);
      }
      if (addDays(from, MAX_EXPORT_DAYS) < to) {
        throw new ValidationError(`an export can cover at most ${MAX_EXPORT_DAYS} days`);
      }

      // The export row and its job are created in ONE transaction: either both exist or neither does.
      // (With a separate queue service, a crash between the two writes could leave an export that never runs.)
      return runInTransaction(async (repos) => {
        const created = await repos.exports.create(userId, from, to);
        await repos.queue.enqueue(STEPS_EXPORT_QUEUE, { exportId: created.id });
        return created;
      });
    },

    async getExport(userId, id) {
      const found = await exportsRepo.findById(userId, id);
      if (!found) throw new NotFoundError("Export");
      return found;
    },

    async getCsv(userId, id) {
      const found = await exportsRepo.findById(userId, id);
      if (!found) throw new NotFoundError("Export");
      if (found.status !== "completed") {
        throw new ConflictError(`The export is ${found.status}; try again when it's completed`);
      }
      const csv = await exportsRepo.findCsv(userId, id);
      if (csv === null) throw new NotFoundError("Export file");
      return csv;
    },
  };
}
```

The transaction is Module 05's unit-of-work pattern again: the service depends on the *type* `RunExportTransaction`, never on `pg`.

## 4.4 `src/modules/exports/steps-export.job.ts`

```ts
import { z } from "zod";
import type { JobHandler } from "../../jobs/run-worker.js";
import type { Clock } from "../../shared/clock.js";
import type { StepsRepository } from "../steps/steps.repository.js";
import type { ExportsRepository } from "./exports.repository.js";

// A job's payload was written in the past, possibly by an older version of the code: validate it.
const Payload = z.object({ exportId: z.uuid() });

export function createStepsExportHandler(deps: {
  exportsRepo: ExportsRepository;
  stepsRepo: StepsRepository;
  clock: Clock;
}): JobHandler {
  return {
    async run(job, log) {
      const { exportId } = Payload.parse(job.payload);

      const requested = await deps.exportsRepo.findByIdForWorker(exportId);
      if (!requested) {
        log.warn({ exportId }, "export no longer exists; nothing to do");
        return; // e.g. the user deleted their account. Not an error: don't retry.
      }
      if (requested.status === "completed") {
        log.info({ exportId }, "export already completed; skipping");
        return; // IDEMPOTENT: a second run (after a crash, or a duplicate job) changes nothing
      }

      await deps.exportsRepo.markRunning(exportId);

      const days = await deps.stepsRepo.listRange(requested.userId, requested.from, requested.to);
      const lines = ["date,steps"];
      for (const day of days) {
        lines.push(`${day.date},${day.steps}`);
      }
      const csvText = lines.join("\n") + "\n";

      await deps.exportsRepo.markCompleted(exportId, csvText, days.length, deps.clock.now().toISOString());
      log.info({ exportId, rows: days.length }, "export completed");
    },

    async onGiveUp(job, errorMessage) {
      const parsed = Payload.safeParse(job.payload);
      if (parsed.success) {
        await deps.exportsRepo.markFailed(parsed.data.exportId, errorMessage);
      }
    },
  };
}
```

**Why this handler is safe to run twice:**
1. If the export is already `completed`, it returns immediately.
2. Otherwise it rebuilds the **whole** CSV from the current data and **overwrites** the result. Running it twice produces the same file.
3. If the export row is gone (the user deleted their account, so the cascade removed it), it returns *without throwing*. Throwing would cause pointless retries for a job that can never succeed.

**Why validate the payload?** Jobs are data from the past. A job enqueued last week by an older version of your code might not have the shape today's code expects. Treat it like any other untrusted input.

## 4.5 `src/modules/exports/exports.routes.ts`

```ts
import express, { type Router } from "express";
import { z } from "zod";
import { getUserId } from "../../shared/current-user.js";
import { CalendarDate } from "../steps/steps.schemas.js";
import type { ExportsService } from "./exports.service.js";

const CreateExportBody = z.strictObject({ from: CalendarDate, to: CalendarDate });
const ExportIdParams = z.object({ id: z.uuid() });

export function createExportsRouter(service: ExportsService): Router {
  const router = express.Router();

  // POST /v1/exports { from, to } → 202 Accepted: "we'll do it; check back here"
  router.post("/", async (req, res) => {
    const body = CreateExportBody.parse(req.body);
    const created = await service.requestExport(getUserId(res), body.from, body.to);
    res.status(202).location(`${req.baseUrl}/${created.id}`).json(created);
  });

  // GET /v1/exports/:id → the status, plus a download link once it's ready
  router.get("/:id", async (req, res) => {
    const params = ExportIdParams.parse(req.params);
    const found = await service.getExport(getUserId(res), params.id);
    const body: Record<string, unknown> = { ...found };
    if (found.status === "completed") {
      body.downloadUrl = `${req.baseUrl}/${found.id}/download`;
    }
    res.json(body);
  });

  // GET /v1/exports/:id/download → the CSV file
  router.get("/:id/download", async (req, res) => {
    const params = ExportIdParams.parse(req.params);
    const csv = await service.getCsv(getUserId(res), params.id);
    res
      .type("text/csv")
      .set("Content-Disposition", `attachment; filename="fittrack-steps-${params.id}.csv"`)
      .send(csv);
  });

  return router;
}
```

- **`.type("text/csv")`** sets `Content-Type`, and **`Content-Disposition: attachment; filename="…"`** tells a browser to download the file instead of displaying it.
- **`CalendarDate` is reused** from the steps schemas (or from `src/shared/schemas.ts` if you moved it in Module 03).

## 4.6 Wiring

**`src/composition.ts`:**

```ts
import { withTransaction } from "./db/transaction.js";
import { createPgJobQueue } from "./jobs/queue.js";
import { createPgExportsRepository } from "./modules/exports/exports.pg-repo.js";
import { createExportsService, type RunExportTransaction } from "./modules/exports/exports.service.js";
// ...
  const exportsRepo = createPgExportsRepository(pool);

  // Exports need the export row and its job written in one transaction
  const runExportTransaction: RunExportTransaction = (work) =>
    withTransaction(pool, (client) =>
      work({ exports: createPgExportsRepository(client), queue: createPgJobQueue(client) }),
    );

  const exportsService = createExportsService({ exportsRepo, runInTransaction: runExportTransaction, clock });
  // ...add exportsService to the returned object
```

**`src/app.ts`:** add `exportsService: ExportsService` to `AppDeps`, and mount the router behind auth:

```ts
app.use("/v1/exports", requireAuth, createExportsRouter(deps.exportsService));
```

✅ **Try it** (with steps data for October, and logged in with `-c/-b jar.txt` as in Module 07)

```bash
# Terminal 1: npm run dev          (Terminal 2: the worker is NOT running yet)
curl -i -b jar.txt -X POST localhost:3000/v1/exports -H 'Content-Type: application/json' \
  -d '{"from":"2026-10-01","to":"2026-10-31"}'
# HTTP/1.1 202 Accepted
# Location: /v1/exports/57ec117c-…
# {"id":"57ec117c-…","status":"queued", …}

curl -b jar.txt localhost:3000/v1/exports/<id>            # status: queued (nobody is working on it)
curl -i -b jar.txt localhost:3000/v1/exports/<id>/download   # 409 "The export is queued…"

# Terminal 2: npm run dev:worker   → logs "worker started", then "export completed" and "job completed"
curl -b jar.txt localhost:3000/v1/exports/<id>            # status: completed, rowCount, downloadUrl
curl -b jar.txt localhost:3000/v1/exports/<id>/download
# date,steps
# 2026-10-01,9000
# …
```

**Notice what just happened:** the API accepted the work while no worker was running at all. The job waited safely in Postgres until a worker appeared. In `psql`: `SELECT queue, status, attempts, last_error FROM jobs ORDER BY created_at DESC LIMIT 5;`

Stop the worker with Ctrl+C: it logs "worker shutting down", then "worker stopped".

```bash
git add -A && git commit -m "feat(jobs): postgres job queue, worker, steps export"
```

---

# Part 5 — ⌨️ Worked example C: ETag on the steps list

## 5.1 A cheap version: repository, service, route

Add to the **`StepsRepository` interface**:

```ts
  /**
   * A short string that changes whenever the result of listRange(userId, from, to) would change.
   * Cheap to compute, so it can back an ETag without loading the rows.
   */
  rangeVersion(userId: string, from: string, to: string): Promise<string>;
```

**Postgres version** (in `steps.pg-repo.ts`):

```ts
    async rangeVersion(userId, from, to) {
      // Adding or deleting a day changes the count; changing a day moves max(updated_at).
      const result = await db.query<{ day_count: number; last_updated: Date | null }>(
        `SELECT count(*) AS day_count, max(updated_at) AS last_updated
         FROM daily_steps
         WHERE user_id = $1 AND day BETWEEN $2 AND $3`,
        [userId, from, to],
      );
      const row = result.rows[0];
      const lastUpdatedMs = row?.last_updated ? row.last_updated.getTime() : 0;
      return `${row?.day_count ?? 0}-${lastUpdatedMs}`;
    },
```

**Memory version** (in `steps.memory-repo.ts`, so unit tests keep working):

```ts
    async rangeVersion(userId, from, to) {
      const prefix = `${userId}|`;
      let dayCount = 0;
      let lastUpdated = "";
      for (const [key, row] of rows.entries()) {
        if (key.startsWith(prefix) && row.date >= from && row.date <= to) {
          dayCount += 1;
          if (row.updatedAt > lastUpdated) lastUpdated = row.updatedAt;
        }
      }
      return `${dayCount}-${lastUpdated}`;
    },
```

(If you converted steps to Kysely in Module 05, TypeScript will now point out that the Kysely repository needs this method too. That's the interface doing its job.)

**Service:** the range rules now apply to two methods, so move them into one helper. Here's the updated `src/modules/steps/steps.service.ts`:

```ts
import type { Clock } from "../../shared/clock.js";
import { addDays, utcDateOf } from "../../shared/dates.js";
import { NotFoundError, ValidationError } from "../../shared/errors.js";
import type { StepsRepository } from "./steps.repository.js";
import type { DailySteps } from "./steps.types.js";

export const MAX_DAILY_STEPS = 100_000;
export const MAX_RANGE_DAYS = 366;

export interface StepsService {
  setDay(userId: string, date: string, steps: number): Promise<{ record: DailySteps; created: boolean }>;
  getDay(userId: string, date: string): Promise<DailySteps>;
  listRange(userId: string, from: string, to: string): Promise<DailySteps[]>;
  /** Changes whenever listRange's result would change (used for ETags). */
  rangeVersion(userId: string, from: string, to: string): Promise<string>;
  deleteDay(userId: string, date: string): Promise<void>;
}

function assertValidRange(from: string, to: string): void {
  if (from > to) {
    throw new ValidationError("from must be on or before to", [
      { path: "from", message: "must be on or before to" },
    ]);
  }
  if (addDays(from, MAX_RANGE_DAYS) < to) {
    throw new ValidationError(`a range can cover at most ${MAX_RANGE_DAYS} days`);
  }
}

export function createStepsService(deps: { repo: StepsRepository; clock: Clock }): StepsService {
  const { repo, clock } = deps;

  return {
    async setDay(userId, date, steps) {
      // Rule 1: a believable whole number of steps.
      if (!Number.isInteger(steps) || steps < 0 || steps > MAX_DAILY_STEPS) {
        throw new ValidationError(`steps must be a whole number from 0 to ${MAX_DAILY_STEPS}`, [
          { path: "steps", message: `must be an integer from 0 to ${MAX_DAILY_STEPS}` },
        ]);
      }

      // Rule 2: no future days. We don't know the user's timezone yet (Module 07 adds it).
      // Local time is at most 14 hours ahead of UTC, so "tomorrow in UTC" is the latest
      // date that could be "today" somewhere on Earth.
      const latestAllowed = addDays(utcDateOf(clock.now()), 1);
      if (date > latestAllowed) {
        throw new ValidationError("date cannot be in the future", [
          { path: "date", message: `must be on or before ${latestAllowed}` },
        ]);
      }

      return repo.upsert(userId, { date, steps, updatedAt: clock.now().toISOString() });
    },

    async getDay(userId, date) {
      const record = await repo.findByDate(userId, date);
      if (!record) throw new NotFoundError(`Steps for ${date}`);
      return record;
    },

    async listRange(userId, from, to) {
      assertValidRange(from, to);
      return repo.listRange(userId, from, to);
    },

    async rangeVersion(userId, from, to) {
      assertValidRange(from, to);
      return repo.rangeVersion(userId, from, to);
    },

    async deleteDay(userId, date) {
      const deleted = await repo.delete(userId, date);
      if (!deleted) throw new NotFoundError(`Steps for ${date}`);
    },
  };
}
```

**Route:** replace the `GET /` handler in `steps.routes.ts`:

```ts
  // GET /v1/steps?from=YYYY-MM-DD&to=YYYY-MM-DD   (supports conditional requests: ETag → 304)
  router.get("/", async (req, res) => {
    const query = ListStepsQuery.parse(req.query);
    const userId = getUserId(res);

    // 1. A cheap question first: "has anything in this range changed?"
    const version = await service.rangeVersion(userId, query.from, query.to);
    res.set("ETag", `"${version}"`);
    // private: per-user data, so shared caches must not store it.
    // no-cache: the client may keep a copy, but must check (revalidate) before using it.
    res.set("Cache-Control", "private, no-cache");

    // 2. req.fresh compares the client's If-None-Match header with the ETag we just set.
    if (req.fresh) {
      res.status(304).end(); // "your copy is still good": no body, and no expensive query
      return;
    }

    // 3. Only now do the real work.
    const days = await service.listRange(userId, query.from, query.to);
    res.json({ data: days });
  });
```

- **ETags are quoted strings** (`"5-1792267062420"`), per the HTTP spec.
- **`req.fresh`** is Express's built-in check: it compares the request's `If-None-Match` against the response's `ETag` header (which is why you set the header first).
- **Because you set an ETag yourself, Express doesn't compute its own** for this response.

✅ **Try it**

```bash
curl -i -b jar.txt 'localhost:3000/v1/steps?from=2026-10-01&to=2026-10-31'
# HTTP/1.1 200 OK
# ETag: "5-1792267062420"
# Cache-Control: private, no-cache

curl -i -b jar.txt -H 'If-None-Match: "5-1792267062420"' 'localhost:3000/v1/steps?from=2026-10-01&to=2026-10-31'
# HTTP/1.1 304 Not Modified        (no body)

curl -s -b jar.txt -X PUT localhost:3000/v1/steps/2026-10-03 -H 'Content-Type: application/json' -d '{"steps":20000}'
curl -i -b jar.txt -H 'If-None-Match: "5-1792267062420"' 'localhost:3000/v1/steps?from=2026-10-01&to=2026-10-31'
# HTTP/1.1 200 OK   ETag: "5-1792267062462"    ← the count is the same, but the timestamp moved
```

Browsers handle all of this automatically: your React app's `fetch` will send `If-None-Match` and reuse its cached copy on a 304, with no extra code.

---

# Part 6 — ⌨️ Worked example D: Redis cache-aside

## 6.1 `src/cache/redis.ts`

```ts
import { Redis } from "ioredis";
import { config } from "../config.js";
import { logger } from "../logger.js";

export const redis = new Redis(config.REDIS_URL, {
  // For a CACHE, failing fast beats waiting: if Redis is down, skip the cache and use the database.
  enableOfflineQueue: false, // don't queue commands while disconnected; fail them immediately
  maxRetriesPerRequest: 1,
});

// Without a listener, a connection error event would crash the process (like the pg pool in Module 05).
redis.on("error", (error) => {
  logger.warn({ err: error }, "redis connection error");
});
```

## 6.2 `src/cache/cache-store.ts`

```ts
import type { Redis } from "ioredis";
import type { Logger } from "pino";

/**
 * The few cache operations the app needs. Every method is "safe": if Redis fails, it logs a warning
 * and behaves like an empty cache, so a Redis outage makes the app slower, never broken.
 */
export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  increment(key: string): Promise<void>;
}

export function createRedisCacheStore(redis: Redis, log: Logger): CacheStore {
  return {
    async get(key) {
      try {
        return await redis.get(key);
      } catch (error) {
        log.warn({ err: error, key }, "cache get failed; treating as a miss");
        return null;
      }
    },

    async set(key, value, ttlSeconds) {
      try {
        await redis.set(key, value, "EX", ttlSeconds); // EX = expire after this many seconds
      } catch (error) {
        log.warn({ err: error, key }, "cache set failed; continuing without caching");
      }
    },

    async increment(key) {
      try {
        await redis.incr(key);
      } catch (error) {
        log.warn({ err: error, key }, "cache increment failed; cached entries expire via TTL");
      }
    },
  };
}

/** A Map-based CacheStore for unit tests: no Redis needed. (TTLs are ignored.) */
export function createMemoryCacheStore(): CacheStore {
  const values = new Map<string, string>();
  return {
    async get(key) {
      return values.get(key) ?? null;
    },
    async set(key, value) {
      values.set(key, value);
    },
    async increment(key) {
      const current = Number(values.get(key) ?? "0");
      values.set(key, String(current + 1));
    },
  };
}
```

- **A small interface (`CacheStore`)** instead of using `redis` everywhere. Unit tests use the memory version, and the "Redis failed, carry on" logic lives in one place.
- **`redis.set(key, value, "EX", ttlSeconds)`**: ioredis passes the arguments straight through as a Redis command: `SET key value EX 300`.

## 6.3 `src/modules/steps/steps.cached-repo.ts`

```ts
import type { CacheStore } from "../../cache/cache-store.js";
import type { StepsRepository } from "./steps.repository.js";
import type { DailySteps } from "./steps.types.js";

const RANGE_TTL_SECONDS = 300; // a safety net: even a missed invalidation heals within 5 minutes

/**
 * Wraps any StepsRepository with a cache-aside layer for listRange.
 *
 * Invalidation uses a per-user VERSION number in the cache key:
 *   steps:version:<userId>                      → "7"
 *   steps:range:<userId>:v7:<from>:<to>         → the cached JSON
 * Any write bumps the version to 8, so every cached range for that user is instantly
 * unreachable (and expires on its own later). One cheap INCR instead of finding and
 * deleting every range that might contain the changed day.
 */
export function createCachedStepsRepository(inner: StepsRepository, cache: CacheStore): StepsRepository {
  function versionKey(userId: string): string {
    return `steps:version:${userId}`;
  }

  async function rangeKey(userId: string, from: string, to: string): Promise<string> {
    const version = (await cache.get(versionKey(userId))) ?? "0";
    return `steps:range:${userId}:v${version}:${from}:${to}`;
  }

  return {
    async listRange(userId, from, to) {
      const key = await rangeKey(userId, from, to);

      // 1. Try the cache
      const cached = await cache.get(key);
      if (cached !== null) {
        return JSON.parse(cached) as DailySteps[];
      }

      // 2. Miss: ask the real repository, then remember the answer
      const days = await inner.listRange(userId, from, to);
      await cache.set(key, JSON.stringify(days), RANGE_TTL_SECONDS);
      return days;
    },

    async upsert(userId, record) {
      const result = await inner.upsert(userId, record); // write to the database FIRST…
      await cache.increment(versionKey(userId)); // …then invalidate
      return result;
    },

    async delete(userId, date) {
      const deleted = await inner.delete(userId, date);
      if (deleted) {
        await cache.increment(versionKey(userId));
      }
      return deleted;
    },

    // Reads we don't cache: pass straight through
    findByDate: (userId, date) => inner.findByDate(userId, date),
    rangeVersion: (userId, from, to) => inner.rangeVersion(userId, from, to),
  };
}
```

**This is the decorator pattern:** an object that *wraps* another object with the **same interface** and adds behavior. The service can't tell it's talking to a cache. To turn caching off, you just don't wrap.

- **Writes go to the database first, then invalidate.** In the reverse order, a reader could re-cache the old data between the two steps.
- **`findByDate` and `rangeVersion` pass straight through.** Not everything needs caching. (The ETag check is already cheap.)

## 6.4 Wire it in `src/composition.ts`

```ts
import { createRedisCacheStore } from "./cache/cache-store.js";
import { redis } from "./cache/redis.js";
import { logger } from "./logger.js";
import { createCachedStepsRepository } from "./modules/steps/steps.cached-repo.js";
// ...
  const cache = createRedisCacheStore(redis, logger);
  const stepsRepo = createCachedStepsRepository(createPgStepsRepository(pool), cache);
```

✅ **Try it**

```bash
curl -s -b jar.txt 'localhost:3000/v1/steps?from=2026-10-01&to=2026-10-31' > /dev/null
docker compose exec redis redis-cli KEYS 'steps:*'
# steps:range:<userId>:v5:2026-10-01:2026-10-31
# steps:version:<userId>

curl -s -b jar.txt -X PUT localhost:3000/v1/steps/2026-10-03 -H 'Content-Type: application/json' -d '{"steps":21000}'
curl -s -b jar.txt 'localhost:3000/v1/steps?from=2026-10-01&to=2026-10-31' | grep 21000    # fresh data
docker compose exec redis redis-cli KEYS 'steps:*'      # now there's a v6 key too; v5 will expire
docker compose exec redis redis-cli TTL 'steps:range:<userId>:v6:2026-10-01:2026-10-31'   # ≤ 300

# The outage drill:
docker compose stop redis
curl -i -b jar.txt 'localhost:3000/v1/steps?from=2026-10-01&to=2026-10-31'     # still 200, from Postgres
#   (the API logs "cache get failed; treating as a miss")
docker compose start redis
```

```bash
git add -A && git commit -m "feat(cache): etags and redis cache-aside for steps"
```

---

# Part 7 — 🧰 Toolbox

## 7.1 Accepting a CSV upload

```ts
// Route-level body parser: only this route reads text/csv, up to 5 MB
router.post("/", express.text({ type: "text/csv", limit: "5mb" }), async (req, res) => {
  if (!req.is("text/csv")) throw new UnsupportedMediaTypeError();   // adjust the message for CSV
  const csvText: unknown = req.body;                                  // a string when the parser ran
  // ...
});

// requireJsonBody (Module 02) must now allow CSV too:
const ALLOWED_BODY_TYPES = ["application/json", "text/csv"];
if (METHODS_WITH_BODY.has(req.method) && req.is(ALLOWED_BODY_TYPES) === false) { /* 415 */ }
```

```bash
curl -i -b jar.txt -X POST localhost:3000/v1/imports -H 'Content-Type: text/csv' --data-binary @steps.csv
```

(`--data-binary` keeps the newlines; `-d` would strip them.)

## 7.2 Parsing simple CSV

```ts
const lines = csvText.split(/\r?\n/);                // handles Windows (\r\n) and Unix (\n) line endings
const header = lines[0]?.trim().toLowerCase();       // expect "date,steps"
for (let i = 1; i < lines.length; i++) {
  const line = lines[i]?.trim() ?? "";
  if (line === "") continue;                          // skip blank lines (e.g., the last one)
  const [date, steps] = line.split(",");
  const rowNumber = i + 1;                            // humans count from 1, and the header is row 1
  // validate each row with a Zod schema: { date: CalendarDate, steps: z.coerce.number().int().min(0).max(100000) }
}
```

This handles the simple format this app defines (two columns, no quotes). Real-world CSV, with quoted fields and commas inside values, needs a proper parser library.

## 7.3 Batch upserts with `unnest`

Inserting 1,000 rows as 1,000 statements means 1,000 round trips. Instead, send **arrays** and let Postgres turn them into rows:

```ts
await db.query(
  `INSERT INTO daily_steps (user_id, day, steps, updated_at)
   SELECT $1, batch.day, batch.steps, $4
   FROM unnest($2::date[], $3::int[]) AS batch(day, steps)
   ON CONFLICT (user_id, day)
   DO UPDATE SET steps = EXCLUDED.steps, updated_at = EXCLUDED.updated_at`,
  [userId, ["2026-09-01", "2026-09-02"], [1000, 2000], updatedAt],
);
```

**⚠️ The same day twice in one batch fails:**
`ON CONFLICT DO UPDATE command cannot affect row a second time`. Deduplicate before sending (decide which value wins, probably the last one, and say so in your docs).

```ts
// Split a long array into chunks of 500
const chunks: Row[][] = [];
for (let i = 0; i < rows.length; i += 500) {
  chunks.push(rows.slice(i, i + 500));
}

// Deduplicate by date, last one wins
const byDate = new Map<string, number>();
for (const row of rows) byDate.set(row.date, row.steps);
```

## 7.4 Storing row errors as JSON

```sql
-- in the imports table
row_errors jsonb NOT NULL DEFAULT '[]'
```

```ts
const rowErrors: { row: number; message: string }[] = [];
// …push as you validate…
await db.query(`UPDATE imports SET row_errors = $2 WHERE id = $1`, [importId, JSON.stringify(rowErrors)]);
```

Cap how many errors you store (say, the first 100): a 50,000-line file of garbage shouldn't create a 50,000-entry error list.

## 7.5 Idempotency keys: the storage

```sql
CREATE TABLE idempotency_keys (
  user_id          uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  key              text        NOT NULL,
  request_hash     text        NOT NULL,
  status           text        NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  response_status  integer,
  response_body    jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
```

```sql
-- "Claim" a key atomically: returns a row ONLY if this request is the first to use it
INSERT INTO idempotency_keys (user_id, key, request_hash)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, key) DO NOTHING
RETURNING key;
-- 0 rows → someone already used this key: SELECT it and decide (replay / 422 / 409)
```

```ts
import { createHash } from "node:crypto";
const requestHash = createHash("sha256").update(JSON.stringify(parsedBody)).digest("hex");
```

Hash the **parsed** body (after Zod). Then `{"kind":"run"}` and `{ "kind" : "run" }` (different whitespace, same meaning) count as the same request.

## 7.6 Redis counters for rate limiting

```ts
// Count a failure in a fixed window, atomically: both commands run together, or not at all
const results = await redis.multi().incr(key).pexpire(key, windowMs, "NX").exec();
// results: [[null, <new count>], [null, 1 or 0]]

const count = Number(results?.[0]?.[1] ?? 0);
const msLeft = await redis.pttl(key);          // milliseconds until the key expires (-2 = no such key)
await redis.del(key);                           // reset on success
```

`PEXPIRE … NX` ("only if no expiry yet") requires Redis 7+. It sets the window's end on the *first* failure and leaves it alone afterward.

## 7.7 Load testing with autocannon

```bash
# 50 concurrent connections for 20 seconds, with your session cookie
npx autocannon -c 50 -d 20 -H "Cookie: fittrack_session=<token>" \
  'http://localhost:3000/v1/stats/weekly?week=2026-W42'
```

Read the **Latency** table (p50 / p97.5 / p99; look at the tail, not the average) and **Req/Sec**. Run it with the cache off and on, on the same data, and record both.

## 7.8 Scheduling a job for later

```ts
await queue.enqueue("weekly-summary", { userId, week: "2026-W42" }, { runAt: new Date("2026-10-19T04:00:00Z") });
```

---

# Part 8 — 🧩 Challenges

## Challenge 1: CSV step import ★★★

The mirror image of the export. **Same pattern, harder rules.**

**API**

| Endpoint | Behavior |
|---|---|
| `POST /v1/imports` | Body: `text/csv` (≤ 5 MB), header `date,steps`. Creates an import record + a job **in one transaction** → **202** + `Location` + `{ id, status: "queued" }` |
| `GET /v1/imports/:id` | `{ id, status, rowsTotal, rowsImported, rowErrors: [{ row, message }], createdAt, completedAt }` |

**The job (`steps-import`)**
1. Validate the payload (`{ importId }`); load the import; if it's `completed`, return (idempotent).
2. Parse the CSV (toolbox 7.2). The header must be exactly `date,steps` (any case); otherwise fail the whole import with a clear error.
3. Validate each row: a real calendar date, not in the future (in the user's timezone if you did Module 07's Challenge 4), steps an integer 0–100,000. Collect up to 100 row errors (`{ row: 412, message: "steps must be ≤ 100000" }`), and skip the bad rows.
4. Deduplicate dates (last one wins), then **upsert in batches of 500** (toolbox 7.3).
5. Record `rowsTotal`, `rowsImported`, and `rowErrors`; mark it `completed`.

**Storage:** an `imports` table like `exports` (`csv_text` holds the upload, plus `rows_total`, `rows_imported`, `row_errors jsonb`).

✅ **Acceptance**
1. **Your real data:** export your step history from your phone or watch (Apple Health, Google Fit, Garmin, Fitbit…), convert it to `date,steps`, and import it. Check a few days by hand.
2. **A generated 3-year file with problems:** write a small script that generates ~1,100 days, with 5 bad rows mixed in (an invalid date, negative steps, `"abc"`, a future date, a duplicate date). Expect `rowsImported` ≈ 1,095, exactly the 4 invalid rows in `rowErrors` with correct row numbers, and the duplicate resolved by "last wins."
3. A wrong header → status `failed` with an error message, and nothing imported.
4. `Content-Type: application/json` on `POST /v1/imports` → 415. A 6 MB file → 413.
5. Another user's import ID → 404.

<details><summary>💡 Hint 1: direction</summary>

Copy Part 4 file by file, renaming *export* to *import*: migration → types → repository → service (with the same unit-of-work transaction) → job handler → routes → wiring in `composition.ts` and `worker.ts`. The new parts are the CSV parsing and the batch upsert (toolbox 7.1–7.4).
</details>

<details><summary>💡 Hint 2: where the logic goes</summary>

Keep the job handler thin, and put the CSV parsing in a **pure function** like `parseStepsCsv(text, today): { rows: { date, steps }[]; errors: { row, message }[]; headerError?: string }`. Pure functions are easy to unit-test with dozens of edge cases (Module 06 style). The batch upsert is a new repository method, `upsertMany(userId, rows, updatedAt)`.
</details>

<details><summary>💡 Hint 3: handler pseudocode</summary>

```
run(job):
  { importId } = Payload.parse(job.payload)
  imp = importsRepo.findByIdForWorker(importId); if none → return; if completed → return
  markRunning(importId)
  user = usersRepo.findById(imp.userId)              // for the timezone (and "today")
  parsed = parseStepsCsv(imp.csvText, localDateOf(clock.now(), user.timezone))
  if parsed.headerError → markFailed(importId, parsed.headerError); return   // don't throw: retrying won't help
  deduped = last-wins by date
  for chunk of chunks(deduped, 500): stepsRepo.upsertMany(imp.userId, chunk, now)
  markCompleted(importId, { rowsTotal, rowsImported: deduped.length, rowErrors: first 100 errors })
```
</details>

---

## Challenge 2: Prove the import is idempotent ★★☆

1. **Integration test:** run the import handler **twice** on the same import (call `run` directly, and reset the import's status to `running` between runs to simulate a crash after the upserts). Assert the `daily_steps` rows are identical after the first and second runs.
2. **Crash drill (manual):** import a large generated file (~10,000 rows: go back 27 years, or several users). While the worker is running it, kill the worker with `kill -9 <pid>` (no graceful stop). Start a new worker. After the lock expires (lower `lockSeconds` while you do this drill), it reclaims the job and finishes. Check the final row count is correct.

Write in the tracker: why was the outcome correct even though some rows were written twice?

---

## Challenge 3: Failure drills ★★☆

1. **Retries:** temporarily make the export handler throw when `job.attempts < 3`. Watch the logs: "will retry" with growing `retryInMs`, then "job completed" on attempt 3. Check `jobs.attempts` and `last_error` in `psql`.
2. **Give up:** make it always throw. After 5 attempts: the job is `failed`, `onGiveUp` ran, and `GET /v1/exports/:id` shows `status: "failed"` with the error.
3. **Database blip:** with the worker running and idle, `docker compose stop db` for 10 seconds, then start it again. The worker logs errors but **doesn't exit**, and processes new jobs afterward.
4. **Unit tests** for `computeRetryDelayMs` with `random: () => 1`, `() => 0`, and the cap.

Remove the temporary throws when you're done.

---

## Challenge 4: Idempotency keys on `POST /v1/workouts` ★★★

Implement 1.7 for workout creation (with or without `sets`), using the table and queries in toolbox 7.5.

| Rule | Detail |
|---|---|
| Header | `Idempotency-Key`: optional; if present, 1–100 characters |
| Scope | Per user: Alice's key `abc` and Bob's key `abc` are unrelated |
| Same key + same body, completed | **Replay** the stored status and body exactly (same workout ID). No new rows. |
| Same key + different body | **422** |
| Same key, still in progress | **409** |
| The original request failed with a 4xx | **Don't store it**: delete the key so the client can fix the body and retry with the same key |
| Expiry | Keys older than 24 hours are ignored and can be reused. Add a cleanup job, or delete them when you find them. |

✅ **Acceptance (integration tests)**
1. The same key + body sent twice → two identical 201 responses, **one** workout in the database.
2. The same key with a different body → 422.
3. **Concurrency:** send the same request twice *at the same time* (`Promise.all` of two Supertest requests) → exactly one 201 + one 409 (or two 201 replays), and exactly one workout.
4. Without the header → behaves exactly as before.

<details><summary>💡 Hint 1</summary>

Do this in the service, wrapping the existing create logic: `createWorkoutIdempotently(userId, key, body)`. The route only reads the header and passes it through.
</details>

<details><summary>💡 Hint 2</summary>

Order of operations: (1) claim the key with `INSERT … ON CONFLICT DO NOTHING RETURNING`; (2) if you got no row, `SELECT` the existing one and decide (replay / 422 / 409); (3) if you did get a row, create the workout, then `UPDATE` the key to `completed` with the response. Ideally (3) happens in one transaction, so a crash can't leave a workout without a completed key.
</details>

---

## Challenge 5: ETag on weekly stats ★★☆

Apply Part 5's pattern to `GET /v1/stats/weekly?week=…`. The cheap version must change whenever steps **or** workouts **or** sets in that week change. (Hint: combine counts and max update times from each table for the week's date range. Sets don't have `updated_at`, so think about what changes when a set changes.)

✅ **Acceptance:** an integration test: GET → 200 + ETag; again with `If-None-Match` → 304; add a set to a workout in that week → 200 with a new ETag.

---

## Challenge 6: Cache the weekly stats ★★★

1. **Measure first:** with your perf-lab data (Module 05), load-test `GET /v1/stats/weekly` with autocannon (toolbox 7.7) and record p50/p99 and requests/second.
2. Add cache-aside for the weekly stats, with a **versioned key per user** (like Part 6). Every write to steps, workouts, or sets for that user bumps the version. (Where should that bump live so you can't forget it? Think about the decorator pattern, or a small `invalidateUserStats(userId)` the services call.)
3. Measure again with the same command. Record both runs in the tracker.
4. **Prove invalidation** with an integration test: GET weekly stats (cached) → log a run in that week → GET again → the new run is included.
5. **Prove degradation:** with Redis stopped, the endpoint still returns correct data.

Then write in the tracker: **was it worth it?** If the gain was small, it's a perfectly good outcome to remove the cache and keep the simpler code. Record that decision either way.

---

## Challenge 7: A Redis-backed login rate limiter ★★☆

Reimplement Module 07's `LoginRateLimiter` interface with Redis (toolbox 7.6): the same limits, the same behavior, and **no change to the login code**, only to the line in `composition.ts` that picks the implementation.

✅ **Acceptance**
1. Module 07's rate-limit tests pass against the Redis version. (Clear the keys in `beforeEach`, or use unique emails per test.)
2. **Two instances, one limit:** start two API processes on different ports (`PORT=3000` and `PORT=3001`). Send 3 bad logins to each for the same email. The 6th attempt is blocked on **either** port.
3. Decide, and record in the decisions log, what happens when Redis is down: **fail open** (allow logins without limiting) or **fail closed** (refuse logins). There's no universally right answer. Write down why you chose yours.

---

## Challenge 8: Scheduled weekly summary ★★★ (stretch)

Every Sunday at 9pm **in each user's timezone**, build last week's summary (your weekly stats query) into a `weekly_summaries` table (`user_id`, `week`, the numbers, `computed_at`), and expose `GET /v1/summaries?limit=` (newest first).

Hints: a `"summary-scheduler"` job that runs hourly and re-enqueues itself with `runAt` one hour later; each run finds users whose local time is Sunday 21:00–21:59 and enqueues one `"weekly-summary"` job per user (an upsert keyed by `(user_id, week)`, so it's idempotent). Write in the tracker: how stale can a summary be, and is that OK for this feature?

```bash
git add -A && git commit -m "feat: csv import, idempotency keys, cached stats, redis rate limiting"
```

---

## Definition of done

- [ ] The worker runs as its own process; jobs survive the worker being stopped and restarted.
- [ ] Export and import both work end to end, are idempotent (tested), and are created atomically with their jobs.
- [ ] Retries back off with jitter, and permanently failed jobs are visible in the API (`status: "failed"`).
- [ ] A retried `POST /v1/workouts` with the same `Idempotency-Key` never creates a duplicate (tested, including concurrency).
- [ ] The steps list and weekly stats support ETags (304 tested).
- [ ] Cached data is never stale after a write (tested), and the API keeps working with Redis down (tested).
- [ ] Two API instances share one login rate limit.
- [ ] Load-test numbers before and after caching are recorded, with a decision.

---

## ✍️ Checkpoint

1. Name three signals that a piece of work belongs in a background job, with an example from fittrack for each.
2. What does "at-least-once delivery" mean, why do queues choose it, and what does it require of every job handler?
3. Explain what `FOR UPDATE SKIP LOCKED` does in your claim query, and what `locked_until` protects against.
4. Why does the export endpoint create the export row and its job in one transaction? Describe what could go wrong otherwise.
5. Why does the import endpoint return 202 rather than 201? What should the response contain? What problem does jitter solve in exponential backoff?
6. Walk through this scenario with and without idempotency keys: the phone sends `POST /v1/workouts`, the server commits, the response is lost, and the phone retries. What happens if the retry has a different body?
7. Describe the ETag / If-None-Match flow for your steps list. What does your server compute, and why is that better than Express's built-in ETag?
8. Write out the cache-aside read path and write path. Describe the stale-write race, and explain how versioned keys avoid it.
9. Redis goes down. What happens to your steps list, your weekly stats, and your login rate limiter, and why did you make each choice?
10. Your import processed 6,000 of 10,000 rows, then the worker crashed. What happens on retry? Is the outcome correct, and why?

**Explain it back:** Explain eventual consistency using your weekly summary (or your cached stats): what a user might see, for how long, and why that's acceptable (or not).

---

## 📋 Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Progress
- [ ] Part 1: Concepts read (1.1–1.12)
- [ ] Part 2: Redis, ioredis, config, scripts
- [ ] Part 3: Job queue + worker
- [ ] Part 4: Steps export end to end
- [ ] Part 5: ETag on steps list
- [ ] Part 6: Redis cache-aside for steps
- [ ] Challenge 1: CSV import
- [ ] Challenge 2: Import idempotency + crash drill
- [ ] Challenge 3: Failure drills
- [ ] Challenge 4: Idempotency keys
- [ ] Challenge 5: ETag on weekly stats
- [ ] Challenge 6: Cached weekly stats + measurements
- [ ] Challenge 7: Redis rate limiter
- [ ] Challenge 8: Scheduled summaries (stretch)
- [ ] Checkpoint passed (≥ 8/10)

### Concepts I can explain without notes
- [ ] The request budget (1.1)
- [ ] Queues and workers (1.2)
- [ ] At-least-once delivery and idempotent handlers (1.3)
- [ ] Claiming with SKIP LOCKED, leases, attempts, backoff with jitter (1.4)
- [ ] The dual-write problem (1.5)
- [ ] 202 + status resources (1.6)
- [ ] Idempotency keys (1.7)
- [ ] Cache-Control and ETags (1.8)
- [ ] Cache-aside, versioned keys, TTLs, degrading when Redis is down (1.9)
- [ ] Eventual consistency (1.10)
- [ ] Scheduling across timezones (1.11)
- [ ] Shared state across instances (1.12)

### Load test results (Challenge 6)
| Endpoint | Cache | Req/s | p50 (ms) | p99 (ms) |
|---|---|---|---|---|
| `/v1/stats/weekly` | off | | | |
| `/v1/stats/weekly` | on | | | |

**Worth it? Decision:** —

### Crash drill (Challenge 2)
—

### Redis-down decisions (Challenge 7 and checkpoint Q9)
| Feature | When Redis is down | Why |
|---|---|---|
| Steps list cache | | |
| Weekly stats cache | | |
| Login rate limiter | | |

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
- PostgreSQL `SELECT … FOR UPDATE SKIP LOCKED`: https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE
- AWS Architecture Blog, "Exponential Backoff and Jitter": https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
- Stripe, "Designing robust and predictable APIs with idempotency": https://stripe.com/blog/idempotency
- MDN, HTTP caching: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
- MDN, ETag: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
- Redis documentation: https://redis.io/docs/latest/
- ioredis: https://github.com/redis/ioredis
- pg-boss (a production Postgres job queue): https://github.com/timgit/pg-boss
- autocannon: https://github.com/mcollina/autocannon
