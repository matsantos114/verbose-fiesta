# Module 05: Data Access, Transactions & Performance

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | ✅ Full |
| **Estimated time** | 16–20 hours |
| **Prerequisites** | Module 04 complete (schema migrated, seed data loaded, SQL kata done) |
| **Project milestone** | Postgres-backed repositories for every feature, atomic "workout + sets" creation, stats and PR endpoints, indexes proven with `EXPLAIN ANALYZE`, N+1 fixed, and a first repository on Kysely |

## 🎓 Tutor prompt

Start every study session for this module in a **new chat** by pasting the prompt below. It sets Claude up as your teacher for this module: it reads the course files, picks up where you left off, follows the teaching rules (no solutions; syntax help and hints instead), quizzes you, and updates your tracker when you say **"wrap up."**

```text
You are my tutor for Module 05 of my backend engineering course: "Data Access, Transactions & Performance".

ROLE
Act as a senior backend engineer specializing in PostgreSQL performance and data correctness under concurrency. You make people reason through interleavings step by step and read query plans before reaching for fixes. Teach the way a great senior engineer mentors a junior on their own team: patient, precise, Socratic, and honest when my work isn't good enough yet.

ABOUT ME
- I'm Mathew, a frontend engineer (React + TypeScript). I'm solid on JS/TS logic, but I don't know every Node, Express, SQL, or tooling API and syntax by heart.
- I'm building `fittrack-api`, an API that tracks my own physical activity (daily steps, workouts, lifting sets, exercises), to learn backend fundamentals properly.
- The course lives in my repo at `docs/course/`: `COURSE.md` (rules, given-vs-you-write table, decisions log, session log) plus one file per module.
- Stack for this module: Node.js LTS + TypeScript + Express 5 + PostgreSQL, using `pg` with raw parameterized SQL, then Kysely.

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/05-data-access-transactions-performance.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
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
- Parameterized queries everywhere; whitelisting identifiers like sort columns.
- Transactions on a single client (`BEGIN`/`COMMIT`/`ROLLBACK` + `release()` in `finally`); proving all-or-nothing behavior.
- Concurrency: have me walk through two requests interleaving, line by line, before I choose a fix (ON CONFLICT, atomic updates, optimistic versioning, `FOR UPDATE`).
- Indexes designed from real queries. Make me interpret `EXPLAIN (ANALYZE, BUFFERS)` output myself before you comment on it.
- Detecting and fixing N+1; keeping aggregations in SQL.
- Swapping repositories via the composition root without touching services. That's the payoff of Module 02.
- Watch for these common misconceptions and correct them when they show up: running `BEGIN` through `pool.query`; string-interpolating values or sort columns into SQL; assuming foreign keys are indexed automatically; "more indexes is always better"; assuming READ COMMITTED prevents lost updates.
- Hold me to this standard before I move on: no interpolated SQL anywhere, workout + sets creation is atomic, every endpoint query has a supporting index shown by EXPLAIN, and listing with sets uses a constant number of queries.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

## How to use this module

| Part | What you do | Kind |
|---|---|---|
| 1. Concepts | Pools, injection, type mapping, transactions, concurrency, indexes, query plans, N+1 | 📖 Read |
| 2. Worked example A | `pool.ts`, `Queryable`, and the Postgres **steps** repository; swap it in | ⌨️ Type along |
| 3. Worked example B | Translating database errors into HTTP responses | ⌨️ Type along |
| 4. Worked example C | `withTransaction` plus a rollback lab | ⌨️ Type along |
| 5. Toolbox | Dynamic filters, keyset pagination in SQL, `ANY`, unit of work, concurrency fixes | 🧰 Reference |
| 6. Challenges | Postgres repos for exercises, workouts, and sets; atomic writes; stats; performance lab; N+1; concurrency | 🧩 You write |
| 7. Kysely | Worked example: steps on Kysely; then convert one repository yourself | ⌨️ then 🧩 |
| Checkpoint | 10 questions | ✍️ Quiz |

**The payoff of Module 02's architecture shows up here.** You'll replace repositories one at a time, and the services and routes won't change. If you find yourself editing a service to make Postgres work, stop and ask why.

## What you'll be able to do by the end
- Use a connection pool correctly, and explain what happens when it runs out.
- Write injection-proof queries, including dynamic filters and sorting.
- Map database rows to API objects, and handle Postgres's type quirks (dates, numerics, bigints).
- Use transactions for multi-step writes, and reason about concurrent requests step by step.
- Turn database errors into the right HTTP responses.
- Design indexes from real queries, and read `EXPLAIN ANALYZE` output to prove they work.
- Detect and fix N+1 queries.
- Explain raw SQL vs. query builder vs. ORM, from experience.

---

# Part 1 — 📖 Concepts

## 1.1 How your app talks to Postgres

```
Express handler ──▶ service ──▶ repository ──▶ pool.query(sql, values)
                                                     │  borrows a connection
                                                     ▼
                                   ┌─────────── pg.Pool (one per process) ───────────┐
                                   │  conn 1 (busy)   conn 2 (idle)   …   conn 10     │
                                   └───────────────────────┬─────────────────────────┘
                                                           │ TCP, Postgres wire protocol
                                                           ▼
                                               Postgres server (one backend process per connection)
```

- A **connection** is a long-lived TCP session. Opening one costs a network handshake, authentication, and a new process on the database server: several milliseconds. Doing that per request would be slow and would overload the database.
- A **pool** keeps a set of open connections and **lends** them out. `pool.query()` borrows one, runs the query, and returns it.
- **Create one pool per process**, at startup, and share it. Never create a pool inside a request handler.

## 1.2 When the pool runs out

With `max: 10` and 50 requests arriving at once, each needing one query:
- 10 queries run immediately.
- 40 **wait in a queue** inside the pool, and get a connection as soon as one is returned.
- If a request waits longer than `connectionTimeoutMillis`, it fails with a timeout error.

So **pool exhaustion shows up as latency, not as errors**, until it gets bad enough to cause timeouts. The common causes:
- A slow query holding connections (fix the query; see Part 1.9).
- A connection that was **never released**, usually a transaction whose `release()` was skipped by an error. Always release in `finally`.
- A pool size larger than the database allows (Module 10 covers connection limits).

## 1.3 SQL injection

```ts
// ❌ The client sends kind = "run' OR '1'='1"
await pool.query(`SELECT * FROM workouts WHERE user_id = '${userId}' AND kind = '${kind}'`);
// The SQL becomes: … AND kind = 'run' OR '1'='1'   → returns EVERY user's workouts
```

The fix is **parameterized queries**:

```ts
// ✅ The SQL text and the values travel separately. A value can never become SQL.
await pool.query("SELECT * FROM workouts WHERE user_id = $1 AND kind = $2", [userId, kind]);
```

`$1`, `$2` are **placeholders**. Postgres parses the SQL first, then plugs in the values as pure data. No amount of quotes in `kind` can change the query's structure.

**What can't be a parameter:** identifiers and keywords: table names, column names, `ASC`/`DESC`. For those, map whitelisted API values to **fixed SQL text written in your code**:

```ts
const direction = query.sort === "startedAt" ? "ASC" : "DESC";   // only ever one of two literals
```

That's the M2 "whitelist sort fields" rule paying off.

## 1.4 Type mapping: Postgres → JavaScript

The `pg` library converts column values into JS values. Most are obvious; three will bite you:

| Postgres type | Default JS value | The problem | Our fix |
|---|---|---|---|
| `date` | a `Date` at **local** midnight | On a server in Los Angeles, `2026-10-11` becomes `2026-10-11T07:00:00Z`. Convert that back with `toISOString()` and you get the wrong date shown in some places. | Keep it as a `"YYYY-MM-DD"` **string** |
| `numeric` | a **string** (`"102.50"`) | No precision is lost, but you can't do math with it | Convert to `number` (safe for our ranges) |
| `bigint` (what `count(*)` returns) | a **string** (`"42"`) | Same | Convert to `number` |
| `timestamptz` | a `Date` | Fine | Call `.toISOString()` when mapping to API objects |

You set these conversions once, globally, with **type parsers** in `pool.ts` (Part 2).

## 1.5 Rows vs. API objects

The database speaks `snake_case` with database types; the API speaks `camelCase` with JSON-friendly types. **Each repository has one small mapping function** (`toDailySteps(row)`). Mapping is the *only* place that knows both shapes:

```
row from pg:   { day: "2026-10-11", steps: 9412, updated_at: Date(…) }
                                   │  toDailySteps()
