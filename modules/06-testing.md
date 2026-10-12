# Module 06: Testing a Backend

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Estimated time** | 8–10 hours |
| **Prerequisites** | Module 05 |
| **Project milestone** | Unit + integration + HTTP test suite against a real Postgres test DB; the step-goal streak feature built test-first |

> **From this module on, every feature ships with tests.** Modules 01–05 relied on `requests.http` and manual checks. That stops here.

## Why this matters
Tests are how you change code without fear. In backend work, the most valuable tests exercise real HTTP requests against a real database, because that's where the bugs live: SQL, constraints, transactions, serialization, and status codes.

## Learning objectives
- Pick the right kind of test for each piece of code.
- Unit-test pure logic and services using fakes.
- Write HTTP integration tests against a real Postgres test database.
- Keep tests isolated, fast, and deterministic, including tests involving time and timezones.
- Use factories instead of brittle fixtures.
- Build a feature with TDD.
- Interpret coverage correctly.

---

## Learn

### 6.1 What to test, and how much
- **Unit tests:** pure functions and services with fake repositories. They're fast and precise, but blind to SQL and HTTP issues.
- **Integration tests:** your code + a real database, usually through HTTP. Slower, but they catch the bugs that matter most here.
- **End-to-end tests:** the deployed system from the outside. Keep them few (a smoke test after deploy, M10).
- For a backend like this, the sweet spot is a **large base of HTTP + real-DB integration tests**, plus unit tests for tricky pure logic (dates, streaks, 1RM).
- Test **behavior** (inputs → outputs and side effects), not implementation details.

### 6.2 Vitest basics
`describe`, `it`, `expect`, `beforeAll`/`beforeEach`/`afterAll`, and table-driven tests with `it.each`. Keep tests next to features (`workouts.service.test.ts`) or in `tests/`. Pick one convention and stick to it.

### 6.3 Unit tests with fakes
Your M2 architecture pays off here. Construct a service with in-memory repositories and assert on the business rules ("cannot add a set to a run workout"). There's no DB and no HTTP, and each test takes milliseconds.

### 6.4 HTTP tests with Supertest
```ts
import request from "supertest";
import { buildApp } from "../src/app.js";

it("rejects a workout that ends before it starts", async () => {
  const app = buildApp(testDeps);
  const res = await request(app)
    .post("/v1/workouts")
    .send({ kind: "run", startedAt: "2026-10-11T08:00:00Z", endedAt: "2026-10-11T07:00:00Z" });

  expect(res.status).toBe(400);
  expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
  expect(res.body.errors[0].path).toBe("endedAt");
});
```
This is why M1 split `app.ts` from `server.ts`: you can test the app without opening a port.

### 6.5 A real test database
- Use a separate database (`fittrack_test`) via `.env.test`, and run migrations once before the suite.
- Isolation strategies:
  - **Truncate tables between tests.** Simple and reliable, but tests touching the DB must run one at a time.
  - **Wrap each test in a transaction and roll it back.** Fast, but awkward when the code under test opens its own transactions.
  - **Unique data per test** (a fresh user per test, with every query scoped by user). This allows parallel tests, and your user scoping already makes it natural.
- **Testcontainers** can start a throwaway Postgres per test run. That's useful in CI, and an option locally.
- **Don't mock the database in integration tests.** Mocking the thing most likely to break defeats the purpose. *Do* fake external services you don't control.

### 6.6 Factories
`await makeUser()`, `await makeWorkout({ userId, kind: "strength", sets: 3 })`. Defaults are realistic, and each test overrides only what it cares about. Avoid giant shared fixture files that every test depends on, where changing one value breaks twenty tests.

### 6.7 Time is an input
- Calling `new Date()` inside a service makes tests depend on when they run.
- **Inject a clock** (`{ now: () => Date }`) or use Vitest fake timers.
- Timezone edge cases to test explicitly:
  - Just before and after midnight in the user's timezone.
  - **DST transitions:** in US timezones, DST ends on Sunday, Nov 1, 2026, which gives a 25-hour day. Make sure your step day and weekly bucket logic handles it.
  - A user whose timezone differs from the server's.
- Make sure tests pass no matter what timezone the machine running them is in (set `TZ` explicitly in CI to prove it).

