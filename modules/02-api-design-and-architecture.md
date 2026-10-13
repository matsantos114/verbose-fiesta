# Module 02: API Design & Application Architecture

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | ✅ Full |
| **Estimated time** | 14–18 hours |
| **Prerequisites** | Module 01 complete (Express app with `/health`, logger, 404, and error handler) |
| **Project milestone** | A complete in-memory API for steps, exercises, workouts, and sets, with cursor pagination, consistent errors, and a layered codebase |

## 🎓 Tutor prompt

Start every study session for this module in a **new chat** by pasting the prompt below. It sets Claude up as your teacher for this module: it reads the course files, picks up where you left off, follows the teaching rules (no solutions; syntax help and hints instead), quizzes you, and updates your tracker when you say **"wrap up."**

```text
You are my tutor for Module 02 of my backend engineering course: "API Design & Application Architecture".

ROLE
Act as a staff engineer who designs public APIs and has reviewed hundreds of pull requests for layered Node.js services. You care about predictable contracts, clean boundaries, and correctness under retries. Teach the way a great senior engineer mentors a junior on their own team: patient, precise, Socratic, and honest when my work isn't good enough yet.

ABOUT ME
- I'm Mathew, a frontend engineer (React + TypeScript). I'm solid on JS/TS logic, but I don't know every Node, Express, SQL, or tooling API and syntax by heart.
- I'm building `fittrack-api`, an API that tracks my own physical activity (daily steps, workouts, lifting sets, exercises), to learn backend fundamentals properly.
- The course lives in my repo at `docs/course/`: `COURSE.md` (rules, given-vs-you-write table, decisions log, session log) plus one file per module.
- Stack for this module: Node.js LTS + TypeScript (strict, NodeNext ES modules) + Express 5, with in-memory repositories (Postgres arrives in Module 04).

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/02-api-design-and-architecture.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
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
- Design before code: check that my `docs/api.md` entry exists and is complete *before* I code each challenge.
- The Daily Steps worked example is the reference pattern. When I'm stuck, your first move is to ask: "What's the equivalent of this in the steps module?"
- Layer boundaries: flag any service or repository that imports Express, and any route that contains business rules.
- PATCH: absent vs. null vs. value, and validating the *merged* object.
- Cursor pagination correctness: deterministic sort with an `id` tie-breaker, "strictly after" comparisons, fetching `limit + 1`, and making the cursor from the last *returned* item.
- Dependency design: services receive repositories (not other services), all wired in the composition root.
- Watch for these common misconceptions and correct them when they show up: returning 404 for an empty list; spreading `req.body` into stored data (mass assignment); spread syntax copying `undefined`; returning stored objects instead of copies from the memory repository; 200 instead of 201 + `Location` for creates; treating offset pagination as "good enough."
- Hold me to this standard before I move on: every acceptance test in Challenges 2–5 passes, `docs/api.md` matches the behavior, every error is `application/problem+json`, and no service or repository imports Express.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

## How to use this module

| Part | What you do | Kind |
|---|---|---|
| 1. Designing an API | How to turn "I want to log my runs" into URLs, methods, and JSON | 📖 Read |
| 2. Architecture | How to organize backend code so it can grow | 📖 Read |
| 3. Worked example | **The complete Daily Steps feature**, every file given and explained | ⌨️ Type along |
| 4. Toolbox | The syntax you'll need for the challenges | 🧰 Reference |
| 5. Challenges | You build Exercises, Workouts, Pagination, and Sets using the same pattern | 🧩 You write |
| Checkpoint | 10 questions | ✍️ Quiz |

**The idea:** Part 3 shows you *one* complete feature built the right way. Every challenge in Part 5 follows the same pattern with different rules. When you're stuck, your first move is to open the Steps files and ask: *"What's the equivalent of this, for workouts?"*

## What you'll be able to do by the end
- Turn product requirements into resources, URLs, methods, status codes, and JSON shapes.
- Write one consistent error format (RFC 9457 Problem Details) for the whole API.
- Implement cursor pagination, filtering, and safe sorting.
- Split code into **routes → services → repositories**, and explain what belongs in each layer and why.
- Wire dependencies together by hand in a "composition root."

---

# Part 1 — 📖 Designing an API

## 1.1 What "REST" means in practice

REST is a style, not a library. In practice it means:
- **Resources** are the nouns of your domain: workouts, sets, exercises, step days. Each one has a **URL**.
- **HTTP methods are the verbs.** GET reads, POST creates, PUT replaces, PATCH edits, DELETE removes.
- **Representations** are what you send over the wire: here, JSON. The JSON for a workout is a *representation* of it, not the database row itself.
- **Status codes and headers carry meaning**, so clients can react without parsing your error text.
- **Statelessness** (Module 01): each request stands alone.

You don't need to be dogmatic. You need to be **predictable**: once someone has learned one endpoint, they should be able to guess the others.

## 1.2 From user stories to resources

Start from what you actually do. Here are user stories from your own training:

1. *"Each evening, set today's step count from my phone."*
2. *"Log a 5 km run with start and end times."*
3. *"Log a lifting session: back squat, 5 sets of 5 at 100 kg."*
4. *"Fix a set I mistyped."*
5. *"Scroll back through my workouts, newest first, maybe only runs."*
6. *"Add a custom exercise the app doesn't know about."*

**Underline the nouns.** They become resources:

| Noun | Resource | Lives at |
|---|---|---|
| step count for a day | **daily steps** | `/v1/steps/:date` |
| run, lifting session | **workout** | `/v1/workouts/:id` |
| set | **set** (belongs to a workout) | `/v1/workouts/:workoutId/sets/:setId` |
| exercise | **exercise** (built-in or custom) | `/v1/exercises/:id` |

**Relationships:** a workout *has many* sets; a set *refers to* one exercise; everything *belongs to* a user.

## 1.3 URL design rules

| Rule | ✅ Good | ❌ Bad |
|---|---|---|
| Nouns, not verbs | `POST /v1/workouts` | `POST /v1/createWorkout` |
| Plural collection names | `/v1/workouts/:id` | `/v1/workout/:id` |
| Lowercase, hyphens for multiple words | `/v1/daily-summaries` | `/v1/dailySummaries` |
| IDs in the path, filters in the query | `/v1/workouts?kind=run` | `/v1/workouts/run` |
| Nest only when the child can't exist without the parent | `/v1/workouts/:id/sets` | `/v1/users/:u/workouts/:w/sets/:s/notes` |
| Version prefix | `/v1/...` | (nothing, then a painful migration later) |

**When to nest.** A set *cannot exist* outside a workout, and you always look at sets *in the context of* a workout. So nest them, one level deep. Exercises exist independently (one exercise is used by many workouts), so they get their own top-level collection.

**Why not `/v1/users/me/workouts`?** The user is known from the login session (Module 07). Putting the user ID in the URL invites the attack where someone changes it to another user's ID.

## 1.4 The full API

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/v1/steps?from=&to=` | Step history for a date range | 200 |
| GET | `/v1/steps/:date` | One day | 200 |
| PUT | `/v1/steps/:date` | Set one day's total | 201 if new, 200 if replaced |
| DELETE | `/v1/steps/:date` | Remove a day | 204 |
| GET | `/v1/exercises` | Built-in + my custom exercises | 200 |
| GET | `/v1/exercises/:id` | One exercise | 200 |
| POST | `/v1/exercises` | Create a custom exercise | 201 + `Location` |
| PATCH | `/v1/exercises/:id` | Rename or recategorize a custom exercise | 200 |
| DELETE | `/v1/exercises/:id` | Delete a custom exercise | 204 |
| GET | `/v1/workouts` | List (paginated, filterable) | 200 |
| POST | `/v1/workouts` | Log a workout | 201 + `Location` |
| GET | `/v1/workouts/:id` | One workout | 200 |
| PATCH | `/v1/workouts/:id` | Edit fields | 200 |
| DELETE | `/v1/workouts/:id` | Delete (and its sets) | 204 |
| GET | `/v1/workouts/:workoutId/sets` | Sets in a workout, in order | 200 |
| POST | `/v1/workouts/:workoutId/sets` | Add a set | 201 + `Location` |
| PATCH | `/v1/workouts/:workoutId/sets/:setId` | Fix a set | 200 |
| DELETE | `/v1/workouts/:workoutId/sets/:setId` | Remove a set | 204 |

## 1.5 Choosing the method: replace vs. increment vs. create

**Steps use PUT, not POST.** Your phone knows the *total* for the day: "Oct 11 = 9,412."
- `PUT /v1/steps/2026-10-11 {"steps": 9412}` **sets** the value. Send it twice and the result is the same. It's **idempotent and safe to retry**.
- `POST /v1/steps {"date": "2026-10-11", "add": 500}` **increments**. If the response is lost and the phone retries, you count 500 steps twice.

> **Design rule:** when the client knows the absolute truth, let it send the truth (PUT). Only use "add N" operations when the client truly only knows the change.

**Workouts use POST.** The client doesn't know the ID yet, because the server assigns it. (The retry-duplicate problem this creates is solved with idempotency keys in Module 08.)

## 1.6 PATCH semantics, precisely

`PATCH /v1/workouts/:id` changes only the fields you send. You need three cases:

| Body contains | Meaning | Example |
|---|---|---|
| Field **absent** | Leave it unchanged | `{}` changes nothing |
| Field with a **value** | Set it | `{ "distanceM": 5200 }` |
| Field set to **`null`** | Clear it (only allowed for optional fields) | `{ "notes": null }` removes the notes |

**Validate the result, not just the patch.** If a workout started at 07:00 and you PATCH `{ "endedAt": "06:30" }`, the patch looks fine on its own, but the merged workout is invalid. Always merge first, then run the rules on the merged object.

## 1.7 Status codes per operation

