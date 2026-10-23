# Module 06: Testing a Backend

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | ✅ Full |
| **Estimated time** | 14–18 hours |
| **Prerequisites** | Module 05 complete (every feature on Postgres) |
| **Project milestone** | Unit tests for pure logic and services, HTTP integration tests against a real test database for every endpoint, and the step-goal streak feature built test-first |

## 🎓 Tutor prompt

Start every study session for this module in a **new chat** by pasting the prompt below. It sets Claude up as your teacher for this module: it reads the course files, picks up where you left off, follows the teaching rules (no solutions; syntax help and hints instead), quizzes you, and updates your tracker when you say **"wrap up."**

```text
You are my tutor for Module 06 of my backend engineering course: "Testing a Backend".

ROLE
Act as a test-focused senior engineer who practices TDD and has turned flaky test suites into reliable ones. You value tests that check behavior through real HTTP and a real database. Teach the way a great senior engineer mentors a junior on their own team: patient, precise, Socratic, and honest when my work isn't good enough yet.

ABOUT ME
- I'm Mathew, a frontend engineer (React + TypeScript). I'm solid on JS/TS logic, but I don't know every Node, Express, SQL, or tooling API and syntax by heart.
- I'm building `fittrack-api`, an API that tracks my own physical activity (daily steps, workouts, lifting sets, exercises), to learn backend fundamentals properly.
- The course lives in my repo at `docs/course/`: `COURSE.md` (rules, given-vs-you-write table, decisions log, session log) plus one file per module.
- Stack for this module: Node.js LTS + TypeScript + Express 5 + PostgreSQL, adding Vitest, Supertest, and a dedicated test database.

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/06-testing.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
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
- Choosing the right test type for each piece of code, with most value in HTTP + real-DB integration tests.
- Isolation strategies and factories; tests must not depend on order, the current date, or the machine's timezone.
- Time as an injected input: clocks, midnight boundaries, and the US DST change on Nov 1, 2026.
- TDD for the streak feature: don't let me skip the red step. I write a failing test, run it, and see it fail for the right reason first.
- Reviewing my tests for strength: specific names, meaningful assertions on outcomes (status, body, database state), not just mock calls.
- Watch for these common misconceptions and correct them when they show up: mocking the database in integration tests; equating coverage with correctness; asserting that a mock was called instead of checking results; tests that pass only in one timezone or one order.
- Hold me to this standard before I move on: `npm test` passes from a clean checkout, passes under `TZ=UTC` and `TZ=Asia/Tokyo`, and the git history shows the streak tests landing before or with the implementation.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

> **From this module on, every feature ships with tests.** Modules 01–05 relied on `curl` and `requests.http`. Those were manual tests. Here you make them automatic, so you can change code without fear.

## How to use this module

| Part | What you do | Kind |
|---|---|---|
| 1. Concepts | What to test, the kinds of tests, test doubles, isolation, time, TDD, coverage | 📖 Read |
| 2. Setup | Vitest, the test database, a TypeScript config for tests, the composition refactor | ⌨️ Type along |
| 3. Worked example A | Unit tests for the steps service | ⌨️ Type along |
| 4. Worked example B | HTTP integration tests for the steps routes, on a real database | ⌨️ Type along |
| 5. Toolbox | Vitest, Supertest, factories, controlling time | 🧰 Reference |
| 6. Challenges | Tests for every feature; the streak feature with TDD; coverage; timezone-proofing | 🧩 You write |
| Checkpoint | 10 questions | ✍️ Quiz |

Your team at work uses Jest and Vitest. Vitest's API is nearly identical to Jest's (`describe`, `it`, `expect`), so everything here transfers directly.

## What you'll be able to do by the end
- Choose the right kind of test for a given piece of code.
- Write fast unit tests for pure functions and services using fakes.
- Write HTTP integration tests that hit a real Postgres database, and keep them isolated and deterministic.
- Build test data with factories.
- Control time in tests, including timezones and daylight saving time.
- Build a feature with red → green → refactor.
- Read a coverage report for what it actually says.

---

# Part 1 — 📖 Concepts

## 1.1 Why automated tests

- **Safety for change.** In Module 05 you swapped every repository, and you re-ran a pile of `curl` commands by hand to check nothing broke. A test suite does that in seconds, every time.
- **A precise spec.** A test named `"rejects a workout that ends before it starts"` documents a rule better than a comment, and it can't go out of date without failing.
- **Regression protection.** When you fix a bug, a test makes sure it can never quietly come back.

## 1.2 The kinds of tests

| Kind | What it exercises | Speed | Catches | Misses |
|---|---|---|---|---|
| **Unit** | One function or service, with fake dependencies | ~1 ms each | Logic errors, edge cases | SQL bugs, wiring, HTTP details |
| **Integration (HTTP + real DB)** | The real app, through HTTP, against a real database | ~10–50 ms each | Almost everything: routing, validation, SQL, constraints, transactions, status codes | Problems only in production (config, network) |
| **End-to-end** | The deployed system from outside | Seconds | Deployment and config problems | Hard to pinpoint *why* something failed |

For a backend like this one, **most of the value lives in integration tests** through HTTP against a real database, because that's where most of the bugs are: SQL, constraints, serialization, status codes. **Unit tests** cover logic with many edge cases (dates, streaks, 1RM, validation rules), where they're faster and more precise. **End-to-end** tests stay few: a smoke test after each deploy (Module 10).

```
          ▲  few      E2E smoke test after deploy (Module 10)
          │
          │  MANY     HTTP integration tests, real Postgres     ← most of your tests
          │
          │  some     unit tests for tricky pure logic and service rules
          ▼
