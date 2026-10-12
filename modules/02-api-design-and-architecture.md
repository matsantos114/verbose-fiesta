# Module 02: API Design & Application Architecture

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Estimated time** | 8–10 hours |
| **Prerequisites** | Module 01 |
| **Project milestone** | In-memory CRUD for workouts, sets, exercises, and daily steps, with pagination, filtering, consistent errors, and a layered codebase |

## Why this matters
An API is a contract. Once a client (your future React app) depends on it, changing it costs real effort. Good design up front means fewer breaking changes, fewer bugs, and a codebase you can grow. Layered architecture is what lets you swap in-memory storage for Postgres in M5 without rewriting your business logic.

## Learning objectives
- Model a domain as resources with clear URLs and methods.
- Choose between replace and increment semantics, and design for retries.
- Define consistent success, list, and error response shapes (RFC 9457 Problem Details).
- Implement cursor pagination, filtering, and sorting safely.
- Explain what counts as a breaking change, and how to version.
- Organize code into routes → services → repositories, with dependencies pointing inward.

---

## Learn

### 2.1 Resources, not actions
URLs name **things** (nouns). The HTTP method is the verb.

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/v1/workouts` | List my workouts (paginated, filterable) | 200 |
| POST | `/v1/workouts` | Log a workout | 201 + `Location` |
| GET | `/v1/workouts/:id` | Get one workout | 200 |
| PATCH | `/v1/workouts/:id` | Edit fields | 200 |
| DELETE | `/v1/workouts/:id` | Delete (and its sets) | 204 |
| POST | `/v1/workouts/:id/sets` | Add a set | 201 |
| PATCH | `/v1/workouts/:id/sets/:setId` | Edit a set | 200 |
| DELETE | `/v1/workouts/:id/sets/:setId` | Delete a set | 204 |
| GET | `/v1/exercises` | Built-in + my custom exercises | 200 |
| POST | `/v1/exercises` | Create a custom exercise | 201 |
| PUT | `/v1/steps/:date` | Set the step total for a day | 200 (or 201 if newly created) |
| GET | `/v1/steps?from=&to=` | Step history | 200 |

Avoid verb URLs like `/getWorkouts` or `/createWorkout`. When an action doesn't fit CRUD (for example, "recalculate my records"), model it as a resource such as `POST /v1/recalculations`, or accept a well-named sub-path. Just be deliberate about it.

### 2.2 Replace vs increment: why steps use PUT
A phone or watch reports the **total** steps for a day: "Oct 11 = 9,412".
- `PUT /v1/steps/2026-10-11 {"steps": 9412}` **sets** the value. If it's sent twice, the state is the same. It's idempotent and safe to retry.
- `POST /v1/steps {"date": ..., "delta": 500}` **increments**. If a retry happens after a lost response, you double-count.

The design rule: **when the client knows the absolute truth, let it send the truth.**

### 2.3 Naming and JSON conventions
- Use camelCase JSON keys, because that's what JS/TS clients expect. The database uses snake_case, and you'll map between them in M5.
- **Put units in field names:** `distanceM`, `durationS`, `weightKg`. Unit bugs are silent and expensive.
- **Store SI units** (meters, seconds, kilograms). Converting to miles or pounds is a presentation concern.
- Timestamps are ISO 8601 with an offset or `Z`. Calendar days (for steps) are `YYYY-MM-DD` with no time.
- Use stable enums: `kind: "strength" | "run" | "walk" | "cycle" | "other"`.

### 2.4 Response shapes
- **Single resource:** return the object itself.
- **Lists:** `{ "data": [...], "nextCursor": "..." | null }`. Use an envelope so you can add metadata later without breaking clients.
- **Errors:** use **RFC 9457 Problem Details** with `Content-Type: application/problem+json`:
```json
{
  "type": "https://fittrack.dev/problems/validation",
  "title": "Invalid request",
  "status": 400,
  "detail": "endedAt must be after startedAt",
  "instance": "/v1/workouts",
  "errors": [{ "path": "endedAt", "message": "must be after startedAt" }]
}
```
Every error from your API should have the same shape. Your future frontend gets one error handler instead of twenty.

### 2.5 Pagination: offset vs cursor
- **Offset** (`?page=3&limit=20`) is simple, but if new workouts are inserted while the user scrolls, items shift between pages and they see duplicates or miss entries. Large offsets are also slow, because the DB still has to walk past the skipped rows.
- **Cursor** (`?limit=20&cursor=...`): the cursor encodes the last item's sort key, such as `(startedAt, id)`. The next page is "items before this point." It stays stable under inserts and stays fast at any depth.
- Always enforce a **default and a maximum `limit`** (for example, default 20 and max 100). Unbounded lists are a denial-of-service vector.
- Encode the cursor (base64 JSON is fine) so clients treat it as opaque.

### 2.6 Filtering and sorting
- `GET /v1/workouts?kind=run&from=2026-09-01&to=2026-10-01&sort=-startedAt`
- **Whitelist** sortable fields. Never pass a client string straight into a query, because in M5 that becomes SQL injection.

### 2.7 Versioning and breaking changes
- Prefix the path with `/v1`.
- **Non-breaking:** adding an optional request field, or adding a response field.
- **Breaking:** renaming or removing a field, changing a type, making an optional field required, or changing the meaning of a value.
- **Adding an enum value** is subtle: it's breaking for any client that `switch`es exhaustively. Document how clients should handle unknown values.

### 2.8 Layered architecture
```
HTTP request
  → routes/handlers   (parse the HTTP request, call the service, map the result to a response)
  → services          (business rules: no future workouts, set rules, PR detection)
  → repositories      (data access only: in-memory now, Postgres in M5)
