# Backend Engineering Course: `fittrack-api`

> Learn backend fundamentals by designing, building, testing, and deploying a real API that tracks my own physical activity, including daily steps, runs, walks, rides, and lifting sessions.

| | |
|---|---|
| **Learner** | Mathew |
| **Started** | 2026-10-11 |
| **Current module** | 01: HTTP & Node.js Foundations |
| **Current step** | Setup checklist (section 9), then M01 → Learn 1.1–1.9, then Build B1 |
| **Overall status** | 🟨 In progress |
| **Estimated total** | ~90–110 hours best case; plan for 4–5 months at 6–8 hrs/week (M4, M5, M7, M9 can each take 12–15 hrs) |

---

## 1. How this course works

Each module file in `modules/` has the same five parts:

1. **Learn**: the concepts, explained with examples from this project.
2. **Build**: a milestone for `fittrack-api`. **You write the code.** Claude reviews it, gives hints, and explains. Full solutions come only when you're truly stuck, and only after you've tried.
3. **Definition of done**: what has to be true before you move on.
4. **Checkpoint**: about 10 questions (concept, scenario, and code-reading) plus an "explain it back" prompt. Pass mark: **80%**.
5. **Tracker**: concept checkboxes, dates, quiz score, notes, and an error log. Updated after every session.

### Ground rules
- **Type every line yourself.** You learn far less from reading code than from writing it.
- **Design before code.** Most build sections start with a short written design. Do it.
- **Commit at the end of every build task** with a real message. Your git history is part of your portfolio.
- **Log your errors.** When something breaks, write the error and the fix in that module's error log. Over time this log becomes the most valuable part of the course.
- **Don't skip checkpoints.** If you score under 80%, review the missed topics and retake those questions in the next session.
- **Use real data.** Log your actual workouts and steps. You'll find edge cases that a tutorial would never show you.

### Status legend
⬜ Not started · 🟨 In progress · ✅ Complete · 🔁 Needs review

---

## 2. Stack and why

| Layer | Choice | Why this, for learning |
|---|---|---|
| Runtime | **Node.js (current LTS) + TypeScript, `strict`** | You already know it, so your attention goes to backend concepts instead of syntax. Your types can also be shared with the React app later. |
| HTTP | **Raw `node:http` first (M1), then Express 5** | You'll see exactly what a framework does before you rely on one. Express 5 forwards rejected promises to the error handler natively. |
| Database | **PostgreSQL** (Docker locally, managed in prod) | Relational data, constraints, transactions, and aggregations. It's the default choice in industry for good reason. |
| Data access | **`pg` with raw SQL (M4–M5) → Kysely** | You learn real SQL first. Then you add type safety without an ORM hiding the SQL from you. |
| Migrations | **Your own tiny runner (M4)** | Writing about 60 lines yourself shows you exactly what every migration tool does. |
| Validation | **Zod** | Runtime validation at the trust boundary, with TS types derived from the same schemas. |
| Logging | **pino** | Structured JSON logs, fast, and standard in Node. |
| Testing | **Vitest + Supertest** from M2 (HTTP smoke tests), then **a real Postgres test DB** in M6 | Integration tests through HTTP are where backend testing pays off most. Starting in M2 gives you a safety net for the M5 swap to Postgres. |
| Auth | **Server-side sessions in Postgres, argon2id, HttpOnly cookies** | The safest default for a browser frontend. JWTs are covered as a trade-off, not used as the default. |
| Jobs | **pg-boss** (Postgres-backed queue) | Background jobs without adding a new piece of infrastructure. |
| Cache | **Redis** (M8) | Cache-aside, shared rate limits, and TTLs. |
| Containers | **Docker + Docker Compose** (Postgres from M4, production image in M9) | Dev/prod parity, and one command to run the whole stack. |
| CI/CD | **GitHub Actions** | Lint, typecheck, test, and build on every push. |
| Hosting | **A PaaS (Fly.io, Render, or Railway)**, decided in M10 | Managed Postgres, worker processes, and TLS, without becoming a cloud-infra course. |