```

## 1.3 Anatomy of a good test

```ts
it("returns 409 when a custom exercise name is already used (case-insensitive)", async () => {
  // Arrange: set up the world
  await insertExercise({ name: "Bulgarian Split Squat" });

  // Act: do ONE thing
  const res = await request(app).post("/v1/exercises").send({ name: "bulgarian split squat", category: "legs" });

  // Assert: check the outcome
  expect(res.status).toBe(409);
  expect(res.body.type).toBe("https://fittrack.dev/problems/conflict");
});
```

- **One behavior per test**, and the name says which one. A failing test's name should tell you what broke without reading the code.
- **Arrange → Act → Assert.** Blank lines between them make tests easy to scan.
- **Test behavior, not implementation.** Assert on what a *caller* can see (status, body, rows in the database), not on which internal function was called. Then you can refactor the inside freely.
- **Deterministic.** The same result every run: no dependence on the current time, on random values, on test order, or on the machine's timezone.

## 1.4 Test doubles: fakes, stubs, mocks

| Double | What it is | Example |
|---|---|---|
| **Fake** | A working, simplified implementation | Your in-memory repositories from Module 02 |
| **Stub** | Returns canned answers | A clock that always says Oct 12, 4pm |
| **Mock / spy** | Records how it was called, so you can assert on calls | `vi.fn()` |

**Prefer fakes and stubs.** Tests built on mocks tend to assert on *calls* ("`repo.create` was called once"), which locks in the implementation and proves very little. A test with a fake repository asserts on *results* ("the workout can now be read back"), which survives refactors and catches real bugs.

**Don't mock the database in integration tests.** The database is the thing most likely to disagree with your assumptions. *Do* fake things you don't control: third-party APIs, email, the clock.

## 1.5 A real test database

Integration tests run against a **separate database**, `fittrack_test`, never your dev data. Before the suite starts, a **global setup** creates it (if needed) and runs all migrations, using your own `runMigrations` from Module 04.

Each test must start from a known state. The options:

| Strategy | How | Pros | Cons |
|---|---|---|---|
| **Delete data before each test** | `DELETE FROM users` (cascades) + recreate the dev user | Simple; tests see real commits | Test files must run one at a time |
| Roll back each test's transaction | Begin before, roll back after | Very fast | Breaks when the code under test uses its own transactions (yours does, since Module 05) |
| A unique user per test | Every test creates its own user | Tests can run in parallel | Needs per-test login, which arrives in Module 07 |

**This module uses the first strategy.** Your routes still act as `DEV_USER_ID`, so every test shares that one user, and resetting means "delete all users, recreate the dev user." The built-in exercises survive because they belong to no user. Module 07 switches to a unique user per test.

## 1.6 Factories

Tests need data. **Factories** are small functions that insert realistic data with sensible defaults, so each test spells out only what it cares about:

```ts
await insertSteps({ date: "2026-10-11" });                // steps defaults to 8000
await insertSteps({ date: "2026-10-12", steps: 15000 });  // only what this test cares about
```

Avoid giant shared fixture files that every test depends on. Changing one value there breaks twenty unrelated tests, and you can't tell from a test what data it relies on.

## 1.7 Time is an input

If code calls `new Date()` itself, its behavior depends on *when the test runs*. "Future dates are rejected" passes today and fails next year. That's why every service gets an **injected clock** (Module 02). Tests pass a clock frozen at a specific instant.

**Timezones** matter just as much. The streak feature asks "what's *today* for this user?", and the answer depends on their timezone, not the server's:

```
Instant (UTC)          Los Angeles      Tokyo         UTC
2026-10-12T06:30Z  →   2026-10-11       2026-10-12    2026-10-12
2026-11-01T06:59Z  →   2026-10-31       2026-11-01    2026-11-01
2026-11-01T07:00Z  →   2026-11-01 (00:00 PDT)
2026-11-02T07:59Z  →   2026-11-01 (23:59 PST)  ← Nov 1 in LA is a 25-hour day (DST ends at 2am)
```

Test these boundaries explicitly. Also run the whole suite under different `TZ` settings, which proves no code accidentally depends on the machine's timezone.

## 1.8 TDD: red → green → refactor

1. **Red.** Write a test for behavior that doesn't exist yet. Run it and **watch it fail**, for the reason you expect. (A test that passes before you've written the code is testing nothing.)
2. **Green.** Write the *simplest* code that makes it pass. Resist building more.
3. **Refactor.** Clean up the code (and the tests) while everything stays green.

Repeat with the next test. TDD shines for logic with lots of edge cases, like the streak calculation. You discover the rules one at a time, and each one is pinned down by a test before you move on.

## 1.9 Coverage

Coverage measures which lines and branches **ran** during the tests. It does **not** measure whether they were checked correctly. A test that calls everything and asserts nothing gets 100% coverage and catches nothing.

Use coverage as a **flashlight**: look for important code that never runs in tests (error branches, edge cases), then write meaningful tests for those spots. Don't chase a number.

## 1.10 Flaky tests

A **flaky** test sometimes passes and sometimes fails with no code change. That's worse than no test, because people learn to ignore failures. The usual causes in backend suites:
- Depending on the current time or the machine's timezone.
- Tests that depend on each other's data or on run order.
- Shared state that isn't reset (a module-level `Map`, a database row).
- Unawaited promises: the test finishes before the work does.
- Arbitrary `setTimeout` waits instead of awaiting the actual thing.

✅ **Before moving on:** explain 1.2, 1.4, and 1.5 out loud.

---

# Part 2 — ⌨️ Setup

## 2.1 Install

```bash
npm install --save-dev vitest supertest @types/supertest @vitest/coverage-v8
```

| Package | Purpose |
|---|---|
| `vitest` | Test runner + `expect` assertions (Jest-compatible API) |
| `supertest` | Sends HTTP requests to an Express app **in memory**, without opening a port |
| `@vitest/coverage-v8` | Coverage reports using V8's built-in coverage |

## 2.2 TypeScript config for tests

Tests live in `tests/`, outside `src/`. You want `npm run typecheck` to check them, but `npm run build` must **not** compile them into `dist/`. So split the config in two.

**`tsconfig.json`** (used by your editor and by `typecheck`): change these lines:

```jsonc
{
  "compilerOptions": {
    // ...everything from Module 01 stays the same, except:
    "rootDir": ".",
    "noEmit": true
  },
  "include": ["src", "tests", "vitest.config.ts"]
}
```

(Remove `"outDir"` from this file; it moves to the build config.)

**`tsconfig.build.json`** (new, used only by `build`):

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Scripts in `package.json`:**

```json
"build": "tsc -p tsconfig.build.json",
"typecheck": "tsc",
"test": "vitest run",
"test:watch": "vitest",
"test:unit": "vitest run tests/unit",
"test:integration": "vitest run tests/integration",
"test:coverage": "vitest run --coverage"
```

## 2.3 `vitest.config.ts` (project root)

```ts
import { defineConfig } from "vitest/config";