| Operation | Success | Common failures |
|---|---|---|
| Create (POST) | **201** + `Location` + the created resource | 400 invalid, 409 duplicate, 422 bad reference |
| Read one (GET) | **200** | 404 |
| List (GET) | **200**, even if the list is empty (an empty list isn't "not found") | 400 for a bad filter or cursor |
| Replace (PUT) | **200**, or **201** if it created the resource | 400 |
| Edit (PATCH) | **200** + the updated resource | 400, 404, 409 |
| Delete | **204**, no body | 404 |

**DELETE twice?** The second call returns 404. The *state* is still the same (gone), so DELETE is still idempotent. The status code is allowed to differ.

## 1.8 Representations: what the JSON looks like

**Conventions for this API:**
- **camelCase keys**, because your React code will consume them. The database uses snake_case, and you'll map between them in Module 05.
- **Units in field names, in SI units:** `distanceM` (meters), `durationS` (seconds), `weightKg`. Converting to miles or pounds happens in the frontend. Unit bugs are silent: a run stored in miles but read as kilometers is just quietly wrong.
- **Instants** (a moment in time): ISO 8601 strings. The server **normalizes to UTC** on input: `"2026-10-11T07:00:00-07:00"` is stored and returned as `"2026-10-11T14:00:00.000Z"`.
- **Calendar days:** `"YYYY-MM-DD"` with no time. "October 11" is a local concept (Module 04 explains why this matters).
- **Optional values are `null`, not missing.** Every response has the same set of keys, which is easier for clients to handle.
- **Enums are lowercase strings:** `kind: "strength" | "run" | "walk" | "cycle" | "other"`.

**Examples**

```json
// Daily steps
{ "date": "2026-10-11", "steps": 9412, "updatedAt": "2026-10-12T03:05:00.000Z" }

// Exercise
{ "id": "6a0e…", "name": "Back Squat", "category": "legs", "isCustom": false, "createdAt": "…" }

// Workout
{
  "id": "8f3c…",
  "kind": "run",
  "startedAt": "2026-10-11T14:00:00.000Z",
  "endedAt": "2026-10-11T14:31:10.000Z",
  "durationS": 1870,
  "distanceM": 5000,
  "notes": null,
  "createdAt": "2026-10-11T14:40:02.000Z",
  "updatedAt": "2026-10-11T14:40:02.000Z"
}

// Set
{ "id": "c12d…", "workoutId": "8f3c…", "exerciseId": "6a0e…", "setNumber": 1,
  "reps": 5, "weightKg": 100, "rpe": 8, "createdAt": "…" }
```

**Derived fields** like `durationS` are computed from other fields. Clients never send them.

## 1.9 Response shapes

- **One resource:** the object itself (see above).
- **A list:** wrapped in an envelope: `{ "data": [...], "nextCursor": "…" | null }`. The envelope lets you add metadata later without breaking clients. A bare array can't grow new fields.
- **Errors:** one shape everywhere, **RFC 9457 Problem Details**, with `Content-Type: application/problem+json`:

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

| Field | Meaning |
|---|---|
| `type` | A URI naming the *kind* of problem. Clients can branch on it. |
| `title` | Short, human-readable, the same for every problem of this type |
| `status` | The HTTP status, repeated in the body for convenience |
| `detail` | What went wrong *this time* |
| `instance` | Which request it happened on |
| `errors` | *(our extension)* field-level details for forms |

Your future React app gets **one** error-handling function instead of twenty.

## 1.10 Pagination: offset vs. cursor

You'll eventually have hundreds of workouts. A list endpoint must return them in **pages**.

**Offset pagination** (`?offset=10&limit=10`) means "skip 10, take 10." It's simple, but it breaks when data changes while you're paging:

```
Newest first. You load page 1 (offset 0):    W25 W24 W23 W22 W21 W20 W19 W18 W17 W16
Your watch logs a new run, W26.
You load page 2 (offset 10). Everything has shifted down by one:
                                             W16 W15 W14 …          ← W16 appears twice!
```

(Deletes cause the opposite problem: items get **skipped**.) Large offsets are also slow in databases, because the database still has to walk past every skipped row.

**Cursor pagination** (`?limit=10&cursor=…`) means "give me 10 items that come *after this specific item*":

```
Page 1 → W25 … W16.  nextCursor = encode({ startedAt: W16.startedAt, id: W16.id })
W26 is logged.
Page 2 with that cursor → "items that sort after W16" → W15 W14 … W6   ← no duplicates
```

W26 is *newer* than the cursor position, so it can't appear on later pages. You'll see it when you refresh from the top.

**The details that make cursors work:**
1. **A deterministic sort order.** Two workouts can start at the same second, so sort by `startedAt` **and then by `id`** as a tie-breaker. The cursor stores both values.
2. **"After" means after in *that* sort order.** For newest-first: `startedAt < cursor.startedAt` **OR** (`startedAt == cursor.startedAt` AND `id < cursor.id`).
3. **The cursor is opaque.** Clients pass it back without looking inside. Encode it (JSON → base64url) so nobody builds features that depend on its contents.
4. **Knowing whether there's a next page.** Fetch `limit + 1` items. If you got more than `limit`, there's another page: return the first `limit` and build `nextCursor` from the **last returned** item. Otherwise `nextCursor` is `null`.
5. **Limits:** a default (20) and a **maximum** (100). An unbounded list is an easy way to overload your server.

## 1.11 Filtering and sorting

- Filters are query parameters: `GET /v1/workouts?kind=run&from=2026-09-01&to=2026-09-30`.
- **Validate every filter.** `?kind=swim` (not a valid kind) → 400, not an empty list.
- **Whitelist sort options.** Accept `sort=startedAt` or `sort=-startedAt` (the leading `-` means descending) and nothing else. Never take a field name from the client and use it directly. In memory that's sloppy; in SQL (Module 05) it's an **injection vulnerability**.

## 1.12 Versioning and breaking changes

You prefix every path with `/v1`. A **breaking change** is one that can make a correctly written existing client fail:

| Change | Breaking? | Why |
|---|---|---|
| Add an optional request field | No | Old clients don't send it |
| Add a response field | No | Clients ignore keys they don't know |
| Rename or remove a field | **Yes** | Clients read the old name |
| Change a type (`"5000"` → `5000`) | **Yes** | Client code expects the old type |
| Make an optional field required | **Yes** | Old clients don't send it |
| Add an enum value (`kind: "swim"`) | **Sneaky yes** | A `switch` with no `default` case breaks |

If you must break something, publish `/v2` and run both versions for a while.

## 1.13 IDs

- **Auto-increment integers** (1, 2, 3…) leak information ("this user has logged 40 workouts") and are **guessable**: anyone can try `/workouts/41`.
- **UUIDs** are random 128-bit identifiers. They're not guessable, and any server can create them without coordinating with the others.
- **In this module:** `crypto.randomUUID()` (random UUID version 4).
- **From Module 04:** the database generates **UUIDv7** values, which are *time-ordered* and keep database indexes efficient.

---

# Part 2 — 📖 Architecture: where code goes

## 2.1 The problem: everything in the route handler

Here's what most first backends look like:

```ts
// ❌ Everything in one handler
app.post("/v1/workouts", async (req, res) => {
  if (typeof req.body.kind !== "string") return res.status(400).json({ error: "bad kind" });
  if (new Date(req.body.endedAt) < new Date(req.body.startedAt))
    return res.status(400).json({ error: "bad times" });
  const id = randomUUID();
  workouts.set(id, { id, ...req.body });   // ← also a security hole: the client controls every field
  res.status(201).json(workouts.get(id));
});
```

**What's wrong with it:**
- The business rule "end after start" is **tangled up with HTTP**. A background job (Module 08) that imports workouts can't reuse it.
- Switching storage to Postgres means **editing every handler**.
- Testing the rule requires sending real HTTP requests.
- Error formats drift: every handler invents its own.

## 2.2 Three layers

```
              HTTP request
                   │
┌──────────────────▼──────────────────┐
│ ROUTES (steps.routes.ts)            │  Turn HTTP into function calls, and results back into HTTP.
│ - read params / query / body        │  Knows: Express, status codes, headers.
│ - basic shape checks (is it a       │  Doesn't know: storage, business rules.
│   number? a real date?)             │
│ - call the service                  │
│ - choose the status code, send JSON │
└──────────────────┬──────────────────┘
                   │ plain values: setDay(userId, "2026-10-11", 9412)
┌──────────────────▼──────────────────┐
│ SERVICES (steps.service.ts)         │  Business rules and decisions.
│ - "steps must be 0–100,000"         │  Knows: the domain, the repository *interface*.
│ - "no future dates"                 │  Doesn't know: Express, HTTP, SQL, Maps.
│ - throws NotFoundError, etc.        │
└──────────────────┬──────────────────┘
                   │ repo.upsert(userId, record)
┌──────────────────▼──────────────────┐
│ REPOSITORIES (steps.memory-repo.ts) │  Storing and fetching data. Nothing else.
│ - Map today, Postgres in Module 05  │  Knows: the storage technology.
│                                     │  Doesn't know: HTTP or business rules.
└─────────────────────────────────────┘
```

**The dependency rule:** arrows point **down only**. A service never imports Express. A repository never decides on a status code. The shared contract between layers is TypeScript **interfaces**.

| Question | Layer |
|---|---|
| "Is `:date` a real calendar date?" | Route (it's about parsing the HTTP input) |
| "Is a weight of -20 kg allowed?" | Service (a domain rule) |
| "Should this be 201 or 200?" | Route |
| "Does this exercise name already exist for this user?" | Service (asks the repository) |
| "How do I find all workouts for user X?" | Repository |

## 2.3 Repositories: interfaces first

A repository is described by an **interface**, a contract, and then implemented:

```ts
export interface StepsRepository {
  upsert(userId: string, record: DailySteps): Promise<{ record: DailySteps; created: boolean }>;
  findByDate(userId: string, date: string): Promise<DailySteps | null>;
  // ...
}
```

Three design decisions you'll see in the worked example:
1. **Every method is `async`**, even though a `Map` is instant. The Postgres version (Module 05) *will* be async. If the interface is async now, swapping the implementation later changes **zero** service code.
2. **Every method takes `userId`**, even though there's only one user. Data always belongs to someone, so every query is scoped to that someone. In Module 07 this becomes your main defense against users reading each other's data.
3. **The repository returns copies** (`structuredClone`). If it handed out the object stored in the `Map`, a caller could mutate stored data by accident without ever "saving." A database can't behave like that, so the in-memory version shouldn't either.

## 2.4 Services: factory functions with injected dependencies

```ts
export function createStepsService(deps: { repo: StepsRepository; clock: Clock }): StepsService {
  const { repo, clock } = deps;
  return {
    async setDay(userId, date, steps) { /* rules, then repo calls */ },
    // ...
  };
}
```

- **Factory function:** a function that *creates and returns* an object. The returned methods "remember" `repo` and `clock` through a closure. We use this instead of classes to avoid `this`-binding bugs when methods are passed around as callbacks.
- **Dependency injection:** the service doesn't create its repository; **it's handed one**. That's the entire concept, with no framework needed. Production passes the real repository; a test (Module 06) passes a fake one.
- **The clock is injected too.** A rule like "no future dates" depends on *now*. If the service called `new Date()` directly, tests would depend on when they run. With an injected clock, a test can say "pretend it's Oct 12, 4pm."

## 2.5 Errors that cross layers

Services can't send HTTP responses, because they don't know HTTP exists. So they **throw** typed errors, and **one** piece of middleware translates them:

```
service:  throw new NotFoundError("Workout")         ← a domain fact: it doesn't exist
   │  (routes don't catch it; Express 5 forwards async errors automatically)
   ▼
errorHandler: err instanceof AppError → res.status(err.status).json(problem details)
```

| Error class | Status | When a service throws it |
|---|---|---|
| `ValidationError` | 400 | Input breaks a rule |
| `ForbiddenError` | 403 | You can't do that to this thing (e.g., edit a built-in exercise) |
| `NotFoundError` | 404 | It doesn't exist (for this user) |
| `ConflictError` | 409 | It clashes with existing data (a duplicate name; a sets-vs-kind mismatch) |
| `UnprocessableError` | 422 | The request is well-formed but references something unusable (an unknown `exerciseId`) |

## 2.6 The composition root

Somewhere, someone has to decide "use the in-memory repository" and connect everything. That place is the **composition root**: `server.ts`. It's the *only* place that knows the concrete implementations.

```
server.ts:  repos (Map-based) ──▶ services ──▶ buildApp({ services }) ──▶ listen()
tests:      repos (fresh Maps) ──▶ services ──▶ buildApp({ services }) ──▶ send requests (Module 06)
Module 05:  repos (Postgres)   ──▶ services ──▶ buildApp({ services }) ──▶ listen()   ← only server.ts changes
```

## 2.7 Folder structure: by feature

```
src/
├── app.ts                      ← buildApp(deps): middleware, routers, 404, errors
├── server.ts                   ← composition root + listen()
├── middleware/
│   ├── error-handler.ts
│   ├── not-found.ts
│   ├── request-logger.ts
│   └── require-json-body.ts
├── shared/
│   ├── clock.ts  dates.ts  dev-user.ts  errors.ts  guards.ts
└── modules/
    ├── steps/        ← worked example (Part 3)
    │   ├── steps.types.ts
    │   ├── steps.repository.ts      (interface)
    │   ├── steps.memory-repo.ts     (implementation)
    │   ├── steps.service.ts
    │   └── steps.routes.ts
    ├── exercises/    ← Challenge 2
    ├── workouts/     ← Challenges 3–4
    └── sets/         ← Challenge 5
```

Organizing by **feature** keeps everything about steps in one folder. The alternative, organizing by **layer** (`controllers/`, `services/`, `repositories/`), scatters a single feature across the whole tree.

---

# Part 3 — ⌨️ Worked example: the Daily Steps feature

This is the **reference pattern** for the whole module. Type every file and read every explanation. At the end you'll trace one request through all of it.

**Spec for this feature:**
- `PUT /v1/steps/:date` with `{ "steps": 9412 }` → 201 on first write, 200 on later writes.
- Steps are a whole number, 0–100,000. The date must be a real calendar date, and not in the future.
- `GET /v1/steps/:date` → the record, or 404.
- `GET /v1/steps?from=&to=` → `{ data: [...] }`, oldest first, covering at most 366 days.
- `DELETE /v1/steps/:date` → 204, or 404.

Before you start: **delete the `/echo` route** from Module 01. It was for learning.

## 3.1 Shared building blocks

**`src/shared/errors.ts`** holds the error classes from 2.5.

```ts
export const PROBLEM_JSON = "application/problem+json";
const PROBLEM_BASE = "https://fittrack.dev/problems";

/** One problem with one input field, e.g. { path: "steps", message: "must be an integer" }. */
export interface FieldError {
  path: string;
  message: string;
}

/**
 * Base class for every *expected* error (bad input, not found, conflict…).
 * Services throw these. Only the error-handling middleware turns them into HTTP responses.
 */
export class AppError extends Error {
  readonly status: number;
  readonly type: string;
  readonly title: string;
  readonly fieldErrors: FieldError[] | undefined;

  constructor(opts: {
    status: number;
    slug: string;
    title: string;
    detail: string;
    fieldErrors?: FieldError[];
  }) {
    super(opts.detail); // becomes this.message
    this.name = new.target.name; // "NotFoundError", "ValidationError", ...
    this.status = opts.status;
    this.type = `${PROBLEM_BASE}/${opts.slug}`;
    this.title = opts.title;
    this.fieldErrors = opts.fieldErrors;
  }
}

export class ValidationError extends AppError {
  constructor(detail: string, fieldErrors?: FieldError[]) {
    super({ status: 400, slug: "validation", title: "Invalid request", detail, fieldErrors });
  }
}

export class ForbiddenError extends AppError {
  constructor(detail: string) {
    super({ status: 403, slug: "forbidden", title: "Forbidden", detail });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super({ status: 404, slug: "not-found", title: "Not found", detail: `${resource} not found` });
  }
}

export class ConflictError extends AppError {
  constructor(detail: string) {
    super({ status: 409, slug: "conflict", title: "Conflict", detail });
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor() {
    super({
      status: 415,
      slug: "unsupported-media-type",
      title: "Unsupported media type",
      detail: "Request bodies must be JSON (Content-Type: application/json)",
    });
  }
}

export class UnprocessableError extends AppError {
  constructor(detail: string, fieldErrors?: FieldError[]) {
    super({ status: 422, slug: "unprocessable", title: "Unprocessable request", detail, fieldErrors });
  }
}
```

- **`class X extends AppError`** makes every subclass also an `AppError`, so the error handler can catch all of them with one `instanceof AppError` check.
- **`super(...)`** calls the parent class's constructor. `Error`'s constructor sets `this.message`.
- **`new.target.name`** is the name of the class that was actually constructed, so logs say `NotFoundError` instead of `Error`.
- **`readonly`** means the property can't be reassigned after construction.

**`src/shared/clock.ts`** is the injectable "now" from 2.4.

```ts
/** Anything that can tell the time. Services get one injected instead of calling `new Date()`. */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};
```

**`src/shared/dates.ts`** holds calendar-date helpers.

```ts
const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** True only for real calendar dates written as YYYY-MM-DD ("2026-02-30" → false). */
export function isCalendarDate(value: string): boolean {
  if (!CALENDAR_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  // Impossible dates either fail to parse (NaN) or "roll over" (Feb 30 → Mar 2), so compare back.
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** "2026-10-11" + 1 → "2026-10-12". Works across month and year boundaries. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The UTC calendar date of an instant. */
export function utcDateOf(instant: Date): string {
  return instant.toISOString().slice(0, 10);
}
```

- The regex `^\d{4}-\d{2}-\d{2}$` only checks the *shape*. `2026-02-30` has the right shape but isn't a real date, so we also parse it and check that it survives a round trip.
- `"2026-10-11" < "2026-10-12"` works as plain **string comparison**. Because `YYYY-MM-DD` is zero-padded and goes biggest-unit-first, alphabetical order equals chronological order. The service relies on this.
- All the math happens in **UTC** (`T00:00:00Z`, `setUTCDate`) so the server's own timezone can never shift a date.

**`src/shared/guards.ts`** checks that a value is a plain object.

```ts
/** True for plain JSON objects like { "steps": 9412 }: not null, not an array. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
```

`typeof null === "object"` and `typeof [] === "object"` in JavaScript, so both have to be excluded explicitly. The return type `value is Record<string, unknown>` makes this a **type guard**: after `if (isRecord(body))`, TypeScript lets you read `body.steps` (as `unknown`).

**`src/shared/dev-user.ts`** is a stand-in for login.

```ts
/**
 * Every request acts as this user until Module 07 adds real login.
 * Repositories and services already take a userId, so swapping this out later is easy.
 */
export const DEV_USER_ID = "00000000-0000-4000-8000-000000000001";
```

## 3.2 Middleware updates

**`src/middleware/require-json-body.ts`** returns 415 for any non-JSON body, across the whole API.

```ts
import type { NextFunction, Request, Response } from "express";
import { UnsupportedMediaTypeError } from "../shared/errors.js";

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH"]);

export function requireJsonBody(req: Request, _res: Response, next: NextFunction): void {
  // req.is() returns null when there is no body at all, false when the body isn't JSON.
  if (METHODS_WITH_BODY.has(req.method) && req.is("application/json") === false) {
    throw new UnsupportedMediaTypeError(); // Express forwards errors thrown here to the error handler
  }
  next();
}
```

**`src/middleware/error-handler.ts`** replaces your Module 01 version. **Compare the two first:** what does this one handle that yours didn't?

```ts
import { STATUS_CODES } from "node:http";
import type { ErrorRequestHandler } from "express";
import { AppError, PROBLEM_JSON } from "../shared/errors.js";

/** Errors from express.json() carry a 4xx `status` and a `type` like "entity.parse.failed". */
function isClientHttpError(err: unknown): err is { status: number; type?: unknown } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof err.status === "number" &&
    err.status >= 400 &&
    err.status < 500
  );
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  // 1. Our own expected errors, thrown by services and routes
  if (err instanceof AppError) {
    res
      .status(err.status)
      .type(PROBLEM_JSON)
      .json({
        type: err.type,
        title: err.title,
        status: err.status,
        detail: err.message,
        instance: req.originalUrl,
        ...(err.fieldErrors ? { errors: err.fieldErrors } : {}),
      });
    return;
  }

  // 2. Client errors raised by Express itself, e.g. malformed JSON (400) or a body that's too big (413)
  if (isClientHttpError(err)) {
    const detail =
      err.type === "entity.parse.failed"
        ? "Request body is not valid JSON"
        : err.type === "entity.too.large"
          ? "Request body is too large"
          : "Bad request";
    res
      .status(err.status)
      .type(PROBLEM_JSON)
      .json({
        type: "about:blank",
        title: STATUS_CODES[err.status] ?? "Bad Request",
        status: err.status,
        detail,
        instance: req.originalUrl,
      });
    return;
  }

  // 3. Anything else is a bug. Log everything; reveal nothing.
  console.error(err);
  res.status(500).type(PROBLEM_JSON).json({
    type: "about:blank",
    title: "Internal Server Error",
    status: 500,
    instance: req.originalUrl,
  });
};
```

- `res.type(PROBLEM_JSON)` sets the Content-Type before `.json()`, and `.json()` keeps it.
- `...(cond ? { errors } : {})` is a **conditional spread**: it adds the `errors` key only when there are field errors.
- `STATUS_CODES` is Node's built-in table of reason phrases: `STATUS_CODES[400]` → `"Bad Request"`.
- `"about:blank"` is the RFC's standard `type` for "nothing more specific than the status code."

**`src/middleware/not-found.ts`** is the 404 in Problem Details format.

```ts
import type { Request, Response } from "express";
import { PROBLEM_JSON } from "../shared/errors.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).type(PROBLEM_JSON).json({
    type: "about:blank",
    title: "Not Found",
    status: 404,
    detail: `No route for ${req.method} ${req.path}`,
    instance: req.originalUrl,
  });
}
```

## 3.3 The steps feature, layer by layer

**`src/modules/steps/steps.types.ts`** is the shape of the data.

```ts
/** One day's step total, as the API sends it to clients. */
export interface DailySteps {
  /** The user's local calendar day, "YYYY-MM-DD". */
  date: string;
  /** Whole steps for that day, 0–100,000. */
  steps: number;
  /** When this day's total last changed (ISO 8601, UTC). */
  updatedAt: string;
}
```

**`src/modules/steps/steps.repository.ts`** is the storage contract.

```ts
import type { DailySteps } from "./steps.types.js";

/**
 * Storage for daily step totals. This is a *contract*: the in-memory version (now)
 * and the Postgres version (Module 05) must both behave exactly like this.
 */
export interface StepsRepository {
  /** Insert or replace one day's total. `created` is true if the day had no record before. */
  upsert(userId: string, record: DailySteps): Promise<{ record: DailySteps; created: boolean }>;

  /** The record for one day, or null if there isn't one. */
  findByDate(userId: string, date: string): Promise<DailySteps | null>;

  /** All records with from <= date <= to, oldest first. */
  listRange(userId: string, from: string, to: string): Promise<DailySteps[]>;

  /** Delete one day. Returns false if there was nothing to delete. */
  delete(userId: string, date: string): Promise<boolean>;
}
```

An **interface** has no code, only signatures. The doc comments are part of the contract, because they say *how* each method must behave (oldest first, inclusive range, what the booleans mean).

**`src/modules/steps/steps.memory-repo.ts`** is one implementation of the contract.

```ts
import type { StepsRepository } from "./steps.repository.js";
import type { DailySteps } from "./steps.types.js";

export function createMemoryStepsRepository(): StepsRepository {
  // One entry per user per day, keyed "userId|date". The key plays the role of a primary key.
  const rows = new Map<string, DailySteps>();
  const keyOf = (userId: string, date: string) => `${userId}|${date}`;

  return {
    async upsert(userId, record) {
      const key = keyOf(userId, record.date);
      const created = !rows.has(key);
      rows.set(key, structuredClone(record));
      return { record: structuredClone(record), created };
    },

    async findByDate(userId, date) {
      const row = rows.get(keyOf(userId, date));
      return row ? structuredClone(row) : null;
    },

    async listRange(userId, from, to) {
      const prefix = `${userId}|`;
      return [...rows.entries()]
        .filter(([key, row]) => key.startsWith(prefix) && row.date >= from && row.date <= to)
        .map(([, row]) => structuredClone(row))
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    async delete(userId, date) {
      return rows.delete(keyOf(userId, date));
    },
  };
}
```

- **The return type `StepsRepository`** makes TypeScript check that the object really fulfills the contract. It also **infers parameter types**, which is why `async upsert(userId, record)` needs no annotations.
- **The `Map` is created inside the function**, so each call to `createMemoryStepsRepository()` gets fresh, isolated storage. Tests will rely on that.
- **Composite key `"userId|date"`.** A `Map` key must be a single value, so two fields are combined into one string. Setting the same key again *replaces* the entry, and that's the upsert.
- **`[...rows.entries()]`** turns the Map into an array of `[key, value]` pairs, so you can use `filter`, `map`, and `sort`.
- **`([, row]) =>`** destructures the pair and skips the first element (the key).
- **`rows.delete(key)`** already returns `true` or `false` ("was something there?"), which is exactly what the contract asks for.

**`src/modules/steps/steps.service.ts`** holds the business rules.

```ts
import type { Clock } from "../../shared/clock.js";
import { addDays, utcDateOf } from "../../shared/dates.js";
import { NotFoundError, ValidationError } from "../../shared/errors.js";
import type { StepsRepository } from "./steps.repository.js";
import type { DailySteps } from "./steps.types.js";

export const MAX_DAILY_STEPS = 100_000;
export const MAX_RANGE_DAYS = 366;

export interface StepsService {
  setDay(userId: string, date: string, steps: number): Promise<{ record: DailySteps; created: boolean }>;
  getDay(userId: string, date: string): Promise<DailySteps>;
  listRange(userId: string, from: string, to: string): Promise<DailySteps[]>;
  deleteDay(userId: string, date: string): Promise<void>;
}

export function createStepsService(deps: { repo: StepsRepository; clock: Clock }): StepsService {
  const { repo, clock } = deps;

  return {
    async setDay(userId, date, steps) {
      // Rule 1: a believable whole number of steps.
      if (!Number.isInteger(steps) || steps < 0 || steps > MAX_DAILY_STEPS) {
        throw new ValidationError(`steps must be a whole number from 0 to ${MAX_DAILY_STEPS}`, [
          { path: "steps", message: `must be an integer from 0 to ${MAX_DAILY_STEPS}` },
        ]);
      }

      // Rule 2: no future days. We don't know the user's timezone yet (Module 07 adds it).
      // Local time is at most 14 hours ahead of UTC, so "tomorrow in UTC" is the latest
      // date that could be "today" somewhere on Earth.
      const latestAllowed = addDays(utcDateOf(clock.now()), 1);
      if (date > latestAllowed) {
        throw new ValidationError("date cannot be in the future", [
          { path: "date", message: `must be on or before ${latestAllowed}` },
        ]);
      }

      return repo.upsert(userId, { date, steps, updatedAt: clock.now().toISOString() });
    },

    async getDay(userId, date) {
      const record = await repo.findByDate(userId, date);
      if (!record) throw new NotFoundError(`Steps for ${date}`);
      return record;
    },

    async listRange(userId, from, to) {
      if (from > to) {
        throw new ValidationError("from must be on or before to", [
          { path: "from", message: "must be on or before to" },
        ]);
      }
      if (addDays(from, MAX_RANGE_DAYS) < to) {
        throw new ValidationError(`a range can cover at most ${MAX_RANGE_DAYS} days`);
      }
      return repo.listRange(userId, from, to);
    },

    async deleteDay(userId, date) {
      const deleted = await repo.delete(userId, date);
      if (!deleted) throw new NotFoundError(`Steps for ${date}`);
    },
  };
}
```

- **The `StepsService` interface** is what routes depend on. Routes never see the repository.
- **Every rule is a guard clause:** check → throw → otherwise carry on. The "happy path" ends up at the bottom, unindented.
- **Throwing `ValidationError` instead of returning an error value.** The route doesn't need an `if` around every call; errors flow to the error handler automatically.
- **`getDay` converts "null from the repository" into "404 from the domain."** Repositories report facts (`null`); services decide what those facts *mean*.
- **`100_000`:** underscores in number literals are just for readability.

**`src/modules/steps/steps.routes.ts`** connects HTTP to the service.

```ts
import express, { type Router } from "express";
import { isCalendarDate } from "../../shared/dates.js";
import { DEV_USER_ID } from "../../shared/dev-user.js";
import { ValidationError } from "../../shared/errors.js";
import { isRecord } from "../../shared/guards.js";
import type { StepsService } from "./steps.service.js";

/** Turns a raw route or query value into a YYYY-MM-DD string, or throws a 400. */
function parseDate(value: unknown, field: string): string {
  if (typeof value !== "string" || !isCalendarDate(value)) {
    throw new ValidationError(`${field} must be a real calendar date like 2026-10-11`, [
      { path: field, message: "expected YYYY-MM-DD" },
    ]);
  }
  return value;
}

/** Pulls the steps number out of an unknown JSON body, or throws a 400. */
function parseStepsBody(body: unknown): number {
  if (!isRecord(body) || typeof body.steps !== "number") {
    throw new ValidationError('body must be JSON like { "steps": 9412 }', [
      { path: "steps", message: "expected a number" },
    ]);
  }
  return body.steps;
}

export function createStepsRouter(service: StepsService): Router {
  const router = express.Router();

  // GET /v1/steps?from=YYYY-MM-DD&to=YYYY-MM-DD
  router.get("/", async (req, res) => {
    const from = parseDate(req.query.from, "from");
    const to = parseDate(req.query.to, "to");
    const days = await service.listRange(DEV_USER_ID, from, to);
    res.json({ data: days });
  });

  // GET /v1/steps/:date
  router.get("/:date", async (req, res) => {
    const date = parseDate(req.params.date, "date");
    res.json(await service.getDay(DEV_USER_ID, date));
  });

  // PUT /v1/steps/:date   body: { "steps": 9412 }
  router.put("/:date", async (req, res) => {
    const date = parseDate(req.params.date, "date");
    const steps = parseStepsBody(req.body);
    const { record, created } = await service.setDay(DEV_USER_ID, date, steps);
    if (created) res.location(`${req.baseUrl}/${date}`);
    res.status(created ? 201 : 200).json(record);
  });

  // DELETE /v1/steps/:date
  router.delete("/:date", async (req, res) => {
    const date = parseDate(req.params.date, "date");
    await service.deleteDay(DEV_USER_ID, date);
    res.sendStatus(204);
  });

  return router;
}
```

- **`express.Router()`** is a mini-app holding a group of routes. `app.ts` mounts it at `/v1/steps`, so `"/:date"` here means `/v1/steps/:date`.
- **The route takes the service as a parameter.** It doesn't import a specific service instance. That's dependency injection again.
- **`parseDate(value: unknown, ...)`.** Query values can be a string, an array (`?from=a&from=b`), or missing, so we accept `unknown` and check it. Route params are always strings, but the same helper works for both.
- **Routes do shape checks; services do rules.** "Is `steps` a number?" is about *parsing input* (route). "Is it 0–100,000?" is a *domain rule* (service), and a CSV import job would need it too.
- **No try/catch anywhere.** A throw inside an `async` handler goes to `errorHandler` (Express 5 does this for you).
- **`req.baseUrl`** is the mount path (`/v1/steps`), used to build the `Location` header.
- **Order of routes:** `"/"` and `"/:date"` don't overlap, but in general, define more specific paths before patterns that could swallow them.

> 📝 Module 03 replaces these hand-written `parse…` helpers with Zod schemas. Writing them by hand first shows you exactly what a validation library automates.

## 3.4 Wiring: `app.ts` and `server.ts`

**`src/app.ts`** builds the app from whatever dependencies it's given.

```ts
import express, { type Express } from "express";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestLogger } from "./middleware/request-logger.js";
import { requireJsonBody } from "./middleware/require-json-body.js";
import { createStepsRouter } from "./modules/steps/steps.routes.js";
import type { StepsService } from "./modules/steps/steps.service.js";

/** Everything the app needs, handed in from outside (see server.ts). */
export interface AppDeps {
  stepsService: StepsService;
  // Challenges add: exercisesService, workoutsService, setsService
}

export function buildApp(deps: AppDeps): Express {
  const app = express();

  // 1. Global middleware, in order
  app.use(requestLogger);
  app.use(requireJsonBody);
  app.use(express.json({ limit: "100kb" }));

  // 2. Routes
  //    (keep your /health route from Module 01 here)
  app.use("/v1/steps", createStepsRouter(deps.stepsService));

  // 3. Nothing matched → 404. Then the error handler, always last.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
```

**`src/server.ts`** is the composition root.

```ts
import { buildApp } from "./app.js";
import { createMemoryStepsRepository } from "./modules/steps/steps.memory-repo.js";
import { createStepsService } from "./modules/steps/steps.service.js";
import { systemClock } from "./shared/clock.js";

const PORT = Number(process.env.PORT ?? 3000);

// Composition root: the ONLY place that chooses concrete implementations.
// 1. Repositories (storage)
const stepsRepo = createMemoryStepsRepository();

// 2. Services (rules), each handed the repositories it needs
const stepsService = createStepsService({ repo: stepsRepo, clock: systemClock });

// 3. The HTTP app, handed the services
const app = buildApp({ stepsService });

app.listen(PORT, (error?: Error) => {
  if (error) throw error;
  console.log(`fittrack-api listening on http://localhost:${PORT}`);
});
```

## 3.5 Trace one request

`PUT /v1/steps/2026-10-11` with body `{"steps": 9412}`:

1. **`requestLogger`** notes the start time and registers a "finish" listener → `next()`.
2. **`requireJsonBody`**: the method is PUT and the body is JSON, so it passes → `next()`.
3. **`express.json()`** reads and parses the body → `req.body = { steps: 9412 }` → `next()`.
4. **`/health`** doesn't match. **`app.use("/v1/steps", router)`** matches the prefix, and inside the router, `PUT /:date` matches with `req.params.date = "2026-10-11"`.
5. **The route** runs `parseDate` ✔ and `parseStepsBody` ✔ (9412), then calls `service.setDay(DEV_USER_ID, "2026-10-11", 9412)`.
6. **The service** checks the integer range ✔ and that the date isn't in the future ✔, then calls `repo.upsert(...)`.
7. **The repository** finds the key isn't in the Map, so `created = true`. It stores a copy and returns a copy.
8. **Back in the route:** `created` is true, so it sets `Location: /v1/steps/2026-10-11` and responds `201` with the JSON.
9. **`requestLogger`'s "finish" listener** prints `PUT /v1/steps/2026-10-11 → 201 (0.8 ms)`.

**Now the failure path,** `{"steps": -5}`: steps 1–5 are the same → the service throws `ValidationError` → Express 5 catches the rejected promise → skips to **`errorHandler`** → `err instanceof AppError` → 400 problem+json. The route never had to think about it.

## 3.6 ✅ Try it

Run `npm run dev` and work through the table. Add each of these to `requests.http`.

| Request | Expect |
|---|---|
| `curl -i -X PUT localhost:3000/v1/steps/2026-10-11 -H 'Content-Type: application/json' -d '{"steps":9412}'` | **201**, `Location: /v1/steps/2026-10-11` |
| The same command again | **200** (same state: idempotent) |
| The same with `{"steps":10250}` | **200**, updated |
| `.../v1/steps/2026-02-30` with a valid body | **400**, `"expected YYYY-MM-DD"` |
| Body `{"steps":"9412"}` | **400** (a string isn't a number) |
| Body `{"steps":-5}` or `{"steps":1.5}` | **400** (from the service) |
| Date `2099-01-01` | **400**, future date |
| Body sent as `-H 'Content-Type: text/plain'` | **415** |
| Body `{"steps":` | **400** malformed JSON |
| `curl -i localhost:3000/v1/steps/2026-10-11` | **200** |
| `curl -i 'localhost:3000/v1/steps?from=2026-10-01&to=2026-10-31'` | **200** `{"data":[...]}` |
| `curl -i 'localhost:3000/v1/steps?from=2026-10-31&to=2026-10-01'` | **400** |
| `curl -i -X DELETE localhost:3000/v1/steps/2026-10-11` | **204**, and **404** the second time |

**One more experiment:** add a few days, **restart the server**, and GET them again. They're gone. In-memory storage dies with the process. That's the problem Module 04 solves.

```bash
git add -A && git commit -m "feat(steps): daily steps CRUD with layered architecture"
```

---

# Part 4 — 🧰 Toolbox

Syntax and APIs for the challenges. **These are building blocks, not solutions.**

## 4.1 Express routers and responses

```ts
// Mount a router under a prefix (in app.ts)
app.use("/v1/workouts", createWorkoutsRouter(deps.workoutsService));

// Several routers can share a prefix. Express tries them in order.
// Useful for nested routes like /v1/workouts/:workoutId/sets
app.use("/v1/workouts", createSetsRouter(deps.setsService));
// …inside the sets router:
router.post("/:workoutId/sets", async (req, res) => {
  req.params.workoutId; // typed as string, because Express reads it from the path pattern
});

// Responses
res.status(201).location(`${req.baseUrl}/${created.id}`).json(created);   // create
res.json(item);                                                           // 200 is the default
res.sendStatus(204);                                                      // delete
```

> Express also offers `express.Router({ mergeParams: true })` for nested routers that need their parent's params. Sharing the prefix (above) is simpler and keeps the param types correct.

## 4.2 Reading query values safely

```ts
// ?limit=20&kind=run   → each value is string | string[] | undefined (or a nested object)
const raw = req.query.limit;
if (raw !== undefined && typeof raw !== "string") { /* e.g. ?limit=1&limit=2 → 400 */ }

Number("20")      // 20
Number("abc")     // NaN    → check with Number.isNaN(n)
Number("")        // 0      ← surprise! Treat an empty string as "missing" or invalid
Number("12abc")   // NaN    (parseInt("12abc", 10) would give 12; avoid parseInt for validation)
Number.isInteger(20.5)  // false
```

## 4.3 Validating unknown JSON bodies by hand

```ts
import { isRecord } from "../../shared/guards.js";

// 1. Is it an object at all?
if (!isRecord(body)) throw new ValidationError("body must be a JSON object");

// 2. Reject fields you don't recognize (this blocks clients from setting id, userId, createdAt…)
const ALLOWED = new Set(["kind", "startedAt", "endedAt", "distanceM", "notes"]);
const unknown = Object.keys(body).filter((key) => !ALLOWED.has(key));
if (unknown.length > 0) {
  throw new ValidationError(`unknown fields: ${unknown.join(", ")}`,
    unknown.map((path) => ({ path, message: "is not allowed" })));
}

// 3. Check each field's type; collect all problems so the client can fix everything at once
const errors: FieldError[] = [];
if (typeof body.reps !== "number") errors.push({ path: "reps", message: "expected a number" });
if (errors.length > 0) throw new ValidationError("invalid set", errors);

// 4. Optional vs. nullable fields (for PATCH)
Object.hasOwn(body, "notes")   // true if the key is present at all, even when its value is null
body.notes === null            // the client explicitly wants to clear it
body.notes === undefined       // absent (or explicitly undefined, which JSON can't send anyway)
```

**String enums with a type guard:**

```ts
export const WORKOUT_KINDS = ["strength", "run", "walk", "cycle", "other"] as const;
export type WorkoutKind = (typeof WORKOUT_KINDS)[number];   // "strength" | "run" | …

export function isWorkoutKind(value: unknown): value is WorkoutKind {
  return typeof value === "string" && (WORKOUT_KINDS as readonly string[]).includes(value);
}
```

`as const` turns the array into a fixed tuple of literal values, so TypeScript can derive the union type from it. One list, used at both runtime and compile time.

## 4.4 Instants (timestamps)

```ts
// Accept ISO 8601 with an explicit zone ("Z" or ±hh:mm); reject ambiguous strings like "2026-10-11 07:00"
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

function isIsoInstant(value: unknown): value is string {
  // The regex checks the shape; Date.parse catches impossible values like 25:00
  return typeof value === "string" && ISO_INSTANT.test(value) && !Number.isNaN(Date.parse(value));
}

// Normalize to UTC before storing, so every stored value compares and sorts the same way
new Date("2026-10-11T07:00:00-07:00").toISOString();  // "2026-10-11T14:00:00.000Z"

// Compare instants as numbers (milliseconds since 1970)
Date.parse(endedAt) > Date.parse(startedAt)
const durationS = Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000);

