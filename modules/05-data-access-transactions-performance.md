# Module 05: Data Access, Transactions & Performance

> 📝 **Outline version.** This module currently holds the syllabus: topics, milestone, and checkpoint. The 🎓 tutor prompt below expands it to full depth automatically the first time you use it (or ask Claude to **"Expand Module 05 to full depth"**). You'll get the same structure as Modules 01–02: in-depth reading, type-along setup, a complete worked example for each new pattern, a toolbox, and challenges with acceptance tests and hints. The "Build" list below shows what you'll build; the expanded version teaches you how.

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | 📝 Outline (expand before starting) |
| **Estimated time** | 10–12 hours |
| **Prerequisites** | Module 04 |
| **Project milestone** | Postgres-backed repositories, atomic "workout + sets" creation, stats and PR endpoints, indexes proven with `EXPLAIN ANALYZE`, migration to Kysely |

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
2b. This module is marked 📝 Outline. Before teaching, expand it to full depth by following "Expanding an outline module" in COURSE.md §8 (same structure as Modules 01–02: in-depth reading, type-along setup, one worked example per new pattern, toolbox, challenges with acceptance tests and 3-level hints, checkpoint, tracker). Read the previous module's tracker for my weak spots and address them. Give me the expanded file (or write it if you can edit files), then begin teaching from Part 1.
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

## Why this matters
This is where the API meets real data. Most backend bugs that lose or corrupt data come from this layer: injection, partial writes, race conditions, and queries that are fine with 100 rows but fall over at 1 million.

## Learning objectives
- Use a connection pool correctly.
- Write injection-proof queries and explain why they're safe.
- Implement repositories behind the interfaces from M2 and swap them in via a composition root.
- Use transactions for multi-step writes, and reason about concurrent updates.
- Map database errors to HTTP responses.
- Design indexes from your queries, and verify them with `EXPLAIN ANALYZE`.
- Detect and fix N+1 queries.
- Explain raw SQL vs query builder vs ORM, and migrate to Kysely.

---

## Learn

### 5.1 Connections and pooling
- Opening a Postgres connection costs a TCP handshake, authentication, and a dedicated server process. That's far too slow to do per request.
- `pg.Pool` keeps a set of open connections and lends them out. Create **one pool per process**, sized deliberately (start around 10).
- If every connection is busy, new queries **wait** in a queue. Pool exhaustion shows up as latency spikes and timeouts, not errors.
- `pool.query()` borrows and returns a connection automatically. `pool.connect()` gives you a client you **must** `release()`, even on error (use `try/finally`).
- Close the pool on shutdown (M9).

### 5.2 SQL injection
```ts
// ❌ The client sends kind = "run' OR '1'='1"
await pool.query(`SELECT * FROM workouts WHERE kind = '${kind}'`);

// ✅ Parameterized: values travel separately from the SQL text, so they can never become SQL
await pool.query("SELECT * FROM workouts WHERE user_id = $1 AND kind = $2", [userId, kind]);
```
Identifiers (column names, sort direction) **can't** be parameters. Map whitelisted API values to fixed SQL fragments (this is the M2 sort-whitelist paying off).

### 5.3 Repositories and the composition root
- The SQL stays inside repositories. Map rows (`started_at`) to domain objects (`startedAt`) in one place.
- **Composition root:** `buildApp({ workoutRepo, stepsRepo, … })` wires dependencies together. Production passes the Postgres repositories; unit tests (M6) pass the in-memory ones. This is dependency injection with no framework, just function parameters.

### 5.4 Transactions
Logging a lifting session = 1 workout row + N set rows. If set #3 fails, you must not keep a half-logged workout.
```ts
const client = await pool.connect();
try {
  await client.query("BEGIN");
  // insert the workout, then each set, all with `client`
  await client.query("COMMIT");
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  client.release();
}
```
- **Every statement in a transaction must use the same client.** `pool.query` might hand each statement a different connection.
- Wrap this in a `withTransaction(async (tx) => …)` helper.
- **ACID:** Atomic (all or nothing), Consistent (constraints hold), Isolated (concurrent transactions don't see each other's partial work), Durable (committed means it survives a crash).