// Tests ALWAYS run against their own database, never your dev data.
// (CI can override it by setting TEST_DATABASE_URL.)
const testEnv = {
  NODE_ENV: "test",
  LOG_LEVEL: "silent",
  DATABASE_URL:
    process.env.TEST_DATABASE_URL ?? "postgres://fittrack:fittrack@localhost:5432/fittrack_test",
};

// Make the same values visible to the global setup, which runs in this main process.
Object.assign(process.env, testEnv);

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    env: testEnv, // visible inside every test file
    fileParallelism: false, // test files share one database, so run them one at a time
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
    },
  },
});
```

- **`LOG_LEVEL: "silent"`** keeps the pino logs out of the test output. Your `config.ts` validates it like any other setting.
- **`fileParallelism: false`**: with a shared database, two test files resetting it at once would trample each other's data. Tests *within* a file already run one after another.

## 2.4 `tests/global-setup.ts`

```ts
import pg from "pg";
import { runMigrations } from "../src/db/run-migrations.js";

/**
 * Runs ONCE before the whole test suite (in the main Vitest process):
 * creates the test database if it doesn't exist, then applies every migration.
 */
export async function setup(): Promise<void> {
  const testDatabaseUrl = process.env.DATABASE_URL;
  if (!testDatabaseUrl || !testDatabaseUrl.includes("_test")) {
    throw new Error(`Refusing to run tests against a non-test database: ${testDatabaseUrl}`);
  }

  // Connect to the built-in "postgres" database, because ours may not exist yet.
  const adminUrl = new URL(testDatabaseUrl);
  const databaseName = adminUrl.pathname.slice(1); // "/fittrack_test" → "fittrack_test"
  adminUrl.pathname = "/postgres";

  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const existing = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);
    if (existing.rowCount === 0) {
      // A database name is an identifier, so it can't be a $1 parameter. escapeIdentifier quotes it safely.
      await admin.query(`CREATE DATABASE ${admin.escapeIdentifier(databaseName)}`);
    }
  } finally {
    await admin.end();
  }

  await runMigrations(testDatabaseUrl);
}
```

- **The `_test` safety check** means a misconfigured environment can never point the tests (which delete data!) at your dev or production database.
- **It reuses your runner from Module 04.** That's why `runMigrations` takes a URL instead of reading config itself.

## 2.5 Refactor: move the wiring into `src/composition.ts`

Tests need to build the *real* app, with a *fake* clock. Right now the wiring lives in `server.ts`, mixed with `listen()`. Move it into a function both can call.

**`src/composition.ts`:**

```ts
import type pg from "pg";
import type { AppDeps } from "./app.js";
import { createPgStepsRepository } from "./modules/steps/steps.pg-repo.js";
import { createStepsService } from "./modules/steps/steps.service.js";
import type { Clock } from "./shared/clock.js";

/**
 * Builds every repository and service the app needs.
 * server.ts calls it with the real clock; tests call it with a fake one.
 */
export function createDependencies(pool: pg.Pool, clock: Clock): AppDeps {
  // 1. Repositories
  const stepsRepo = createPgStepsRepository(pool);
  // ...move your exercises, workouts, and sets repositories here

  // 2. Services
  const stepsService = createStepsService({ repo: stepsRepo, clock });
  // ...and their services here

  // 3. Everything buildApp needs
  return {
    db: pool,
    stepsService,
    // exercisesService, workoutsService, setsService, statsService, ...
  };
}
```

**`src/server.ts`** shrinks to:

```ts
const app = buildApp(createDependencies(pool, systemClock));
```

(The process handlers and `app.listen` stay as they are.)

## 2.6 Test helpers

**`tests/helpers/db.ts`:**

```ts
import { pool } from "../../src/db/pool.js";
import { DEV_USER_ID } from "../../src/shared/dev-user.js";

/**
 * Puts the database back into a known state before each test:
 * no users except the dev user, and therefore no steps, workouts, sets, or custom exercises.
 * Built-in exercises (user_id IS NULL) come from a migration and are kept.
 */
export async function resetDatabase(): Promise<void> {
  await pool.query("DELETE FROM users"); // ON DELETE CASCADE removes everything they own
  await pool.query(
    `INSERT INTO users (id, email, display_name, timezone, daily_step_goal)
     VALUES ($1, 'dev@fittrack.local', 'Dev User', 'America/Los_Angeles', 10000)`,
    [DEV_USER_ID],
  );
}
```

(This is where Module 04's deferred foreign key earns its keep. Without it, `DELETE FROM users` would fail as soon as a test created a set using a custom exercise.)

**`tests/helpers/clock.ts`:**

```ts
import type { Clock } from "../../src/shared/clock.js";

/** A clock that is always at the same instant. */
export function fixedClock(isoInstant: string): Clock {
  const instant = new Date(isoInstant);
  return { now: () => new Date(instant) };
}