API object:    { date: "2026-10-11", steps: 9412, updatedAt: "2026-10-12T03:05:00.000Z" }
```

## 1.6 Transactions and ACID

A **transaction** groups several statements so they succeed or fail **together**.

```sql
BEGIN;
  INSERT INTO workouts (…) VALUES (…) RETURNING id;
  INSERT INTO workout_sets (…) VALUES (…);   -- set 1
  INSERT INTO workout_sets (…) VALUES (…);   -- set 2 ← fails a CHECK
ROLLBACK;  -- nothing above happened: no half-logged workout
```

| Letter | Meaning | In this app |
|---|---|---|
| **A**tomic | All or nothing | A workout is never saved without its sets |
| **C**onsistent | Constraints hold before and after | No set ever points at a missing workout |
| **I**solated | Concurrent transactions don't see each other's half-done work | Another request never sees the workout without its sets |
| **D**urable | Committed means saved, even through a crash | |

**The rule that matters for code: every statement in a transaction must run on the same connection.** `BEGIN` on one pooled connection and `INSERT` on another is two unrelated sessions. That's why transactions use `pool.connect()` to borrow one dedicated client.

## 1.7 Concurrency: two classic bugs

Postgres's default isolation level is **READ COMMITTED**: each statement sees everything committed *before that statement started*. That's not enough to prevent these two bugs on its own.

**Bug 1: check-then-act.** Two phones sync Oct 11's steps at the same instant, with code that checks first:

```
Phone A: SELECT … WHERE day = '2026-10-11'   → no row
Phone B: SELECT … WHERE day = '2026-10-11'   → no row
Phone A: INSERT (…, 9412)                     ✔
Phone B: INSERT (…, 9412)                     ✘ unique violation (or, with no constraint, a duplicate row)
```

**Fix:** let the database decide in **one statement**: `INSERT … ON CONFLICT DO UPDATE` (the upsert from Module 04).

**Bug 2: the lost update.** You edit a workout's notes on your laptop while your watch fixes its distance:

```
Laptop: GET workout   → { notes: "easy", distanceM: 5000, … }
Watch:  GET workout   → { notes: "easy", distanceM: 5000, … }
Watch:  PATCH distanceM: 5200  → UPDATE … SET notes='easy', distance_m=5200
Laptop: PATCH notes: "felt great"  → UPDATE … SET notes='felt great', distance_m=5000   ← the watch's fix is LOST
```

The laptop wrote back a stale value it never meant to change. Fixes:

| Fix | How | When |
|---|---|---|
| Only update the columns the client sent | `UPDATE … SET notes = $1` (not every column) | Always. Your PATCH semantics already require this. |
| Atomic SQL | `SET steps = steps + $1`: the database computes from the *current* value | For counters and increments |
| **Optimistic concurrency** | A `version` column; `UPDATE … WHERE id = $1 AND version = $2`; 0 rows updated means someone else changed it first → tell the client | When two people (or devices) really can edit the same row |
| Pessimistic locking | `SELECT … FOR UPDATE` inside a transaction: other writers wait | Short, critical read-then-write sequences |

Stricter isolation levels (`REPEATABLE READ`, `SERIALIZABLE`) make Postgres detect more conflicts for you, at the cost of retrying failed transactions. Know they exist; you won't need them in this app.

## 1.8 Database errors → HTTP

| SQLSTATE | Meaning | HTTP | Note |
|---|---|---|---|
| `23505` | unique_violation | **409** | Use the constraint name for a friendly message |
| `23503` | foreign_key_violation | **422** (or 404) | The request referred to something that doesn't exist |
| `23514` / `23502` | check / not-null violation | **400** | It means your validation missed something: log it as a warning |
| `22P02` | invalid text representation (e.g., a malformed UUID) | **400** | |
| `ECONNREFUSED`, `57P01`, `57P03`, `53300` | database unreachable, shutting down, starting up, too many connections | **503** | An *operational* error: retrying later may work |
| anything else | | **500** | A bug |

Translate in **one place** (Part 3), so repositories and services stay clean.

## 1.9 Indexes

Without an index, finding "this user's latest 20 workouts" among 500,000 rows means reading **every row**, keeping the matches, and sorting them. A **B-tree index** is a sorted copy of some columns, with pointers back to the rows, like the index at the back of a book.

An index on **`(user_id, started_at DESC, id DESC)`** stores entries sorted by user, then newest first, then by ID:

```
(user A, Oct 12 07:00, 8f3c) → row
(user A, Oct 11 18:30, 1a2b) → row
(user A, Oct 10 07:05, 77de) → row
…
(user B, Oct 12 06:45, 9c01) → row
```

To answer "user A, newest 20," Postgres **jumps** to user A's first entry and reads 20 entries in order. No scanning and no sorting.

**Rules of thumb:**
1. **Equality columns first, then range or sort columns.** `(user_id, started_at)` serves "user = X, ordered by time." `(started_at, user_id)` would make Postgres walk through *every* user's workouts in time order, skipping the ones that aren't user X.
2. **Postgres does not automatically index foreign key columns.** It does index primary keys and `UNIQUE` constraints. Check each FK: is there already an index whose *first* column is the FK column?
3. **Indexes aren't free.** Every insert and update must also update every index, and indexes use disk space. Add them for real queries, not "just in case."

## 1.10 Reading `EXPLAIN ANALYZE`

`EXPLAIN` shows the plan Postgres *chose*. `EXPLAIN ANALYZE` actually runs the query and adds real timings. Here are two real plans from this course's performance lab: 500,000 workouts across 1,000 users.

**Before an index:**

```
Limit  (actual time=22.708..27.363 rows=20 loops=1)
  ->  Gather Merge  (actual time=22.707..27.359 rows=20 loops=1)
        Workers Launched: 2
        ->  Sort  (actual time=19.420..19.421 rows=13 loops=3)
              Sort Key: started_at DESC, id DESC
              ->  Parallel Seq Scan on workouts  (actual time=13.029..19.352 rows=167 loops=3)
                    Filter: (user_id = '0bdd…'::uuid)
                    Rows Removed by Filter: 166500
Execution Time: 27.411 ms
```

Read it **from the innermost (most indented) line outward**:
1. **`Parallel Seq Scan on workouts`**: read the *whole table* (3 workers splitting the work).
2. **`Filter … Rows Removed by Filter: 166500`** (per worker): about 500,000 rows read to keep about 500. That ratio is the smell.
3. **`Sort`**: sort the matches, because nothing gave them in order.
4. **`Limit`**: finally keep 20.

**After `CREATE INDEX workouts_user_started_idx ON workouts (user_id, started_at DESC, id DESC)`:**

```
Limit  (actual time=0.035..0.040 rows=20 loops=1)
  ->  Index Scan using workouts_user_started_idx on workouts  (actual time=0.034..0.038 rows=20 loops=1)
        Index Cond: (user_id = '0bdd…'::uuid)