### 5.5 Concurrency
- Postgres defaults to **READ COMMITTED**: each statement sees data committed before it started.
- **Check-then-act races:** "SELECT to see if the steps row exists, then INSERT or UPDATE" breaks when two requests run at the same time. Fix it with a constraint plus `INSERT … ON CONFLICT`, letting the DB arbitrate.
- **Lost updates:** your laptop and your watch both read a workout, both edit it, and the last write silently wins. Fixes:
  - Make updates **atomic in SQL** (`SET steps = steps + $1`) when the operation allows it.
  - **Optimistic concurrency:** add a `version` column. `UPDATE … WHERE id = $1 AND version = $2`, and if 0 rows were updated, someone else got there first → `412 Precondition Failed` (paired with `If-Match`/ETag) or `409`.
  - **Pessimistic locking:** `SELECT … FOR UPDATE` inside a transaction. Use it sparingly.
- Stricter isolation levels (REPEATABLE READ, SERIALIZABLE) exist. Read about them, and know when you'd reach for them.

### 5.6 Mapping database errors
Handle this in one place in the data layer:

| SQLSTATE | Meaning | Typical HTTP |
|---|---|---|
| `23505` | unique_violation | 409 Conflict |
| `23503` | foreign_key_violation | 404 or 422 (e.g., a set references an unknown exercise) |
| `23514` | check_violation | 400/422 (it means your app validation missed something; log it) |
| `23502` | not_null_violation | 400, or a bug |

Anything else → let it fall through to a 500.

### 5.7 Indexes
- Without an index, `WHERE user_id = $1 ORDER BY started_at DESC LIMIT 20` scans the whole table and then sorts it.
- A **B-tree index** on `(user_id, started_at DESC)` lets Postgres jump straight to your rows, already in order, and stop after 20.
- **Column order matters:** put equality columns first, then range/sort columns. `(started_at, user_id)` would be much worse for this query.
- **Postgres does not index foreign key columns automatically.** `workout_sets.workout_id` needs an index, or every "sets for this workout" lookup and every cascade delete scans the table.
- **Indexes cost writes and disk.** Add them for real queries, not "just in case."
- Read plans with `EXPLAIN (ANALYZE, BUFFERS)`. Learn to recognize Seq Scan vs Index Scan vs Index Only Scan, estimated vs actual rows, and where the time goes.

### 5.8 The N+1 problem
Listing 20 workouts, then querying sets for each one, is **21 round trips**. It's invisible at 2 workouts and painful at 200.
Fixes:
- One query for the workouts, then one query for all their sets (`WHERE workout_id = ANY($1)`), stitched together in code.
- Or a `JOIN`, possibly with `json_agg` to build nested results in SQL.

Detect it by logging query counts per request in dev.

### 5.9 Raw SQL vs query builder vs ORM
| | Raw SQL (`pg`) | Query builder (Kysely) | ORM (Prisma, TypeORM) |
|---|---|---|---|
| Control and transparency | Total | High: you still think in SQL | Lower: SQL is generated |
| Type safety | Manual | Strong (types generated from the DB) | Strong |
| Complex queries | Natural | Good, with a raw `sql` escape hatch | Often awkward |
| Learning value | Highest | High | Lowest for SQL skills |

Plan: write raw SQL first, then migrate to **Kysely** with types generated by `kysely-codegen`. Keep a complex stats query as raw `sql\`…\`` if it reads better that way.

### 5.10 Aggregations belong in the database
Weekly summaries, PRs, and streaks should be computed **in SQL**. Pulling 3 years of rows into Node to `reduce()` them wastes memory and network and blocks the event loop (M1). Send the question to the data, not the data to the question.

---

## Build