/** A clock you can move: testClock.set("2026-11-01T07:00:00Z"). */
export function createTestClock(startIsoInstant: string): Clock & { set(isoInstant: string): void } {
  let current = new Date(startIsoInstant);
  return {
    now: () => new Date(current),
    set: (isoInstant: string) => {
      current = new Date(isoInstant);
    },
  };
}
```

`now: () => new Date(instant)` returns a **copy** each time, so a caller mutating the `Date` can't change the clock.

**`tests/helpers/app.ts`:**

```ts
import type { Express } from "express";
import { buildApp } from "../../src/app.js";
import { createDependencies } from "../../src/composition.js";
import { pool } from "../../src/db/pool.js";
import { fixedClock } from "./clock.js";

/** The real app, wired to the test database, with time frozen at `now`. */
export function buildTestApp(options: { now: string }): Express {
  return buildApp(createDependencies(pool, fixedClock(options.now)));
}
```

**`tests/factories/steps.ts`:**

```ts
import { pool } from "../../src/db/pool.js";
import { DEV_USER_ID } from "../../src/shared/dev-user.js";

/** Inserts one day of steps straight into the database. Only `date` is required. */
export async function insertSteps(input: { date: string; steps?: number; userId?: string }): Promise<void> {
  await pool.query(
    `INSERT INTO daily_steps (user_id, day, steps) VALUES ($1, $2, $3)`,
    [input.userId ?? DEV_USER_ID, input.date, input.steps ?? 8000],
  );
}