Execution Time: 0.065 ms
```

No scan of the whole table, no sort. Postgres reads exactly 20 index entries. **27 ms → 0.07 ms**, about 400× faster. And the gap grows as the table grows.

| You see | It means |
|---|---|
| `Seq Scan` + a big `Rows Removed by Filter` | A missing or unusable index |
| `Index Scan` / `Index Only Scan` | Using an index (Index Only = didn't even need to visit the table) |
| `Bitmap Index Scan` → `Bitmap Heap Scan` | Using an index to collect many matching rows, then fetching them |
| A `Sort` above a scan | Results weren't already in order |
| estimated `rows=` very different from `actual … rows=` | Stale statistics: run `ANALYZE` |

Use `EXPLAIN (ANALYZE, BUFFERS)` to also see how many 8 KB pages were read (`shared hit` = from memory, `read` = from disk).

## 1.11 The N+1 query problem

`GET /v1/workouts?include=sets` written the obvious way:

```ts
const workouts = await workoutsRepo.list(userId, opts);          // 1 query
for (const workout of workouts) {
  workout.sets = await setsRepo.listByWorkout(workout.id);       // +1 query PER workout
}
```

20 workouts = **21 queries**, each one a network round trip. It's invisible on your laptop with 3 workouts and painful in production with 100. The fix is **one query for all the sets**:

```sql
SELECT … FROM workout_sets WHERE workout_id = ANY($1::uuid[]) ORDER BY workout_id, set_number;
-- $1 = the array of 20 workout IDs
```

Then group the sets by `workout_id` in code. 2 queries, no matter how many workouts. (A `JOIN` with `json_agg` can do it in one query; either is fine.)

## 1.12 Aggregations belong in the database

"Weekly km for 8 weeks" could be done by fetching every run into Node and looping. Don't:
- It transfers far more data than the answer needs.
- It holds that data in memory.
- The loop **blocks the event loop** (Module 01's `/block` experiment) while it runs.

The database is built for exactly this: **send the question to the data, not the data to the question.**

## 1.13 Raw SQL vs. query builder vs. ORM

| | Raw SQL (`pg`) | Query builder (Kysely) | ORM (Prisma, TypeORM) |
|---|---|---|---|
| You write | SQL strings | TypeScript that reads like SQL | Method calls on models |
| Type safety | You declare row types by hand | Column names and types are checked | Strong |
| Complex queries | Natural | Good, with a raw `sql` escape hatch | Often awkward |
| What happens is obvious | Totally | Mostly (`.compile()` shows the SQL) | Less so: SQL is generated for you |
| What it teaches you | SQL itself | SQL, with guard rails | The ORM's API |

This course goes raw SQL → Kysely so you learn the SQL first, then add type safety without hiding it.

✅ **Before moving on:** explain 1.3, 1.6, 1.7, and 1.9 out loud.

---

# Part 2 — ⌨️ Worked example A: the Postgres steps repository

The data flows through these files in order: **`pool.ts`** (how values convert, plus the shared pool) → **`queryable.ts`** (what a repository needs) → **`steps.pg-repo.ts`** (the SQL) → **`server.ts`** (swap it in) → **`app.ts`** (`/health` checks the database).

## 2.1 Config

Add to `ConfigSchema` in `src/config.ts`, and to `.env.example`:

```ts
DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
```

## 2.2 `src/db/pool.ts`

```ts
import pg from "pg";
import { config } from "../config.js";
import { logger } from "../logger.js";

// ── Type parsers: how Postgres values become JavaScript values ───────────────────────────
// DATE (type id 1082): keep "YYYY-MM-DD" as a plain string. By default pg turns it into a JS
// Date at LOCAL midnight, which can silently shift the day when the server isn't on UTC.
pg.types.setTypeParser(1082, (value: string) => value);

// NUMERIC (type id 1700): pg returns these as strings so no precision is lost. Our numerics
// (weights up to 1000.00, RPE up to 10.0) fit exactly in a JS number, so convert them.
pg.types.setTypeParser(1700, (value: string) => Number(value));

// INT8 / BIGINT (type id 20): count(*) returns bigint. Our counts are far below 2^53.
pg.types.setTypeParser(20, (value: string) => Number(value));

// ── The pool: ONE per process, shared by every request ───────────────────────────────────
export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  max: config.DB_POOL_MAX, // at most this many open connections
  idleTimeoutMillis: 30_000, // close connections that sit unused for 30s
  connectionTimeoutMillis: 5_000, // give up if no connection is free within 5s
});

// An idle connection can fail (for example, the database restarted). Without this
// listener, that error would crash the process.
pool.on("error", (error) => {
  logger.error({ err: error }, "idle database connection failed");
});
```

- **Type IDs** (1082, 1700, 20) are Postgres's internal numbers for each type. You can look them up with `SELECT oid, typname FROM pg_type WHERE typname IN ('date', 'numeric', 'int8');`.
- **The parsers run when this file is first imported**, so they apply to every query in the process.
- **`pool.on("error", …)`**: an `EventEmitter` "error" event with no listener crashes Node. The pool reconnects on its own; we just need to log it.

## 2.3 `src/db/queryable.ts`

```ts
import type pg from "pg";

/**
 * Anything that can run a query: the shared pool, or one client inside a transaction.
 * Repositories accept a Queryable, so the same repository code works in both situations.
 */
export interface Queryable {
  query<Row extends pg.QueryResultRow>(text: string, values?: unknown[]): Promise<pg.QueryResult<Row>>;
}
```

Both `pg.Pool` and the `pg.PoolClient` you get inside a transaction match this interface. That's what lets Part 4 run the **same repository code** inside a transaction.

## 2.4 `src/modules/steps/steps.pg-repo.ts`

```ts
import type { Queryable } from "../../db/queryable.js";
import type { StepsRepository } from "./steps.repository.js";
import type { DailySteps } from "./steps.types.js";

/** One row of the daily_steps table, exactly as pg returns it (snake_case, with parsed types). */
interface DailyStepsRow {
  day: string; // DATE → string, thanks to the type parser in pool.ts
  steps: number;
  updated_at: Date; // TIMESTAMPTZ → JS Date
}

/** The only place that knows how database rows map to API objects. */
function toDailySteps(row: DailyStepsRow): DailySteps {
  return {
    date: row.day,
    steps: row.steps,
    updatedAt: row.updated_at.toISOString(),
  };
}