**Why not a different route?**
- *Go, Python, Java?* Go in particular is a great backend language. But learning a new language while learning backend fundamentals splits your attention. Everything here transfers. A strong follow-up project after the course is rewriting one piece of this API in Go.
- *Prisma or another ORM?* An ORM hides the SQL, and SQL is the skill. Once you know SQL, you can learn any ORM in an afternoon. If you start with the ORM, you never really learn SQL.
- *NestJS?* It adds a lot of structure and decorators. You'll understand why that structure exists better after you've built a layered architecture by hand in M2.

---

## 3. The app: what `fittrack-api` does

It tracks physical activity for one person at first (you), and it's designed from day one so it could support many users.

**Core entities**
- **User**: account, timezone, daily step goal
- **DailySteps**: one row per user per *local calendar day*
- **Workout**: a session with a kind (`strength`, `run`, `walk`, `cycle`, `other`), start/end time, optional distance, and notes
- **Exercise**: a catalog entry such as "Back Squat" or "Bench Press", either built-in or created by the user
- **Set**: reps × weight (with optional RPE) for one exercise inside a strength workout

**Features built along the way**
CRUD for all of the above · step syncing (idempotent) · filtering and pagination · weekly summaries · personal records (PRs) and estimated 1RM · step-goal streaks · CSV import of step history (background job) · auth · caching · deployment.

**Suggested repo layout** (keep this course *inside* the repo):
```
fittrack-api/
  docs/
    course/            ← this course (COURSE.md + modules/)
    api.md             ← your API design (M2)
    data-model.md      ← your ERD (M4)
  src/
  migrations/
  scripts/
  tests/
  docker-compose.yml
```

---

## 4. Course map

| # | Module | Core skills | Project milestone | Status | Quiz | Completed |
|---|---|---|---|---|---|---|
| 01 | [HTTP & Node.js Foundations](modules/01-http-and-node-foundations.md) | HTTP messages, methods, status codes, event loop, TS project setup | `/health` in raw `node:http`, then Express | ⬜ | — | — |
| 02 | [API Design & Architecture](modules/02-api-design-and-architecture.md) | REST resource modeling, pagination, errors, versioning, layered architecture, first HTTP tests | In-memory CRUD for workouts, steps, exercises, sets, with Vitest + Supertest smoke tests | ⬜ | — | — |
| 03 | [Validation, Errors, Config & Logging](modules/03-validation-errors-config-logging.md) | Trust boundaries, Zod, central error handling, 12-factor config, structured logs | Bulletproof input handling, problem+json errors, pino | ⬜ | — | — |
| 04 | [Relational Data Modeling & SQL](modules/04-relational-modeling-and-sql.md) | Schema design, types, constraints, normalization, migrations, SQL fluency, `user_id` ownership from day one | Postgres in Docker, your own migration runner, seed data, SQL kata | ⬜ | — | — |
| 05 | [Data Access, Transactions & Performance](modules/05-data-access-transactions-performance.md) | Pooling, injection, transactions, isolation, indexes, EXPLAIN, N+1, Kysely | Postgres-backed repos, atomic workout+sets, stats & PR endpoints | ⬜ | — | — |
| 06 | [Testing a Backend](modules/06-testing.md) | Test pyramid, unit vs integration, real-DB tests, factories, TDD, time in tests | Full test suite; TDD the streak feature | ⬜ | — | — |
| 07 | [Auth & Security](modules/07-auth-and-security.md) | Password hashing, sessions vs JWT, cookies, CSRF, IDOR, rate limiting, OWASP API Top 10 | Register/login/logout, ownership on every query | ⬜ | — | — |
| 08 | [Caching, Background Jobs & Async Work](modules/08-caching-and-background-jobs.md) | Queues, retries, idempotency, HTTP caching, Redis cache-aside, eventual consistency | CSV step import job, idempotency keys, ETags, cached stats | ⬜ | — | — |
| 09 | [Production Readiness](modules/09-production-readiness.md) | Logs/metrics/traces, health checks, graceful shutdown, Docker, CI, OpenAPI, load testing | Dockerized stack, CI pipeline, metrics, API docs | ⬜ | — | — |
| 10 | [Deployment, Operations & Capstone](modules/10-deployment-and-capstone.md) | Environments, secrets, zero-downtime migrations, CORS/cookies, backups, alerting | Live in production, runbook, restore drill, portfolio README | ⬜ | — | — |

