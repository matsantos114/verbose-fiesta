# Module 09: Production Readiness: Observability, Containers & CI

> 📝 **Outline version.** This module currently holds the syllabus: topics, milestone, and checkpoint. The 🎓 tutor prompt below expands it to full depth automatically the first time you use it (or ask Claude to **"Expand Module 09 to full depth"**). You'll get the same structure as Modules 01–02: in-depth reading, type-along setup, a complete worked example for each new pattern, a toolbox, and challenges with acceptance tests and hints. The "Build" list below shows what you'll build; the expanded version teaches you how.

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | 📝 Outline (expand before starting) |
| **Estimated time** | 8–10 hours |
| **Prerequisites** | Module 08 |
| **Project milestone** | Liveness/readiness checks, graceful shutdown, Prometheus metrics, a multi-stage non-root Docker image, the full stack in Compose, a GitHub Actions CI pipeline, and an OpenAPI spec with docs |

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
- Stack for this module: Node.js LTS + TypeScript + Express 5 + PostgreSQL + Redis + pg-boss, adding Docker, Docker Compose, GitHub Actions, prom-client metrics, and OpenAPI.

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/09-production-readiness.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
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
- Per COURSE.md, Dockerfiles, Compose files, and CI YAML are given with explanations. Make sure I can explain every line. The app-side code (health checks, graceful shutdown, metrics) is mine to write.
- Liveness vs. readiness, and what the platform does with each.
- Graceful shutdown: have me prove it with a real SIGTERM during a slow request.
- Image layering, multi-stage builds, non-root users, and `.dockerignore`.
- Metrics: RED per route template; label cardinality; reading p50/p95/p99 from my own load tests.
- OpenAPI as the contract for the future React frontend.
- Watch for these common misconceptions and correct them when they show up: liveness checks that depend on the database; running migrations on every boot; trusting averages instead of percentiles; `npm install` in CI; running containers as root; putting user IDs in metric labels.
- Hold me to this standard before I move on: a fresh clone + `docker compose up` gives a working, migrated stack; CI is green and protects `main`; SIGTERM never drops an in-flight request; the OpenAPI spec matches the API.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

## Why this matters
"It works on my machine" isn't a deployment strategy. Before going live, the service has to be observable (you can tell what it's doing), disposable (it starts and stops cleanly), reproducible (same image everywhere), and verified automatically on every change.

## Learning objectives
- Distinguish logs, metrics, and traces, and know which answers which question.
- Implement liveness and readiness checks correctly.
- Shut down gracefully without dropping in-flight work.
- Build small, secure, cache-friendly Docker images.
- Run the whole stack with Docker Compose, with migrations as a one-off step.
- Build a CI pipeline that lints, typechecks, tests against real services, and builds the image.
- Document the API with OpenAPI as a contract for the frontend.
- Run a basic load test and read latency percentiles.

---

## Learn

### 9.1 Observability: three signals
| Signal | What it is | Best for |
|---|---|---|
| **Logs** | Discrete events with context (M3) | "Why did *this* import fail?" |
| **Metrics** | Numeric aggregates over time | "Did p95 latency double after the deploy?" |
| **Traces** | One request's path through components, with timings | "Where does time go inside this slow request?" |

- For request metrics, use **RED**: **R**ate, **E**rrors, **D**uration, per route.
- `prom-client` exposes a `/metrics` endpoint for Prometheus. **OpenTelemetry** is the vendor-neutral standard for traces (and increasingly for metrics and logs too).
- **Label cardinality:** label metrics by *route template* (`/v1/workouts/:id`) and status code, never by raw URL or user ID. Unbounded labels create a time series per value and can overwhelm a metrics system.

### 9.2 Liveness vs readiness
- **Liveness** (`/health/live`): is the process alive and its event loop responsive? Failing it → the platform **restarts** the instance. Keep it dependency-free; a database outage shouldn't trigger endless restarts.
- **Readiness** (`/health/ready`): can this instance serve traffic right now (DB and Redis reachable, startup finished)? Failing it → the platform **stops sending traffic** to it, without restarting it.

### 9.3 Graceful shutdown
The platform sends `SIGTERM` before stopping an instance (on every deploy). On SIGTERM:
1. Start failing readiness (so traffic stops arriving).
2. `server.close()`: stop accepting new connections, and let in-flight requests finish.
3. Stop the job worker from taking new jobs, and let current jobs finish.
4. Close the DB pool, Redis, and the queue.
5. Exit 0. Add a hard timeout (e.g., 10–20s) so a stuck request can't block shutdown forever.

Without this, every deploy cuts off in-flight requests and abandons jobs mid-run.

### 9.4 Docker images
```dockerfile
FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations
USER node
CMD ["node", "dist/server.js"]
```
(Match the Node version to your `.nvmrc`.)
- **Layer caching:** copy the package files and install dependencies *before* copying the source, so code changes don't reinstall everything.
- **Multi-stage builds:** compilers and dev dependencies stay in the build stage, which gives a smaller image and a smaller attack surface.
- **Non-root (`USER node`):** if the app is compromised, the attacker doesn't get root inside the container.
- Add a `.dockerignore` (`node_modules`, `.git`, `.env`, tests, `dist`).
- **One process per container:** the API and the worker use the same image with different commands.

