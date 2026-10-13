# Backend Engineering Course: `fittrack-api`

> Learn backend fundamentals by designing, building, testing, and deploying a real API that tracks my own physical activity, including daily steps, runs, walks, rides, and lifting sessions.

| | |
|---|---|
| **Learner** | Mathew |
| **Started** | 2026-10-11 |
| **Current module** | 01: HTTP & Node.js Foundations |
| **Current step** | Not started (begin with 01 → Part 1: Concepts) |
| **Overall status** | 🟨 In progress |
| **Estimated total** | ~130–160 hours (about 4–5 months at 7–8 hrs/week) |

---

## 1. How this course works

### The teaching model: I do → we do → you do
You can't be challenged on something you've never been shown. So every pattern is taught in three steps:

1. **I do (⌨️ type along):** a complete worked example. Every line is given and explained. You type it out (don't paste) and run it.
2. **We do (🧰 toolbox):** the exact syntax and APIs you'll need next, shown as small standalone examples. These are building blocks, not solutions.
3. **You do (🧩 challenge):** you build the next feature yourself using the same pattern. You get a precise spec, acceptance tests (so you know when you're done), and hints hidden in fold-outs.

### Anatomy of a module
| Section | Purpose |
|---|---|
| 🎓 **Tutor prompt** | Paste it into a new chat to make Claude this module's teacher (see §8) |
| **How to use this module** | The parts, in order, with time estimates |
| 📖 **Read** | Concepts explained in depth, with diagrams, real output, and examples from this app |
| ⌨️ **Type along** | Setup, config, and one complete worked example per pattern |
| 🧰 **Toolbox** | Syntax reference for the challenges |
| 🧩 **Challenges** | You write the code. Each has a spec table, ✅ acceptance tests, and 💡 hints (direction → approach → pseudocode). |
| **Definition of done** | What must be true before you move on |
| ✍️ **Checkpoint** | 10 questions + "explain it back." Pass mark: **80%**. |
| 📋 **Tracker** | Progress checkboxes, concepts, quiz score, notes, error log |

### What's given vs. what you write
The line is drawn at **what a backend engineer needs to be able to write from scratch.**

| Given in full, with explanations (⌨️) | You write (🧩) |
|---|---|
| Tool installs, `package.json`, `tsconfig.json`, ESLint/Prettier | HTTP handlers and routing |
| Small infrastructure helpers (an async error wrapper, error classes, a clock) | Request parsing and validation |
| One complete worked example of each new pattern | Business rules (services) |
| Docker Compose, Dockerfiles, CI YAML, test-runner config (each explained) | Repositories, SQL queries, migrations |
| | Transactions, auth logic, jobs, caching logic |
| | Tests |

**Scaffolding fades over the course.** Early modules give more; later modules expect you to reuse patterns you already know. When a later module introduces something genuinely new (SQL, transactions, sessions, queues), it gets its own worked example first.

### Content depth: full vs. outline
Modules marked **✅ Full** are ready to work through. Modules marked **📝 Outline** contain the syllabus (topics, milestone, checkpoint) and are **expanded to full depth just before you start them**, using what you struggled with in the previous module. To trigger this, say: *"Expand Module 0X to full depth."*

### Ground rules
- **Type every line yourself**, including the given code. You learn far less from reading code than from writing it.
- **Try before opening a hint.** Spend at least 15–20 minutes stuck before opening Hint 1, and open the hints in order.
- **Design before code.** Most challenges start with a short written design (like `docs/api.md`). Do it.
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
| Testing | **Vitest + Supertest + a real Postgres test DB** | Integration tests through HTTP are where backend testing pays off most. |
| Auth | **Server-side sessions in Postgres, argon2id, HttpOnly cookies** | The safest default for a browser frontend. JWTs are covered as a trade-off, not used as the default. |
| Jobs | **pg-boss** (Postgres-backed queue) | Background jobs without adding a new piece of infrastructure. |
| Cache | **Redis** (M8) | Cache-aside, shared rate limits, and TTLs. |
| Containers | **Docker + Docker Compose** | Dev/prod parity, and one command to run the whole stack. |
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

| # | Module | Core skills | Project milestone | Depth | Status | Quiz | Completed |
|---|---|---|---|---|---|---|---|
| 01 | [HTTP & Node.js Foundations](modules/01-http-and-node-foundations.md) | HTTP messages, methods, status codes, event loop, TS project setup | `/health` and `/echo` in raw `node:http`, then Express | ✅ Full | ⬜ | — | — |
| 02 | [API Design & Architecture](modules/02-api-design-and-architecture.md) | REST resource modeling, pagination, errors, versioning, layered architecture | In-memory CRUD for steps, exercises, workouts, sets | ✅ Full | ⬜ | — | — |
| 03 | [Validation, Errors, Config & Logging](modules/03-validation-errors-config-logging.md) | Trust boundaries, Zod, central error handling, 12-factor config, structured logs | Bulletproof input handling, problem+json errors, pino | 📝 Outline | ⬜ | — | — |
| 04 | [Relational Data Modeling & SQL](modules/04-relational-modeling-and-sql.md) | Schema design, types, constraints, normalization, migrations, SQL fluency | Postgres in Docker, your own migration runner, seed data, SQL kata | 📝 Outline | ⬜ | — | — |
| 05 | [Data Access, Transactions & Performance](modules/05-data-access-transactions-performance.md) | Pooling, injection, transactions, isolation, indexes, EXPLAIN, N+1, Kysely | Postgres-backed repos, atomic workout+sets, stats & PR endpoints | 📝 Outline | ⬜ | — | — |
| 06 | [Testing a Backend](modules/06-testing.md) | Test pyramid, unit vs integration, real-DB tests, factories, TDD, time in tests | Full test suite; TDD the streak feature | 📝 Outline | ⬜ | — | — |
| 07 | [Auth & Security](modules/07-auth-and-security.md) | Password hashing, sessions vs JWT, cookies, CSRF, IDOR, rate limiting, OWASP API Top 10 | Register/login/logout, ownership on every query | 📝 Outline | ⬜ | — | — |
| 08 | [Caching, Background Jobs & Async Work](modules/08-caching-and-background-jobs.md) | Queues, retries, idempotency, HTTP caching, Redis cache-aside, eventual consistency | CSV step import job, idempotency keys, ETags, cached stats | 📝 Outline | ⬜ | — | — |
| 09 | [Production Readiness](modules/09-production-readiness.md) | Logs/metrics/traces, health checks, graceful shutdown, Docker, CI, OpenAPI, load testing | Dockerized stack, CI pipeline, metrics, API docs | 📝 Outline | ⬜ | — | — |
| 10 | [Deployment, Operations & Capstone](modules/10-deployment-and-capstone.md) | Environments, secrets, zero-downtime migrations, CORS/cookies, backups, alerting | Live in production, runbook, restore drill, portfolio README | 📝 Outline | ⬜ | — | — |

---

## 5. Skills ledger (cumulative, "I can…")

Tick these as you *prove* them in a build or checkpoint, not when you read about them.

**HTTP & APIs**
- [ ] Explain an HTTP request/response at the byte level, and pick correct methods and status codes (M1)
- [ ] Design a resource-oriented API with consistent naming, errors, pagination, and versioning (M2)
- [ ] Structure a codebase into routes → services → repositories with clean dependencies (M2)
- [ ] Validate every input at the trust boundary and derive types from schemas (M3)
- [ ] Document an API with OpenAPI so a frontend can build against it (M9)

**Data**
- [ ] Model a domain relationally, with appropriate types and constraints (M4)
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
- [ ] Rate-limit sensitive endpoints (M7, M8)
- [ ] Configure CORS and cookies for a separate frontend origin (M10)

**Testing**
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
| | *(add yours: ID type, units, polymorphism approach, hosting…)* | | |

---

## 7. Session log

Add a row at the end of every session. Write "Next step" so that a cold start in a new chat knows exactly where to pick up.

| Date | Module | What I did | What I learned / struggled with | Next step |
|---|---|---|---|---|
| 2026-10-11 | — | Course created | — | M01 → Learn 1.1–1.9, then Build B1 |
| 2026-10-12 | — | Course revised after feedback ("I can't be challenged if I don't know the direction"). New I do → we do → you do structure. M01 and M02 rewritten at full depth (guided setup with every config line explained, worked examples, toolboxes, specs with acceptance tests, inline hints). M03–M10 marked as outlines, to be expanded just in time. | Needed more teaching material and guided setup before challenges | M01 → Part 1 (Concepts), then Part 2 (Setup) |
| 2026-10-12 | — | Added a 🎓 tutor prompt to every module (role, prep, teaching rules, module focus, quiz and wrap-up protocol) | — | Paste the M01 tutor prompt into a new chat and start Part 1 |

---

## 8. Working with Claude on this course

### Starting a session: use the module's 🎓 tutor prompt
Context windows are limited, so these files are the source of truth, and every module has a **tutor prompt** near the top that turns a fresh chat into that module's teacher.
1. Keep this folder in your repo at `docs/course/`.
2. Open a **new chat** and connect your repo folder through the Claude desktop app, so Claude can read your code and update the tracker directly. (Or attach `COURSE.md`, the current module file, and any code you want reviewed.)
3. Copy the module's 🎓 tutor prompt and paste it as your first message. Optionally add a line like *"Last session I finished Challenge 2; here's what broke."*
4. Claude reads the files, tells you where you left off, and picks up from there. Say **"quiz me"** for the checkpoint and **"wrap up"** at the end of every session so the tracker and session log get updated.

Each tutor prompt contains:

| Part | What it does |
|---|---|
| **ROLE** | A persona suited to the module (e.g., a Postgres database engineer for M04, an application security engineer for M07) |
| **ABOUT ME** | Your background and this module's stack |
| **PREP** | Read COURSE.md + the module + its tracker, skim your code, then open with where you left off. For 📝 outline modules, expand the module first. |
| **HOW TO TEACH ME** | The shared rules: given code is explained freely, syntax help is always allowed, challenges get hints, never solutions |
| **FOCUS** | What to emphasize, the misconceptions to watch for, and the bar you must clear before moving on |
| **CHECKPOINT / END OF SESSION** | The quiz protocol and the tracker/session-log update on "wrap up" |

### Update protocol (for Claude, after each session)
1. **Module file:** tick finished parts, challenges, and concepts; set status and dates; add notes, the error log, and open questions.
2. **COURSE.md:** update the header (current module/step), the course map row, the skills ledger (only for skills that were proven), and the decisions log if a choice was made. Append a session log row with a concrete next step.
3. Return the updated files.

### Expanding an outline module (for Claude)
When the learner is about to start a 📝 Outline module, rewrite it to match the structure and depth of Modules 01–02:
- "How to use this module" table → 📖 Read (in depth, with diagrams and real output) → ⌨️ type-along setup and **one complete worked example per new pattern** → 🧰 toolbox → 🧩 challenges with spec tables, ✅ acceptance tests, and 💡 three-level hints in `<details>` → Definition of done → ✍️ Checkpoint → 📋 Tracker.
- Respect the given-vs-you-write table in §1. Verify every given code snippet compiles and runs before publishing it.
- Read the previous module's tracker (weak spots, error log, notes) and address those gaps.
- Keep the module's existing milestone and checkpoint topics unless the learner agrees to change them.
- Keep the module's 🎓 tutor prompt: remove its step "2b" (the expand-this-module step) and the outline banner, update its FOCUS bullets if the expanded content changed, and set **Content depth** to ✅ Full here and in the course map.

### Taking a checkpoint
Say *"Quiz me on Module 0X."* Claude asks one question at a time, and you answer without notes. Each answer is graded 0 / 0.5 / 1 with an explanation. Claude then records the score and your weak spots in the module tracker. Under 80% → review → retake only the missed questions next session.

### Getting help without getting the answer
Hints 1–3 are built into each challenge as fold-outs. Beyond those, ask Claude for:
- **Hint 4:** a code review of your attempt (paste your code, or let Claude read your repo)
- **A syntax question:** "How do I do X in TypeScript/Express/SQL?" Always fair game. Not knowing syntax is never a reason to be stuck.
- **Solution:** only after hint 4, and you then retype it rather than pasting

---

## 9. Setup checklist
Module 01, Part 2 walks through all of this step by step. This is just the summary.
- [ ] Node.js LTS installed via a version manager, and pinned in `.nvmrc` (M01)
- [ ] VS Code extensions: ESLint, Prettier, REST Client (M01)
- [ ] Git + a private GitHub repo `fittrack-api` (M01)
- [ ] This course folder copied to `docs/course/` in the repo (M01)
- [ ] Docker Desktop (or equivalent) installed and running (needed from M04)
- [ ] A Postgres client: `psql`, plus optionally a GUI such as TablePlus, DBeaver, or pgAdmin (needed from M04)