export function createPgStepsRepository(db: Queryable): StepsRepository {
  return {
    async upsert(userId, record) {
      const result = await db.query<DailyStepsRow & { created: boolean }>(
        `INSERT INTO daily_steps (user_id, day, steps, updated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, day)
         DO UPDATE SET steps = EXCLUDED.steps, updated_at = EXCLUDED.updated_at
         RETURNING day, steps, updated_at, (xmax = 0) AS created`,
        [userId, record.date, record.steps, record.updatedAt],
      );
      const row = result.rows[0];
      if (!row) {
        throw new Error("upsert into daily_steps returned no row");
      }
      return { record: toDailySteps(row), created: row.created };
    },

    async findByDate(userId, date) {
      const result = await db.query<DailyStepsRow>(
        `SELECT day, steps, updated_at
         FROM daily_steps
         WHERE user_id = $1 AND day = $2`,
        [userId, date],
      );
      const row = result.rows[0];
      return row ? toDailySteps(row) : null;
    },

    async listRange(userId, from, to) {
      const result = await db.query<DailyStepsRow>(
        `SELECT day, steps, updated_at
         FROM daily_steps
         WHERE user_id = $1 AND day BETWEEN $2 AND $3
         ORDER BY day`,
        [userId, from, to],
      );
      return result.rows.map(toDailySteps);
    },

    async delete(userId, date) {
      const result = await db.query(
        `DELETE FROM daily_steps
         WHERE user_id = $1 AND day = $2`,
        [userId, date],
      );
      return result.rowCount === 1;
    },
  };
}
```

**Reading it piece by piece:**
- **The same contract (`StepsRepository`) as the memory version.** The service can't tell which one it's using.
- **`db: Queryable`, not the `pool` directly.** The caller decides what to pass in. That's dependency injection again.
- **`db.query<DailyStepsRow>(…)`** tells TypeScript what the rows look like. **TypeScript can't check this against the real table:** if you misspell a column, you get `undefined` at runtime. Keep the row interface right next to the SQL, so mismatches are easy to spot. (Kysely in Part 7 fixes this.)
- **Multi-line SQL in template literals** is just for readability. There's **no `${…}` interpolation** anywhere: every value is a `$n` parameter.
- **`RETURNING …`** gets the stored row back in the same round trip, including values the database computed.
- **`(xmax = 0) AS created`** is a Postgres-specific trick. `xmax` is a hidden system column that's `0` on a freshly inserted row and non-zero on a row that `ON CONFLICT … DO UPDATE` just updated. It answers "was this an insert?" without a second query. It's a well-known idiom, but it *is* relying on an internal detail, so keep the comment explaining it.
- **`updated_at = EXCLUDED.updated_at`**: the timestamp comes from the **service's injected clock** (`record.updatedAt`), not from `now()` in SQL. Tests in Module 06 can then control time.
- **`result.rowCount === 1`**: how many rows the `DELETE` affected, which gives the `true`/`false` the contract promises.
- **`const row = result.rows[0]; if (!row) …`**: with `noUncheckedIndexedAccess`, `rows[0]` might be `undefined`, so TypeScript makes you handle it.

## 2.5 Swap it in: `src/server.ts`

```ts
import { pool } from "./db/pool.js";
import { createPgStepsRepository } from "./modules/steps/steps.pg-repo.js";
// ...
const stepsRepo = createPgStepsRepository(pool); // was: createMemoryStepsRepository()
const stepsService = createStepsService({ repo: stepsRepo, clock: systemClock });
// the other features keep their memory repositories until you convert them
const app = buildApp({ db: pool, stepsService /* , … */ });
```

**One line changed in the composition root, and zero lines in the service or routes.** Keep `steps.memory-repo.ts`: Module 06's unit tests use it.

## 2.6 `/health` checks the database

Add `db: Queryable` to `AppDeps`, and make the health route ask the database a trivial question:

```ts
app.route("/health").get(async (_req, res) => {
  try {
    await deps.db.query("SELECT 1");
    res.json({ status: "ok", database: "ok" });
  } catch {
    res.status(503).json({ status: "degraded", database: "unreachable" });
  }
}) // .all(...) for 405 stays as before
```

(Module 09 splits this into separate liveness and readiness checks.)

✅ **Try it**

```bash
docker compose up -d && npm run db:migrate && npm run db:seed && npm run dev
```

Rerun the steps table from Module 02 (Part 3.6): every status should match. Then:
1. **Restart the server** and `GET` your steps again. **The data survived.** That's the whole point of this module.
2. In `psql`: `SELECT * FROM daily_steps ORDER BY updated_at DESC LIMIT 3;` shows the rows your API just wrote.
3. `docker compose stop db`, then `curl -i localhost:3000/health` → **503**. `docker compose start db` → 200 again within a few seconds. The pool reconnects by itself.

```bash
git add -A && git commit -m "feat(steps): postgres repository"
```

---

# Part 3 — ⌨️ Worked example B: database errors → HTTP

## 3.1 Add a 503 error class to `src/shared/errors.ts`

```ts
export class ServiceUnavailableError extends AppError {
  constructor(detail: string) {
    super({ status: 503, slug: "service-unavailable", title: "Service unavailable", detail });
  }
}
```

## 3.2 `src/db/errors.ts`

```ts
import {
  AppError,
  ConflictError,
  ServiceUnavailableError,
  UnprocessableError,
  ValidationError,
} from "../shared/errors.js";

/** The fields we use from errors thrown by the pg library. */
export interface PgErrorLike {
  code: string;
  constraint?: string;
}

/** Postgres errors carry a 5-character SQLSTATE code like "23505"; Node network errors use names like "ECONNREFUSED". */
export function isPgErrorLike(err: unknown): err is PgErrorLike {
  return typeof err === "object" && err !== null && "code" in err && typeof err.code === "string";
}

/** Friendly messages for specific constraints, by constraint name. Add to this as you go. */
const UNIQUE_MESSAGES: Record<string, string> = {
  exercises_owner_name_unique: "An exercise with that name already exists",
  workout_sets_number_unique: "That set number already exists in this workout",
};

/**
 * Translates a database or connection error into an AppError (an HTTP-friendly error),
 * or returns null if it's something unexpected that should stay a 500.
 */
export function toAppError(err: PgErrorLike): AppError | null {
  switch (err.code) {
    case "23505": {
      const known = err.constraint ? UNIQUE_MESSAGES[err.constraint] : undefined;
      return new ConflictError(known ?? "That conflicts with existing data");
    }
    case "23503":
      return new UnprocessableError("The request refers to a record that does not exist");
    case "23514":
    case "23502":
      // Our schemas and services should have caught this first. Getting here means a
      // validation gap; the error handler logs it at warn level so we notice.
      return new ValidationError("A value is missing or outside the allowed range");
    case "22P02":
      return new ValidationError("A value has the wrong format");
    case "ECONNREFUSED":
    case "ETIMEDOUT":
    case "57P01": // the database is shutting down
    case "57P03": // the database is starting up
    case "53300": // too many connections
      return new ServiceUnavailableError("The database is temporarily unavailable");
    default:
      return null;
  }
}
```

- **Why match by constraint name?** `23505` alone tells you "something was a duplicate." The constraint name (from Module 04, where you named every constraint) tells you *what*, so the message can be specific.
- **Why not translate in each repository?** Then every repository would repeat this switch. One translation layer keeps them focused on SQL.

## 3.3 Use it in `src/middleware/error-handler.ts`

Add an import, and **replace step 2** ("Expected errors thrown by services or routes") with these two steps:

```ts
import { isPgErrorLike, toAppError } from "../db/errors.js";
// ...

  // 2. Database errors we can explain become AppErrors.
  let knownError: unknown = err;
  if (isPgErrorLike(err)) {
    const translated = toAppError(err);
    if (translated) {
      log.warn({ pgCode: err.code, constraint: err.constraint }, "database rejected the request");
      knownError = translated;
    }
  }

  // 3. Expected errors: thrown by services or routes, or translated from the database above.
  if (knownError instanceof AppError) {
    log.info({ errorName: knownError.name, status: knownError.status }, knownError.message);
    const problem: Problem = {
      type: knownError.type,
      title: knownError.title,
      status: knownError.status,
      detail: knownError.message,
    };
    if (knownError.fieldErrors) {
      problem.errors = knownError.fieldErrors;
    }
    sendProblem(req, res, problem);
    return;
  }
```

Renumber the remaining steps (body-parser errors become 4; the 500 fallback becomes 5).

✅ **Try it**

```bash
# 1. A foreign key violation: delete the dev user in psql first:
#    DELETE FROM users WHERE id = '00000000-0000-4000-8000-000000000001';
curl -i -X PUT localhost:3000/v1/steps/2026-10-11 -H 'Content-Type: application/json' -d '{"steps":9412}'
#    → 422, and a warn log line with pgCode 23503 and constraint daily_steps_user_id_fkey
npm run db:seed    # put the dev user back