// "Not more than 5 minutes in the future"
Date.parse(startedAt) <= clock.now().getTime() + 5 * 60 * 1000
```

Consider adding `isIsoInstant` to `src/shared/dates.ts`.

## 4.5 IDs, Maps, and copies

```ts
import { randomUUID } from "node:crypto";
randomUUID();                       // "1ca189af-819d-4bc2-94aa-2956c139ac0e"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
UUID.test(req.params.id);           // a malformed id can't match anything → treat it as 404

const items = new Map<string, Workout>();
items.set(id, w); items.get(id); items.has(id); items.delete(id);   // delete returns a boolean
[...items.values()]                 // all values as an array
structuredClone(w)                  // a deep copy: return copies, never stored objects
```

## 4.6 Merging a partial update (PATCH)

```ts
const existing = { notes: "easy", distanceM: 5000 };
const patch = { notes: undefined };

{ ...existing, ...patch }  // { notes: undefined, distanceM: 5000 } ← the spread COPIES undefined values!
```

So don't blindly spread a patch object. Build it field by field: only copy a key **if the client sent it** (`Object.hasOwn`). A client-sent `null` means "clear this field."

## 4.7 Sorting with a tie-breaker

```ts
// Newest first by startedAt; if two are equal, by id descending.
// A comparator returns a negative number (a first), a positive number (b first), or 0 (equal).
items.sort((a, b) =>
  b.startedAt.localeCompare(a.startedAt) || b.id.localeCompare(a.id),
);
// `||` falls through to the tie-breaker only when the first comparison returns 0.
// Comparing ISO strings works ONLY because every stored value is normalized to the same UTC format.
```

## 4.8 Encoding and decoding a cursor

```ts
// Encode: object → JSON → base64url (URL-safe: no + / or = characters)
const cursor = Buffer.from(JSON.stringify({ startedAt: "2026-10-01T10:00:00.000Z", id: "b" }))
  .toString("base64url");