---

## 5. Skills ledger (cumulative, "I can…")

Tick these as you *prove* them in a build or checkpoint, not when you read about them.

**HTTP & APIs**
- [ ] Explain an HTTP request/response at the byte level, and pick correct methods and status codes (M1)
- [ ] Design a resource-oriented API with consistent naming, errors, pagination, and versioning (M2)
- [ ] Structure a codebase into routes → services → repositories with clean dependencies (M2)
- [ ] Validate every input at the trust boundary and derive types from schemas (M3)
- [ ] Paginate with opaque cursors and whitelist filters and sorts (M2)
- [ ] Document an API with OpenAPI so a frontend can build against it (M9)

**Data**
- [ ] Model a domain relationally, with appropriate types and constraints (M4)
- [ ] Store UTC instants and SI units, and derive local calendar days from the user's IANA timezone (M2, M4)
- [ ] Write and run migrations, and explain how migration tools work (M4)
- [ ] Write SQL with joins, aggregations, upserts, `generate_series`, and window functions (M4)
- [ ] Use transactions correctly and reason about concurrent writes (M5)
- [ ] Diagnose slow queries with `EXPLAIN ANALYZE` and fix them with indexes (M5)
- [ ] Spot and fix N+1 queries (M5)
- [ ] Change a production schema without downtime using expand/contract (M10)

**Reliability**
- [ ] Centralize error handling and keep internal details out of client responses (M3)
- [ ] Emit structured logs with request IDs (M3)
- [ ] Move slow work to idempotent background jobs with retries (M8)
- [ ] Make a POST endpoint safe to retry with idempotency keys (M8)
- [ ] Cache responsibly (HTTP caching, cache-aside) and invalidate correctly (M8)
- [ ] Implement health checks, graceful shutdown, and metrics (M9)

**Security**
- [ ] Store passwords correctly and implement session auth with secure cookies (M7)
- [ ] Prevent IDOR/BOLA and mass assignment (M7)
- [ ] Rate-limit login with an in-memory limiter (M7), then share the limit across instances with Redis (M8)
- [ ] Configure CORS and cookies for a separate frontend origin (M10)

**Testing**
- [ ] Write HTTP smoke tests against an in-memory API (M2)
- [ ] Write unit, integration, and HTTP tests with a real test database (M6)
- [ ] Test time- and timezone-dependent logic deterministically (M6)
- [ ] Use TDD to build a feature (M6)

**Ops**
- [ ] Containerize the app with a multi-stage, non-root Docker image (M9)
- [ ] Run CI that lints, typechecks, tests, and builds (M9)
- [ ] Deploy API + worker + DB + cache, and run a backup restore drill (M10)
- [ ] Write a runbook and reason about alerting (M10)

---

## 6. Decisions log (lightweight ADRs)

Record every significant choice: what you chose, why, and what you rejected. Writing down decisions this way is itself a core backend skill.