```
**Dependency rule:** inner layers know nothing about outer ones. Services never import Express. Repositories know nothing about HTTP status codes.

What that buys you:
- Services are unit-testable with fake repositories (M6).
- You can swap the in-memory repositories for Postgres without touching services (M5).
- A future CLI or job worker (M8) can reuse the same services.

Define repositories as interfaces:
```ts
export interface WorkoutRepository {
  create(userId: string, input: NewWorkout): Promise<Workout>;
  findById(userId: string, id: string): Promise<Workout | null>;
  list(userId: string, opts: ListWorkoutsOptions): Promise<Page<Workout>>;
  update(userId: string, id: string, patch: WorkoutPatch): Promise<Workout | null>;
  delete(userId: string, id: string): Promise<boolean>;
}
```
Notice `userId` in every method, even though auth doesn't exist yet. You're designing for multiple users now: a hardcoded dev user ID stands in until M7.

### 2.9 Folder structure (by feature)
```
src/
  app.ts                  # builds the app and wires dependencies (composition root)
  server.ts               # listen()
  modules/
    workouts/
      workouts.routes.ts
      workouts.service.ts
      workouts.repository.ts      # interface
      workouts.memory-repo.ts     # in-memory implementation
      workouts.types.ts
    sets/ ...
    exercises/ ...
    steps/ ...
  shared/
    errors.ts  http.ts  pagination.ts
