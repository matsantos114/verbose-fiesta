# Module 04: Relational Data Modeling & SQL

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | ✅ Full |
| **Estimated time** | 14–18 hours |
| **Prerequisites** | Module 03 complete |
| **Project milestone** | Postgres in Docker, your own migration runner, the full schema with constraints, realistic seed data, and a 10-query SQL kata |

## 🎓 Tutor prompt

Start every study session for this module in a **new chat** by pasting the prompt below. It sets Claude up as your teacher for this module: it reads the course files, picks up where you left off, follows the teaching rules (no solutions; syntax help and hints instead), quizzes you, and updates your tracker when you say **"wrap up."**

```text
You are my tutor for Module 04 of my backend engineering course: "Relational Data Modeling & SQL".

ROLE
Act as a database engineer who has designed Postgres schemas for consumer apps and teaches SQL by making people write a lot of it. You believe the database should make invalid states impossible. Teach the way a great senior engineer mentors a junior on their own team: patient, precise, Socratic, and honest when my work isn't good enough yet.

ABOUT ME
- I'm Mathew, a frontend engineer (React + TypeScript). I'm solid on JS/TS logic, but I don't know every Node, Express, SQL, or tooling API and syntax by heart.
- I'm building `fittrack-api`, an API that tracks my own physical activity (daily steps, workouts, lifting sets, exercises), to learn backend fundamentals properly.
- The course lives in my repo at `docs/course/`: `COURSE.md` (rules, given-vs-you-write table, decisions log, session log) plus one file per module.
- Stack for this module: Node.js LTS + TypeScript, adding PostgreSQL 18 (in Docker Compose), `psql`, raw SQL, the `pg` library (for my migration runner and seed script), and a migration runner I write myself. The API itself still uses in-memory repositories in this module.

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/04-relational-modeling-and-sql.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
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
- SQL fluency: I write every query myself in `psql`. You may demonstrate syntax (JOIN, GROUP BY, window functions, `generate_series`, upserts) on a *different* example table, but never solve my SQL kata for me.
- Time: `timestamptz` for instants vs. `date` for calendar days, and which day a late-night workout belongs to.
- Constraints as the source of truth (NOT NULL, UNIQUE, CHECK, FKs with the right ON DELETE, including why `workout_sets.exercise_id` is DEFERRABLE INITIALLY DEFERRED), and why app validation isn't enough under concurrency.
- If I'm new to SQL, slow down in Part 3 (SQL from zero) and have me predict every result before running it.
- Schema design reviews: critique my ERD and migrations the way a senior DBA would. Ask "what invalid state can this table still hold?"
- How migrations work (bookkeeping table, ordering, one transaction per file), and why applied migrations are never edited.
- Watch for these common misconceptions and correct them when they show up: `timestamp` vs. `timestamptz`; using floats for weights; INNER JOIN silently dropping rows that a LEFT JOIN would keep; selecting columns that aren't grouped or aggregated; editing a migration that has already run; trusting app-level uniqueness checks.
- Hold me to this standard before I move on: a fresh volume + `npm run migrate` builds the schema, re-running it is a no-op, the seed data is realistic, all kata queries are correct, and every invalid state I can think of is rejected by the database.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

## How to use this module

| Part | What you do | Kind |
|---|---|---|
| 1. Concepts | How relational databases think: tables, keys, types, time, constraints, NULL, normalization | 📖 Read |
| 2. Setup | Postgres in Docker; connect with `psql` | ⌨️ Type along |
| 3. SQL from zero | A guided `psql` session on a practice table: create, insert, select, update, delete | ⌨️ Type along |
| 4. Worked example | The `users` and `daily_steps` migrations, line by line | ⌨️ Type along |
| 5. Toolbox | SQL and `pg` syntax for the challenges | 🧰 Reference |
| 6. Challenges | Data model doc, migration runner, the rest of the schema, seed script, SQL kata, constraint lab | 🧩 You write |
| Checkpoint | 10 questions | ✍️ Quiz |

**Your API still uses in-memory storage at the end of this module.** This module is about the database itself: designing the schema and becoming fluent in SQL. Module 05 connects the API to it.

## What you'll be able to do by the end
- Run Postgres in Docker and work comfortably in `psql`.
- Read and write SQL: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, joins, grouping, upserts, `generate_series`, `DISTINCT ON`, and window functions.
- Model the fitness domain with correct types, keys, and constraints.
- Handle time correctly: instants vs. calendar days, UTC vs. a user's timezone.
- Explain how migration tools work, because you'll have built one.

---

# Part 1 — 📖 Concepts

## 1.1 Why a database (and not a JSON file)

At the end of Module 02, you restarted the server and your data vanished. A JSON file would survive restarts, but a real database gives you much more:

| Need | JSON file | Postgres |
|---|---|---|
| Survives restarts and crashes | Sort of (a crash mid-write can corrupt the file) | ✅ Durable: committed means saved |
| Two requests writing at once | ❌ One overwrites the other | ✅ Concurrency control |
| "Reject invalid data, always" | ❌ Only if every code path remembers | ✅ Constraints, enforced on every write |
| "Weekly km for the last 8 weeks" | Load everything into memory and loop | ✅ One query, computed next to the data |
| Find one row among millions, fast | ❌ Scan everything | ✅ Indexes (Module 05) |

## 1.2 The relational model in plain words

| Term | Meaning | In this app |
|---|---|---|
| **Table** | A set of rows with the same columns | `workouts` |
| **Row** | One record | One run you logged |
| **Column** | One named, typed field | `started_at timestamptz` |
| **Primary key (PK)** | Column(s) that uniquely identify a row | `workouts.id` |
| **Foreign key (FK)** | A column that must match a PK in another table | `workout_sets.workout_id → workouts.id` |
| **Constraint** | A rule the database enforces on every write | `CHECK (steps BETWEEN 0 AND 100000)` |
| **Index** | A lookup structure that makes certain queries fast | Module 05 |
| **Schema** | The set of all table definitions (and the namespace they live in; ours is `public`) | |

A relational database stores **facts** in tables and **relationships** as matching key values. A workout doesn't *contain* its sets the way a JSON object would. Instead, each set row *points at* its workout.

## 1.3 Postgres, the pieces you'll touch

```
your laptop
├── Docker container "db"  ── runs the Postgres server process, listening on port 5432
│     └── database "fittrack_dev"
│           └── schema "public"
│                 ├── table users
│                 ├── table daily_steps
│                 └── …
└── clients that connect over TCP:
      ├── psql            (the command-line client)
      ├── your Node app   (via the `pg` library, from Module 05)
      └── a GUI like TablePlus (optional)
```

A connection string holds everything a client needs to connect:

```
postgres://fittrack:fittrack@localhost:5432/fittrack_dev
└─scheme─┘ └─user─┘ └─pass─┘ └──host──┘└port┘└─database─┘
```

## 1.4 SQL has two halves

- **DDL (Data Definition Language)** changes the *structure*: `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, `CREATE INDEX`. These go in **migrations**.
- **DML (Data Manipulation Language)** changes or reads the *data*: `INSERT`, `SELECT`, `UPDATE`, `DELETE`. Your app runs these.

