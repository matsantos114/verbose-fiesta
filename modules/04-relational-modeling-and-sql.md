# Module 04: Relational Data Modeling & SQL

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Estimated time** | 10–12 hours |
| **Prerequisites** | Module 03 |
| **Project milestone** | Postgres in Docker, your own migration runner, the full schema with constraints, realistic seed data, and a 10-query SQL kata |

## Why this matters
Your data will outlive your code. A good schema makes invalid states impossible and makes questions like "how many km did I run per week?" a single query. A bad schema forces every feature to work around it. This is the module where you learn SQL properly instead of hiding from it.

## Learning objectives
- Run Postgres locally in Docker and work comfortably in `psql`.
- Model the fitness domain relationally, with correct types, keys, and constraints.
- Explain time handling: `timestamptz` vs `date`, UTC, and user timezones.
- Apply normalization, and know when denormalizing is justified.
- Choose a strategy for polymorphic data (strength vs cardio).
- Build a migration runner and explain how migration tools work.
- Write SQL fluently: joins, aggregates, upserts, `generate_series`, `DISTINCT ON`, and window functions.

---

## Learn

### 4.1 Why relational for this app
Your data is structured and connected: users have workouts, workouts have sets, and sets reference exercises. You need integrity (a set can't point to a missing workout) and aggregations (weekly volume, PRs). That's exactly what relational databases are built for. A document database fits when data is mostly read and written as whole self-contained blobs, with few cross-entity queries.

### 4.2 Postgres in Docker Compose
```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_USER: fittrack
      POSTGRES_PASSWORD: fittrack
      POSTGRES_DB: fittrack_dev
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql   # PG18 images keep data under a versioned subfolder here
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fittrack"]
      interval: 5s
volumes:
  pgdata:
```
Connect with `psql postgres://fittrack:fittrack@localhost:5432/fittrack_dev`. Learn these `psql` commands: `\dt` (tables), `\d workouts` (describe a table), `\x` (expanded output), `\timing`, `\q`.

### 4.3 The fitness data model (starting point; adapt it to your training)
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
        text timezone "IANA, e.g. America/Los_Angeles"
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
        text kind "strength|run|walk|cycle|other"
        timestamptz started_at
        timestamptz ended_at
        int distance_m "nullable, cardio"
        text notes
        timestamptz created_at
        timestamptz updated_at
    }
    exercises {
        uuid id PK
        uuid user_id FK "NULL = built-in"
        text name
        text category
    }
    workout_sets {
        uuid id PK
        uuid workout_id FK
        uuid exercise_id FK
        int set_number
        int reps
        numeric weight_kg
        numeric rpe "nullable"
    }