// Decode: may throw (bad base64 or bad JSON), and might not have the shape you expect
let position: unknown;
try {
  position = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
} catch {
  /* invalid cursor → 400 */
}
// …then check its shape with isRecord / typeof before using it
```

## 4.9 Mapping stored data to a response

Sometimes what you *store* has fields the client shouldn't see:

```ts
interface ExerciseRecord {          // what the repository stores
  id: string;
  ownerId: string | null;           // null = built-in; internal detail
  name: string;
  category: ExerciseCategory;
  createdAt: string;
}

function toExerciseResponse(e: ExerciseRecord) {   // what the API returns
  return { id: e.id, name: e.name, category: e.category, isCustom: e.ownerId !== null, createdAt: e.createdAt };
}
```

Mapping explicitly (instead of sending the record as-is) means a new internal field can never leak out by accident.

---

# Part 5 — 🧩 Challenges

Work in order; each one builds on the previous. **For each challenge, first update `docs/api.md` (Challenge 1), then build the layers bottom-up: types → repository interface → memory repository → service → routes → wire into `app.ts` and `server.ts`.** That's the same order as the worked example.

## Challenge 1: Write the API contract first ★☆☆

Create `docs/api.md`. Designing before coding is the professional habit, and it's much cheaper to change a document than code.

Here's the template, filled in for one endpoint. Write an entry like this for **every** endpoint in the 1.4 table (the steps ones too).

````markdown
### PUT /v1/steps/:date
Set the total steps for one calendar day. Idempotent.

**Path params:** `date`: YYYY-MM-DD, a real calendar date, not in the future
**Body:**
```json
{ "steps": 9412 }
```
`steps`: integer, 0–100000

**Responses**
- `201`: created. `Location: /v1/steps/:date`. Body: DailySteps
- `200`: replaced. Body: DailySteps
- `400`: invalid date or steps (problem+json with `errors`)
- `415`: body isn't JSON
````

✅ **Done when:** every endpoint has its params, body, success response, and **every error status** written down. Use the specs in Challenges 2–5 as your source.

---

## Challenge 2: Exercises ★☆☆ (closest to the worked example)

**Representation (response)**

```json
{ "id": "uuid", "name": "Back Squat", "category": "legs", "isCustom": false, "createdAt": "ISO" }
```

`category` is one of `"legs" | "push" | "pull" | "core" | "full-body" | "cardio"`.

**Built-in catalog.** The memory repository starts with these, owned by nobody (`ownerId: null`):

| Name | Category | Name | Category |
|---|---|---|---|
| Back Squat | legs | Barbell Row | pull |
| Romanian Deadlift | legs | Pull-Up | pull |
| Deadlift | pull | Lat Pulldown | pull |
| Bench Press | push | Plank | core |
| Overhead Press | push | Hanging Leg Raise | core |
| Incline Dumbbell Press | push | Kettlebell Swing | full-body |

**Endpoints and rules**

| Endpoint | Rules | Errors |
|---|---|---|
| `GET /v1/exercises?category=` | Built-ins + **my** custom exercises, sorted by name (A→Z). Optional category filter. | 400 for an invalid category |
| `GET /v1/exercises/:id` | Built-in, or custom and mine | 404 otherwise (including other users' custom exercises) |
| `POST /v1/exercises` | Body `{ name, category }`, nothing else. The name is trimmed and 1–60 characters. **Unique case-insensitively** among built-ins + my custom exercises. | 400 invalid · **409** duplicate name |
| `PATCH /v1/exercises/:id` | Body: `name?`, `category?` (at least one). Same name rules. | **403** if built-in · 404 · 409 · 400 |
| `DELETE /v1/exercises/:id` | Custom only. (Challenge 5 adds: **409** if any set uses it.) | **403** if built-in · 404 |

**Files:** `src/modules/exercises/` → `exercises.types.ts`, `exercises.repository.ts`, `exercises.memory-repo.ts`, `exercises.service.ts`, `exercises.routes.ts`. Then add it to `AppDeps`, `buildApp`, and `server.ts`.

✅ **Acceptance tests** (add them all to `requests.http`)

```bash
curl -s localhost:3000/v1/exercises | head -c 300                       # 12 built-ins, A→Z
curl -s 'localhost:3000/v1/exercises?category=pull'                     # Barbell Row, Deadlift, Lat Pulldown, Pull-Up
curl -i 'localhost:3000/v1/exercises?category=arms'                     # 400
curl -i -X POST localhost:3000/v1/exercises -H 'Content-Type: application/json' \
  -d '{"name":"  Bulgarian Split Squat ","category":"legs"}'            # 201, Location, name trimmed, isCustom true
