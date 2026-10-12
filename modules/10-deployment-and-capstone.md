# Module 10: Deployment, Operations & Capstone

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Estimated time** | 10–12 hours, plus 2 weeks of real use |
| **Prerequisites** | Module 09 |
| **Project milestone** | API + worker + Postgres + Redis live on HTTPS, deployed automatically from `main`; a zero-downtime migration done in prod; a backup restore drill; alerting; a runbook; a portfolio-ready README; two weeks of logging your real training |

## Why this matters
Shipping is a skill in its own right. Most of an engineer's backend time is spent changing a system that's already running without breaking it: deploying safely, migrating live data, recovering from mistakes, and knowing when something is wrong before users tell you.

## Learning objectives
- Choose a hosting model and justify it.
- Separate environments, and manage secrets safely.
- Build a deploy pipeline that builds once, migrates safely, and can roll back.
- Change a live schema with expand/contract, without downtime.
- Configure HTTPS, cookies, and CORS for a separate frontend.
- Prove that backups work with a restore drill.
- Alert on symptoms, write a runbook, and think in postmortems.

---

## Learn

### 10.1 Hosting models
| Model | Examples | Trade-off |
|---|---|---|
| PaaS | Fly.io, Render, Railway | Least ops work: managed Postgres, TLS, and deploys from a Dockerfile. Less control. |
| Managed containers | Cloud Run, ECS/Fargate, Azure Container Apps | More control and more configuration; closer to how many companies run. |
| VM | EC2, a VPS | Full control, and you own patching, TLS, process supervision, and backups. |