```

### 4.4 Choosing types
- **`timestamptz` for instants** (when a workout started). Despite the name, Postgres stores a UTC instant and converts it on input and output using the session's timezone. Plain `timestamp` has no zone and is ambiguous, so avoid it for real events.
- **`date` for calendar days** (`daily_steps.day`). "October 11" is a *local* concept. Steps taken at 11:30pm in San Jose belong to Oct 11 for you, even though it's already Oct 12 in UTC. The client (or the server, using the user's timezone) decides the day; the DB stores the date.
- **Integers for measured quantities** where the precision is natural: `distance_m`, `duration_s`.
- **`numeric(6,2)` for weight** (or integer grams). Floating point gives you `102.49999…`, and an exact type avoids that.
- **`text` + `CHECK` instead of Postgres `ENUM` types** for `kind`. ENUM values are awkward to remove or rename; a CHECK constraint is easy to change in a migration.
- **IDs:** `uuid` with `DEFAULT uuidv7()` (Postgres 18+).

### 4.5 Constraints are the last line of defense
`NOT NULL`, `UNIQUE`, `CHECK`, `PRIMARY KEY`, `FOREIGN KEY`.
- **App validation is for good error messages. Constraints are for truth.** Two concurrent requests can both pass an app-level "is this name taken?" check; only a `UNIQUE` constraint stops the duplicate.
- **FK delete behavior:** `workout_sets.workout_id … ON DELETE CASCADE` (deleting a workout deletes its sets). `workout_sets.exercise_id … ON DELETE RESTRICT` (you can't delete an exercise that's in use).
- **Uniqueness with NULLs:** `UNIQUE (user_id, name)` on `exercises` treats NULLs as distinct by default, so two built-in exercises named "Squat" would both be allowed. Postgres 15+ supports `UNIQUE NULLS NOT DISTINCT`. Decide which behavior you want.
- **Table-level checks:** `CHECK (ended_at IS NULL OR ended_at > started_at)`.

### 4.6 Normalization in plain words
- **1NF:** one value per cell. No `set1_reps, set2_reps, …` columns; sets become rows.
- **2NF/3NF:** every non-key column depends on the key, the whole key, and nothing but the key. An exercise's name lives in `exercises`, not copied onto every set.
- **Denormalizing on purpose:** storing `total_volume_kg` on `workouts` makes reads faster, but now two places must agree. Default to computing values. Add caching or summary tables later (M8), and only with a measured reason.

### 4.7 Polymorphism: strength vs cardio
A run has distance and duration. A lifting session has sets. Options:
1. **One wide table** with nullable columns for everything. Simple, but you get many NULLs and weak constraints.
2. **A table per type** (`runs`, `lifts`). Clean per type, but listing "all my workouts" becomes a UNION.
3. **A base table + detail tables** (`workouts` + `workout_sets`, plus optionally `cardio_details`). Shared fields live in one place, and details are typed.
4. **JSONB `details` column.** Flexible, but the DB can't easily enforce structure, and queries get harder.

The suggested starting point is **3**, with cardio fields as nullable columns on `workouts` (a light version of 1 for those few fields). Record what you choose and why in the decisions log.

### 4.8 Migrations: how they actually work
- The schema is code: versioned, reviewed, and reproducible on every machine and environment.
- A migration tool is mostly this:
  1. Make sure a `schema_migrations(name text primary key, applied_at timestamptz)` table exists.
  2. Read `migrations/*.sql` and sort by filename (`001_users.sql`, `002_daily_steps.sql`…).
  3. For each file that isn't recorded yet: `BEGIN` → run the SQL → insert its name → `COMMIT`. On error, `ROLLBACK` and stop.
- **Never edit a migration that has already run** in a shared environment. Write a new one.
- Production is forward-only. Down migrations are handy locally but rarely trusted in prod. M10 covers zero-downtime changes with expand/contract.

### 4.9 SQL you must be fluent in
```sql
-- Upsert a day's steps (idempotent PUT)
INSERT INTO daily_steps (user_id, day, steps)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, day)
DO UPDATE SET steps = EXCLUDED.steps, updated_at = now();

-- Weekly running distance (km) over the last 8 weeks, bucketed in the user's timezone
SELECT date_trunc('week', started_at AT TIME ZONE 'America/Los_Angeles') AS week,
       round(sum(distance_m) / 1000.0, 2) AS km
FROM workouts
WHERE user_id = $1
  AND kind = 'run'
  AND started_at >= now() - interval '8 weeks'
GROUP BY week
ORDER BY week;
```
Also learn: `INNER` vs `LEFT JOIN`, `GROUP BY` / `HAVING`, `generate_series` (to fill in days with no data), `DISTINCT ON`, window functions (`row_number()`, `max() OVER (PARTITION BY …)`, running totals), `RETURNING`, and CTEs (`WITH`).

---

## Build

- [ ] **B1** Add `docker-compose.yml` with Postgres. Connect with `psql`. Add `DATABASE_URL` to config and `.env.example`.
- [ ] **B2** Draw your ERD in `docs/data-model.md` (Mermaid). Adjust it to how *you* actually train. Record your decisions on units, IDs, and polymorphism. Every user-owned table (`daily_steps`, `workouts`, user-created `exercises`) carries a `user_id` FK, and sets are reachable to a user through their workout. M7 depends on this.
- [ ] **B3** Write `scripts/migrate.ts` (using `pg`): the bookkeeping table, sorted files, one transaction per file, stop on failure, and clear output. Add an `npm run migrate` script.
- [ ] **B4** Write migrations: `001_users`, `002_daily_steps`, `003_workouts`, `004_exercises_and_sets`, with every constraint from 4.4–4.5.
- [ ] **B5** Write a seed script: you as a user, a built-in exercise catalog (~20 lifts), and about 8 weeks of realistic steps, runs, and lifting sessions. Use your real numbers where you can.
- [ ] **B6** **SQL kata.** Write each in `sql/practice.sql` and run it in `psql`:
  1. Total steps over the last 7 days.
  2. Days in the last 30 where you met your step goal (join `users`).
  3. Daily steps for the last 30 days, with missing days shown as 0 (`generate_series` + `LEFT JOIN`).
  4. Weekly run distance in km.
  5. Total volume (`reps × weight_kg`) per strength workout.
  6. Heaviest set per exercise (your PRs). Write it twice: once with `DISTINCT ON`, once with a window function.
  7. Strength workouts that have no sets (`LEFT JOIN … WHERE … IS NULL`).
  8. The exercise you trained most often this month.
  9. Upsert a day's steps, and run it twice to prove it's idempotent.
  10. **Stretch:** your current streak of consecutive days meeting the step goal (look up "gaps and islands").
- [ ] **B7** **Violate every constraint** in `psql` and confirm the DB rejects each one. Record the SQLSTATE codes (`23505` unique, `23503` FK, `23514` check, `23502` not null). You'll map these to HTTP statuses in M5.

## Definition of done
- `docker compose up -d && npm run migrate` builds the schema from scratch on a fresh volume.
- Re-running `npm run migrate` does nothing (it's idempotent).
- The seed produces realistic data, and all kata queries run correctly.
- Every invalid state you can think of is rejected *by the database*.

---

## Checkpoint

1. `timestamp` vs `timestamptz`: which do you use for `workouts.started_at`, and what does Postgres actually store?
2. You log a run at 11:30pm in San Jose on Oct 11, then later fly to New York. Which "day" does the run belong to in your weekly stats? How does your schema (or your query) answer that?
3. Why is `daily_steps.day` a `date` rather than a `timestamptz`?
4. Why use `numeric` (or integer grams) instead of `real`/`double precision` for `weight_kg`?
5. The app already validates `steps >= 0`. Why also add a CHECK constraint? Describe a scenario where app-level validation alone fails (think about concurrency for UNIQUE).
6. `ON DELETE CASCADE` vs `RESTRICT`: which for workout → sets, and which for exercise → sets? Why?
7. Write a query that lists every workout with its set count, including workouts with zero sets. Why does the join type matter here?
8. What does a migration tool's bookkeeping table do? Why should you never edit a migration that has already run in production?
9. Which polymorphism approach did you choose for strength vs cardio, and what's its biggest drawback?
10. Write SQL that returns, for each exercise, your heaviest weight and the date you lifted it.

**Explain it back:** You have a spreadsheet with columns `date, workout type, exercise, set1 reps, set1 weight, set2 reps, set2 weight, …`. Walk through normalizing it into your tables, and explain each step.

---

## Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Concepts understood
- [ ] 4.1 When relational fits
- [ ] 4.2 Postgres in Docker, `psql`
- [ ] 4.3 Domain model / ERD
- [ ] 4.4 Type choices (time, dates, numbers, enums)
- [ ] 4.5 Constraints and FK behaviors
- [ ] 4.6 Normalization and deliberate denormalization
- [ ] 4.7 Polymorphic data strategies
- [ ] 4.8 How migrations work
- [ ] 4.9 SQL fluency

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
| 10 | Streak (stretch) | ⬜ | |

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
- Date/time types: https://www.postgresql.org/docs/current/datatype-datetime.html
- Constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- Window functions: https://www.postgresql.org/docs/current/tutorial-window.html
- Error codes (SQLSTATE): https://www.postgresql.org/docs/current/errcodes-appendix.html