/** Inserts several consecutive days, oldest first: insertStepsRange("2026-10-01", [9000, 12000, 0]) */
export async function insertStepsRange(firstDate: string, stepsPerDay: number[]): Promise<void> {
  const start = new Date(`${firstDate}T00:00:00Z`);
  for (let i = 0; i < stepsPerDay.length; i++) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    await insertSteps({ date: day.toISOString().slice(0, 10), steps: stepsPerDay[i] ?? 0 });
  }
}
```

**Why insert with SQL instead of calling the API?** Factories set up the *world*. If they went through the API, a bug in `PUT /v1/steps` would break every test that merely *needs* some steps, and you'd have trouble finding the real failure.

Your folder now looks like:

```
tests/
├── global-setup.ts
├── helpers/   app.ts  clock.ts  db.ts
├── factories/ steps.ts        (you'll add more)
├── unit/                      (Part 3)
└── integration/               (Part 4)
```

---

# Part 3 — ⌨️ Worked example A: unit tests for the steps service

**`tests/unit/steps.service.test.ts`:**

```ts
import { describe, expect, it } from "vitest";
import { createMemoryStepsRepository } from "../../src/modules/steps/steps.memory-repo.js";
import { createStepsService } from "../../src/modules/steps/steps.service.js";
import { NotFoundError, ValidationError } from "../../src/shared/errors.js";
import { fixedClock } from "../helpers/clock.js";

const USER = "user-1";
const NOW = "2026-10-12T16:00:00.000Z"; // Monday, Oct 12, 2026, 4pm UTC

// A fresh service with empty storage for every test: no shared state between tests.
function makeService(now: string = NOW) {
  return createStepsService({ repo: createMemoryStepsRepository(), clock: fixedClock(now) });
}

describe("stepsService.setDay", () => {
  it("creates a day the first time, and says so", async () => {
    const service = makeService();

    const result = await service.setDay(USER, "2026-10-11", 9412);

    expect(result.created).toBe(true);
    expect(result.record).toEqual({ date: "2026-10-11", steps: 9412, updatedAt: NOW });
  });

  it("replaces the total on a second write (an idempotent PUT)", async () => {
    const service = makeService();
    await service.setDay(USER, "2026-10-11", 9412);

    const result = await service.setDay(USER, "2026-10-11", 10250);

    expect(result.created).toBe(false);
    expect(result.record.steps).toBe(10250);
  });

  it.each([
    { steps: -1, why: "negative" },
    { steps: 100_001, why: "over the maximum" },
    { steps: 1.5, why: "not a whole number" },
  ])("rejects $steps steps ($why)", async ({ steps }) => {
    const service = makeService();

    await expect(service.setDay(USER, "2026-10-11", steps)).rejects.toBeInstanceOf(ValidationError);
  });

  it("accepts tomorrow (UTC), because it is already 'today' somewhere", async () => {
    const service = makeService();

    const result = await service.setDay(USER, "2026-10-13", 100);

    expect(result.created).toBe(true);
  });

  it("rejects the day after tomorrow", async () => {
    const service = makeService();

    await expect(service.setDay(USER, "2026-10-14", 100)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("stepsService.getDay", () => {
  it("throws NotFoundError for a day with no record", async () => {
    const service = makeService();

    await expect(service.getDay(USER, "2026-10-01")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("does not return another user's day", async () => {
    const service = makeService();
    await service.setDay("someone-else", "2026-10-11", 5000);

    await expect(service.getDay(USER, "2026-10-11")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("stepsService.listRange", () => {
  it("returns only days inside the range, oldest first", async () => {
    const service = makeService();
    await service.setDay(USER, "2026-10-03", 3);
    await service.setDay(USER, "2026-10-01", 1);
    await service.setDay(USER, "2026-09-30", 0);

    const days = await service.listRange(USER, "2026-10-01", "2026-10-31");

    expect(days.map((day) => day.date)).toEqual(["2026-10-01", "2026-10-03"]);
  });

  it("rejects a range where from is after to", async () => {
    const service = makeService();

    await expect(service.listRange(USER, "2026-10-31", "2026-10-01")).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});
```

**Reading it piece by piece:**
- **`makeService()` per test** gives fresh, empty storage every time. Tests never share state, so they can run in any order.
- **`fixedClock(NOW)`** makes "the future" mean the same thing on every run, forever. Without it, the "rejects the day after tomorrow" test would need to compute dates from the real clock, and would be fragile.
- **`it.each([...])("rejects $steps steps ($why)", …)`** is a table-driven test. One test body, three cases, each reported separately with a readable name.
- **`await expect(promise).rejects.toBeInstanceOf(ValidationError)`** asserts that an async call *throws* that kind of error. Forgetting the `await` here is a classic bug: the test would end before the promise settles and pass no matter what.
- **"does not return another user's day"** is a *security* test, at the unit level. Module 07 adds the HTTP-level version.
- **These tests use the memory repository (a fake).** They test the *rules* in milliseconds, with no database. The SQL gets its own tests in Part 4.

```bash
npm run test:unit
```

**Prove the tests can fail:** temporarily change `MAX_DAILY_STEPS` to `200_000` in the service, and rerun. "rejects 100001 steps" must fail. Change it back.

---

# Part 4 — ⌨️ Worked example B: HTTP integration tests for steps

**`tests/integration/steps.routes.test.ts`:**

```ts
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { pool } from "../../src/db/pool.js";
import { DEV_USER_ID } from "../../src/shared/dev-user.js";
import { insertSteps, insertStepsRange } from "../factories/steps.js";
import { buildTestApp } from "../helpers/app.js";
import { resetDatabase } from "../helpers/db.js";

const NOW = "2026-10-12T16:00:00.000Z";
const app = buildTestApp({ now: NOW });

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end(); // close this file's connections so Vitest can exit
});

describe("PUT /v1/steps/:date", () => {
  it("creates a day: 201, Location header, body, and a row in the database", async () => {
    const res = await request(app).put("/v1/steps/2026-10-11").send({ steps: 9412 });

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe("/v1/steps/2026-10-11");
    expect(res.body).toEqual({ date: "2026-10-11", steps: 9412, updatedAt: NOW });

    const rows = await pool.query("SELECT steps FROM daily_steps WHERE user_id = $1 AND day = $2", [
      DEV_USER_ID,
      "2026-10-11",
    ]);
    expect(rows.rows).toEqual([{ steps: 9412 }]);
  });

  it("is idempotent: the same PUT twice gives 200 and still one row", async () => {
    await request(app).put("/v1/steps/2026-10-11").send({ steps: 9412 });

    const res = await request(app).put("/v1/steps/2026-10-11").send({ steps: 9412 });

    expect(res.status).toBe(200);
    const count = await pool.query("SELECT count(*) AS n FROM daily_steps WHERE user_id = $1", [DEV_USER_ID]);
    expect(count.rows[0]).toEqual({ n: 1 });
  });

  it("rejects an impossible date with 400 problem+json", async () => {
    const res = await request(app).put("/v1/steps/2026-02-30").send({ steps: 100 });

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
    expect(res.body.errors).toEqual([
      { path: "date", message: "must be a real calendar date in YYYY-MM-DD format" },
    ]);
  });

  it("lists every problem at once: a wrong type AND an unknown field", async () => {
    const res = await request(app).put("/v1/steps/2026-10-11").send({ steps: "lots", stepz: 1 });

    expect(res.status).toBe(400);
    const paths = res.body.errors.map((error: { path: string }) => error.path);
    expect(paths).toEqual(expect.arrayContaining(["steps", "(root)"]));
  });

  it("rejects a non-JSON body with 415", async () => {
    const res = await request(app)
      .put("/v1/steps/2026-10-11")
      .set("Content-Type", "text/plain")
      .send("9412");

    expect(res.status).toBe(415);
  });
});

describe("GET /v1/steps", () => {
  it("returns the days in range, oldest first", async () => {
    await insertStepsRange("2026-10-01", [9000, 12000, 0]);
    await insertSteps({ date: "2026-09-30", steps: 5000 }); // just outside the range

    const res = await request(app).get("/v1/steps").query({ from: "2026-10-01", to: "2026-10-31" });

    expect(res.status).toBe(200);
    expect(res.body.data.map((day: { date: string }) => day.date)).toEqual([
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
    ]);
  });

  it("returns an empty list (not 404) when there's no data", async () => {
    const res = await request(app).get("/v1/steps").query({ from: "2026-10-01", to: "2026-10-31" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });
});

describe("DELETE /v1/steps/:date", () => {
  it("deletes the day, then 404s the second time", async () => {
    await insertSteps({ date: "2026-10-11" });

    const first = await request(app).delete("/v1/steps/2026-10-11");
    const second = await request(app).delete("/v1/steps/2026-10-11");

    expect(first.status).toBe(204);
    expect(second.status).toBe(404);
  });
});
```

**Reading it piece by piece:**
- **`request(app)`**: Supertest starts the Express app on a temporary in-memory port for each request. No `listen()`, no port conflicts. This is why Module 01 split `app.ts` from `server.ts`.
- **`.send({ steps: 9412 })`** sends JSON and sets `Content-Type: application/json` automatically.
- **`.query({ from, to })`** builds the query string for you.
- **The first test checks the database directly.** The response alone could be lying (for example, if the repository returned the input without saving it). Checking the row proves the write happened.
- **`beforeEach(resetDatabase)`** gives every test a clean slate. A test can never pass only because an earlier test left data behind.
- **`afterAll(pool.end)`**: Vitest runs each test file in its own module context, so each file has its own pool to close. Without this, the open connections keep the process alive and the run hangs.
- **`expect.arrayContaining([...])`** passes if the array contains *at least* those items, in any order. Useful when you don't want to depend on the order of Zod's issues.

```bash
docker compose up -d
npm test
```

The first run creates `fittrack_test` and migrates it (you'll see the `applied …` lines). Later runs skip straight to the tests.

```bash
git add -A && git commit -m "test: unit and integration tests for steps"
```

---

# Part 5 — 🧰 Toolbox

## 5.1 Vitest

```ts
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

describe("group", () => { /* tests */ });
it("does one thing", async () => { /* … */ });
it.each([{ a: 1 }, { a: 2 }])("works for $a", ({ a }) => { /* … */ });
it.only(…);  it.skip(…);                      // focus or skip while debugging; never commit .only

// Matchers
expect(x).toBe(3);                            // strict equality (===), for primitives
expect(obj).toEqual({ a: 1 });                // deep equality
expect(obj).toMatchObject({ a: 1 });          // obj has AT LEAST these properties
expect(list).toHaveLength(3);
expect(list).toContainEqual({ id: "x" });
expect(text).toMatch(/problem\+json/);
expect(value).toBeNull();  expect(value).toBeUndefined();  expect(flag).toBe(true);
expect(() => parse(bad)).toThrow();           // synchronous throw
await expect(promise).rejects.toBeInstanceOf(NotFoundError);   // async throw (await it!)
await expect(promise).resolves.toEqual(…);
expect(res.body.updatedAt).toEqual(expect.any(String));        // any value of a type
```

## 5.2 Supertest

```ts
import request from "supertest";

const res = await request(app)
  .post("/v1/workouts")
  .set("X-Request-Id", "test-1")            // headers
  .send({ kind: "run", startedAt: "…" });    // JSON body

res.status          // 201
res.body            // parsed JSON
res.headers         // lowercase keys: res.headers["content-type"], res.headers.location
res.text            // raw body text

await request(app).get("/v1/workouts").query({ kind: "run", limit: 5 });
await request(app).delete(`/v1/workouts/${id}`);
```

## 5.3 Factories for the other features

Model them on `insertSteps`. Return what the test needs next (usually the new row's ID), and default everything except what tests vary:

```ts
export async function insertWorkout(input: {
  kind?: WorkoutKind;
  startedAt?: string;
  endedAt?: string | null;
  distanceM?: number | null;
} = {}): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO workouts (user_id, kind, started_at, ended_at, distance_m)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [DEV_USER_ID, input.kind ?? "run", input.startedAt ?? "2026-10-11T14:00:00.000Z",
     input.endedAt ?? null, input.distanceM ?? null],
  );
  return result.rows[0]!.id;   // `!` = "I know it's there": INSERT … RETURNING always returns the row
}

/** Looks up a built-in exercise's ID by name, e.g. "Back Squat". */
export async function builtInExerciseId(name: string): Promise<string> { /* SELECT id … WHERE user_id IS NULL AND name = $1 */ }
```

## 5.4 Controlling time

```ts
// Services: pass a fixed or movable clock (tests/helpers/clock.ts)
const clock = createTestClock("2026-10-12T16:00:00.000Z");
const service = createStepsService({ repo, clock });
clock.set("2026-10-13T08:00:00.000Z");      // time travel between steps of one test

// A user's local calendar date for an instant (YYYY-MM-DD). "en-CA" formats dates as YYYY-MM-DD.
export function localDateOf(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

localDateOf(new Date("2026-10-12T06:30:00Z"), "America/Los_Angeles");   // "2026-10-11"
localDateOf(new Date("2026-10-12T06:30:00Z"), "Asia/Tokyo");            // "2026-10-12"
```

`vi.useFakeTimers()` and `vi.setSystemTime()` also exist. They fake `Date` globally, which is handy for code you don't control. Your injected clock is more explicit and doesn't leak between tests, so prefer it for your own code.

## 5.5 Running under another timezone

```bash
TZ=UTC npm test
TZ=Asia/Tokyo npm test
TZ=America/Los_Angeles npm test
```

`TZ` changes the timezone of the Node process (and of `new Date().toString()`, `getHours()`, and so on). Code that's correctly written with explicit timezones gives identical results under all three.

---

# Part 6 — 🧩 Challenges

## Challenge 1: Unit tests for pure functions ★☆☆

Create `tests/unit/` files for:

| Function | Cases to cover |
|---|---|
| `isCalendarDate` | Valid dates; Feb 29 in a leap year (2024) vs. not (2025); Feb 30; month 13; wrong formats (`26-10-11`, `2026/10/11`) |
| `addDays` | Within a month; across a month end; across a year end; negative days |
| Your 1RM function (Module 05) | A known value (100 kg × 5 → 116.67 with Epley); 1 rep → the weight itself (or your chosen rule) |
| Each Zod schema | **Table-driven:** a list of valid inputs that must parse, and invalid ones that must fail, with the expected error path |

✅ **Done when:** every case is a separate `it` (or an `it.each` row) with a descriptive name.

<details><summary>💡 Hint</summary>

For schemas: `expect(Schema.safeParse(input).success).toBe(false)`, and for the path: `Schema.safeParse(input).error?.issues[0]?.path`. Keep the input tables at the top of the file so they read like a spec.
</details>

---

## Challenge 2: Service unit tests ★★☆

Using the **memory repositories** and a fixed clock, test every business rule from Module 02 for exercises, workouts, and sets. At minimum:

- Exercises: duplicate names (case-insensitive, including against built-ins) → `ConflictError`; editing or deleting a built-in → `ForbiddenError`; another user's custom exercise → `NotFoundError`.
- Workouts: end before start; longer than 24 h; more than 5 minutes in the future; distance on a strength workout; **a PATCH that makes the merged workout invalid**.
- Sets: only on strength workouts (`ConflictError`); unknown exercise (`UnprocessableError`); set numbers increment; deleting a workout removes its sets.

✅ **Done when:** every rule from your `docs/api.md` has at least one test that would fail if the rule were removed. Prove it for three of them by deleting the rule and watching the test fail.

<details><summary>💡 Hint</summary>

Write a small `makeServices()` helper at the top of each file that creates fresh memory repositories and wires the services exactly the way `composition.ts` does, but with fakes.
</details>

---

## Challenge 3: Integration tests for every endpoint ★★★

For **every endpoint** in `docs/api.md`, write integration tests covering:
- the happy path (status, body shape, and the database state where it matters), and
- **at least two failure paths** (validation, not found, conflict, …).

Plus these specifically:
- **Pagination:** create 25 workouts with a factory; page through with `limit=10` and check 10/10/5 and `nextCursor: null` at the end; insert a newer workout between pages and check there are no duplicates; two workouts with the **same** `startedAt` across a page boundary.
- **Every error response** has `Content-Type: application/problem+json` and a `requestId`.
- **Stats:** for a small, hand-made data set where you can compute the answers on paper, check `/v1/stats/steps`, `/v1/stats/weekly`, and `/v1/records` return exactly those numbers.

Write factories (`tests/factories/`) for workouts, sets, and exercises as you need them (toolbox 5.3).

✅ **Done when:** `npm test` covers every endpoint, and deleting any single route makes at least one test fail.

---

## Challenge 4: The transaction test ★★☆

Write an integration test proving that `POST /v1/workouts` with a `sets` array is **all-or-nothing** (Module 05, Challenge 4):
1. Send a strength workout with 3 sets, where the 3rd references a non-existent exercise.
2. Assert the response is 422.
3. Assert, **by querying the database**, that there are zero workouts and zero sets.

Then, temporarily break atomicity (call the repositories directly instead of through `runInTransaction`), and confirm the test **fails**. Restore it.

---

## Challenge 5: TDD the streak feature ★★★

**The feature:** `GET /v1/stats/streak` → `{ "current": 4, "longest": 11, "goal": 10000, "today": "2026-10-12" }`

**The rules:**
- A day "counts" when its steps are **≥ the user's goal**. A missing day doesn't count.
- **`today`** is the current date **in the user's timezone** (from `users.timezone`), not the server's.
- **`current`** is the number of consecutive counting days ending **today**. If today hasn't reached the goal (yet), the streak can still be alive: then it's the run ending **yesterday**.
- **`longest`** is the longest run of consecutive counting days ever.

**Build it in this order, test first at every step:**

**Step 1:** a pure function in `src/modules/stats/streaks.ts`:

```ts
export function computeStreaks(
  days: { date: string; steps: number }[],
  goal: number,
  today: string,
): { current: number; longest: number }
```

Write these tests **one at a time**: watch each fail (red), make it pass (green), clean up (refactor), then move to the next. (Use `goal = 10000` and `today = "2026-10-12"` unless noted.)

| # | Test name | Days (date: steps) | Expected |
|---|---|---|---|
| 1 | no data means no streak | (none) | current 0, longest 0 |
| 2 | today alone counts | 10-12: 12000 | 1, 1 |
| 3 | consecutive days add up | 10-11: 12000, 10-12: 10500 | 2, 2 |
| 4 | reaching exactly the goal counts | 10-12: 10000 | 1, 1 |
| 5 | one step short doesn't count | 10-12: 9999 | 0, 0 |
| 6 | today not reached yet: the streak ending yesterday is still current | 10-10: 11000, 10-11: 12000, 10-12: 3000 | 2, 2 |
| 7 | today missing entirely: same as above | 10-11: 12000 | 1, 1 |
| 8 | a missed day breaks the streak | 10-09: 11000, 10-11: 11000, 10-12: 11000 | 2, 2 |
| 9 | longest can be an older streak | 10-05, 10-06, 10-07, 10-12 all 11000 | 1, 3 |
| 10 | an old streak isn't current | 10-01, 10-02: 11000 | 0, 2 |
| 11 | input order doesn't matter | 10-12, 10-10, 10-11 (in that order), all 11000 | 3, 3 |
| 12 | streaks cross month boundaries | 09-30, 10-01: 11000; today = 10-01 | 2, 2 |
| 13 | streaks cross the DST change | 10-30, 10-31, 11-01, 11-02: 11000; today = 11-02 | 4, 4 |

**Step 2:** `localDateOf(instant, timeZone)` (toolbox 5.4), with tests for these instants in `America/Los_Angeles`:

| Instant (UTC) | Expected local date |
|---|---|
| `2026-10-12T06:30:00Z` | `2026-10-11` |
| `2026-10-12T07:00:00Z` | `2026-10-12` |
| `2026-11-01T06:59:00Z` | `2026-10-31` |
| `2026-11-01T07:00:00Z` | `2026-11-01` |
| `2026-11-02T07:59:00Z` | `2026-11-01` (the 25-hour day) |
| `2026-11-02T08:00:00Z` | `2026-11-02` |

Plus one in `Asia/Tokyo`, to prove the timezone parameter is really used.

**Step 3:** the service (`statsService.getStreak(userId)`): reads the user's goal and timezone, computes `today` from the injected clock, fetches the step days, and calls `computeStreaks`. Unit-test it with a fake clock at **5pm Pacific** (the moment the UTC date has already changed).

**Step 4:** the route + one integration test with seeded steps.

✅ **Done when:** all the tests above pass, and your git history shows the tests landing **before or with** each piece of implementation. Commit after each green.

<details><summary>💡 Hint 1: direction</summary>

Don't design the whole algorithm up front. Test #1 can pass with `return { current: 0, longest: 0 }`. Let each new test force exactly one new idea into the code.
</details>

<details><summary>💡 Hint 2: approach</summary>

Two separate questions:
- **Longest:** sort the counting dates; walk through them; if a date is the day after the previous one (`addDays(prev, 1) === date`), the run grows; otherwise it restarts at 1. Track the maximum.
- **Current:** put the counting dates in a `Set`. Start from today if it counts, otherwise from yesterday. Step backward one day at a time while the set contains the date.
</details>

<details><summary>💡 Hint 3: why the 5pm test matters</summary>

At 5pm Pacific Daylight Time it's already midnight UTC (the next day). If your service computes `today` with `toISOString().slice(0, 10)`, "today" will be one day ahead for a Pacific user every evening, and their current streak will drop to 0 until they reach the goal again. Only `localDateOf(clock.now(), user.timezone)` gets this right.
</details>

---

## Challenge 6: Coverage as a flashlight ★☆☆

```bash
npm run test:coverage
```

Open the HTML report (`coverage/index.html`). Find **one meaningful branch** that never runs in tests (an error branch in a service, the 503 path in `toAppError`, …). Write a test for it. Record in the tracker what it was and why it mattered. Add `coverage/` to `.gitignore`.

---

## Challenge 7: Timezone-proof the suite ★☆☆

Run the full suite three times:

```bash
TZ=UTC npm test && TZ=Asia/Tokyo npm test && TZ=America/Los_Angeles npm test
```

All three must pass. If one fails, find the code that depends on the machine's timezone (the usual suspects are `getDate()`, `getHours()`, `toLocaleDateString()` without a `timeZone`, or `new Date("2026-10-11")` parsed as local time), and fix the code, not the test.

---

## Challenge 8: Prove the tests catch bugs ★★☆

A test suite that never fails is suspicious. Introduce each of these bugs, one at a time, and confirm at least one test fails. Record which test caught it:

1. Remove `user_id = $1` from the workouts list query.
2. Change `<` to `<=` in the cursor condition.
3. Remove the `.strict` from `CreateWorkoutBody` (use `z.object`).
4. Delete the `ConflictError` throw for duplicate exercise names (leaving only the database constraint).
5. Forget `await` before one `repo` call in a service.

If any bug survives, write the missing test.

```bash
git add -A && git commit -m "test: full suite, TDD streaks"
```

---

## Definition of done

- [ ] `docker compose up -d && npm test` passes from a clean checkout.
- [ ] Tests don't depend on each other's order, the current date, or the machine's timezone (Challenge 7 passes).
- [ ] Every endpoint has a happy-path test and at least two failure-path tests.
- [ ] The streak feature exists, and its git history shows tests first.
- [ ] Every bug in Challenge 8 is caught.
- [ ] `npm run typecheck` checks the tests too, and `npm run build` doesn't put them in `dist/`.

---

## ✍️ Checkpoint

1. Give one example from your codebase of a unit test, an integration test, and an end-to-end test, and say what each one can and can't catch.
2. Why test HTTP endpoints against a real Postgres instead of mocking the repository? What does that cost you?
3. You chose "delete all users, recreate the dev user" for isolation. Compare it with rolling back each test's transaction. Why would rollback not work well for your app? What changes in Module 07?
4. Your streak test passes locally and fails in CI at 5pm Pacific. What's the likely cause, and how do you fix it permanently?
5. **Code reading.** What's weak about this test, and how would you rewrite it?
   ```ts
   it("creates a workout", async () => {
     const repo = { create: vi.fn().mockResolvedValue({ id: "1" }) };
     await service(repo).createWorkout(userId, input);
     expect(repo.create).toHaveBeenCalledTimes(1);
   });
   ```
6. What makes a test flaky? Name three common causes in backend test suites, and how your suite avoids each.
7. Why inject a clock instead of calling `new Date()` inside services?
8. Your suite reports 95% line coverage. What does that guarantee, and what doesn't it?
9. List the test cases (names only) you'd want for `PUT /v1/steps/:date`.
10. What does each step of red-green-refactor accomplish? Why watch the test fail first?

**Explain it back:** Describe the testing strategy for `fittrack-api` to a new teammate in 5 sentences.

---

## 📋 Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Progress
- [ ] Part 1: Concepts read (1.1–1.10)
- [ ] Part 2: Vitest, test DB, tsconfig split, composition refactor, helpers
- [ ] Part 3: Steps service unit tests
- [ ] Part 4: Steps route integration tests
- [ ] Challenge 1: Pure function tests
- [ ] Challenge 2: Service tests
- [ ] Challenge 3: Integration tests for every endpoint
- [ ] Challenge 4: Transaction test
- [ ] Challenge 5: TDD streaks
- [ ] Challenge 6: Coverage branch
- [ ] Challenge 7: Timezone-proof
- [ ] Challenge 8: Bug-catching proof
- [ ] Checkpoint passed (≥ 8/10)

### Concepts I can explain without notes
- [ ] Why automate tests (1.1)
- [ ] Unit vs. integration vs. E2E, and where value lives (1.2)
- [ ] Arrange-Act-Assert; behavior over implementation (1.3)
- [ ] Fakes vs. stubs vs. mocks; what not to mock (1.4)
- [ ] Test database isolation strategies (1.5)
- [ ] Factories (1.6)
- [ ] Time and timezones as inputs (1.7)
- [ ] Red → green → refactor (1.8)
- [ ] What coverage does and doesn't mean (1.9)
- [ ] Causes of flaky tests (1.10)

### Test inventory
| Area | Unit | Integration | Notes |
|---|---|---|---|
| Steps | ⬜ | ⬜ | |
| Exercises | ⬜ | ⬜ | |
| Workouts (incl. pagination) | ⬜ | ⬜ | |
| Sets | ⬜ | ⬜ | |
| Stats / records | ⬜ | ⬜ | |
| Streak (TDD) | ⬜ | ⬜ | |

### Bug-catching proof (Challenge 8)
| Bug | Caught by |
|---|---|
| Missing `user_id` filter | |
| `<` → `<=` in cursor | |
| Non-strict body schema | |
| No service duplicate check | |
| Missing `await` | |

### Coverage finding (Challenge 6)
—

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
- Vitest: https://vitest.dev/guide/
- Vitest API (expect): https://vitest.dev/api/expect
- Supertest: https://github.com/forwardemail/supertest
- Kent C. Dodds, "Write tests. Not too many. Mostly integration.": https://kentcdodds.com/blog/write-tests
- Martin Fowler, "Mocks Aren't Stubs": https://martinfowler.com/articles/mocksArentStubs.html
- MDN, `Intl.DateTimeFormat`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
