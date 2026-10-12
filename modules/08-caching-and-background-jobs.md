# Module 08: Caching, Background Jobs & Async Work

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Estimated time** | 10–12 hours |
| **Prerequisites** | Module 07 |
| **Project milestone** | CSV step-history import as a background job; idempotency keys on workout creation; ETags on stats; Redis cache-aside for weekly stats; a Redis-backed rate limiter; a scheduled weekly summary |

## Why this matters
Not every piece of work belongs inside the request. Importing three years of step data, sending notifications, or rebuilding summaries should happen in the background, reliably, and safely on retry. Caching makes reads fast, but it adds the hardest problem in the field: keeping the copy correct.

## Learning objectives
- Decide what runs in the request and what runs in the background.
- Build job handlers that are idempotent and safe to retry.
- Design a long-running operation with `202 Accepted` and a status resource.
- Make POST endpoints safe to retry with idempotency keys.
- Use HTTP caching (Cache-Control, ETag/304).
- Implement cache-aside with Redis, and invalidate it correctly.
- Explain eventual consistency with a real example.

---

## Learn

### 8.1 The request budget
A user is waiting for every millisecond of a request. Move work to the background when it's:
- **slow** (parsing a 50k-row CSV),
- **flaky** (calling a third-party API),
- **deferrable** (rebuilding weekly summaries), or
- **bursty** (many imports arriving at once).

### 8.2 Job queues
```
API (producer) → queue → worker process(es) → DB
```
- **At-least-once delivery:** a job may run more than once (a worker crashes after doing the work but before acknowledging it). **Every handler must be idempotent.**
- **Retries with exponential backoff + jitter:** 1s, 2s, 4s, 8s… each with randomness, so a thousand failed jobs don't all retry at the same instant.
- **Failed / dead-letter state:** after N attempts, park the job for inspection instead of retrying forever.
- **The worker is a separate process** (same codebase, different entrypoint, e.g., `src/worker.ts`). This lets it scale and restart independently.
- **pg-boss** stores jobs in Postgres (using `SELECT … FOR UPDATE SKIP LOCKED`), so there's no new infrastructure. **BullMQ** uses Redis and is very popular. Both teach the same concepts.

### 8.3 Long-running operations: CSV import
```
POST /v1/imports  (text/csv body or multipart upload)
→ 202 Accepted
  Location: /v1/imports/7b1e…
  { "id": "7b1e…", "status": "queued" }

GET /v1/imports/7b1e…
→ { "status": "completed", "rowsTotal": 1095, "rowsImported": 1093,
    "errors": [{ "row": 412, "message": "steps must be ≥ 0" }] }
```
- **202** means "accepted, not finished." The response tells the client where to check on progress.
- The handler validates each row (Zod), **upserts in batches** (e.g., 500 rows per statement), and records progress and per-row errors.
- Because step rows are upserts keyed by `(user_id, day)`, re-running the same import yields the same state. It's idempotent by design.

### 8.4 Idempotency keys
The problem: your phone sends `POST /v1/workouts`, the server commits, the response is lost on a bad connection, and the phone retries → a **duplicate workout**.

The fix:
1. The client sends `Idempotency-Key: <uuid>` with each logical operation (the same key on retries).
2. The server stores `(user_id, key) → request hash + response` for about 24 hours.
3. The same key + same body → return the stored response without re-executing.
4. The same key + a different body → `422` (the key was reused incorrectly).
5. Concurrent duplicates while the first is still in flight → `409`, or wait.

### 8.5 HTTP caching
- `Cache-Control: private, max-age=60`: the client may reuse the response for 60s. `private` matters because the data is per-user and shared caches must not store it.
- **ETag + conditional requests:**
  1. The server sends `ETag: "<hash of the response>"`.
  2. The client sends `If-None-Match: "<that hash>"` next time.
  3. If unchanged → `304 Not Modified` with no body. That saves bandwidth, and if you can compute the ETag cheaply (e.g., from `max(updated_at)`), it saves server work too.

### 8.6 Application caching with Redis (cache-aside)
**Read path:** check Redis → on a hit, return it. On a miss, query Postgres → store the result in Redis with a TTL → return it.