```
Organizing by feature keeps related code together. Organizing by layer (`controllers/`, `services/`) scatters a single feature across the whole tree.

### 2.10 IDs
- **Auto-increment integers** leak information (your 40th workout has ID 40) and let anyone enumerate `/workouts/1`, `/2`, `/3`…
- **UUIDs** are unguessable. **UUIDv7** is time-ordered, which keeps database indexes efficient. Postgres 18+ has `uuidv7()` built in; otherwise, generate it in the app.
- Decide now and record it in the decisions log.

---

## Build

- [ ] **B1** Write `docs/api.md` **before coding**: for every endpoint, list the method, path, request body or query, success response, and every error status it can return.
- [ ] **B2** Define domain types: `Workout`, `WorkoutKind`, `WorkoutSet`, `Exercise`, `DailySteps`, `Page<T>`.
- [ ] **B3** Write repository interfaces and in-memory implementations (Map-based) for each module.
- [ ] **B4** Write services with business rules. At minimum:
  - `endedAt` must be after `startedAt`.
  - No workout may start more than 5 minutes in the future.
  - Steps must be 0–100,000.
  - Sets require `reps > 0` and `weightKg ≥ 0`, and can only be added to `strength` workouts.
  - A custom exercise name must be unique for this user.
- [ ] **B5** Write routes for every endpoint in your API doc, using a hardcoded dev user ID.
- [ ] **B6** Add cursor pagination to `GET /v1/workouts`: default 20, max 100, with `nextCursor`.
- [ ] **B7** Add filters (`kind`, `from`, `to`) and whitelisted sorting.
- [ ] **B8** Return problem+json for 400, 404, and 409 from a small helper. Validation is done properly in M3; manual checks are fine for now.
- [ ] **B9** Exercise every endpoint from `requests.http`. Log **your real workouts from this week** as test data.
- [ ] **B10** Add decisions-log entries for: the ID type, storing SI units, and cursor pagination.
- [ ] **B11** Install Vitest + Supertest. Write one HTTP smoke test per endpoint (happy path plus one error path), running against your in-memory app. Keep them passing as you refactor; M5 will lean on them when you swap in Postgres.

## Definition of done
- `docs/api.md` matches the implementation.
- No service file imports from `express`.
- Paging through more than 25 workouts works, and inserting a workout mid-scroll doesn't produce duplicates.
- Every error response is problem+json.
- `npm test` runs an HTTP smoke test for every endpoint and passes.

---

## Checkpoint

1. Why is `PUT /v1/steps/2026-10-11` better than `POST /v1/steps` for syncing a phone's daily step total? Describe exactly what goes wrong with POST under retries.
2. Design the endpoints to add, edit, and delete a set within a workout: methods, paths, and success codes.
3. You're scrolling your workout history while your watch logs a new run. What happens with offset pagination compared with cursor pagination?
4. Classify each as breaking or non-breaking, and explain: (a) adding an optional `notes` field; (b) renaming `distance` to `distanceM`; (c) adding `"swim"` to `kind`; (d) making `notes` required.
5. Why put units in field names? Give a concrete bug this prevents.
6. Which layer does each belong in? (a) "a set's weight can't be negative"; (b) parsing `?limit=`; (c) the code that lists workouts from storage; (d) "a heavier squat than ever before is a PR"; (e) choosing 201 vs 200.
7. Why should services not import Express types? Name two concrete benefits.
8. Sequential integer IDs vs UUIDs for `/v1/workouts/:id`: give one security consideration and one performance consideration.
9. **Code reading.** What's the problem, and what will it become in M5?
   ```ts
   const sortField = req.query.sort as string;
   const results = workouts.sort((a, b) => (a as any)[sortField] - (b as any)[sortField]);
   ```
10. Why does every repository method take `userId` when there's only one user?

**Explain it back:** Walk through what happens in your code for `GET /v1/workouts?kind=run&limit=2`, layer by layer, naming the functions involved.

---

## Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Concepts understood
- [ ] 2.1 Resource modeling
- [ ] 2.2 Replace vs increment, designing for retries
- [ ] 2.3 Naming, units, time formats
- [ ] 2.4 Response envelopes and Problem Details
- [ ] 2.5 Offset vs cursor pagination
- [ ] 2.6 Safe filtering and sorting
- [ ] 2.7 Versioning and breaking changes
- [ ] 2.8 Layered architecture and the dependency rule
- [ ] 2.9 Feature-based structure
- [ ] 2.10 ID strategy

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
- RFC 9457, Problem Details for HTTP APIs: https://www.rfc-editor.org/rfc/rfc9457
- Zalando RESTful API Guidelines: https://opensource.zalando.com/restful-api-guidelines/
- Microsoft REST API Guidelines: https://github.com/microsoft/api-guidelines