For this course: a **PaaS** with managed Postgres and Redis. Compare current offerings on: managed Postgres (with backups and point-in-time recovery), support for a separate worker process, Redis availability, region, and **current pricing** (check the providers' sites; pricing changes often).

### 10.2 Environments and secrets
- Keep `development`, `test`, and `production` (and optionally `staging`) **fully separate**: separate databases and separate secrets.
- Secrets live in the platform's secret store, injected as env vars. They're never in the image, the repo, or logs.
- Never point a local or test environment at production data.

### 10.3 The deploy pipeline
1. CI passes on `main` (M9).
2. **Build the image once.** The exact artifact that was tested is the one that ships.
3. **Run migrations** as a release step, before new code takes traffic.
4. **Roll out** new instances. Readiness gates traffic, and old instances shut down gracefully (M9).
5. **Smoke test** a few real endpoints.
6. **Roll back** by redeploying the previous image. This only works if your migrations are backward-compatible (10.4).

### 10.4 Zero-downtime schema changes: expand/contract
During a rollout, **old and new code run at the same time against the same database.** Every migration must work with both versions.
- **Safe:** adding a nullable column, adding a table, or adding an index with `CREATE INDEX CONCURRENTLY` (a plain `CREATE INDEX` blocks writes on large tables).
- **Unsafe in one step:** renaming or dropping a column, changing a type, or adding a `NOT NULL` column without a default.

**Expand/contract**, for example adding a required `source` column (`manual` | `import`) to `workouts`:
1. **Expand:** add `source` as nullable. Deploy code that writes it on every insert.
2. **Backfill:** set `source` on existing rows, in batches.
3. **Enforce:** add `NOT NULL` (and a CHECK constraint).
4. **Contract:** remove any code paths for the old shape. To rename or drop something, wait until no running code uses it.

Each step is a separate, independently safe deploy.

### 10.5 HTTPS
The platform terminates TLS. Your app must trust the proxy's forwarded headers (Express `trust proxy`) to see the correct protocol and client IP, which matters for `Secure` cookies and for rate limiting by IP. Consider HSTS.

### 10.6 CORS and cookies for a separate frontend
- **Same-origin** = same scheme + host + port. **Same-site** = same scheme + registrable domain.
  - `app.fittrack.dev` → `api.fittrack.dev` is **cross-origin but same-site**. A `SameSite=Lax` cookie works, as long as CORS allows the origin with credentials.
  - Platform default domains (e.g., `*.fly.dev`, `*.onrender.com`) are on the **Public Suffix List**, so two apps there are **cross-site**. That would force `SameSite=None; Secure`. A custom domain avoids this.
- With credentials: `Access-Control-Allow-Origin` must be the **exact origin, never `*`**, and you also send `Access-Control-Allow-Credentials: true`. The frontend uses `fetch(url, { credentials: "include" })`.
- Allowlist origins from config (`http://localhost:5173` in dev, your app domain in prod).

### 10.7 Backups
- Managed Postgres usually provides daily backups and point-in-time recovery (PITR). Know your retention period, and know your **RPO** (how much data you can lose) and **RTO** (how long recovery takes).
- **A backup you've never restored isn't a backup.** Practice a restore into a scratch database, and time it.
- `pg_dump` gives you a portable logical backup you control.

### 10.8 Operating the service
- **Alert on symptoms users feel**: error rate, latency, and the readiness check failing, rather than causes like CPU. Every alert should be actionable.
- **Runbook:** written steps for deploy, rollback, rotating a secret, restoring the DB, and common failures.
- **Blameless postmortems:** what happened, the impact, the timeline, the root causes, and action items. Focus on the system, not on who made the mistake.

### 10.9 Capacity and limits
- Total DB connections = instances × pool size + worker pool + migrations. Managed plans cap connections. Size pools to fit, or add a pooler (PgBouncer).
- Know your plan's memory limits. Node's heap grows with the size of what you hold in memory, which is one more reason to stream imports and aggregate in SQL.

### 10.10 After the course: frontend handoff
- Generate a typed client from your OpenAPI spec.
- Set up the auth flow with cookies + `credentials: "include"`, with CORS configured.
- Write a backlog of features you discovered by actually using the API for two weeks.
- Possible v2 directions: OAuth integrations with wearables, webhooks, sharing workouts with friends, multi-user roles, or rewriting one service in Go.

---

## Build

- [ ] **B1** Compare 2–3 hosts on the criteria in 10.1 (check current pricing and limits). Record the choice in the decisions log.
- [ ] **B2** Provision production Postgres and Redis. Set secrets. Deploy the `api` and `worker` processes from your image.
- [ ] **B3** Use HTTPS on a custom domain if you can (otherwise the platform domain). Configure `trust proxy`. Verify the `Secure` cookie login flow in prod.
- [ ] **B4** **CD:** merging to `main` → CI → build the image → run migrations as a release step → deploy → a smoke test hits `/health/ready` and one authenticated endpoint.
- [ ] **B5** Do an **expand/contract migration in prod**: add `workouts.source` (nullable → write it → backfill → `NOT NULL`), across separate deploys with no downtime.
- [ ] **B6** Configure the CORS allowlist from config. Test credentialed requests from a tiny HTML page served on `http://localhost:5173`, and record what fails before the config is right.
- [ ] **B7** **Backup restore drill:** restore a prod backup (or a `pg_dump`) into a scratch DB, verify row counts, and record the time it took.
- [ ] **B8** Set up an uptime check on `/health/ready` and an error-rate alert, using whatever your host or a free monitoring tool provides.
- [ ] **B9** Write `RUNBOOK.md`: deploy, roll back, rotate a secret, restore the DB, and the top 5 errors with what to do about each.
- [ ] **B10** **Use it for real for 2 weeks.** Log every workout and every day's steps through the API (Bruno/curl, or a small script). Keep a friction log; it becomes the frontend backlog.
- [ ] **B11** **Capstone README:** what it is, an architecture diagram, the key decisions (linking the decisions log), how to run it locally, how to test, how to deploy, and what you'd do next. Write it so a hiring manager understands it in 2 minutes.
- [ ] **B12** **Retro:** write a one-page reflection in the notes below: what was hardest, what surprised you, and what you'd build differently.

## Definition of done
- The service is live on HTTPS and deploys automatically from `main`.
- You've performed a zero-downtime migration and a timed restore drill.
- Alerts exist and have been tested (trigger one deliberately).
- Two weeks of your real activity data is in production.
- The README and runbook would let someone else run the service without you.

---

## Checkpoint

1. Why build the image once and promote that exact artifact, instead of rebuilding per environment?
2. Your deploy runs migrations, then rolls out new code while old instances still serve traffic. Which kinds of migrations are safe? Give one unsafe example and its expand/contract version.
3. Why use `CREATE INDEX CONCURRENTLY` in production?
4. Same-origin vs same-site: is `app.fittrack.dev` → `api.fittrack.dev` same-site? What about `fittrack-app.onrender.com` → `fittrack-api.onrender.com`? What does each mean for your cookies?
5. Why can't `Access-Control-Allow-Origin` be `*` when credentials are included?
6. Your managed Postgres allows 25 connections. You run 2 API instances with a pool max of 10 and a worker with a pool max of 10. What's the problem, and what are your options?
7. Someone says "we have daily backups." What questions should you ask next?
8. Alert A: CPU > 80%. Alert B: 5xx rate > 2% for 5 minutes. Which is better, and why?
9. You deployed a bug along with a migration that dropped a column. Why is rolling back hard, and how would expand/contract have prevented it?
10. What would you change in this architecture if `fittrack` had 100,000 active users?

**Explain it back:** Describe the full lifecycle of a feature, from a new branch to verified in production, including the migration and how you'd know it's healthy.

---

## Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Concepts understood
- [ ] 10.1 Hosting models
- [ ] 10.2 Environments and secrets
- [ ] 10.3 Deploy pipeline and rollback
- [ ] 10.4 Expand/contract migrations
- [ ] 10.5 HTTPS and proxies
- [ ] 10.6 CORS, same-site, cookies across origins
- [ ] 10.7 Backups, RPO/RTO, restore drills
- [ ] 10.8 Alerting, runbooks, postmortems
- [ ] 10.9 Capacity and connection limits
- [ ] 10.10 Frontend handoff

### Production facts
| Item | Value |
|---|---|
| Host | |
| Production URL | |
| Postgres plan / connection limit | |
| Backup retention / PITR | |
| Restore drill time | |
| Alerts configured | |

### Two-week usage friction log (B10)
| Date | Friction | Idea |
|---|---|---|
| | | |

### Checkpoint weak spots
—

### Retro
—

### Error log
| Error | Cause | Fix |
|---|---|---|
| | | |

### Open questions
—

## Resources
- PostgreSQL backup and restore: https://www.postgresql.org/docs/current/backup.html
- MDN, CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- web.dev, "Understanding same-site and same-origin": https://web.dev/articles/same-site-same-origin
- Public Suffix List: https://publicsuffix.org/
- Strong Migrations (Rails-focused, principles apply everywhere): https://github.com/ankane/strong_migrations
- Google SRE book, Postmortem Culture: https://sre.google/sre-book/postmortem-culture/