# 2. Database down
docker compose stop db
curl -i localhost:3000/v1/steps/2026-10-11    # → 503 "The database is temporarily unavailable"
docker compose start db
```

---

# Part 4 — ⌨️ Worked example C: transactions

## 4.1 `src/db/transaction.ts`

```ts
import type pg from "pg";

/**
 * Runs `work` inside one database transaction, on one dedicated connection.
 * If `work` throws, everything it did is rolled back and the error is re-thrown.
 */
export async function withTransaction<T>(
  pool: pg.Pool,
  work: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect(); // borrow ONE connection for the whole transaction
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // The connection itself is broken. The original error is the one worth reporting.
    }
    throw error;
  } finally {
    client.release(); // ALWAYS give the connection back to the pool
  }
}
```

- **`<T>`** makes it generic: whatever `work` returns, `withTransaction` returns too.
- **`finally` always runs:** after a commit, after a rollback, and even if `ROLLBACK` itself throws. Forgetting `release()` leaks a connection, and after `DB_POOL_MAX` leaks, your server hangs (1.2).
- **`work` receives the client.** Anything that should be part of the transaction must use *that* client, not the pool.

## 4.2 🧪 Rollback lab

Create `src/playground/transaction-lab.ts`:

```ts
import { pool } from "../db/pool.js";
import { withTransaction } from "../db/transaction.js";
import { createPgStepsRepository } from "../modules/steps/steps.pg-repo.js";
import { DEV_USER_ID } from "../shared/dev-user.js";

const now = new Date().toISOString();

try {
  await withTransaction(pool, async (client) => {
    // The SAME repository code, but running on the transaction's client
    const steps = createPgStepsRepository(client);
    await steps.upsert(DEV_USER_ID, { date: "2026-09-01", steps: 5000, updatedAt: now });
    await steps.upsert(DEV_USER_ID, { date: "2026-09-02", steps: -1, updatedAt: now }); // violates the CHECK
  });
} catch (error) {
  console.log("Transaction failed:", error instanceof Error ? error.message : error);
}

const check = await pool.query<{ count: number }>(
  "SELECT count(*) AS count FROM daily_steps WHERE user_id = $1 AND day IN ('2026-09-01', '2026-09-02')",
  [DEV_USER_ID],
);
console.log("Rows written:", check.rows[0]?.count); // expect 0: the first upsert was rolled back too

await pool.end();
```

```bash
npx tsx --env-file=.env src/playground/transaction-lab.ts
# Transaction failed: new row for relation "daily_steps" violates check constraint "daily_steps_steps_range"
# Rows written: 0
```

Now change `withTransaction(pool, async (client) => …)` to run the two upserts directly on `pool` (no transaction) and run it again. You'll get **1** row written. In the tracker, write down what that difference would mean for a workout and its sets.

---

# Part 5 — 🧰 Toolbox

## 5.1 Building a WHERE clause from optional filters (safely)

```ts
const conditions: string[] = ["user_id = $1"];
const values: unknown[] = [userId];

if (opts.kind !== undefined) {
  values.push(opts.kind);
  conditions.push(`kind = $${values.length}`);          // → "kind = $2"
}
if (opts.fromInclusive !== undefined) {
  values.push(opts.fromInclusive);
  conditions.push(`started_at >= $${values.length}`);   // → "started_at >= $3"
}

const direction = opts.order === "asc" ? "ASC" : "DESC";     // a literal from YOUR code, never from input
values.push(opts.limit);
const sql = `
  SELECT id, kind, started_at, ended_at, distance_m, notes, created_at, updated_at
  FROM workouts
  WHERE ${conditions.join(" AND ")}
  ORDER BY started_at ${direction}, id ${direction}
  LIMIT $${values.length}`;
```

The `${…}` here only ever inserts **text you wrote** (`"kind = $2"`, `"ASC"`), never a client value. Client values only go into `values`.

## 5.2 Keyset (cursor) pagination in SQL

Module 02's "strictly after the cursor" rule becomes a **row comparison**:

```sql
-- newest first, continuing after the cursor (cursorStartedAt, cursorId)
WHERE user_id = $1
  AND (started_at, id) < ($2, $3)
ORDER BY started_at DESC, id DESC
LIMIT $4

-- oldest first: flip to > and ASC
```

`(a, b) < (x, y)` means `a < x OR (a = x AND b < y)`, exactly the tie-breaker rule. The index `(user_id, started_at DESC, id DESC)` serves both the filter and the order. (This exact query was tested in the performance lab: it's an `Index Only Scan`.)

## 5.3 One query for many IDs

```ts
const result = await db.query<SetRow>(
  `SELECT … FROM workout_sets
   WHERE workout_id = ANY($1::uuid[])
   ORDER BY workout_id, set_number`,
  [workoutIds],                       // a JS array becomes a Postgres array
);

// Group them in code
const setsByWorkout = new Map<string, WorkoutSet[]>();
for (const row of result.rows) {
  const list = setsByWorkout.get(row.workout_id) ?? [];
  list.push(toWorkoutSet(row));
  setsByWorkout.set(row.workout_id, list);
}
```

## 5.4 Partial updates: only the columns that were sent

```ts
const assignments: string[] = [];
const values: unknown[] = [];

if (Object.hasOwn(patch, "notes")) {
  values.push(patch.notes);                     // may be null: that clears the column
  assignments.push(`notes = $${values.length}`);
}
// … one block per updatable column …
values.push(updatedAt);
assignments.push(`updated_at = $${values.length}`);

values.push(id, userId);
const sql = `UPDATE workouts SET ${assignments.join(", ")}
             WHERE id = $${values.length - 1} AND user_id = $${values.length}
             RETURNING …`;
```

**Simpler alternative:** your service already builds the full *merged* workout (Module 02) and validates it. The repository can update *every* column from that merged object. That's fine as long as the service read the row inside the same transaction (or you use optimistic concurrency, 5.6), so it isn't writing back stale values. Pick one approach and note it in the decisions log.

## 5.5 Unit of work: transactions without leaking `pg` into services

Services must not import `pg` (the dependency rule). So give them a **function that runs work in a transaction** and hands over transaction-bound repositories:

```ts
// src/modules/workouts/workouts.transaction.ts
import type pg from "pg";
import { withTransaction } from "../../db/transaction.js";

export interface WorkoutWriteRepos {
  workouts: WorkoutsRepository;
  sets: SetsRepository;
}

/** Runs `work` atomically. Services depend on this TYPE only. */
export type RunWorkoutTransaction = <T>(work: (repos: WorkoutWriteRepos) => Promise<T>) => Promise<T>;

/** Postgres version: real transaction. */
export function createPgWorkoutTransaction(pool: pg.Pool): RunWorkoutTransaction {
  return (work) =>
    withTransaction(pool, (client) =>
      work({ workouts: createPgWorkoutsRepository(client), sets: createPgSetsRepository(client) }),
    );
}

/** Memory version (for unit tests): no real atomicity, same shape. */
export function createMemoryWorkoutTransaction(repos: WorkoutWriteRepos): RunWorkoutTransaction {
  return (work) => work(repos);
}
```

```ts
// In the service: no pg anywhere
const created = await deps.runInTransaction(async (repos) => {
  const workout = await repos.workouts.create(record);
  for (const set of sets) {
    await repos.sets.create({ ...set, workoutId: workout.id });
  }
  return workout;
});
```

## 5.6 Optimistic concurrency

```sql
-- migration: ALTER TABLE workouts ADD COLUMN version integer NOT NULL DEFAULT 1;