- [ ] **B1** Write `src/db/pool.ts`: one pool from config. `/health` now runs `SELECT 1`. (M9 splits this into liveness and readiness.)
- [ ] **B2** Write Postgres repositories for steps, workouts, exercises, and sets using raw parameterized SQL. Swap them in via the composition root, and keep the in-memory repositories for tests.
- [ ] **B3** Write the `withTransaction` helper. `POST /v1/workouts` now accepts an optional `sets` array and creates everything atomically. **Prove it:** make the 3rd set invalid, and confirm that nothing was written.
- [ ] **B4** Map SQLSTATE codes to `AppError`s in one place.
- [ ] **B5** Build stats endpoints (in SQL):
  - `GET /v1/stats/steps?from=&to=`: daily steps with zero-filled gaps, plus goal met / not met.
  - `GET /v1/stats/weekly?week=2026-W41`: total steps, workouts by kind, run km, lifting volume.
  - `GET /v1/records`: heaviest set per exercise, plus estimated 1RM using Epley (`weight × (1 + reps/30)`).
- [ ] **B6** **Performance lab:** generate about 1M `daily_steps` rows and 500k workouts across 1,000 fake users. Run `EXPLAIN ANALYZE` on your list and stats queries **before and after** adding indexes. Record the timings in the table below.
- [ ] **B7** Add `?include=sets` to `GET /v1/workouts`. Implement it naively first, count the queries, then fix the N+1.
- [ ] **B8** Migrate the repositories to Kysely with generated types. Keep all tests and behavior identical.
- [ ] **B9** *(Stretch)* Optimistic concurrency on `PATCH /v1/workouts/:id` with a `version` column.

## Definition of done
- No string-interpolated SQL anywhere (search for `${` inside SQL).
- Creating a workout with sets is all-or-nothing.
- Every query that serves an endpoint has a supporting index, shown by `EXPLAIN`.
- Listing with sets uses a constant number of queries, no matter how many workouts are returned.

---

## Checkpoint

1. Why use a connection pool? What happens if the pool max is 10 and 50 requests needing the DB arrive at once?
2. Show why this is vulnerable, and fix it: ``pool.query(`SELECT * FROM workouts WHERE kind = '${kind}'`)``.
3. Why can't you run a transaction with `pool.query("BEGIN")` followed by `pool.query("INSERT …")`?
4. Two phones sync steps for the same day at the same instant. Walk through what happens with (a) SELECT-then-INSERT/UPDATE in app code and (b) `INSERT … ON CONFLICT`.
5. Describe the lost-update problem using your laptop and watch editing the same workout, and give one fix.
6. Your main query is `WHERE user_id = $1 ORDER BY started_at DESC LIMIT 20`. What index do you create, and why that column order? Would `(started_at, user_id)` work as well?
7. Postgres doesn't index foreign key columns automatically. Which of your FKs need an index, and what goes wrong without one?
8. What is N+1? How did you detect it in B7, and how did you fix it?
9. An `EXPLAIN` shows `Seq Scan on workouts (actual rows=500000) Filter: (user_id = …) Rows Removed by Filter: 499500`. What does it tell you, and what do you do?
10. Why compute weekly stats in SQL rather than fetching all workouts and reducing in TypeScript?

**Explain it back:** Raw SQL vs query builder vs ORM: when would you choose each, and why did this course choose the order it did?

---

## Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Concepts understood
- [ ] 5.1 Pooling
- [ ] 5.2 SQL injection and parameterization
- [ ] 5.3 Repositories, composition root
- [ ] 5.4 Transactions and ACID
- [ ] 5.5 Isolation, races, lost updates
- [ ] 5.6 DB error mapping
- [ ] 5.7 Index design and `EXPLAIN`
- [ ] 5.8 N+1
- [ ] 5.9 Raw vs builder vs ORM
- [ ] 5.10 Aggregations in the database

### Performance lab results (B6)
| Query | Rows | Before index (ms) | Index added | After (ms) | Plan change |
|---|---|---|---|---|---|
| List workouts | | | | | |
| Weekly stats | | | | | |
| Steps range | | | | | |

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
- node-postgres: https://node-postgres.com/
- Kysely: https://kysely.dev/
- Use The Index, Luke: https://use-the-index-luke.com/
- Using EXPLAIN: https://www.postgresql.org/docs/current/using-explain.html
- Transaction isolation: https://www.postgresql.org/docs/current/transaction-iso.html