SQL is **declarative**: you describe *what* you want, and the database figures out *how* to get it.

**The order a `SELECT` is evaluated in** is not the order it's written in. Knowing this explains most confusing errors:

```
Written order:                       Logical evaluation order:
SELECT   kind, count(*)               1. FROM      workouts            which rows exist
FROM     workouts                     2. WHERE     user_id = $1        keep some rows
WHERE    user_id = $1                 3. GROUP BY  kind                bucket the rows
GROUP BY kind                         4. HAVING    count(*) > 2        keep some buckets
HAVING   count(*) > 2                 5. SELECT    kind, count(*)      compute output columns
ORDER BY count(*) DESC                6. ORDER BY  count(*) DESC       sort
LIMIT    3;                           7. LIMIT     3                   cut
```

That's why you can't use a column alias from `SELECT` inside `WHERE`: `WHERE` runs first.

## 1.5 Choosing data types

| Data | Type | Why |
|---|---|---|
| IDs | `uuid` with `DEFAULT uuidv7()` | Unguessable (M2). Version 7 starts with a timestamp, so new IDs sort roughly by creation time, which keeps indexes compact. `uuidv7()` is built into Postgres 18. |
| An instant (when a workout started) | **`timestamptz`** | Stored as an exact moment in UTC |
| A calendar day (which day's steps) | **`date`** | A day has no time and no timezone |
| Whole counts (steps, reps, meters) | `integer` | Exact; range ±2.1 billion |
| Weights | **`numeric(6,2)`** | Exact decimals. `numeric(6,2)` means 6 digits total, 2 after the point: up to 9999.99. |
| Free text | `text` | Postgres `text` has no performance penalty compared to `varchar(n)`. Enforce lengths with `CHECK`. |
| A small fixed set of values (`kind`) | `text` + `CHECK (kind IN (...))` | Easy to change later in a migration. (Postgres `ENUM` types are hard to remove values from.) |

**Why not floating point for weights?** `real` and `double precision` store binary approximations: `0.1 + 0.2` is `0.30000000000000004`. For a bodyweight plus a 2.5 kg plate, you want exactly 102.5, every time.

## 1.6 Time: the part everyone gets wrong

There are two different things people call "a date":

| Concept | Example | Postgres type | Timezone? |
|---|---|---|---|
| An **instant**: a single moment, the same everywhere on Earth | "the run started at 14:00 UTC" | `timestamptz` | Stored as UTC; *displayed* in the session's timezone |
| A **calendar day**: a label on a local calendar | "my steps for October 11" | `date` | None. "October 11" means different instants in San Jose and New York. |

**`timestamptz` doesn't store a timezone**, despite its name ("timestamp with time zone"). It converts the input to UTC, stores that, and converts back when displaying. Plain `timestamp` ("without time zone") stores digits with no zone at all, so `2026-10-11 07:00` could be any of 24+ different moments. **Don't use `timestamp` for real events.**

**Which day does a workout belong to?** Convert the instant into the user's timezone, then take the date:

```sql
SELECT (TIMESTAMPTZ '2026-10-12 06:30:00+00' AT TIME ZONE 'America/Los_Angeles')::date;
-- 2026-10-11   ← 06:30 UTC on Oct 12 is 11:30pm on Oct 11 in San Jose
```

- `instant AT TIME ZONE 'America/Los_Angeles'` gives the **local wall-clock time** there (a plain `timestamp`).
- `::date` keeps just the calendar day. (`::` is Postgres's cast operator.)

That's why the `users` table stores an **IANA timezone name** like `America/Los_Angeles`, not an offset like `-07:00`. The offset changes with daylight saving time; the name knows all the rules.

## 1.7 Keys

- Every table has a **primary key**: a non-null, unique identifier for each row.
- **Surrogate key:** a generated ID with no meaning (`workouts.id`). Use one when nothing natural identifies a row.
- **Natural / composite key:** real data that identifies the row. `daily_steps` has **one row per user per day**, so `(user_id, day)` *is* the identity. Making it the primary key means the database itself guarantees there's no duplicate day. That's what makes the upsert (1.16) possible.

## 1.8 Constraints: the last line of defense

Your app validates input (Module 03). **The database enforces truth.** Why both?

- **App validation** gives the client friendly error messages.
- **Constraints** hold for *every* writer: your API, a buggy script, a migration, a teammate in `psql`, and two concurrent requests that each passed the app's check.

```
Request A: "Is the name 'Squat' taken?" → no  ┐
Request B: "Is the name 'Squat' taken?" → no  ┤  both checks pass…
Request A: INSERT 'Squat' ✔                   │
Request B: INSERT 'Squat' ✔  ← duplicate!     ┘  …unless a UNIQUE constraint rejects B
```

| Constraint | Example |
|---|---|
| `NOT NULL` | `started_at timestamptz NOT NULL` |
| `UNIQUE` | `email text NOT NULL UNIQUE` |
| `CHECK` | `CHECK (ended_at IS NULL OR ended_at > started_at)` |
| `PRIMARY KEY` | `PRIMARY KEY (user_id, day)` |
| `FOREIGN KEY` | `REFERENCES workouts (id) ON DELETE CASCADE` |

**Name your constraints** (`CONSTRAINT workouts_end_after_start CHECK (...)`). The name appears in error messages, and in Module 05 you'll map names and codes to HTTP responses.

### What happens to children when a parent is deleted?

| FK action | Effect | Use for |
|---|---|---|
| `ON DELETE CASCADE` | Delete the children too | Sets of a deleted workout; everything owned by a deleted user |
| `ON DELETE RESTRICT` | Refuse to delete the parent, checked immediately | Rarely; see below |
| *(default)* `NO ACTION` | Refuse, checked at the end of the statement | |
| `NO ACTION DEFERRABLE INITIALLY DEFERRED` | Refuse, but check only **at commit** | `workout_sets.exercise_id` (see below) |
| `ON DELETE SET NULL` | Keep the child, clear the reference | Optional links |

**A real gotcha, from this exact schema.** Deleting a user cascades along two paths at once: user → workouts → sets, and user → custom exercises. With a plain `NO ACTION` or `RESTRICT` on the exercise link, Postgres checks the exercise deletion *before* the sets cascade has finished, and the whole delete fails. (It really does; try it without the fix and see.) Making that one FK **`DEFERRABLE INITIALLY DEFERRED`** moves the check to commit time. By then, the sets are gone. Meanwhile, deleting an exercise that sets still use is still refused, so the protection stays.

## 1.9 NULL: "unknown," not "empty"

`NULL` means *no value / unknown*. It follows **three-valued logic**: comparisons with NULL give NULL ("unknown"), which `WHERE` treats as false.

```sql
SELECT NULL = NULL;        -- NULL  (not true!)
SELECT NULL IS NULL;       -- true  ← always test for NULL with IS NULL / IS NOT NULL
WHERE distance_m <> 5000   -- skips rows where distance_m IS NULL!
```

| Expression | Counts… |
|---|---|
| `count(*)` | rows |
| `count(distance_m)` | rows where `distance_m` is **not** NULL |
| `sum`, `avg`, `max` | ignore NULLs |
| `coalesce(x, 0)` | gives 0 when `x` is NULL |

**UNIQUE and NULL:** by default, NULLs are *not equal to each other*, so a unique index lets any number of rows have NULL in that column. For built-in exercises (`user_id IS NULL`) you'll want the opposite. Postgres 15+ supports `NULLS NOT DISTINCT` for exactly this case.

## 1.10 Normalization in plain words

Normalization means **storing each fact exactly once**, so it can never disagree with itself.

A tempting but bad design, straight from a spreadsheet:

| date | exercise | set1_reps | set1_kg | set2_reps | set2_kg | set3_reps | set3_kg |
|---|---|---|---|---|---|---|---|
| Oct 10 | Back Squat | 5 | 100 | 5 | 100 | 5 | 102.5 |

Problems: what about a 6th set? How do you find your heaviest squat ever (scan six columns)? What if you rename the exercise (update every row)?

The rules:
- **First normal form (1NF):** one value per cell, no repeating column groups. Sets become **rows**, not columns.
- **Second and third normal form (2NF/3NF):** every column describes *the key, the whole key, and nothing but the key*. The exercise's name and category describe the *exercise*, so they live in `exercises`, and a set stores only `exercise_id`.

**Denormalizing on purpose** (for example, storing `total_volume_kg` on `workouts`) makes some reads faster, but now two places must always agree. Default to computing values with queries. Add summaries or caches later (Module 08), and only with a measured reason.

## 1.11 Polymorphic data: strength vs. cardio

A run has a distance; a lifting session has sets. Options:

| Approach | Shape | Pros | Cons |
|---|---|---|---|
| 1. One wide table | `workouts` with nullable columns for everything | Simple; one list query | Lots of NULLs; weaker constraints |
| 2. Table per type | `runs`, `lifts`, … | Precise columns per type | "All my workouts" needs a `UNION` |
| 3. Base + detail tables | `workouts` (shared) + `workout_sets` (strength details) | Shared fields once; typed details | More joins |
| 4. JSON column | `workouts.details jsonb` | Flexible | The database can't easily enforce the structure |

**This course uses 3, with a light touch of 1:** shared fields and the few cardio fields (`distance_m`) on `workouts`, and strength details in `workout_sets`. A `CHECK` keeps `distance_m` limited to cardio kinds. You'll record this choice in the decisions log.

## 1.12 Migrations

A migration is a versioned file that changes the schema: `001_users.sql`, `002_daily_steps.sql`, … Every environment (your laptop, CI, production) runs the **same files in the same order** and ends up with the same schema.

How every migration tool works underneath:

```
1. Ensure a bookkeeping table exists:  schema_migrations(name, applied_at)
2. List migrations/*.sql, sorted by filename
3. For each file NOT recorded in schema_migrations:
      BEGIN
        run the file's SQL
        INSERT INTO schema_migrations (name) VALUES ('003_exercises.sql')
      COMMIT          ← both happen, or neither does
   On any error: ROLLBACK, report which file failed, and stop.
```

The rules:
- **Never edit a migration that has already run** in a shared environment. Other databases already applied the old version, and they'll never re-run it. Write a **new** migration instead.
- **Production is forward-only.** "Down" migrations are fine locally but rarely trusted in production. Module 10 covers changing a live schema safely.
- Wrapping each file in a **transaction** means a failed migration leaves no half-built tables. Postgres can do this for DDL; many databases can't.

## 1.13 Joins

```
workouts                         workout_sets
id  kind                         workout_id  reps
W1  strength  ──────────────▶    W1          5
W1                               W1          5
W2  run       (no sets)
W3  strength  (no sets)

INNER JOIN  (only rows that match on both sides)     LEFT JOIN  (every left row; NULLs where no match)
W1 | 5                                               W1 | 5
W1 | 5                                               W1 | 5
                                                     W2 | NULL
                                                     W3 | NULL
```

```sql
SELECT w.id, w.kind, count(s.workout_id) AS set_count
FROM workouts w
LEFT JOIN workout_sets s ON s.workout_id = w.id
GROUP BY w.id, w.kind;
-- count(s.workout_id) ignores the NULLs from unmatched rows, so W2 and W3 get 0 (count(*) would give 1).
```

**Rule of thumb:** if you want "every X, plus related Y if any," use `LEFT JOIN`. An `INNER JOIN` silently drops X's that have no Y.

## 1.14 Grouping and aggregates

`GROUP BY` collapses rows into one row per group. Every column in `SELECT` must be either **in the `GROUP BY`** or **inside an aggregate** (`count`, `sum`, `avg`, `min`, `max`). Otherwise Postgres can't know which of the group's values to show.

```sql
SELECT kind, count(*) AS workouts, sum(distance_m) AS total_m
FROM workouts
WHERE user_id = $1
GROUP BY kind;
```

`WHERE` filters **rows before** grouping. `HAVING` filters **groups after** grouping.

## 1.15 Window functions

Aggregates collapse rows. **Window functions compute across related rows but keep every row.**

```sql
SELECT day, steps,
       avg(steps) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS seven_day_avg,
       row_number() OVER (ORDER BY steps DESC) AS rank_by_steps
FROM daily_steps
WHERE user_id = $1;
```

`OVER (PARTITION BY x ORDER BY y)` means "for each group of `x`, in order of `y`." Window functions are perfect for "best set per exercise," running totals, and streaks.

## 1.16 Upsert

"Insert, or if the row already exists, update it." That's exactly `PUT /v1/steps/:date`:

```sql
INSERT INTO daily_steps (user_id, day, steps)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, day)
DO UPDATE SET steps = EXCLUDED.steps, updated_at = now();
```

- `ON CONFLICT (user_id, day)` names the unique key to detect duplicates on.
- `EXCLUDED` is the row you *tried* to insert.
- It's **one atomic statement**. Two phones syncing the same day at the same instant can't create two rows.

✅ **Before moving on:** explain 1.6, 1.8, and 1.13 out loud, without notes.

---

# Part 2 — ⌨️ Setup

## 2.1 Install Docker

Install **Docker Desktop** (https://www.docker.com/products/docker-desktop/) and start it. Check it works:

```bash
docker --version
docker compose version
```

**What Docker is, in one paragraph:** a **container** runs a program with its own isolated filesystem, packaged as an **image**. `postgres:18` is an image with Postgres 18 installed. You can run Postgres without installing it on your Mac, delete it cleanly, and run exactly the same version that CI and production use. **Docker Compose** describes one or more containers in a YAML file, so you can start everything with one command.

## 2.2 `docker-compose.yml` (project root)

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

volumes:
  pgdata:
```

| Line | Meaning |
|---|---|
| `services: db:` | One container, named `db` |
| `image: postgres:18` | Use the official Postgres 18 image (it has `uuidv7()` built in) |
| `environment:` | The image creates this user, password, and database on first start. **Local-only credentials.** Production uses real secrets (Module 10). |
| `ports: "5432:5432"` | Make container port 5432 reachable as `localhost:5432` on your Mac |
| `volumes: pgdata:/var/lib/postgresql` | Store the data in a named Docker **volume**, so it survives container restarts. (Postgres 18 images keep their data under this folder.) |
| `healthcheck:` | Docker runs `pg_isready` every 5s to know when the database is ready to accept connections |

```bash
docker compose up -d          # start in the background (-d = detached)
docker compose ps             # STATUS should become "healthy"
docker compose logs db        # see Postgres's own logs
docker compose down           # stop (data is kept in the volume)
docker compose down -v        # stop AND delete the volume (a completely fresh database next time)
```

> If you already have Postgres installed on your Mac (e.g., Postgres.app), it may already be using port 5432. Stop it, or change the mapping to `"5433:5432"` and use port 5433 in your connection string.

## 2.3 Connect with `psql`

You don't need to install anything; `psql` is inside the container:

```bash
docker compose exec db psql -U fittrack -d fittrack_dev
```

You'll see the prompt `fittrack_dev=#`. **psql cheat sheet:**

| Command | Does |
|---|---|
| `\dt` | List tables |
| `\d workouts` | Describe a table: columns, types, constraints, indexes |
| `\x` | Toggle expanded output (one column per line), great for wide rows |
| `\timing` | Show how long each query takes |
| `\i path/file.sql` | Run a file |
| `\q` | Quit |
| `;` | **Every SQL statement ends with a semicolon.** If you press Enter and see `fittrack_dev-#`, psql is waiting for the `;`. |

Optional GUI: TablePlus, DBeaver, or pgAdmin, using the connection string from 1.3.

## 2.4 Connect the app's config

Add to `.env` and `.env.example`:

```dotenv
DATABASE_URL=postgres://fittrack:fittrack@localhost:5432/fittrack_dev
```

Add to `ConfigSchema` in `src/config.ts`:

```ts
DATABASE_URL: z.string().startsWith("postgres", { message: "must be a postgres:// connection string" }),
```

No default: if it's missing, the app refuses to start (Module 03's fail-fast rule).

Install the Postgres client library for Node (used by your migration runner and seed script now, and by the whole app in Module 05):

```bash
npm install pg
npm install --save-dev @types/pg
```

---

# Part 3 — ⌨️ SQL from zero: a guided `psql` session

Open `psql` and type each statement. **Predict the result before you press Enter.** This practice table isn't part of the app; you'll drop it at the end.

```sql
-- 1. Create a table
CREATE TABLE practice_runs (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_date    date    NOT NULL,
  distance_km numeric(5,2) NOT NULL CHECK (distance_km > 0),
  minutes     integer NOT NULL,
  notes       text
);
```
`GENERATED ALWAYS AS IDENTITY` is Postgres's auto-incrementing integer. It's fine for a practice table; the real tables use UUIDs.

```sql
-- 2. Insert rows
INSERT INTO practice_runs (run_date, distance_km, minutes, notes)
VALUES ('2026-10-01', 5.0, 28, 'easy'),
       ('2026-10-03', 8.2, 47, NULL),
       ('2026-10-05', 3.1, 15, 'tempo'),
       ('2026-10-08', 10.0, 59, 'long run');

-- 3. Read everything
SELECT * FROM practice_runs;

-- 4. Choose columns, compute a new one, name it with AS
SELECT run_date, distance_km, minutes, round(minutes / distance_km, 2) AS min_per_km
FROM practice_runs;

-- 5. Filter rows with WHERE
SELECT * FROM practice_runs WHERE distance_km >= 5;
SELECT * FROM practice_runs WHERE notes IS NULL;           -- not "= NULL"
SELECT * FROM practice_runs WHERE run_date BETWEEN '2026-10-02' AND '2026-10-06';

-- 6. Sort and limit
SELECT * FROM practice_runs ORDER BY distance_km DESC LIMIT 2;

-- 7. Aggregate: one row summarizing many
SELECT count(*) AS runs, sum(distance_km) AS total_km, max(distance_km) AS longest
FROM practice_runs;

-- 8. Group: one summary row per group
SELECT date_trunc('week', run_date)::date AS week_start, count(*) AS runs, sum(distance_km) AS km
FROM practice_runs
GROUP BY week_start
ORDER BY week_start;

-- 9. Update rows (ALWAYS write the WHERE first, then the rest)
UPDATE practice_runs SET notes = 'recovery' WHERE run_date = '2026-10-03';

-- 10. RETURNING shows the changed rows (very useful from code)
UPDATE practice_runs SET minutes = minutes - 1 WHERE id = 1 RETURNING *;

-- 11. Try to break a constraint, and read the error
INSERT INTO practice_runs (run_date, distance_km, minutes) VALUES ('2026-10-09', -2, 10);
-- ERROR:  new row for relation "practice_runs" violates check constraint "practice_runs_distance_km_check"

-- 12. Delete rows
DELETE FROM practice_runs WHERE distance_km < 4 RETURNING *;

-- 13. Transactions: try something, then undo it
BEGIN;
DELETE FROM practice_runs;         -- everything gone?
SELECT count(*) FROM practice_runs;
ROLLBACK;                          -- …nope, undone
SELECT count(*) FROM practice_runs;

-- 14. Clean up
DROP TABLE practice_runs;
```

**Two safety habits to keep forever:**
1. Write the `WHERE` clause of an `UPDATE` or `DELETE` *before* the rest. An `UPDATE` without `WHERE` changes every row.
2. When unsure, wrap it in `BEGIN; … ROLLBACK;` and look at the result first.

---

# Part 4 — ⌨️ Worked example: the first two migrations

Create a `migrations/` folder in the project root (next to `src/`, not inside it). Filenames start with a zero-padded number so they sort in the right order.

## 4.1 `migrations/001_users.sql`

```sql
-- 001_users.sql
-- One row per person who uses fittrack. Login fields (password, sessions) arrive in Module 07.
CREATE TABLE users (
  id               uuid        PRIMARY KEY DEFAULT uuidv7(),
  email            text        NOT NULL UNIQUE,
  display_name     text        NOT NULL,
  timezone         text        NOT NULL DEFAULT 'UTC',
  daily_step_goal  integer     NOT NULL DEFAULT 10000,
  created_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT users_email_not_blank  CHECK (length(trim(email)) > 0),
  CONSTRAINT users_name_length      CHECK (length(display_name) BETWEEN 1 AND 80),
  CONSTRAINT users_step_goal_range  CHECK (daily_step_goal BETWEEN 1 AND 100000)
);
```

**Line by line:**
- **`id uuid PRIMARY KEY DEFAULT uuidv7()`.** If an `INSERT` doesn't provide an ID, Postgres generates one. `PRIMARY KEY` implies `NOT NULL` and `UNIQUE`, and creates an index automatically.
- **`email text NOT NULL UNIQUE`.** Two accounts can't share an email. (Module 07 adds case-insensitivity.)
- **`timezone text NOT NULL DEFAULT 'UTC'`.** An IANA name like `America/Los_Angeles`, used to decide which *local day* things happened on (1.6). The database doesn't validate the name; the API will (Module 07).
- **`daily_step_goal`** is per user, because goals differ. It's needed for the "goal met?" and streak features.
- **`created_at timestamptz NOT NULL DEFAULT now()`.** `now()` is the transaction's start time. The server sets this; clients never do.
- **Named `CHECK` constraints:** `length(trim(email)) > 0` rejects an email of just spaces; `BETWEEN 1 AND 80` is inclusive on both ends.
- **The commas:** column definitions and table constraints are one comma-separated list inside `( … )`. No comma after the last item.

## 4.2 `migrations/002_daily_steps.sql`

```sql
-- 002_daily_steps.sql
-- One row per user per LOCAL calendar day. Re-sending a day replaces it (upsert).
CREATE TABLE daily_steps (
  user_id     uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  day         date        NOT NULL,
  steps       integer     NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, day),
  CONSTRAINT daily_steps_steps_range CHECK (steps BETWEEN 0 AND 100000)
);
```

- **No `id` column.** The natural key `(user_id, day)` *is* the identity (1.7). It's also the conflict target for the upsert, and its index makes "this user's steps from Oct 1 to Oct 31" fast.
- **`REFERENCES users (id)`** means every row must belong to a real user. **`ON DELETE CASCADE`**: deleting a user deletes their steps.
- **`day date`.** The client tells us which local day it is (M2 rule). There's no time and no timezone here.
- **The CHECK repeats the service rule.** The service rule gives a friendly 400; the constraint guarantees no other writer can store `-5` either.

## 4.3 Run them by hand (once, to understand what the runner will automate)

```bash
docker compose exec -T db psql -U fittrack -d fittrack_dev < migrations/001_users.sql
docker compose exec -T db psql -U fittrack -d fittrack_dev < migrations/002_daily_steps.sql
```

(`-T` lets you feed a file into the container's `psql` through `<`.)

Then in `psql`:

```sql
\d users
\d daily_steps
INSERT INTO users (email, display_name) VALUES ('test@example.com', 'Test') RETURNING *;
INSERT INTO daily_steps (user_id, day, steps)
  SELECT id, '2026-10-11', 9412 FROM users WHERE email = 'test@example.com';
-- Run the upsert from 1.16 twice with different step counts; only one row remains.
```

Now **reset**, because the runner (Challenge 2) should be the thing that builds the schema:

```bash
docker compose down -v && docker compose up -d
```

---

# Part 5 — 🧰 Toolbox

## 5.1 DDL reference

```sql
CREATE TABLE things (
  id          uuid PRIMARY KEY DEFAULT uuidv7(),
  owner_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES parents (id) DEFERRABLE INITIALLY DEFERRED,   -- checked at commit
  label       text NOT NULL,
  amount      numeric(6,2) NOT NULL,
  happened_at timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT things_label_length CHECK (length(label) BETWEEN 1 AND 60),
  CONSTRAINT things_kind_valid   CHECK (kind IN ('a', 'b', 'c')),
  CONSTRAINT things_owner_label_unique UNIQUE (owner_id, label)
);

-- A unique rule on an EXPRESSION (case-insensitive) needs a unique INDEX, not a table constraint:
CREATE UNIQUE INDEX things_owner_label_ci_unique ON things (owner_id, lower(label));

-- Treat NULLs as equal for uniqueness (Postgres 15+):
CREATE UNIQUE INDEX things_label_unique ON things (owner_id, lower(label)) NULLS NOT DISTINCT;

-- Reference data inside a migration
INSERT INTO things (owner_id, label, amount, happened_at) VALUES (...), (...);

-- Intervals
CHECK (ended_at - started_at <= interval '24 hours')
```

## 5.2 Querying reference

```sql
-- Joins
SELECT w.started_at, e.name, s.reps, s.weight_kg
FROM workout_sets s
JOIN workouts w  ON w.id = s.workout_id
JOIN exercises e ON e.id = s.exercise_id
WHERE w.user_id = $1;

-- Every day in a range, even days with no row (generate_series + LEFT JOIN + coalesce)
SELECT d::date AS day, coalesce(s.steps, 0) AS steps
FROM generate_series(DATE '2026-10-01', DATE '2026-10-31', interval '1 day') AS d
LEFT JOIN daily_steps s ON s.day = d::date AND s.user_id = $1
ORDER BY day;

-- "Today" and recent ranges
current_date                          -- today, in the session's timezone
current_date - 6                      -- 6 days ago (date minus integer = date)
now() - interval '8 weeks'

-- Weeks in the user's timezone (date_trunc('week', …) starts weeks on Monday)
date_trunc('week', started_at AT TIME ZONE 'America/Los_Angeles')

-- One row per group, picking a specific row: DISTINCT ON
SELECT DISTINCT ON (exercise_id) exercise_id, weight_kg, created_at
FROM workout_sets
ORDER BY exercise_id, weight_kg DESC, created_at;   -- the FIRST row of each group wins

-- The same with a window function
SELECT * FROM (
  SELECT exercise_id, weight_kg,
         row_number() OVER (PARTITION BY exercise_id ORDER BY weight_kg DESC) AS rn
  FROM workout_sets
) ranked
WHERE rn = 1;

-- CTEs (WITH) name intermediate results, so a long query reads top to bottom
WITH this_month AS (
  SELECT * FROM workouts WHERE started_at >= date_trunc('month', now())
)
SELECT kind, count(*) FROM this_month GROUP BY kind;

-- "Gaps and islands": consecutive dates share the same (day - row_number) value
SELECT day, day - (row_number() OVER (ORDER BY day))::int AS island
FROM some_days;
```

## 5.3 Node: `pg`, files, and paths

```ts
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

// Connect one client
const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();

// Query without parameters (a multi-statement .sql file is fine here)
await client.query(sqlText);

// Query WITH parameters: $1, $2… are filled from the array. Never build SQL with string concatenation.
await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [fileName]);

// Typed rows
const result = await client.query<{ name: string }>("SELECT name FROM schema_migrations");
const appliedNames = result.rows.map((row) => row.name);

// Always close the connection, even after an error
try {
  // ...
} finally {
  await client.end();
}

// Files
const migrationsDir = path.resolve("migrations");        // relative to where you run the command
const entries = await readdir(migrationsDir);            // ["001_users.sql", "002_daily_steps.sql", ...]
const sqlFiles = entries.filter((name) => name.endsWith(".sql")).sort();
const sqlText = await readFile(path.join(migrationsDir, "001_users.sql"), "utf8");

// A Set makes "already applied?" checks easy
const applied = new Set(appliedNames);
applied.has("001_users.sql");
```

Why `import pg from "pg"` and then `pg.Client`? The `pg` package is CommonJS. A default import followed by property access works with every version of it.

## 5.4 Postgres error codes you'll meet

| SQLSTATE | Name | Example |
|---|---|---|
| `23502` | not_null_violation | Inserting a workout without `started_at` |
| `23503` | foreign_key_violation | A set for a workout that doesn't exist |
| `23505` | unique_violation | Duplicate custom exercise name |
| `23514` | check_violation | `steps = -5` |
| `22007` / `22008` | invalid datetime format / datetime field overflow | `'2026-02-30'` |
| `42P01` | undefined_table | Querying a table before its migration ran |

In `psql`, run `\set VERBOSITY verbose` to see the code with every error.

---

# Part 6 — 🧩 Challenges

## Challenge 1: The data model document ★☆☆

Create `docs/data-model.md`. Start from this ERD (GitHub and VS Code render Mermaid) and **adjust it to how you actually train**: do you track tempo, rest time, or RPE? Add or remove fields, and justify each change.

````markdown
```mermaid
erDiagram
    users ||--o{ daily_steps : logs
    users ||--o{ workouts : logs
    users ||--o{ exercises : "creates (custom)"
    workouts ||--o{ workout_sets : contains
    exercises ||--o{ workout_sets : "performed as"

    users {
        uuid id PK
        text email UK
        text display_name
        text timezone
        int daily_step_goal
        timestamptz created_at
    }
    daily_steps {
        uuid user_id PK,FK
        date day PK
        int steps
        timestamptz updated_at
    }
    workouts {
        uuid id PK
        uuid user_id FK
        text kind
        timestamptz started_at
        timestamptz ended_at
        int distance_m
        text notes
        timestamptz created_at
        timestamptz updated_at
    }
    exercises {
        uuid id PK
        uuid user_id FK "NULL = built-in"
        text name
        text category
        timestamptz created_at
    }
    workout_sets {
        uuid id PK
        uuid workout_id FK
        uuid exercise_id FK
        int set_number
        int reps
        numeric weight_kg
        numeric rpe
        timestamptz created_at
    }
```
````

Below the diagram, write a **Decisions** section: ID type, units, the polymorphism approach (1.11), and each FK's delete behavior with a reason.

✅ **Done when:** every table and FK in your migrations appears in the diagram, and every decision has a one-line reason.

---

## Challenge 2: Your own migration runner ★★☆

Write `src/db/run-migrations.ts`, which exports:

```ts
/**
 * Applies every migrations/*.sql file that hasn't been applied yet, in filename order.
 * Each file runs in its own transaction, together with its bookkeeping row.
 * Returns the names of the files it applied (an empty array if there was nothing to do).
 */
export async function runMigrations(databaseUrl: string): Promise<string[]>
```

**Spec**
1. Create `schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())` if it doesn't exist.
2. Read the applied names.
3. List `migrations/*.sql`, sorted by name.
4. For each unapplied file: `BEGIN` → run the file → insert its name → `COMMIT`. Print `applied 003_exercises.sql`.
5. On error: `ROLLBACK`, then throw a **new** `Error` whose message names the failing file and includes the original message. Stop; don't run later files.
6. Always close the connection.

The command-line entry point is given. Create **`src/db/migrate.ts`**:

```ts
import { config } from "../config.js";
import { runMigrations } from "./run-migrations.js";

const applied = await runMigrations(config.DATABASE_URL);

if (applied.length === 0) {
  console.log("Database is up to date.");
} else {
  console.log(`Applied ${applied.length} migration(s).`);
}
```

(`await` at the top level of a file works in ES modules.) Add the script:

```json
"db:migrate": "tsx --env-file-if-exists=.env src/db/migrate.ts"
```

Keeping the logic in `run-migrations.ts`, separate from the command in `migrate.ts`, lets Module 06's test setup call `runMigrations()` directly on the test database.

✅ **Acceptance tests**

```bash
docker compose down -v && docker compose up -d     # a brand-new empty database
npm run db:migrate          # applied 001_users.sql, applied 002_daily_steps.sql
npm run db:migrate          # Database is up to date.
docker compose exec db psql -U fittrack -d fittrack_dev -c "SELECT * FROM schema_migrations;"
```

**Failure test:** create `migrations/003_broken.sql` containing `CREATE TABLE oops (id int); SELECT * FROM table_that_does_not_exist;`. Run the migration. Expect an error naming `003_broken.sql`, **and the `oops` table must not exist** (the transaction rolled back). Delete the file afterward.

<details><summary>💡 Hint 1: direction</summary>

Everything you need is in toolbox 5.3. Get steps 1–3 working first (just print the list of unapplied files), then add the loop.
</details>

<details><summary>💡 Hint 2: approach</summary>

One `pg.Client` for the whole run. Wrap everything after `connect()` in `try/finally` so `end()` always runs. Inside the loop, wrap each file in its own `try/catch`: on error, `ROLLBACK`, then `throw new Error(\`Migration ${file} failed: ${message}\`)`. Get the original message with `error instanceof Error ? error.message : String(error)`.
</details>

<details><summary>💡 Hint 3: pseudocode</summary>

```
runMigrations(url):
  client = new pg.Client({ connectionString: url }); await client.connect()
  try:
    await client.query(CREATE TABLE IF NOT EXISTS schema_migrations …)
    applied = Set of names from SELECT name FROM schema_migrations
    files = readdir(migrationsDir) filtered to .sql, sorted
    appliedNow = []
    for file in files:
      if applied.has(file): continue
      sql = readFile(file)
      try:
        BEGIN; query(sql); INSERT name; COMMIT
        console.log("applied", file); appliedNow.push(file)
      catch error:
        ROLLBACK
        throw new Error("Migration " + file + " failed: " + message)
    return appliedNow
  finally:
    await client.end()
```
</details>

**Stretch:** two deploys could run the migrations at the same moment. Take a Postgres **advisory lock** at the start (`SELECT pg_advisory_lock(727274)`) and release it at the end (`SELECT pg_advisory_unlock(727274)`), so a second runner waits its turn. The number is arbitrary; it just has to be the same in every runner.

---

## Challenge 3: The rest of the schema ★★☆

Write three migrations. **Every rule in the "Constraints" column must be enforced by the database.** Name every constraint.

**`migrations/003_exercises.sql`**

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `uuidv7()` |
| `user_id` | uuid | **nullable** (NULL = built-in); FK → users, `ON DELETE CASCADE` |
| `name` | text | not null; 1–60 characters |
| `category` | text | not null; one of `legs`, `push`, `pull`, `core`, `full-body`, `cardio` |
| `created_at` | timestamptz | not null, default `now()` |

- **Uniqueness:** case-insensitive names must be unique **among the built-ins** and **within each user's custom exercises**.
- **Reference data:** insert the 12 built-in exercises from Module 02 in this same migration. The app depends on them existing.

**`migrations/004_workouts.sql`**

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | not null; FK → users, cascade |
| `kind` | text | not null; one of the 5 kinds |
| `started_at` | timestamptz | not null |
| `ended_at` | timestamptz | nullable; after `started_at`; at most 24 hours after it |
| `distance_m` | integer | nullable; 0–500,000; **only allowed when kind is run, walk, or cycle** |
| `notes` | text | nullable; at most 2,000 characters |
| `created_at`, `updated_at` | timestamptz | not null, default `now()` |

**`migrations/005_workout_sets.sql`**

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `workout_id` | uuid | not null; FK → workouts, cascade |
| `exercise_id` | uuid | not null; FK → exercises, **refuses deletion of an exercise that's in use**, but must not break deleting a user (1.8) |
| `set_number` | integer | not null; ≥ 1; **unique within a workout** |
| `reps` | integer | not null; 1–1000 |
| `weight_kg` | numeric(6,2) | not null; 0–1000 |
| `rpe` | numeric(3,1) | nullable; 1–10 in steps of 0.5 |
| `created_at` | timestamptz | not null, default `now()` |

✅ **Acceptance:** `npm run db:migrate` applies 003–005 on top of 001–002. `\d workout_sets` shows every constraint. Challenge 6 proves they work.

<details><summary>💡 Hint 1</summary>

Toolbox 5.1 has every piece of syntax you need. For the case-insensitive uniqueness, you need an expression index. Re-read the end of 1.9 about NULLs.
</details>

<details><summary>💡 Hint 2</summary>

- Exercise uniqueness: one unique **index** on `(user_id, lower(name))` with `NULLS NOT DISTINCT`. The NULL `user_id`s of built-ins then count as "the same owner."
- "Distance only for cardio": `CHECK (distance_m IS NULL OR kind IN (...))`.
- RPE in half steps: `rpe * 2 = floor(rpe * 2)`.
- `exercise_id`: `REFERENCES exercises (id) DEFERRABLE INITIALLY DEFERRED`.
</details>

**Notice what the database *can't* easily enforce:** "a custom exercise can't reuse a built-in's name" (it compares different owners) and "sets only on strength workouts" (it compares two tables). Those stay as service rules. Write them under "app-enforced rules" in `docs/data-model.md`.

---

## Challenge 4: Realistic seed data ★★☆

Write `src/db/seed.ts` and add `"db:seed": "tsx --env-file-if-exists=.env src/db/seed.ts"`.

**Spec**
1. **Idempotent:** running it twice gives the same amount of data. Delete the dev user first (the cascades clear their data), then recreate it.
2. **The dev user:** `id` = the `DEV_USER_ID` from `src/shared/dev-user.ts`, your real timezone, and your real step goal.
3. **8 weeks of data, ending yesterday:**
   - Daily steps between about 4,000 and 16,000, with a few missing days (you forgot your phone).
   - About 3 runs a week, 3–10 km, at realistic paces (5–7 min/km), at realistic local times (mornings).
   - About 2 lifting sessions a week: 3 exercises × 3–5 sets, with weights that **slowly increase** over the 8 weeks (so the PR queries have something to find).
   - **Use your real numbers where you can.**
4. Use parameterized queries only (`$1, $2…`).
5. Print a summary: `Seeded 52 step days, 24 runs, 16 lifting sessions, 187 sets.`

<details><summary>💡 Hint 1</summary>

The deterministic parts (which days, which exercises) come from loops over dates. The variety comes from `Math.random()`. A small helper like `randomInt(min, max)` keeps the code readable.
</details>

<details><summary>💡 Hint 2</summary>

Insert with `RETURNING id` to get each workout's ID for its sets. Look up the built-in exercise IDs once at the start (`SELECT id, name FROM exercises WHERE user_id IS NULL`) and store them in a `Map<string, string>` from name to id. To build a realistic `started_at`, take a local date, pick a local time like `07:15`, and convert it, either in SQL (`($1::date + $2::time) AT TIME ZONE $3`) or in JS.
</details>

<details><summary>💡 Hint 3: structure</summary>

```
main:
  client.connect()
  DELETE FROM users WHERE id = DEV_USER_ID
  INSERT dev user
  builtIns = Map name → id
  for each day from (today - 56) to (today - 1):
    if random() > 0.05: INSERT daily_steps (random 4000–16000)
    if day is Mon/Wed/Sat: INSERT run workout (random distance, duration from pace)
    if day is Tue/Fri: INSERT strength workout RETURNING id
         for each of 3 exercises: for setNumber 1..random(3,5):
             weight = base + progress(weekIndex); INSERT set
  print the counts; client.end()
```
</details>

---

## Challenge 5: SQL kata ★★★

Create `sql/practice.sql` and write each query yourself in `psql` against your seed data. Use the dev user's ID (or `(SELECT id FROM users LIMIT 1)`) for the user. **Verify each answer by hand** on a small slice: pick 3 days, look at the raw rows, and check the math.

| # | Question | Result shape |
|---|---|---|
| 1 | Total steps over the last 7 days | one number |
| 2 | Days in the last 30 where you met your goal (join `users` for the goal) | a count + the list of days |
| 3 | Daily steps for the last 30 days, **with missing days shown as 0** | 30 rows: `day, steps` |
| 4 | Weekly running distance (km) for the last 8 weeks, weeks in **your** timezone | `week_start, km` |
| 5 | Total volume (`reps × weight_kg`) per strength workout | `workout_id, started_at, volume_kg` |
| 6 | Heaviest set per exercise (your PRs), **twice**: with `DISTINCT ON` and with a window function | `exercise, weight_kg, reps, date` |
| 7 | Strength workouts that have no sets | workout rows |
| 8 | The exercise you trained most often this month (by number of sets) | `name, set_count` |
| 9 | Upsert today's steps; run it twice with different values; show only one row exists | |
| 10 | **Stretch:** your current streak of consecutive goal-met days, and your longest ever | `current, longest` |

**Rules for this challenge:** your tutor may show you syntax on a *different* example, but won't write these queries for you.

<details><summary>💡 Hints for #3 and #4</summary>

#3: `generate_series` makes the days; `LEFT JOIN` attaches the steps; `coalesce` turns NULL into 0 (toolbox 5.2).
#4: bucket `started_at AT TIME ZONE '<your timezone>'` with `date_trunc('week', …)`, `sum(distance_m) / 1000.0` (the `.0` avoids integer division), and `round(…, 2)`.
</details>

<details><summary>💡 Hints for #6 and #8</summary>

#6: the `DISTINCT ON` version orders by `exercise_id, weight_kg DESC`; the window version uses `row_number() OVER (PARTITION BY exercise_id ORDER BY weight_kg DESC)` in a subquery, then keeps `rn = 1`. Join `exercises` and `workouts` for the name and date.
#8: join sets → workouts (for date and user) → exercises (for the name), filter to this month, `GROUP BY` the name, `ORDER BY count DESC LIMIT 1`.
</details>

<details><summary>💡 Hints for #10 (gaps and islands)</summary>

1. A CTE with the goal-met days only.
2. For each, compute `day - (row_number() OVER (ORDER BY day))::int`. Consecutive days produce the **same** value (each day goes up by 1, and so does the row number).
3. `GROUP BY` that value → each group is one streak; `count(*)` is its length.
4. The longest is the max length. The current streak is the group whose last day is today or yesterday (if today isn't over yet).
</details>

---

## Challenge 6: Constraint lab ★☆☆

Prove that **the database** rejects every invalid state. In `psql` (with `\set VERBOSITY verbose`), try each of these, and record the error code and constraint name in the tracker:

1. Steps of `-5`, and steps of `100001`
2. Two rows for the same user and day, using a plain `INSERT` (not an upsert)
3. A workout that ends before it starts; one that lasts 25 hours
4. A strength workout with a `distance_m`
5. A workout `kind` of `swim`
6. A set with `reps = 0`; with `rpe = 8.3`; a duplicate `set_number` in one workout
7. A set pointing at a workout ID that doesn't exist
8. Deleting a custom exercise that a set uses (it must fail)
9. Deleting the dev user (it must **succeed**, and leave the 12 built-in exercises in place)
10. A built-in named `back squat` (lowercase), and a duplicate custom name for one user
11. **Surprise test:** insert a set with `weight_kg = 100.125`. What gets stored? What does that tell you about where the "max 2 decimals" rule has to live?

✅ **Done when:** every row in the tracker table has an error code (or, for #9 and #11, the observed behavior).

---

## Challenge 7: Decisions ★☆☆

Add to the decisions log in `COURSE.md`:
- `uuidv7` IDs generated by the database
- `timestamptz` for instants, `date` + user timezone for calendar days
- The polymorphism approach
- The FK delete behaviors, including the deferred exercise FK and why
- Which rules are enforced by the DB and which by the app

```bash
git add -A && git commit -m "feat(db): postgres schema, migration runner, seed data"
```

---

## Definition of done

- [ ] `docker compose down -v && docker compose up -d && npm run db:migrate && npm run db:seed` builds everything from nothing.
- [ ] Re-running `db:migrate` is a no-op; re-running `db:seed` gives the same counts.
- [ ] The broken-migration test leaves no partial tables.
- [ ] All 9 kata queries (10 with the stretch) are correct and saved in `sql/practice.sql`.
- [ ] Every Challenge 6 attempt is recorded, with the database doing the rejecting.
- [ ] `docs/data-model.md` and the decisions log are up to date.

---

## ✍️ Checkpoint

1. `timestamp` vs. `timestamptz`: which do you use for `workouts.started_at`, and what does Postgres actually store?
2. You log a run at 11:30pm in San Jose on Oct 11, then later fly to New York and change your profile timezone. Which "day" does that run belong to in your weekly stats now? What would you change in the schema to keep it on Oct 11? (Module 10 comes back to this.)
3. Why is `daily_steps.day` a `date` rather than a `timestamptz`? And why is `(user_id, day)` its primary key instead of a separate `id`?
4. Why `numeric(6,2)` instead of `double precision` for `weight_kg`? What happened when you inserted `100.125`?
5. The app already validates `steps >= 0`. Why also add a `CHECK`? Describe a scenario where app-level validation alone lets bad data in.
6. Which FK delete behavior did you choose for workout → sets, user → exercises, and set → exercise? Why did the last one need to be `DEFERRABLE INITIALLY DEFERRED`?
7. Write a query that lists every workout with its set count, including workouts with zero sets. What goes wrong with an inner join, and with `count(*)`?
8. What does a migration tool's bookkeeping table do? Why should you never edit a migration that has already run in production? Why does your runner use a transaction per file?
9. Which polymorphism approach did you choose for strength vs. cardio, and what's its biggest drawback?
10. Write SQL that returns, for each exercise, your heaviest weight and the date you lifted it.

**Explain it back:** You have a spreadsheet with columns `date, workout type, exercise, set1 reps, set1 weight, set2 reps, set2 weight, …`. Walk through normalizing it into your tables, explaining each step.

---

## 📋 Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Progress
- [ ] Part 1: Concepts read (1.1–1.16)
- [ ] Part 2: Postgres running in Docker; `psql` works; config has `DATABASE_URL`
- [ ] Part 3: SQL-from-zero session completed
- [ ] Part 4: Migrations 001–002 written and run by hand
- [ ] Challenge 1: `docs/data-model.md`
- [ ] Challenge 2: Migration runner
- [ ] Challenge 3: Migrations 003–005
- [ ] Challenge 4: Seed script
- [ ] Challenge 5: SQL kata
- [ ] Challenge 6: Constraint lab
- [ ] Challenge 7: Decisions
- [ ] Checkpoint passed (≥ 8/10)

### Concepts I can explain without notes
- [ ] Why a database (1.1) and the relational vocabulary (1.2)
- [ ] SELECT's logical evaluation order (1.4)
- [ ] Type choices, especially time and money-like numbers (1.5)
- [ ] Instants vs. calendar days; `AT TIME ZONE` (1.6)
- [ ] Surrogate vs. natural keys (1.7)
- [ ] Constraints vs. app validation; FK delete actions (1.8)
- [ ] NULL semantics (1.9)
- [ ] Normalization (1.10)
- [ ] Polymorphism options (1.11)
- [ ] How migrations work (1.12)
- [ ] INNER vs. LEFT JOIN (1.13)
- [ ] GROUP BY rules (1.14)
- [ ] Window functions (1.15)
- [ ] Upsert (1.16)

### SQL kata progress
| # | Query | Done | Notes |
|---|---|---|---|
| 1 | 7-day steps | ⬜ | |
| 2 | Goal days | ⬜ | |
| 3 | Zero-filled days | ⬜ | |
| 4 | Weekly run km | ⬜ | |
| 5 | Volume per workout | ⬜ | |
| 6 | PRs (two ways) | ⬜ | |
| 7 | Workouts without sets | ⬜ | |
| 8 | Most-trained exercise | ⬜ | |
| 9 | Idempotent upsert | ⬜ | |
| 10 | Streaks (stretch) | ⬜ | |

### Constraint lab (Challenge 6)
| # | Attempt | SQLSTATE | Constraint / behavior |
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
- PostgreSQL tutorial: https://www.postgresql.org/docs/current/tutorial.html
- Data types: https://www.postgresql.org/docs/current/datatype.html
- Date/time types and `AT TIME ZONE`: https://www.postgresql.org/docs/current/datatype-datetime.html
- Constraints (including FK actions and deferrable constraints): https://www.postgresql.org/docs/current/ddl-constraints.html
- Window functions tutorial: https://www.postgresql.org/docs/current/tutorial-window.html
- `INSERT … ON CONFLICT`: https://www.postgresql.org/docs/current/sql-insert.html
- Error codes (SQLSTATE): https://www.postgresql.org/docs/current/errcodes-appendix.html
- node-postgres: https://node-postgres.com/
- Docker Compose overview: https://docs.docker.com/compose/