### 9.5 Twelve-factor, revisited
Config in the environment (M3) · logs to stdout · disposability (9.3) · dev/prod parity (Compose mirrors prod) · **admin processes as one-offs**. Migrations run as a separate step, not on every app boot, because several instances booting at once would race each other running migrations.

### 9.6 Continuous integration
On every push and pull request:
1. `npm ci` (installs exactly what the lockfile says; fails if it's out of sync)
2. lint → typecheck → unit tests
3. integration tests against **Postgres and Redis service containers**
4. `docker build`

Then protect `main`: merges require green CI.

### 9.7 OpenAPI: the contract
- OpenAPI 3.1 describes every endpoint, schema, and error. You can generate it from your Zod schemas (e.g., `zod-to-openapi`, or JSON Schema output from Zod) or write it by hand.
- Serve interactive docs at `/docs` (Swagger UI or Scalar) outside production, or publish them.
- Payoff at the end of the course: generate a typed TypeScript client for the React app from this spec.

### 9.8 Load testing and percentiles
- Use `autocannon` or `k6`. Measure **p50 / p95 / p99**, not the average. Averages hide the slow requests your users actually notice.
- Watch for pool saturation (M5), event loop blocking (M1), and missing indexes (M5).

### 9.9 Dependency hygiene
Commit the lockfile, use `npm ci` in CI, run `npm audit`, and turn on Dependabot or Renovate. Keep upgrades small and frequent.

---

## Build

- [ ] **B1** Add `/health/live` and `/health/ready` (checks DB + Redis, and returns 503 when degraded or shutting down).
- [ ] **B2** Implement graceful shutdown for the API and the worker. **Test it:** start a slow request, send `SIGTERM`, and confirm the request completes and the process exits cleanly.
- [ ] **B3** Add a `/metrics` endpoint with `prom-client`: an HTTP duration histogram labeled by route template + method + status, plus default process metrics. Decide how to keep it non-public.
- [ ] **B4** Write a multi-stage, non-root `Dockerfile` and a `.dockerignore`. Record the image size.
- [ ] **B5** Compose: `api`, `worker`, `db`, `redis`, plus a one-off `migrate` service. `docker compose up` runs everything.
- [ ] **B6** **GitHub Actions CI:** lint, typecheck, unit tests, integration tests with Postgres + Redis services, and `docker build`. Add a status badge to the README, and protect `main`.
- [ ] **B7** Write an OpenAPI spec covering every endpoint, and serve docs at `/docs` in non-production.
- [ ] **B8** Load-test `GET /v1/workouts` and `GET /v1/stats/weekly`. Find one bottleneck, fix it, and record before/after p95 below.
- [ ] **B9** Add a Dependabot config. Get `npm audit` clean, or document why a finding doesn't apply.

## Definition of done
- A fresh clone + `docker compose up` gives a working stack with a migrated DB.
- CI is green on `main` and blocks merges when it fails.
- A deploy-style `SIGTERM` never drops an in-flight request.
- The OpenAPI spec matches the implementation (spot-check five endpoints).

---

## Checkpoint

1. Logs, metrics, or traces: which would you reach for in each case? (a) "p95 latency of `/stats/weekly` doubled since yesterday's deploy"; (b) "why did my CSV import fail?"; (c) "where does the time go inside one slow request?"
2. The DB is down for 30 seconds. What should liveness and readiness each return, and what does the platform do in response to each?
3. Walk through graceful shutdown on SIGTERM. What happens to in-flight requests and running jobs if you don't implement it?
4. Why copy `package*.json` and run `npm ci` before copying the source code in a Dockerfile?
5. What do multi-stage builds and running as non-root each buy you?
6. Why run migrations as a separate step rather than on every app boot?
7. What is p99 latency, and why care about it more than the average?
8. Why use `npm ci` in CI instead of `npm install`?
9. Which labels make good metric labels, and which make bad ones? Why is `userId` a bad label?
10. Why is an OpenAPI spec valuable *before* you start the React frontend?

**Explain it back:** Describe everything that happens from `git push` to a green CI check.

---

## Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Concepts understood
- [ ] 9.1 Logs, metrics, traces; RED; cardinality
- [ ] 9.2 Liveness vs readiness
- [ ] 9.3 Graceful shutdown
- [ ] 9.4 Docker images (layers, multi-stage, non-root)
- [ ] 9.5 Twelve-factor; migrations as one-offs
- [ ] 9.6 CI pipeline
- [ ] 9.7 OpenAPI
- [ ] 9.8 Load testing and percentiles
- [ ] 9.9 Dependency hygiene

### Measurements
| Item | Value |
|---|---|
| Docker image size | |
| CI duration | |
| p95 `/v1/workouts` before / after | |
| p95 `/v1/stats/weekly` before / after | |

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
- Docker multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- GitHub Actions: https://docs.github.com/en/actions
- prom-client: https://github.com/siimon/prom-client
- OpenTelemetry for JavaScript: https://opentelemetry.io/docs/languages/js/
- OpenAPI specification: https://spec.openapis.org/oas/latest.html
- Google SRE book, Monitoring Distributed Systems: https://sre.google/sre-book/monitoring-distributed-systems/