# the same name in different case
curl -i -X POST localhost:3000/v1/exercises -H 'Content-Type: application/json' \
  -d '{"name":"bulgarian split squat","category":"legs"}'               # 409
curl -i -X POST localhost:3000/v1/exercises -H 'Content-Type: application/json' \
  -d '{"name":"bench press","category":"push"}'                         # 409 (clashes with a built-in)
curl -i -X POST localhost:3000/v1/exercises -H 'Content-Type: application/json' \
  -d '{"name":"Curl","category":"arms","id":"x"}'                       # 400, listing BOTH problems
curl -i -X PATCH localhost:3000/v1/exercises/<built-in id> -H 'Content-Type: application/json' \
  -d '{"name":"Squat"}'                                                 # 403
curl -i -X DELETE localhost:3000/v1/exercises/<your custom id>           # 204, then 404
```

<details><summary>💡 Hint 1: direction</summary>

Copy the *structure* of the steps module, not its contents. Read toolbox 4.3 (body validation), 4.5 (IDs and Maps), and 4.9 (record vs. response). Decide where the uniqueness rule lives (look at the table in 2.2).
</details>

<details><summary>💡 Hint 2: approach</summary>

- **Storage type** `ExerciseRecord` has `ownerId: string | null`. The memory repository seeds the 12 built-ins with `ownerId: null` when it's created.
- **Repository methods you'll probably want:** `listVisible(userId, category?)` (built-ins + mine), `findVisibleById(userId, id)`, `findVisibleByName(userId, name)` (case-insensitive), `create(record)`, `update(id, changes)`, `delete(id)`.
- **The service** does: trim and validate the name length; the duplicate check via `findVisibleByName` → `ConflictError`; "is it built-in?" → `ForbiddenError`; not visible → `NotFoundError`.
- **Routes** do: check the body's shape and reject unknown keys (400), call the service, map the record to the response (`toExerciseResponse`), and pick the status code.
- **For PATCH,** when checking for a duplicate name, make sure an exercise doesn't conflict *with itself* (renaming "Curl" to "curl").
</details>

<details><summary>💡 Hint 3: pseudocode for create</summary>

```
route POST /:
  body must be an object; unknown keys → 400
  name must be a string, category must be a valid category → else 400 (collect both errors)
  record = await service.create(DEV_USER_ID, { name, category })
  201 + Location + toExerciseResponse(record)