**Write path:** write to Postgres → **delete** the affected cache keys (don't try to update them).

- **Key design:** `stats:weekly:{userId}:{isoWeek}`. Precise keys make precise invalidation possible.
- **Always set a TTL** as a safety net for invalidation bugs.
- **The classic race:** reader A misses and reads an old value from the DB; writer B updates the DB and deletes the key; then A writes its stale value into the cache. Short TTLs bound the damage.
- **Stampede:** a hot key expires, and 500 requests all recompute it at once. Mitigate with request coalescing or a lock.
- **Measure before caching.** If the query takes 3ms with a good index (M5), a cache adds complexity for nothing.

### 8.7 Summary tables vs cache
A `weekly_summaries` table updated by a job is another form of denormalization (M4). It's durable and queryable, but it's **eventually consistent**: it lags behind writes until the job runs. Choose based on how stale the data is allowed to be, and record the choice.

### 8.8 Scheduled jobs
- Use cron-style schedules inside the queue (pg-boss supports schedules).
- "Every Sunday night" — whose Sunday night? You have users in different timezones. Either run hourly and process the users for whom it's now Sunday 11pm, or compute summaries lazily on request.

### 8.9 Shared state across instances
The in-memory rate limiter from M7 breaks with two instances. Redis provides a shared counter (`INCR` + `EXPIRE`, or a sliding window).

---

## Build

- [ ] **B1** Add Redis to `docker-compose.yml`. Add `REDIS_URL` to config. The readiness check pings Redis.
- [ ] **B2** Set up pg-boss. Add a `src/worker.ts` entrypoint and `dev:worker` / `start:worker` scripts.
- [ ] **B3** **CSV step import:** `POST /v1/imports` → 202 + an import record. The job validates rows, upserts in batches, and records counts and row errors. Add `GET /v1/imports/:id`. Test it with your real step export if you can get one from your phone or watch, plus a generated 3-year CSV with some bad rows mixed in.
- [ ] **B4** Prove the import is **idempotent**: run the same job twice and assert the DB state is identical (write a test).
- [ ] **B5** Simulate failures (throw on the first two attempts). Observe the backoff and retries, and the final `failed` state after max attempts.
- [ ] **B6** **Idempotency keys** on `POST /v1/workouts`: an `idempotency_keys` table, request hashing, stored responses, key reuse with a different body → 422, and a 24-hour expiry. Write tests for each behavior.
- [ ] **B7** Add **ETag/304** to `GET /v1/stats/weekly`. Verify with `curl -i -H 'If-None-Match: …'`.
- [ ] **B8** Use **cache-aside** for weekly stats in Redis, invalidated on workout/set/steps writes for that week. Load-test with `autocannon` before and after, and record the results below.
- [ ] **B9** Move the login rate limiter to Redis.
- [ ] **B10** *(Stretch)* Add a scheduled weekly summary job writing to `weekly_summaries`, respecting each user's timezone.

## Definition of done
- The import works end to end, survives a worker restart mid-job, and is safe to re-run.
- A retried `POST /v1/workouts` with the same key never creates a duplicate.
- Stats are never stale after a write (invalidation is tested), and the cache has measurable benefit.
- Two API instances share one rate limit.

---

## Checkpoint

1. Name three signals that a piece of work belongs in a background job.
2. What does "at-least-once delivery" mean for how you write job handlers?
3. Why does the import endpoint return 202 rather than 201? What should the response contain?
4. What problem does jitter solve in exponential backoff?
5. Walk through this scenario with and without idempotency keys: the phone sends `POST /v1/workouts`, the server commits, the response is lost, and the phone retries.
6. Describe the ETag / If-None-Match flow. What does the server compute, and what does the client store?
7. Write out the cache-aside read path and write path. Describe the race that can leave stale data in the cache, and how you limit it.
8. Why is "cache everything" a bad first move? What did your B8 measurements show?
9. pg-boss vs BullMQ: give one reason to choose each.
10. Your import processed 6,000 of 10,000 rows, then the worker crashed. What happens on retry? Is the outcome correct, and why?

**Explain it back:** Explain eventual consistency using your weekly summary feature, including what a user might see and for how long.

---

## Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Concepts understood
- [ ] 8.1 Request budget
- [ ] 8.2 Queues, at-least-once, retries, dead letters
- [ ] 8.3 202 + status resource
- [ ] 8.4 Idempotency keys
- [ ] 8.5 HTTP caching, ETag/304
- [ ] 8.6 Cache-aside, invalidation, stampedes
- [ ] 8.7 Summary tables and eventual consistency
- [ ] 8.8 Scheduled jobs and timezones
- [ ] 8.9 Shared state across instances

### Load test results (B8)
| Endpoint | Cache | Req/s | p50 (ms) | p95 (ms) | p99 (ms) |
|---|---|---|---|---|---|
| `/v1/stats/weekly` | off | | | | |
| `/v1/stats/weekly` | on | | | | |

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
- pg-boss: https://github.com/timgit/pg-boss
- Redis docs: https://redis.io/docs/latest/
- MDN, HTTP caching: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
- Stripe, "Designing robust and predictable APIs with idempotency": https://stripe.com/blog/idempotency
- AWS, "Exponential Backoff and Jitter": https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
- autocannon: https://github.com/mcollina/autocannon