### 6.8 TDD: red → green → refactor
1. **Red:** write a test for behavior that doesn't exist yet, and watch it fail for the right reason.
2. **Green:** write the simplest code that passes.
3. **Refactor:** clean up while the tests stay green.

TDD shines for logic with many edge cases, like a streak calculation.

### 6.9 Coverage
Coverage tells you which lines ran, not whether they're *correct*. Use it to find untested branches that matter (error paths, edge cases), not as a target to hit. 100% coverage with weak assertions proves nothing.

---

## Build

- [ ] **B1** Extend the Vitest setup from M2 (smoke tests already exist). Add `test`, `test:unit`, and `test:integration` scripts, a `.env.test` with a separate DB, and a global setup that migrates the test DB.
- [ ] **B2** Write unit tests for pure functions: 1RM, week bucketing, day-in-user-timezone, and the Zod schemas (table-driven valid and invalid cases).
- [ ] **B3** Write service unit tests with in-memory repositories covering every business rule from M2.
- [ ] **B4** Write integration tests for **every endpoint**: the happy path plus at least two failure paths (validation, not found, conflict).
- [ ] **B5** Write a transaction test: atomic workout + sets creation rolls back completely when a set is invalid.
- [ ] **B6** Build factories in `tests/factories/`.
- [ ] **B7** **TDD** `GET /v1/stats/streak` → `{ current, longest }` days meeting the step goal. Write the tests *first*, including: today not yet met (does the streak still count yesterday?), gaps, the first day of data, user timezone vs server timezone, and the Nov 1, 2026 DST change.
- [ ] **B8** Run coverage, find one meaningful untested branch, and test it.
- [ ] **B9** Run the suite with `TZ=UTC` and `TZ=Asia/Tokyo`. Both must pass.

## Definition of done
- `npm test` passes from a clean checkout with Docker running.
- Tests don't depend on each other's order, the current date, or the machine's timezone.
- The streak feature was built test-first, and the git history shows tests landing before or with the implementation.

---

## Checkpoint

1. Give one example from your codebase of a unit test, an integration test, and an end-to-end test, and say what each one can and can't catch.
2. Why test HTTP endpoints against a real Postgres instead of mocking the repository? What does that cost you?
3. Compare truncating between tests with rolling back each test's transaction. Which did you choose, and why?
4. Your streak test passes locally and fails in CI at 5pm Pacific. What's the likely cause, and how do you fix it permanently?
5. **Code reading.** What's weak about this test?
   ```ts
   it("creates a workout", async () => {
     const repo = { create: vi.fn().mockResolvedValue({ id: "1" }) };
     await service(repo).createWorkout(userId, input);
     expect(repo.create).toHaveBeenCalledTimes(1);
   });
   ```
6. What makes a test flaky? Name three common causes in backend test suites.
7. Why inject a clock instead of calling `new Date()` inside services?
8. Your suite reports 95% line coverage. What does that guarantee, and what doesn't it?
9. List the test cases (names only) you'd want for `PUT /v1/steps/:date`.
10. What does each step of red-green-refactor accomplish? Why watch the test fail first?

**Explain it back:** Describe the testing strategy for `fittrack-api` to a new teammate in 5 sentences.

---

## Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Concepts understood
- [ ] 6.1 Test types and where value lives
- [ ] 6.2 Vitest basics
- [ ] 6.3 Unit tests with fakes
- [ ] 6.4 HTTP tests with Supertest
- [ ] 6.5 Test DB and isolation strategies
- [ ] 6.6 Factories
- [ ] 6.7 Time and timezone testing
- [ ] 6.8 TDD
- [ ] 6.9 Interpreting coverage

### Test inventory
| Area | Unit | Integration | Notes |
|---|---|---|---|
| Workouts | ⬜ | ⬜ | |
| Sets | ⬜ | ⬜ | |
| Exercises | ⬜ | ⬜ | |
| Steps | ⬜ | ⬜ | |
| Stats / records | ⬜ | ⬜ | |
| Streak (TDD) | ⬜ | ⬜ | |

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
- Vitest: https://vitest.dev/
- Supertest: https://github.com/ladjs/supertest
- Testcontainers for Node: https://node.testcontainers.org/
- The Testing Trophy (Kent C. Dodds): https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