service.create(userId, input):
  name = input.name.trim()
  if name.length < 1 or > 60 → ValidationError
  if await repo.findVisibleByName(userId, name) → ConflictError("An exercise named … already exists")
  record = { id: randomUUID(), ownerId: userId, name, category, createdAt: clock.now().toISOString() }
  return repo.create(record)
```
</details>

**Something to notice:** the duplicate check reads first, then writes. If two requests with the same name arrive at the same instant, could both pass the check? In memory, no. The memory repository's promises resolve immediately, so once one request reaches the service, its check and its write both finish before Node switches to the other request. With a real database, each `await` is a real network round trip, and another request *can* run in between. Module 04's `UNIQUE` constraint is the real fix. Write this down in your notes.

---

## Challenge 3: Workouts (create, read, update, delete) ★★☆

**Representation:** see 1.8. `durationS` is derived: `null` if there's no `endedAt`.

**Create: `POST /v1/workouts`.** Allowed body fields: `kind`, `startedAt`, `endedAt`, `distanceM`, `notes`.

| Field | Rule |
|---|---|
| `kind` | Required; one of `strength`, `run`, `walk`, `cycle`, `other` |
| `startedAt` | Required; ISO 8601 with a zone; **normalized to UTC**; not more than 5 minutes in the future |
| `endedAt` | Optional (or `null`); must be **after** `startedAt`; a workout lasts at most **24 hours** |
| `distanceM` | Optional (or `null`); integer 0–500,000; **only allowed** for `run`, `walk`, `cycle` |
| `notes` | Optional (or `null`); trimmed; at most 2,000 characters; an empty string becomes `null` |
| anything else | 400 (`id`, `userId`, `createdAt`, `durationS` are all server-controlled) |

**Endpoints**

| Endpoint | Behavior |
|---|---|
| `POST /v1/workouts` | 201 + `Location` + workout |
| `GET /v1/workouts/:id` | 200, or 404 (also 404 if the id isn't a valid UUID, so you don't reveal anything) |
| `PATCH /v1/workouts/:id` | The PATCH semantics from 1.6. **Validate the merged workout** with the same rules as create. Updates `updatedAt`. |
| `DELETE /v1/workouts/:id` | 204, or 404 |
| `GET /v1/workouts` | For now: all my workouts, newest first, as `{ data, nextCursor: null }`. Challenge 4 adds paging. |

✅ **Acceptance tests**

```bash
# Create a run (note the -07:00 offset)
curl -i -X POST localhost:3000/v1/workouts -H 'Content-Type: application/json' \
  -d '{"kind":"run","startedAt":"2026-10-11T07:00:00-07:00","endedAt":"2026-10-11T07:31:10-07:00","distanceM":5000}'