| Date | Decision | Why | Alternatives considered |
|---|---|---|---|
| 2026-10-11 | Node.js + TypeScript + Express 5 | Existing familiarity, so focus goes to fundamentals; types can be shared with React later | Go, Fastify, NestJS |
| 2026-10-11 | PostgreSQL | Relational domain, constraints, aggregations, industry default | MongoDB, SQLite |
| 2026-10-11 | Raw SQL first, then Kysely | Learn SQL for real, then add type safety | Prisma, Drizzle, TypeORM |
| 2026-10-11 | Sessions over JWT (tentative, confirm in M7) | Browser client, instant revocation, simpler security | JWT access + refresh tokens |
| 2026-10-11 | Every table and repository method carries `user_id` from M2/M4, using a hardcoded dev user until M7 | Avoids retrofitting ownership filters in M7; M7 only swaps in real identity | Add `user_id` later |
| 2026-10-11 | HTTP tests start in M2; M6 deepens them (real DB, factories, TDD) | Gives a safety net before the M5 in-memory → Postgres swap | All testing in M6 |
| 2026-10-11 | Store UTC instants (`timestamptz`) and SI units; owners are M2 (API naming) and M4 (schema) | Silent unit and timezone bugs are the most expensive kind | Store local time or user-preferred units |
| | *(add yours: Node version, ID type, polymorphism approach, hosting…)* | | |

---

## 7. Session log

Add a row at the end of every session. Write "Next step" so that a cold start in a new chat knows exactly where to pick up.

| Date | Module | What I did | What I learned / struggled with | Next step |
|---|---|---|---|---|
| 2026-10-11 | — | Course created | — | M01 → Learn 1.1–1.9, then Build B1 |

---

## 8. Working with Claude on this course

### Resuming in a new chat
Context windows are limited, so these files are the source of truth. To resume:
1. Keep this folder in your repo at `docs/course/`.
2. In a new chat, attach `COURSE.md` and the current module file (or connect the folder through the Claude desktop app so Claude can read and update the files directly).
3. Say something like: *"Resume my backend course. Read COURSE.md and modules/0X. Last session I finished B3; here's my code / here's what broke."*

### Update protocol (for Claude, after each session)
1. **Module file:** tick finished concepts and build tasks; set status and dates; add notes, the error log, and open questions.
2. **COURSE.md:** update the header (current module/step), the course map row, the skills ledger (only for skills that were proven), and the decisions log if a choice was made. Append a session log row with a concrete next step.
3. Edit the files in place when the folder is connected; otherwise return the updated files.

### If you fall behind
Cut in this order, and log the cut in the decisions log: (1) Redis in M8 (keep pg-boss, ETags, idempotency keys), (2) Kysely in M5 (stay on `pg` + raw SQL), (3) the stretch tasks in every module. Never cut M4, M5, M6, or M7.

### Failing a checkpoint twice
Redo the weak part of that module's build task, then retake a **fresh** set of questions (ask Claude to write new ones), not the same ones.

### Taking a checkpoint
Say *"Quiz me on Module 0X."* Claude asks one question at a time, and you answer without notes. Each answer is graded 0 / 0.5 / 1 with an explanation. Claude then records the score and your weak spots in the module tracker. Under 80% → review → retake only the missed questions next session.

### Getting help without getting the answer
Ask for a **hint level**:
- **Hint 1:** which concept or doc to look at
- **Hint 2:** the approach in plain English
- **Hint 3:** pseudocode
- **Hint 4:** a code review of your attempt
- **Solution:** only after hint 4, and you then retype it rather than pasting

---

## 9. Setup checklist (before Module 01)
- [ ] Node.js current LTS installed (pin it in `.nvmrc` and note the version in the decisions log)
- [ ] Docker Desktop (or equivalent) installed and running
- [ ] Git + a new GitHub repo `fittrack-api`
- [ ] An HTTP client: `curl` plus one of Bruno, Insomnia, or the VS Code REST Client (`.http` files)
- [ ] A Postgres client: `psql` and optionally a GUI (TablePlus, DBeaver, pgAdmin)
- [ ] This course folder copied to `docs/course/` in the repo (do this first, so all course edits happen there)
- [ ] `.gitignore` includes `.env` and `node_modules`; commit only `.env.example`