UPDATE workouts
SET notes = $1, version = version + 1, updated_at = $2
WHERE id = $3 AND user_id = $4 AND version = $5
RETURNING …;
-- 0 rows → either it doesn't exist (404), or someone changed it first (conflict)
```

The HTTP side: `GET` returns `ETag: "3"` (the version). The client sends `If-Match: "3"` with its `PATCH`. If the version moved on, respond **`412 Precondition Failed`**, and the client re-fetches and re-applies its change.

## 5.7 Useful SQL for stats

```sql
-- The Monday of an ISO week ("2026-W42" → 2026-10-12)
to_date('2026-42', 'IYYY-IW')

-- An instant's local date / week for a user
(started_at AT TIME ZONE u.timezone)::date
date_trunc('week', started_at AT TIME ZONE u.timezone)

-- Estimated one-rep max (Epley formula)
weight_kg * (1 + reps / 30.0)

-- Conditional aggregates
count(*) FILTER (WHERE kind = 'run')
sum(distance_m) FILTER (WHERE kind = 'run')
```

## 5.8 Watching every query (for N+1 detection)

Make Postgres log every statement it receives. Add to the `db` service in `docker-compose.yml`:

```yaml
    command: ["postgres", "-c", "log_statement=all"]
```

Then `docker compose up -d` (it recreates the container; your data volume stays) and `docker compose logs -f db` while you send a request. Remove the line when you're done; it's noisy.

---

# Part 6 — 🧩 Challenges

For each repository: **same interface as the memory version → row interface + mapping function → one method at a time → swap it in `server.ts` → rerun that feature's Module 02 acceptance tests.**

## Challenge 1: Exercises on Postgres ★★☆

`src/modules/exercises/exercises.pg-repo.ts`, implementing your `ExercisesRepository`.

- Built-ins now come from the migration (`user_id IS NULL`), not from the memory seed list.
- "Visible to this user" means `user_id IS NULL OR user_id = $1`.
- Case-insensitive name lookups use `lower(name) = lower($2)`.
- **Keep the service's duplicate check** (for the friendly message and the built-in clash), but now the **unique index is the real guarantee**. When two requests race, the second gets `23505`, which Part 3 translates to 409.

✅ **Acceptance:** all Module 02 + 03 exercises tests pass with Postgres. Create a custom exercise, restart the server, and it's still there.

<details><summary>💡 Hint 1</summary>

Copy the structure of `steps.pg-repo.ts`. The tricky bit is NULL: `user_id = NULL` is never true (Module 04, 1.9). Use `user_id IS NULL`.
</details>

<details><summary>💡 Hint 2</summary>

Your record type has `ownerId: string | null`; the column is `user_id`. Map it in `toExerciseRecord(row)`. For `update`, return the row with `RETURNING`, and return `null` if no row matched.
</details>

---

## Challenge 2: Workouts on Postgres, with SQL pagination ★★★

`src/modules/workouts/workouts.pg-repo.ts`.

1. Every method from your Module 02 interface, all scoped by `user_id`.
2. **`list(userId, opts)`** builds its `WHERE` from the optional filters (toolbox 5.1) and uses **keyset pagination** (5.2). It still returns `limit + 1` rows when asked, so your route's `nextCursor` logic doesn't change.
3. **The index:** write `migrations/006_workouts_list_index.sql`:
   ```sql
   CREATE INDEX workouts_user_started_idx ON workouts (user_id, started_at DESC, id DESC);
   ```

✅ **Acceptance:** every Module 02 Challenge 4 pagination test passes against Postgres, including the mid-scroll insert and the same-`startedAt` tie test. In `psql`, `EXPLAIN` your list query for the dev user: you should see `workouts_user_started_idx` in the plan.

<details><summary>💡 Hint 1</summary>

Write the query by hand in `psql` first, with literal values, until it returns the right rows. Then turn each literal into a `$n` placeholder.
</details>

<details><summary>💡 Hint 2</summary>

The cursor condition is just another optional filter: `if (opts.after) { values.push(opts.after.startedAt, opts.after.id); conditions.push(\`(started_at, id) ${op} ($${values.length - 1}, $${values.length})\`); }` where `op` is `<` for descending and `>` for ascending, chosen in code.
</details>

<details><summary>💡 Hint 3: watch out</summary>

`from`/`to` from Module 02 are UTC days. Pass them as instants (`"2026-09-01T00:00:00.000Z"`), and compare `started_at >= $n` and `started_at < $m` (exclusive end). Don't wrap `started_at` in a function in the `WHERE`; that can prevent the index from being used.
</details>

---

## Challenge 3: Sets on Postgres, and deletes in a transaction ★★☆

`src/modules/sets/sets.pg-repo.ts`, plus the unit of work from toolbox 5.5 (`workouts.transaction.ts`).

- **Next set number:** `SELECT coalesce(max(set_number), 0) + 1 FROM workout_sets WHERE workout_id = $1`. Note that two concurrent "add set" requests could compute the same number. The `UNIQUE (workout_id, set_number)` constraint turns that into a 409 instead of a duplicate. Mention this in your notes.
- **Deleting a workout:** the database now cascades to its sets (`ON DELETE CASCADE`). Decide whether your service still deletes sets explicitly (needed for the memory repository) and, if so, run both deletes through `runInTransaction`.
- **Deleting an exercise that's in use** (Module 02 rule): `countByExercise` can now be a `SELECT EXISTS (…)` query. The deferred FK from Module 04 is the backstop.

✅ **Acceptance:** all Module 02 sets tests and cross-feature rules pass against Postgres.

---

## Challenge 4: Atomic "workout + sets" creation ★★★

Extend `POST /v1/workouts` to accept an optional `sets` array (only for `strength` workouts):

```json
{
  "kind": "strength",
  "startedAt": "2026-10-12T18:00:00-07:00",
  "sets": [
    { "exerciseId": "…", "reps": 5, "weightKg": 100 },
    { "exerciseId": "…", "reps": 5, "weightKg": 100 },
    { "exerciseId": "…", "reps": 5, "weightKg": 102.5 }
  ]
}
```

- **Schema:** reuse `CreateSetBody` for each item, max 50 sets. Set numbers are assigned in order (1, 2, 3…).
- **Service:** all the rules from Modules 02–03 still apply, to the workout *and* to each set.
- **Atomicity:** create the workout and all its sets inside `runInTransaction` (toolbox 5.5).
- **Response:** 201 with the workout, plus a `sets` array.

✅ **Acceptance**

1. A valid request with 3 sets → 201, and `GET .../sets` shows all 3.
2. **The proof:** make the 3rd set reference an exercise ID that doesn't exist (a valid UUID). → 422, **and no workout was created**. Check in `psql` that `SELECT count(*) FROM workouts` didn't change.
3. `sets` on a `run` → 409, and nothing created.

<details><summary>💡 Hint 1</summary>

The service needs a new dependency: `runInTransaction: RunWorkoutTransaction`. Wire the Postgres version in `server.ts`, and keep a memory version for tests.
</details>

<details><summary>💡 Hint 2</summary>

Validate everything you can *before* opening the transaction (schemas, kinds, the exercise IDs exist). Then do only the writes inside it. Short transactions hold locks and connections for less time.
</details>

---

## Challenge 5: Stats and records endpoints ★★★

Create a **stats** feature (`src/modules/stats/`: repository, service, routes). All the heavy lifting happens in SQL (1.12). Use the **user's timezone** from `users.timezone`.

| Endpoint | Returns |
|---|---|
| `GET /v1/stats/steps?from=&to=` | Every day in the range (max 366), **zero-filled**, with `goalMet: boolean` using the user's goal: `{ data: [{ date, steps, goalMet }], goal }` |
| `GET /v1/stats/weekly?week=2026-W42` | For that ISO week in the user's timezone: `{ week, totalSteps, avgSteps, workouts: { strength, run, walk, cycle, other }, runKm, liftingVolumeKg }` |
| `GET /v1/records` | Per exercise: heaviest set (`weightKg`, `reps`, `date`) and best estimated 1RM (Epley), sorted by exercise name |

- `week` is validated with a schema: `/^\d{4}-W\d{2}$/`.
- Workouts belong to the week by their **local** start date.
- Exercises you've never done don't appear in `/v1/records`.

✅ **Acceptance:** compare each endpoint's numbers with your Module 04 kata queries on the same seed data. They must match exactly. Write the comparison in the tracker.

<details><summary>💡 Hint 1</summary>

Your kata queries #2–#6 are 80% of this. Toolbox 5.7 has the ISO-week, timezone, Epley, and `FILTER` pieces.
</details>

<details><summary>💡 Hint 2</summary>

For the weekly stats, compute the week's Monday in SQL (`to_date(…, 'IYYY-IW')`), then select workouts where the local start date is between that Monday and Monday + 6. A CTE for "this user's timezone and the week's bounds" keeps the main query readable. Several smaller queries (steps, workouts, volume) run with `Promise.all` are also perfectly fine.
</details>

---

## Challenge 6: Performance lab ★★☆

1. Copy this into `sql/perf-data.sql` and run it **against your local database only** (`\i sql/perf-data.sql` in `psql`). It takes about 10–30 seconds.

   ```sql
   -- sql/perf-data.sql: fake load for the performance lab. Run it ONLY against your local database.
   -- 1,000 fake users
   INSERT INTO users (email, display_name, timezone)
   SELECT 'perf' || n || '@example.com', 'Perf user ' || n, 'America/Los_Angeles'
   FROM generate_series(1, 1000) AS n;

   -- 1,000 days of steps per fake user = 1,000,000 rows
   INSERT INTO daily_steps (user_id, day, steps)
   SELECT u.id, DATE '2026-10-01' - d, (random() * 15000)::int
   FROM users u
   CROSS JOIN generate_series(0, 999) AS d
   WHERE u.email LIKE 'perf%@example.com';

   -- 500 runs per fake user = 500,000 rows
   INSERT INTO workouts (user_id, kind, started_at, ended_at, distance_m)
   SELECT u.id, 'run', t.started_at, t.started_at + interval '35 minutes', (3000 + random() * 7000)::int
   FROM users u
   CROSS JOIN LATERAL (
     SELECT now() - make_interval(days => n) - random() * interval '12 hours' AS started_at
     FROM generate_series(1, 500) AS n
   ) AS t
   WHERE u.email LIKE 'perf%@example.com';

   -- Refresh the planner's statistics so EXPLAIN reflects the new data
   ANALYZE;
   ```

2. **To see the "before" plan,** temporarily drop the index: `DROP INDEX workouts_user_started_idx;`.
3. For each query below, run `EXPLAIN (ANALYZE, BUFFERS)` for one perf user (`SELECT id FROM users WHERE email = 'perf500@example.com'`), record it, add or restore the index, `ANALYZE`, and run it again:
   - Your workouts list query (first page and a later page with a cursor)
   - Your steps range query (*surprise:* which index does it already use, and why?)
   - Your weekly stats queries
   - Your "is this exercise used by any set?" query (`workout_sets.exercise_id` has no index yet; write `007_workout_sets_exercise_index.sql`)
4. Fill in the tracker table.

✅ **Done when:** every endpoint query has a supporting index shown by `EXPLAIN`, and you can explain each "before" plan line by line.

<details><summary>💡 Hint</summary>

For the steps query, look for `daily_steps_pkey` in the plan. A primary key **is** an index, and `(user_id, day)` is exactly the right column order for "this user, these days." Check which FK columns are already the first column of an existing index (a PK or UNIQUE) before adding new ones.
</details>

When you're finished, remove the fake users: `DELETE FROM users WHERE email LIKE 'perf%@example.com';` (the cascades clean up the rest).

---

## Challenge 7: Find and fix an N+1 ★★☆

1. Add `?include=sets` to `GET /v1/workouts`. Implement it the obvious way first: loop over the workouts and fetch each one's sets.
2. Turn on statement logging (toolbox 5.8), request a page of 20 strength workouts, and **count the queries** in the logs. Record the number.
3. Fix it with `ANY($1::uuid[])` and grouping in code (toolbox 5.3). Count again.

✅ **Done when:** the number of queries is the same for 1 workout and for 100.

---

## Challenge 8: Concurrency lab ★★☆ (with a stretch)

**Part A: watch a lost update happen.** Open **two** `psql` sessions (two terminals).

| Step | Session 1 | Session 2 |
|---|---|---|
| 1 | `BEGIN;` | `BEGIN;` |
| 2 | `SELECT notes, distance_m FROM workouts WHERE id = '<id>';` | (same) |
| 3 | `UPDATE workouts SET notes = 'from laptop', distance_m = 5000 WHERE id = '<id>';` | |
| 4 | | `UPDATE workouts SET notes = 'easy', distance_m = 5200 WHERE id = '<id>';` ← **it waits!** Why? |
| 5 | `COMMIT;` | (now it continues) `COMMIT;` |
| 6 | `SELECT notes, distance_m …` | |

Write down: what did session 2 wait for? Whose `notes` survived? Whose distance? Which value was "lost"?

**Part B: the atomic fix.** Repeat with each session updating **only its own column**. What's different?

**Stretch: optimistic concurrency.** Add `version` (toolbox 5.6) with a migration. `GET /v1/workouts/:id` returns `ETag: "<version>"`. `PATCH` with `If-Match` → 412 when stale, and `PATCH` without `If-Match` still works.

---

# Part 7 — Kysely: type-safe SQL

## 7.1 ⌨️ Worked example: steps on Kysely

```bash
npm install kysely
```

**`src/db/kysely.ts`:**

```ts
import { Kysely, PostgresDialect, type Generated } from "kysely";
import { pool } from "./pool.js";

/** The database tables, written by hand so you can see exactly what Kysely knows. */
export interface DailyStepsTable {
  user_id: string;
  day: string; // DATE kept as "YYYY-MM-DD" by our pg type parser
  steps: number;
  updated_at: Generated<Date>; // Generated = the database can fill it in (DEFAULT now())
}

export interface Database {
  daily_steps: DailyStepsTable;
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});
```

**`src/modules/steps/steps.kysely-repo.ts`:**

```ts
import { sql, type Kysely } from "kysely";
import type { Database } from "../../db/kysely.js";
import type { StepsRepository } from "./steps.repository.js";
import type { DailySteps } from "./steps.types.js";

function toDailySteps(row: { day: string; steps: number; updated_at: Date }): DailySteps {
  return { date: row.day, steps: row.steps, updatedAt: row.updated_at.toISOString() };
}

export function createKyselyStepsRepository(db: Kysely<Database>): StepsRepository {
  return {
    async upsert(userId, record) {
      const row = await db
        .insertInto("daily_steps")
        .values({
          user_id: userId,
          day: record.date,
          steps: record.steps,
          updated_at: new Date(record.updatedAt),
        })
        .onConflict((conflict) =>
          conflict.columns(["user_id", "day"]).doUpdateSet((eb) => ({
            steps: eb.ref("excluded.steps"),
            updated_at: eb.ref("excluded.updated_at"),
          })),
        )
        .returning(["day", "steps", "updated_at", sql<boolean>`xmax = 0`.as("created")])
        .executeTakeFirstOrThrow();
      return { record: toDailySteps(row), created: row.created };
    },

    async findByDate(userId, date) {
      const row = await db
        .selectFrom("daily_steps")
        .select(["day", "steps", "updated_at"])
        .where("user_id", "=", userId)
        .where("day", "=", date)
        .executeTakeFirst();
      return row ? toDailySteps(row) : null;
    },

    async listRange(userId, from, to) {
      const rows = await db
        .selectFrom("daily_steps")
        .select(["day", "steps", "updated_at"])
        .where("user_id", "=", userId)
        .where("day", ">=", from)
        .where("day", "<=", to)
        .orderBy("day")
        .execute();
      return rows.map(toDailySteps);
    },

    async delete(userId, date) {
      const result = await db
        .deleteFrom("daily_steps")
        .where("user_id", "=", userId)
        .where("day", "=", date)
        .executeTakeFirst();
      return result.numDeletedRows === 1n;
    },
  };
}
```

**What you gained:**
- **Misspell a column** (`"stpes"`) and TypeScript errors *before you run anything*. The raw SQL version would quietly return `undefined`.
- **The result type is inferred** from your `select([...])`: no hand-written row interface.
- **It's still SQL.** Each method reads like the query it produces. To see the exact SQL, call `.compile()` on the query instead of `.execute()`, and log `compiled.sql` and `compiled.parameters`.
- **Escape hatch:** `sql\`…\`` for anything Kysely doesn't model (like the `xmax` trick). Values interpolated into the `sql` tag (`sql\`… ${value} …\``) become **parameters**, not text, so they're still injection-safe.
- **`1n`** is a BigInt literal: Kysely reports affected-row counts as `bigint`.
- **Transactions:** `await db.transaction().execute(async (trx) => { … })` hands you `trx`, which you pass to repositories exactly like the `client` in `withTransaction`.

**Generating the `Database` interface:** writing table types by hand is great for learning, but in a real project you'd generate them from the live schema with `kysely-codegen`. If you do, check what it generates for `date` and `numeric` columns: they must match the type parsers in `pool.ts`.

## 7.2 🧩 Challenge 9: Convert one more repository ★★☆

Add `exercises` to the `Database` interface and write `exercises.kysely-repo.ts`. Swap it in, and rerun the exercises tests. Then **write in the tracker:** which version (raw or Kysely) would you rather debug at 2am, and which would you rather refactor? You may convert the rest, or keep raw SQL for them. Record the decision.

```bash
git add -A && git commit -m "feat(db): postgres repositories, transactions, stats, indexes"
```

---

## Definition of done

- [ ] Every feature runs on Postgres; data survives restarts.
- [ ] `grep -rn '\${' src --include=*.pg-repo.ts` shows interpolation only of code-controlled text (placeholder numbers, `ASC`/`DESC`, joined condition lists), never of values.
- [ ] Creating a workout with sets is all-or-nothing (Challenge 4's proof passes).
- [ ] Database errors produce 409, 422, 400, or 503 as appropriate, never a 500.
- [ ] Every endpoint query has a supporting index, shown by `EXPLAIN`.
- [ ] Listing workouts with sets uses a constant number of queries.
- [ ] The stats endpoints match your kata queries.
- [ ] The memory repositories still exist and still pass their tests (Module 06 needs them).

---

## ✍️ Checkpoint

1. Why use a connection pool? What happens if the pool max is 10 and 50 requests that each need the database arrive at once? What makes it get worse?
2. Show why this is vulnerable, and fix it: ``pool.query(`SELECT * FROM workouts WHERE kind = '${kind}'`)``. How do you safely support `?sort=-startedAt`?
3. Why can't you run a transaction with `pool.query("BEGIN")` followed by `pool.query("INSERT …")`? What does `withTransaction` do differently, and why is `release()` in `finally`?
4. Two phones sync steps for the same day at the same instant. Walk through what happens with (a) SELECT-then-INSERT/UPDATE in app code and (b) `INSERT … ON CONFLICT`.
5. Describe the lost-update problem using your laptop and watch editing the same workout, and give two different fixes.
6. Your main query is `WHERE user_id = $1 ORDER BY started_at DESC, id DESC LIMIT 20`. What index do you create, and why that column order? Would `(started_at, user_id)` work as well?
7. Postgres doesn't index foreign key columns automatically. Which of your FKs already had an index (and from what), and which needed a new one?
8. What is N+1? How did you detect it in Challenge 7, and how did you fix it?
9. An `EXPLAIN` shows `Seq Scan on workouts … Filter: (user_id = …) Rows Removed by Filter: 499500`. What does it tell you, and what do you do?
10. Why does `pool.ts` override the parsers for `date`, `numeric`, and `bigint`? Describe the bug the `date` parser prevents.

**Explain it back:** Raw SQL vs. query builder vs. ORM: when would you choose each, and why did this course choose the order it did? Use what you noticed in Challenge 9.

---

## 📋 Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Progress
- [ ] Part 1: Concepts read (1.1–1.13)
- [ ] Part 2: Pool + Postgres steps repo; data survives restart
- [ ] Part 3: Database error translation
- [ ] Part 4: `withTransaction` + rollback lab
- [ ] Challenge 1: Exercises on Postgres
- [ ] Challenge 2: Workouts on Postgres + SQL pagination + index
- [ ] Challenge 3: Sets on Postgres + transactional deletes
- [ ] Challenge 4: Atomic workout + sets
- [ ] Challenge 5: Stats and records
- [ ] Challenge 6: Performance lab
- [ ] Challenge 7: N+1
- [ ] Challenge 8: Concurrency lab
- [ ] Challenge 9: Kysely conversion
- [ ] Checkpoint passed (≥ 8/10)

### Concepts I can explain without notes
- [ ] Connections and pooling; what exhaustion looks like (1.1–1.2)
- [ ] Parameterized queries; why identifiers can't be parameters (1.3)
- [ ] Type mapping pitfalls (1.4) and row mapping (1.5)
- [ ] Transactions, ACID, and one connection per transaction (1.6)
- [ ] Check-then-act and lost updates, and their fixes (1.7)
- [ ] Database error translation (1.8)
- [ ] Index design and column order (1.9)
- [ ] Reading EXPLAIN ANALYZE (1.10)
- [ ] N+1 (1.11)
- [ ] Why aggregations belong in SQL (1.12)
- [ ] Raw vs. builder vs. ORM (1.13)

### Rollback lab (Part 4.2)
| Version | Rows written | What it would mean for a workout + sets |
|---|---|---|
| With transaction | | |
| Without | | |

### Performance lab results (Challenge 6)
| Query | Before: plan / ms | Index added | After: plan / ms |
|---|---|---|---|
| Workouts list (page 1) | | | |
| Workouts list (cursor page) | | | |
| Steps range | | | |
| Weekly stats | | | |
| Exercise-in-use check | | | |

### N+1 (Challenge 7)
| Version | Queries for 20 workouts |
|---|---|
| Naive | |
| Fixed | |

### Stats vs. kata (Challenge 5)
| Endpoint | Kata query # | Match? |
|---|---|---|
| | | |

### Concurrency lab notes (Challenge 8)
—

### Raw vs. Kysely reflection (Challenge 9)
—

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
- node-postgres (pooling, queries, transactions, types): https://node-postgres.com/
- Using EXPLAIN: https://www.postgresql.org/docs/current/using-explain.html
- Use The Index, Luke (index design, keyset pagination): https://use-the-index-luke.com/
- Transaction isolation: https://www.postgresql.org/docs/current/transaction-iso.html
- Row comparisons: https://www.postgresql.org/docs/current/functions-comparisons.html#ROW-WISE-COMPARISON
- Kysely: https://kysely.dev/