# → 201, startedAt "2026-10-11T14:00:00.000Z", durationS 1870, notes null

# Ends before it starts → 400 with errors[0].path "endedAt"
curl -i -X POST localhost:3000/v1/workouts -H 'Content-Type: application/json' \
  -d '{"kind":"run","startedAt":"2026-10-11T08:00:00Z","endedAt":"2026-10-11T07:00:00Z"}'

# A distance on a strength workout → 400
curl -i -X POST localhost:3000/v1/workouts -H 'Content-Type: application/json' \
  -d '{"kind":"strength","startedAt":"2026-10-11T18:00:00Z","distanceM":100}'

# No timezone (ambiguous) → 400.   A future start → 400.   {"kind":"swim"} → 400.   An extra "userId" field → 400.

# PATCH: fix the distance, clear the notes
curl -i -X PATCH localhost:3000/v1/workouts/<id> -H 'Content-Type: application/json' -d '{"distanceM":5100,"notes":null}'
# → 200, distanceM 5100, updatedAt changed, createdAt unchanged

# PATCH that makes the MERGED workout invalid → 400
curl -i -X PATCH localhost:3000/v1/workouts/<id> -H 'Content-Type: application/json' -d '{"endedAt":"2026-10-11T13:00:00Z"}'

curl -i localhost:3000/v1/workouts/not-a-uuid       # 404
curl -i -X DELETE localhost:3000/v1/workouts/<id>   # 204, then 404
```

<details><summary>💡 Hint 1: direction</summary>

You need toolbox 4.3 (unknown keys, enums), 4.4 (instants), and 4.6 (PATCH merging). Put the rules in **one** service function, e.g. `assertValidWorkout(w)`, and call it from both create and update. That's what makes "validate the merged result" easy.
</details>

<details><summary>💡 Hint 2: approach</summary>

- **The route** checks shapes only. Is `kind` a string, is `startedAt` an ISO instant, is `distanceM` a number or null, are there unknown keys? It passes a typed input object to the service. For PATCH, it passes only the keys that were present (use `Object.hasOwn`).
- **The service, for create:** normalize timestamps to UTC → build the full workout (id, createdAt, updatedAt, `null` for missing optionals) → `assertValidWorkout` → `repo.create`.
- **The service, for update:** `repo.findById` → 404 if missing → merged = existing with each present patch key applied → `assertValidWorkout(merged)` → set `updatedAt` → `repo.update`.
- **Compute `durationS`** when mapping to the response (it's derived), not in storage.
</details>

<details><summary>💡 Hint 3: pseudocode for assertValidWorkout</summary>

```
assertValidWorkout(w, now):
  errors = []
  start = Date.parse(w.startedAt)
  if start > now + 5 min:                  errors.push(startedAt: "cannot be in the future")
  if w.endedAt != null:
    end = Date.parse(w.endedAt)
    if end <= start:                       errors.push(endedAt: "must be after startedAt")
    else if end - start > 24 h:            errors.push(endedAt: "workout cannot exceed 24 hours")
  if w.distanceM != null:
    if kind not in [run, walk, cycle]:     errors.push(distanceM: "only for run, walk, cycle")
    if not integer or < 0 or > 500000:     errors.push(distanceM: "integer 0–500000")
  if w.notes != null and length > 2000:    errors.push(notes: "max 2000 characters")
  if errors not empty: throw ValidationError("invalid workout", errors)
```
</details>

---

## Challenge 4: Pagination, filters, and sorting ★★★

**`GET /v1/workouts`** query parameters:

| Param | Rule | Default |
|---|---|---|
| `limit` | Integer 1–100 | 20 |
| `cursor` | Opaque string from a previous response | none (first page) |
| `kind` | A valid kind | all kinds |
| `from`, `to` | `YYYY-MM-DD`. Includes workouts whose `startedAt` falls on these **UTC** days, inclusive. (User timezones come in Module 07.) | no bound |
| `sort` | `-startedAt` (newest first) or `startedAt` (oldest first) | `-startedAt` |

Any invalid value → 400. **A cursor created with one `sort` used with another → 400.**

**Response:** `{ "data": [...], "nextCursor": "…" | null }`

**Architecture decision (important):** cursor *encoding and decoding* is an HTTP concern, so it belongs in the **route** (or `src/shared/pagination.ts`). The **repository** receives a decoded position and knows nothing about base64. Suggested repository signature:

```ts
export interface ListWorkoutsOptions {
  kind?: WorkoutKind;
  fromInclusive?: string;   // an ISO instant, e.g. "2026-09-01T00:00:00.000Z"
  toExclusive?: string;     // an ISO instant, e.g. "2026-10-01T00:00:00.000Z"
  order: "asc" | "desc";
  after?: { startedAt: string; id: string };  // the position to continue from
  limit: number;            // the repository returns up to this many
}
list(userId: string, opts: ListWorkoutsOptions): Promise<WorkoutRecord[]>;
```

**Test data.** This creates 25 runs on Sept 1–25:

```bash
for i in $(seq 1 25); do
  day=$(printf %02d $i)
  curl -s -o /dev/null -X POST localhost:3000/v1/workouts -H 'Content-Type: application/json' \
    -d "{\"kind\":\"run\",\"startedAt\":\"2026-09-${day}T13:00:00Z\",\"distanceM\":$((3000 + i * 100))}"
done
```

✅ **Acceptance tests**

1. `GET /v1/workouts?limit=10` → 10 items (Sept 25…16) plus a `nextCursor`.
2. Follow the cursors → 10 items (15…6), then 5 items (5…1) with `nextCursor: null`.
3. **The mid-scroll test:** get page 1, then POST a new workout dated Sept 30, then request page 2 with the old cursor → **no duplicates, nothing skipped.**
4. `?sort=startedAt&limit=5` → Sept 1…5.
5. `?kind=strength` → `{"data":[],"nextCursor":null}` (an empty list is 200, not 404).
6. `?from=2026-09-10&to=2026-09-12` → exactly 3 workouts.
7. `?limit=0`, `?limit=101`, `?limit=abc`, `?cursor=garbage`, `?sort=distanceM` → all 400.
8. Two workouts with the **same** `startedAt` page correctly across a page boundary (that's what the `id` tie-breaker is for).

<details><summary>💡 Hint 1: direction</summary>

Re-read 1.10 (especially the 5 numbered points) and toolbox 4.7–4.8. Write the decode function first, and test it with a hand-made cursor.
</details>

<details><summary>💡 Hint 2: approach</summary>

- **Route:** parse and validate every query param → decode the cursor (it must contain `startedAt`, `id`, and the `sort` it was made with) → call the service/repository with `limit: limit + 1` → if more than `limit` came back, drop the extra one and encode a cursor from the **last item you're returning** → respond.
- **Memory repository:** filter by user, kind, and dates → sort with the tie-breaker (4.7) → if `after` is set, keep only items strictly after that position → take the first `limit`.
- **"Strictly after"** for `desc`: `startedAt < a.startedAt || (startedAt === a.startedAt && id < a.id)`. For `asc`, flip both comparisons.
- **`to` is inclusive by day**, so convert it to an exclusive instant: `addDays(to, 1) + "T00:00:00.000Z"`.
</details>

<details><summary>💡 Hint 3: pseudocode</summary>

```
route GET /:
  limit  = parse int 1..100, default 20         (else 400)
  order  = sort === "startedAt" ? "asc" : "desc" (only those two values are allowed)
  after  = cursor ? decodeCursor(cursor) : undefined
           (decodeCursor: base64url → JSON → must be {startedAt: string, id: string, sort: string}; else 400)
  if after and after.sort !== sort → 400
  rows = await service.list(DEV_USER_ID, { kind, fromInclusive, toExclusive, order, after, limit: limit + 1 })
  hasMore = rows.length > limit
  page = rows.slice(0, limit)
  last = page[page.length - 1]
  nextCursor = hasMore && last ? encodeCursor({ startedAt: last.startedAt, id: last.id, sort }) : null
  200 { data: page.map(toWorkoutResponse), nextCursor }
```
</details>

---

## Challenge 5: Sets (nested resources and cross-feature rules) ★★★

**Representation**

```json
{ "id": "uuid", "workoutId": "uuid", "exerciseId": "uuid", "setNumber": 1,
  "reps": 5, "weightKg": 100, "rpe": 8, "createdAt": "ISO" }
```

**Rules**

| Field / situation | Rule | Error |
|---|---|---|
| The workout | Must exist and be mine | 404 |
| The workout's kind | Must be `strength` | **409**: the request is valid on its own, but conflicts with the workout's current state |
| `exerciseId` | Must be a built-in or one of my custom exercises | **422**: the body is well-formed, but refers to something unusable |
| `reps` | Integer 1–1000 | 400 |
| `weightKg` | Number 0–1000, at most 2 decimal places (0 = bodyweight) | 400 |
| `rpe` | Optional (or null); 1–10 in steps of 0.5 | 400 |
| `setNumber` | **Server-assigned**: 1 + the highest existing set number in this workout. Clients can't send it. | 400 if sent |

**Endpoints:** `GET`/`POST /v1/workouts/:workoutId/sets` and `PATCH`/`DELETE /v1/workouts/:workoutId/sets/:setId`. A set that exists but belongs to a *different* workout → 404.

**Cross-feature rules (the real lesson of this challenge)**
1. **Deleting a workout deletes its sets.** (A database does this with `ON DELETE CASCADE` in Module 04. Here, your service does it.)
2. **Deleting an exercise that any set uses → 409.**
3. **PATCHing a workout's `kind` away from `strength` while it has sets → 409.**

**Dependency design: inject repositories, not services.** The sets service needs to *read* workouts and exercises; the workouts service needs to *delete* sets. If services depended on each other, you'd get a circle (workouts → sets → workouts). Instead, give each service the **repositories** it needs:

```ts
// server.ts
const workoutsRepo = createMemoryWorkoutsRepository();
const exercisesRepo = createMemoryExercisesRepository();
const setsRepo = createMemorySetsRepository();

const workoutsService = createWorkoutsService({ workoutsRepo, setsRepo, clock: systemClock });
const exercisesService = createExercisesService({ exercisesRepo, setsRepo, clock: systemClock });
const setsService = createSetsService({ setsRepo, workoutsRepo, exercisesRepo, clock: systemClock });
```

**Routing:** mount the sets router on the same prefix as workouts (toolbox 4.1).

✅ **Acceptance tests**

1. Create a strength workout. Add 3 sets of Back Squat → `setNumber` 1, 2, 3.
2. `GET .../sets` → all 3, ordered by `setNumber`.
3. Add a set to a **run** → 409.
4. A set with an unknown `exerciseId` (a valid UUID that doesn't exist) → 422.
5. `{"reps":0}`, `{"weightKg":-20}`, `{"weightKg":100.125}`, `{"rpe":11}`, `{"setNumber":7}` → 400 each.
6. PATCH set 2 to `{"weightKg":102.5}` → 200.
7. Create a custom exercise, use it in a set, then try to delete the exercise → **409**. (Built-ins can't be deleted at all: that's the 403 from Challenge 2.)
8. PATCH the strength workout to `{"kind":"run"}` → **409**.
9. DELETE the workout → 204. Then `GET .../sets` → 404 (the workout is gone), and the sets are gone from storage too.
10. Use a set ID with the wrong `workoutId` in the URL → 404.

<details><summary>💡 Hint 1: direction</summary>

Re-read 2.4 (injection) and the dependency design above. The sets service starts every operation with the same question: *"Does this workout exist, and is it mine?"* Write that as one private helper inside the service.
</details>

<details><summary>💡 Hint 2: approach</summary>

- **Sets repository methods you'll probably want:** `listByWorkout(workoutId)`, `findById(id)`, `create`, `update`, `delete`, `deleteByWorkout(workoutId)`, `countByExercise(exerciseId)`.
- **Two decimal places:** `Math.round(w * 100) === w * 100` is a reasonable check for this range.
- **RPE in 0.5 steps:** `Number.isInteger(rpe * 2)`.
- **Next set number:** `max(existing setNumbers, 0) + 1`.
- **Workout delete order:** delete the sets first, then the workout. (In Module 05, a transaction makes the pair all-or-nothing.)
</details>

<details><summary>💡 Hint 3: pseudocode for addSet</summary>

```
setsService.addSet(userId, workoutId, input):
  workout = await workoutsRepo.findById(userId, workoutId)
  if !workout → NotFoundError("Workout")
  if workout.kind !== "strength" → ConflictError("Sets can only be added to strength workouts")
  exercise = await exercisesRepo.findVisibleById(userId, input.exerciseId)
  if !exercise → UnprocessableError("exerciseId does not refer to an exercise you can use", [{ path: "exerciseId", … }])
  validate reps / weightKg / rpe → ValidationError with all problems
  existing = await setsRepo.listByWorkout(workoutId)
  setNumber = max(existing.map(s => s.setNumber), 0) + 1
  return setsRepo.create({ id: randomUUID(), workoutId, exerciseId, setNumber, reps, weightKg, rpe ?? null, createdAt: now })
```
</details>

---

## Challenge 6: Use it for real ★☆☆

- Log **this week's real workouts and steps** through `requests.http`. Notice what's awkward. (Did you want a "copy last workout" feature? Did typing ISO timestamps get old?) Write it in your notes. This becomes your feature backlog.
- Make sure `requests.http` has a request for every acceptance test in this module.

## Challenge 7: Record your decisions ★☆☆

Add rows to the decisions log in `COURSE.md`:
- The ID type (UUIDv4 now, UUIDv7 from the database later)
- SI units + normalizing instants to UTC
- Cursor pagination over offset pagination
- 409 vs. 422 for the set rules (and why)
- Injecting repositories (not services) into services

```bash
git add -A && git commit -m "feat: exercises, workouts with pagination, and sets"
```

---

## Definition of done

- [ ] `docs/api.md` documents every endpoint and matches the behavior.
- [ ] All acceptance tests in Challenges 2–5 pass.
- [ ] **No file under `src/modules/*/` ending in `.service.ts` or `.repository.ts` imports `express`.** Check: `grep -rl "from \"express\"" src/modules --include=*.service.ts --include=*.repository.ts` prints nothing.
- [ ] Every error response is `application/problem+json`.
- [ ] Paging through 25+ workouts while adding new ones produces no duplicates.
- [ ] `npm run typecheck` and `npm run lint` pass.
- [ ] Decisions are recorded.

---

## ✍️ Checkpoint

1. Why is `PUT /v1/steps/2026-10-11` better than `POST /v1/steps` for syncing a phone's daily total? Describe exactly what goes wrong with POST when a response is lost.
2. Design the endpoints to list, add, edit, and remove sets in a workout: methods, paths, and success codes. Why are sets nested under workouts but exercises aren't?
3. You're scrolling your workout history while your watch logs a new run. Walk through what happens with offset pagination vs. cursor pagination.
4. Why does the cursor sort include `id` as well as `startedAt`? Give the failure case if it didn't.
5. Classify each as breaking or non-breaking, with reasons: (a) adding an optional `notes` field to the request; (b) renaming `distance` to `distanceM`; (c) adding `"swim"` to `kind`; (d) making `notes` required.
6. Which layer does each belong in? (a) "a set's weight can't be negative"; (b) parsing `?limit=` into a number; (c) iterating a Map to find workouts; (d) "a heavier squat than ever before is a PR"; (e) choosing 201 vs. 200; (f) decoding a cursor.
7. Why don't services import Express? Name two concrete benefits you'll get in later modules.
8. Why is every repository method `async` when the Map is synchronous? Why does it return `structuredClone` copies?
9. **Code reading.** Find at least three problems here.
   ```ts
   router.patch("/:id", async (req, res) => {
     const existing = await repo.findById(DEV_USER_ID, req.params.id);
     const updated = { ...existing, ...req.body, updatedAt: new Date().toISOString() };
     await repo.update(updated);
     res.json(updated);
   });
   ```
10. A user PATCHes a workout's `endedAt` so it falls before `startedAt`. Where is that caught in your code, and why must the check run on the *merged* workout?

**Explain it back:** Walk through `GET /v1/workouts?kind=run&limit=2` layer by layer in *your* code, naming the actual functions it passes through, including how `nextCursor` is built.

---

## 📋 Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Progress
- [ ] Part 1 read (1.1–1.13)
- [ ] Part 2 read (2.1–2.7)
- [ ] Part 3 worked example typed, run, and traced
- [ ] Challenge 1: `docs/api.md`
- [ ] Challenge 2: Exercises
- [ ] Challenge 3: Workouts CRUD
- [ ] Challenge 4: Pagination, filters, sorting
- [ ] Challenge 5: Sets + cross-feature rules
- [ ] Challenge 6: Real data logged
- [ ] Challenge 7: Decisions recorded
- [ ] Checkpoint passed (≥ 8/10)

### Concepts I can explain without notes
- [ ] Turning user stories into resources (1.2)
- [ ] URL rules and when to nest (1.3)
- [ ] PUT vs POST for retries (1.5)
- [ ] PATCH: absent vs. null vs. value; validating the merged result (1.6)
- [ ] Representation conventions: units, UTC, nulls (1.8)
- [ ] Problem Details (1.9)
- [ ] Offset vs. cursor pagination, and the 5 cursor details (1.10)
- [ ] Breaking vs. non-breaking changes (1.12)
- [ ] The three layers and the dependency rule (2.2)
- [ ] Repository contracts: async, userId, copies (2.3)
- [ ] Factory functions and dependency injection (2.4)
- [ ] How errors cross layers (2.5)
- [ ] The composition root (2.6)

### Friction log from real use (Challenge 6)
| Date | What was awkward | Feature idea |
|---|---|---|
| | | |

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
- Zalando RESTful API Guidelines (great, practical rules): https://opensource.zalando.com/restful-api-guidelines/
- Express routing guide: https://expressjs.com/en/guide/routing.html
- MDN, `structuredClone`: https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
- Slack Engineering, "Evolving API Pagination at Slack" (why cursors): https://slack.engineering/evolving-api-pagination-at-slack/
