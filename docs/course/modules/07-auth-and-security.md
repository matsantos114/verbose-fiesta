# Module 07: Authentication, Authorization & Security

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | ✅ Full |
| **Estimated time** | 16–20 hours |
| **Prerequisites** | Module 06 complete (a full test suite you trust) |
| **Project milestone** | Register / login / logout / me with server-side sessions in Postgres; every query scoped to the logged-in user; an IDOR test suite; rate-limited login; security headers; an OWASP API Top 10 self-review |

## 🎓 Tutor prompt

Start every study session for this module in a **new chat** by pasting the prompt below. It sets Claude up as your teacher for this module: it reads the course files, picks up where you left off, follows the teaching rules (no solutions; syntax help and hints instead), quizzes you, and updates your tracker when you say **"wrap up."**

```text
You are my tutor for Module 07 of my backend engineering course: "Authentication, Authorization & Security".

ROLE
Act as an application security engineer who has tested APIs for vulnerabilities and now mentors developers on secure design. You teach an attacker's mindset, applied only to my own app, so I build defenses that actually hold. Teach the way a great senior engineer mentors a junior on their own team: patient, precise, Socratic, and honest when my work isn't good enough yet.

ABOUT ME
- I'm Mathew, a frontend engineer (React + TypeScript). I'm solid on JS/TS logic, but I don't know every Node, Express, SQL, or tooling API and syntax by heart.
- I'm building `fittrack-api`, an API that tracks my own physical activity (daily steps, workouts, lifting sets, exercises), to learn backend fundamentals properly.
- The course lives in my repo at `docs/course/`: `COURSE.md` (rules, given-vs-you-write table, decisions log, session log) plus one file per module.
- Stack for this module: Node.js LTS + TypeScript + Express 5 + PostgreSQL, adding argon2id password hashing, server-side sessions in Postgres, HttpOnly cookies, helmet, and rate limiting.

PREP (do this before teaching anything)
1. Read `docs/course/COURSE.md` and `docs/course/modules/07-auth-and-security.md`, including that module's Tracker section. If you can't access them, ask me to attach both files and stop until I do.
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
- Authentication vs. authorization, and when to return 401, 403, or 404.
- Password storage (why fast hashes fail), random session tokens hashed at rest, cookie flags, and revocation on logout and password change.
- IDOR/BOLA: have me attack my own API as a second user before you point anything out. Ownership must be enforced in every query, with `userId` coming only from the session.
- CSRF, SameSite, and what CORS does and doesn't protect.
- The OWASP API Security Top 10 review: ask me to find the issues in my code first, then fill the gaps.
- Ask me to justify sessions vs. JWT in my own words before I record the decision.
- Watch for these common misconceptions and correct them when they show up: using SHA-256 for passwords; thinking JWTs in localStorage are fine; treating CORS as a security boundary; taking `userId` from the body or URL; login messages that reveal which emails have accounts; forgetting to revoke sessions on password change.
- Hold me to this standard before I move on: every user-data route requires auth, every user-data query is scoped by `user_id`, the IDOR suite passes for every resource, and no password or token appears in logs or responses.

CHECKPOINT
When I say "quiz me": ask the module's 10 checkpoint questions one at a time. I answer without notes. Grade each 0 / 0.5 / 1 with a short explanation of what a full answer includes. Then give the "explain it back" prompt. Pass = 8/10. Under 8, list exactly which topics to review, and retake only those questions next session.

END OF SESSION
When I say "wrap up": (1) update this module's Tracker (progress checkboxes, concepts I demonstrated, quiz score, weak spots, notes, error log, open questions); (2) update COURSE.md (header's current module/step, course map row, skills ledger only for skills I *proved*, decisions log if we made a choice, and a new Session log row with a concrete next step). Edit the files directly if you can; otherwise give me the exact Markdown to paste.

Begin now with PREP.
```

## How to use this module

| Part | What you do | Kind |
|---|---|---|
| 1. Concepts | Authentication vs. authorization, passwords, sessions vs. JWTs, cookies, CSRF, IDOR, rate limiting, OWASP | 📖 Read |
| 2. Setup | Install argon2, cookie-parser, helmet; the auth migration; config | ⌨️ Type along |
| 3. Worked example | **Registration + sessions + `requireAuth`**, end to end, and steps behind login | ⌨️ Type along |
| 4. Toolbox | Login building blocks, rate limiting, test helpers with cookies | 🧰 Reference |
| 5. Challenges | Login, logout, me, password change; every route behind auth; the IDOR suite; rate limiting; the security review | 🧩 You write |
| Checkpoint | 10 questions | ✍️ Quiz |

**Why the worked example is bigger here than usual:** authentication is new *and* security-critical, and small mistakes are invisible until someone exploits them. So you get registration, session creation, and the auth middleware in full, with every decision explained. Then you build login, logout, and the rest on top of it.

## What you'll be able to do by the end
- Explain authentication vs. authorization, and return 401 vs. 403 vs. 404 correctly.
- Store passwords correctly, and explain why "just hash it" is wrong.
- Implement server-side sessions with secure cookies, and justify sessions over JWTs for this app.
- Explain CSRF, and how SameSite cookies and JSON-only bodies defend against it.
- Prevent IDOR/BOLA by construction, and prove it with tests.
- Rate-limit login and return proper 429 responses.
- Review an API against the OWASP API Security Top 10.

---

# Part 1 — 📖 Concepts

## 1.1 Authentication vs. authorization

| | Question | Failure | Example |
|---|---|---|---|
| **Authentication (AuthN)** | *Who are you?* | **401 Unauthorized** (the name is historical; it means "unauthenticated") | No session cookie, or an expired one |
| **Authorization (AuthZ)** | *Are you allowed to do this?* | **403 Forbidden**, or **404** if even admitting the thing exists would leak information | Editing a built-in exercise (403); reading someone else's workout (404) |

Authentication happens **once per request**, in middleware. Authorization happens **everywhere data is touched**, and that's why it's the one that goes wrong.

## 1.2 How a server-side session works

```
REGISTER / LOGIN
 browser ──POST /v1/auth/login {email, password}──▶ API
                                                      1. verify the password against the stored hash
                                                      2. token = 32 random bytes
                                                      3. INSERT sessions (user_id, token_hash = sha256(token), expires_at)
 browser ◀──200 + Set-Cookie: fittrack_session=<token>; HttpOnly; SameSite=Lax──

EVERY LATER REQUEST
 browser ──GET /v1/workouts  Cookie: fittrack_session=<token>──▶ API
                                                      requireAuth: sha256(token) → SELECT user_id FROM sessions
                                                                   WHERE token_hash = … AND expires_at > now()
                                                      found → res.locals.userId = that user; route runs
                                                      missing → 401

LOGOUT
 browser ──POST /v1/auth/logout──▶ API: DELETE the session row; clear the cookie. The token is now worthless.
```

The cookie holds a **random token that means nothing by itself**. All the meaning (who it belongs to, when it expires) lives in your database, under your control.

## 1.3 Password storage

**Never store passwords.** Store a value that lets you *check* a password but not *recover* it.

| Approach | Problem |
|---|---|
| Plaintext | One database leak exposes every password, and people reuse passwords across sites |
| Encryption | Whoever has the key (or steals it) can decrypt every password |
| `sha256(password)` | Identical passwords produce identical hashes, so precomputed tables crack common ones instantly |
| `sha256(salt + password)` | Better, but SHA-256 is designed to be **fast**: a GPU tries **billions** of guesses per second |
| **argon2id** (or bcrypt) | **Deliberately slow and memory-hungry** (≈ tens of ms and tens of MB per attempt), with a random salt built in. An attacker gets thousands of guesses per second instead of billions. |

argon2id is OWASP's first recommendation. The library generates the salt and stores it inside the hash string, along with the settings:

```
$argon2id$v=19$m=65536,t=3,p=4$Zz5sV0J3…$hY8m…
   algorithm  │      settings     salt      hash
```

So `verify(storedHash, attempt)` knows exactly how to re-hash the attempt and compare.

**Login messages must not reveal which emails exist.** "No account with that email" vs. "Wrong password" lets anyone check whether someone uses your app. Always answer **"Invalid email or password,"** and take about the same *time* either way (Part 4.1 shows how).

## 1.4 Why the session token is hashed too

The `sessions` table stores **`sha256(token)`**, not the token.
- If the table leaks (a backup, a SQL injection somewhere, a bad log line), the hashes can't be pasted into a cookie.
- **Why a fast hash is fine here but not for passwords:** passwords are short and human-chosen, so slow hashing is what protects them from guessing. A session token is **256 random bits**. No speed of hashing makes guessing 2²⁵⁶ possibilities feasible.

## 1.5 Sessions vs. JWTs

A **JWT** (JSON Web Token) is a signed blob like `{ "sub": "user-id", "exp": … }`. The server can check the signature **without a database lookup**.

| | Server-side sessions (this course) | JWTs |
|---|---|---|
| Check per request | A DB lookup (a fast indexed query) | Verify a signature (no DB) |
| **Revoke** (logout, stolen token, password change) | **Delete the row: instant** | Hard. The token stays valid until it expires, unless you add a revocation list (which is a DB lookup again). |
| Where the browser keeps it | `HttpOnly` cookie: JS can't read it | Often `localStorage`, where **any XSS bug can steal it** |
| Complexity | Low | Short-lived access tokens + refresh tokens + rotation + revocation |
| Shines when | A browser app talking to its own API | Service-to-service auth, third-party API access, many independent services verifying the same token |

**Decision for `fittrack-api`: sessions.** Confirm it in your decisions log, in your own words.

## 1.6 Cookie flags

```
Set-Cookie: fittrack_session=<token>; Path=/; Expires=…; HttpOnly; Secure; SameSite=Lax
```

| Flag | What it does | Defends against |
|---|---|---|
| `HttpOnly` | JavaScript can't read the cookie (`document.cookie` doesn't show it) | XSS stealing the session |
| `Secure` | Only sent over HTTPS | Someone on the café Wi-Fi reading it |
| `SameSite=Lax` | Not sent on cross-site *subrequests* (fetch, forms POSTed from other sites); sent on top-level navigation | Most CSRF |
| `Expires` / `Max-Age` | When the browser deletes it | Sessions living forever |
| `Path=/` | Sent for every path on this site | |

In local development you use `http://localhost`, so `Secure` is off (via config). In production it's always on (Module 10).

## 1.7 CSRF (cross-site request forgery)

Browsers attach cookies automatically. So if you're logged in to fittrack and visit `evil.example`, its page could try to make *your browser* send a request to your API, with your cookie attached.

Your defenses, from strongest to weakest:
1. **`SameSite=Lax`**: the browser won't attach your cookie to that cross-site POST in the first place.
2. **JSON-only bodies.** Your `requireJsonBody` middleware (Module 02) returns 415 for anything that isn't `application/json`. A plain HTML `<form>` can't send JSON, and a cross-site `fetch` with `Content-Type: application/json` triggers a CORS **preflight**, which your API doesn't approve for unknown origins (Module 10).
3. **GET never changes state.** Links and images can trigger GETs from anywhere.
4. (Optional, for defense in depth: a CSRF token or a required custom header.)

## 1.8 IDOR / BOLA: the most common API vulnerability

**Insecure Direct Object Reference / Broken Object Level Authorization**: the API trusts the ID in the URL and forgets to check who owns it.

```sql
-- ❌ Any logged-in user can read ANY workout, just by trying IDs
SELECT * FROM workouts WHERE id = $1;

-- ✅ Ownership is part of the query itself
SELECT * FROM workouts WHERE id = $1 AND user_id = $2;
```

Rules:
- **`userId` always comes from the session** (`getUserId(res)`), never from the URL, the body, or a header the client controls.
- **Another user's resource → 404**, not 403. A 403 confirms the ID exists.
- **Nested resources check the parent.** A set must belong to a workout that belongs to the user.

Your Module 02 design (every repository method takes `userId`) means this is mostly done already. In this module you replace `DEV_USER_ID` with the real user, and **prove** it with tests that attack your own API as a second user.

## 1.9 Rate limiting

Login is a guessing target. Limit failed attempts **per IP address** (one attacker guessing many accounts) **and per email** (many machines guessing one account), e.g. 5 failures per 15 minutes. Over the limit → **429 Too Many Requests** with a `Retry-After` header.

An in-memory limiter works with one server instance. With two instances, each counts separately and the limit is effectively doubled. Module 08 moves the counters to Redis.

## 1.10 Other hardening

- **Security headers** with `helmet`: `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, a `Content-Security-Policy`, and it removes `X-Powered-By: Express` (no need to advertise your stack).
- **Never return the password hash.** List columns explicitly in SQL (no `SELECT *` on `users`), and have a test that checks no response contains `passwordHash` or `password_hash`.
- **Size limits** (body, `limit`, string lengths) prevent cheap denial of service. Note the password **maximum** (128): hashing a 10 MB "password" would be a cheap way to burn your CPU.
- **CORS is not a security boundary for your API.** Browsers enforce it; `curl` and scripts ignore it. It only controls which *web pages* may read your responses.
- **Secrets live in env vars.** If a secret is ever committed to git, rotate it. Deleting the commit isn't enough.

## 1.11 The OWASP API Security Top 10 (2023), mapped to this app

| # | Risk | In fittrack | Where you handle it |
|---|---|---|---|
| 1 | Broken Object Level Authorization (BOLA) | Reading another user's workout by ID | 1.8, Challenge 6 |
| 2 | Broken Authentication | Weak hashing, guessable tokens, no brute-force protection | 1.3–1.4, Challenges 1 and 7 |
| 3 | Broken Object Property Level Authorization | Mass assignment; returning `password_hash` | Module 03 strict schemas; 1.10 |
| 4 | Unrestricted Resource Consumption | No pagination cap; huge bodies | Modules 01–03 |
| 5 | Broken Function Level Authorization | Editing built-in exercises | Module 02 rules |
| 6 | Unrestricted Access to Sensitive Business Flows | Scripted mass registration | Rate limits |
| 7 | Server-Side Request Forgery | Not present yet (it would be if you fetched user-supplied URLs) | Keep it that way, or validate URLs |
| 8 | Security Misconfiguration | Verbose errors, missing headers, `Secure` off in production | Module 03, helmet, Module 10 |
| 9 | Improper Inventory Management | Forgotten test or debug routes (`/boom`!) | Challenge 8 |
| 10 | Unsafe Consumption of APIs | Trusting a third-party API's response without validating it | Validate it like client input (Zod) |

✅ **Before moving on:** explain 1.2, 1.3, 1.5, and 1.8 out loud.

---

# Part 2 — ⌨️ Setup

## 2.1 Install

```bash
npm install argon2 cookie-parser helmet
npm install --save-dev @types/cookie-parser
```

| Package | Purpose |
|---|---|
| `argon2` | Password hashing (a native addon; npm downloads a prebuilt binary for your platform) |
| `cookie-parser` | Parses the `Cookie` header into `req.cookies` |
| `helmet` | Sets security headers |

## 2.2 The migration: `migrations/NNN_auth.sql`

Use the next free number in your project.

```sql
-- Passwords and server-side sessions.

-- Existing users (like the seeded dev user) have no password yet, so the column starts nullable.
ALTER TABLE users ADD COLUMN password_hash text;

-- Emails are stored lowercase, so "Mathew@Example.com" and "mathew@example.com" are one account.
ALTER TABLE users ADD CONSTRAINT users_email_lowercase CHECK (email = lower(email));

CREATE TABLE sessions (
  id            uuid        PRIMARY KEY DEFAULT uuidv7(),
  user_id       uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash    text        NOT NULL UNIQUE,   -- SHA-256 of the cookie value; the raw token is never stored
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  user_agent    text
);

-- "Log out everywhere" and "delete my other sessions" look sessions up by user.
CREATE INDEX sessions_user_id_idx ON sessions (user_id);
```

- **`password_hash` is nullable** because existing rows (your seeded dev user) don't have one. Login treats a NULL hash as "can't log in with a password."
- **`token_hash text NOT NULL UNIQUE`**: the unique constraint also creates the index that `requireAuth` uses on every request.
- **`ON DELETE CASCADE`**: deleting a user ends all their sessions.

> Run `npm run db:migrate`. If the email CHECK fails, some existing row has uppercase letters in its email. Fix that row (`UPDATE users SET email = lower(email)`) in a separate migration *before* this one.

## 2.3 Config

Add to `ConfigSchema` (and `.env.example`):

```ts
SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
COOKIE_SECURE: z.stringbool().default(false),
```

**Why `z.stringbool()` and not `z.coerce.boolean()`?** `coerce.boolean()` uses JavaScript truthiness, and `"false"` is a non-empty string, so it's **true**. `stringbool()` understands `"true"`/`"false"`, `"1"`/`"0"`, `"yes"`/`"no"`. A config that silently turns `COOKIE_SECURE=false` into `true` (or worse, the reverse in production) is exactly the kind of bug you don't want.

## 2.4 New error class in `src/shared/errors.ts`

```ts
export class UnauthorizedError extends AppError {
  constructor(detail = "You need to log in") {
    super({ status: 401, slug: "unauthorized", title: "Unauthorized", detail });
  }
}
```

And add to `UNIQUE_MESSAGES` in `src/db/errors.ts` (Postgres names an inline `UNIQUE` constraint `<table>_<column>_key`):

```ts
users_email_key: "An account with that email already exists",
```

---

# Part 3 — ⌨️ Worked example: registration, sessions, and `requireAuth`

The data flows through these files in order:

```
password.ts, session-token.ts      the two crypto primitives
users.* , sessions.*               storage
auth.schemas.ts                    what a registration request may contain
auth.service.ts                    the rules: register, authenticate
cookies.ts                         how the cookie is set
auth.routes.ts                     POST /v1/auth/register
require-auth.ts, current-user.ts   protecting routes, and reading who's logged in
app.ts, composition.ts             wiring
```

## 3.1 `src/modules/auth/password.ts`

```ts
import * as argon2 from "argon2";

/**
 * Hashes a password with argon2id. The result is a single string that contains the
 * algorithm, its settings, a random salt, and the hash, e.g. "$argon2id$v=19$m=65536,t=3,p=4$...".
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, { type: argon2.argon2id });
}

/** True if `plainPassword` matches `storedHash`. Reads the salt and settings from the hash itself. */
export async function verifyPassword(storedHash: string, plainPassword: string): Promise<boolean> {
  return argon2.verify(storedHash, plainPassword);
}
```

The whole security of password storage is these two calls, which is the point: **don't invent your own.** `import * as argon2` brings in the library's named exports (`hash`, `verify`, `argon2id`) as one object.

## 3.2 `src/modules/auth/session-token.ts`

```ts
import { createHash, randomBytes } from "node:crypto";

/** 32 random bytes = 256 bits: impossible to guess. base64url makes it cookie-safe text. */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * What we store in the database instead of the token itself. If the sessions table ever leaks,
 * the hashes can't be used as cookies. A fast hash is fine here (unlike for passwords), because
 * a 256-bit random token can't be brute-forced.
 */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
```

`randomBytes` comes from the operating system's cryptographically secure random generator. **Never use `Math.random()` for anything security-related:** its output is predictable.

## 3.3 Users: types, repository, Postgres implementation

**`src/modules/users/users.types.ts`:**

```ts
/** A user as the rest of the app sees it. Never includes the password hash. */
export interface User {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  dailyStepGoal: number;
  createdAt: string;
}

/** Only the auth service ever sees this shape. */
export interface UserWithPasswordHash extends User {
  passwordHash: string | null;
}
```

**`src/modules/users/users.repository.ts`:**

```ts
import type { User, UserWithPasswordHash } from "./users.types.js";

export interface NewUser {
  email: string;
  displayName: string;
  timezone: string;
  dailyStepGoal: number;
  passwordHash: string;
}

export interface UsersRepository {
  create(input: NewUser): Promise<User>;
  findById(id: string): Promise<User | null>;
  /** Includes the password hash: only for logging in. */
  findByEmailWithPasswordHash(email: string): Promise<UserWithPasswordHash | null>;
}
```

**`src/modules/users/users.pg-repo.ts`:**

```ts
import type { Queryable } from "../../db/queryable.js";
import type { UsersRepository } from "./users.repository.js";
import type { User, UserWithPasswordHash } from "./users.types.js";

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  timezone: string;
  daily_step_goal: number;
  created_at: Date;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    timezone: row.timezone,
    dailyStepGoal: row.daily_step_goal,
    createdAt: row.created_at.toISOString(),
  };
}

// Listing columns explicitly (never SELECT *) means password_hash can't sneak into a response.
const USER_COLUMNS = "id, email, display_name, timezone, daily_step_goal, created_at";

export function createPgUsersRepository(db: Queryable): UsersRepository {
  return {
    async create(input) {
      const result = await db.query<UserRow>(
        `INSERT INTO users (email, display_name, timezone, daily_step_goal, password_hash)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${USER_COLUMNS}`,
        [input.email, input.displayName, input.timezone, input.dailyStepGoal, input.passwordHash],
      );
      const row = result.rows[0];
      if (!row) throw new Error("insert into users returned no row");
      return toUser(row);
    },

    async findById(id) {
      const result = await db.query<UserRow>(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
      const row = result.rows[0];
      return row ? toUser(row) : null;
    },

    async findByEmailWithPasswordHash(email) {
      const result = await db.query<UserRow & { password_hash: string | null }>(
        `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = $1`,
        [email],
      );
      const row = result.rows[0];
      if (!row) return null;
      const user: UserWithPasswordHash = { ...toUser(row), passwordHash: row.password_hash };
      return user;
    },
  };
}
```

- **Two types on purpose.** `User` is what routes, services, and responses use. `UserWithPasswordHash` is returned by exactly one method, which only the auth service calls. A hash can't end up in a response by accident, because the normal type doesn't even have the field.
- **`USER_COLUMNS` is a constant from your code**, so interpolating it into SQL is safe (it's never client input).

## 3.4 Sessions: repository and Postgres implementation

**`src/modules/auth/sessions.repository.ts`:**

```ts
export interface NewSession {
  userId: string;
  tokenHash: string;
  expiresAt: string;
  userAgent: string | null;
}

export interface SessionsRepository {
  create(input: NewSession): Promise<{ id: string }>;
  /** The session's user ID, if the session exists and hasn't expired at `now`. */
  findActiveUserId(tokenHash: string, now: string): Promise<{ sessionId: string; userId: string } | null>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
  /** Deletes every session for the user except one (pass null to delete them all). */
  deleteAllForUserExcept(userId: string, keepSessionId: string | null): Promise<number>;
}
```

**`src/modules/auth/sessions.pg-repo.ts`:**

```ts
import type { Queryable } from "../../db/queryable.js";
import type { SessionsRepository } from "./sessions.repository.js";

export function createPgSessionsRepository(db: Queryable): SessionsRepository {
  return {
    async create(input) {
      const result = await db.query<{ id: string }>(
        `INSERT INTO sessions (user_id, token_hash, expires_at, user_agent)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [input.userId, input.tokenHash, input.expiresAt, input.userAgent],
      );
      const row = result.rows[0];
      if (!row) throw new Error("insert into sessions returned no row");
      return row;
    },

    async findActiveUserId(tokenHash, now) {
      const result = await db.query<{ id: string; user_id: string }>(
        `SELECT id, user_id FROM sessions WHERE token_hash = $1 AND expires_at > $2`,
        [tokenHash, now],
      );
      const row = result.rows[0];
      return row ? { sessionId: row.id, userId: row.user_id } : null;
    },

    async deleteByTokenHash(tokenHash) {
      await db.query(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash]);
    },

    async deleteAllForUserExcept(userId, keepSessionId) {
      const result = await db.query(
        `DELETE FROM sessions WHERE user_id = $1 AND ($2::uuid IS NULL OR id <> $2::uuid)`,
        [userId, keepSessionId],
      );
      return result.rowCount ?? 0;
    },
  };
}
```

- **`expires_at > $2`**: an expired session is treated as missing. `now` comes from the injected clock, so tests can fast-forward past expiry.
- **`($2::uuid IS NULL OR id <> $2::uuid)`** handles both "delete all of this user's sessions" (pass `null`) and "delete all except the current one" (pass its ID) in one query. The `::uuid` casts tell Postgres the parameter's type even when it's `null`.

## 3.5 `src/modules/auth/auth.schemas.ts`

```ts
import { z } from "zod";

/** True if the runtime knows this IANA timezone name ("America/Los_Angeles", "UTC", ...). */
export function isValidTimeZone(name: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: name });
    return true;
  } catch {
    return false; // RangeError: Invalid time zone specified
  }
}

export const Email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ message: "must be a valid email address" }));

// Length is what makes a password strong. 12+ characters, and a generous maximum
// (hashing a megabyte-long "password" would be a cheap way to burn our CPU).
export const NewPassword = z.string().min(12, { message: "must be at least 12 characters" }).max(128);

export const RegisterBody = z.strictObject({
  email: Email,
  password: NewPassword,
  displayName: z.string().trim().min(1).max(80),
  timezone: z.string().refine(isValidTimeZone, { message: "must be an IANA timezone like America/Los_Angeles" }),
  dailyStepGoal: z.number().int().min(1).max(100_000).default(10_000),
});
export type RegisterBody = z.infer<typeof RegisterBody>;

export const LoginBody = z.strictObject({
  email: Email,
  password: z.string().min(1).max(128),
});
export type LoginBody = z.infer<typeof LoginBody>;
```

- **`Email`**: trim → lowercase → length cap → *then* check the format. `.pipe(…)` runs the second schema on the output of the first. Lowercasing before storing (plus the CHECK in the migration) is what makes emails case-insensitive.
- **`isValidTimeZone`**: the cleanest way to validate an IANA timezone name is to ask the runtime to use it. An invalid name throws a `RangeError`.
- **`dailyStepGoal` defaults to 10,000** if it's not sent.
- **`LoginBody`**'s password only checks it's non-empty: login must not reveal the password rules.

## 3.6 `src/modules/auth/auth.service.ts`

```ts
import type { Clock } from "../../shared/clock.js";
import { ConflictError } from "../../shared/errors.js";
import type { UsersRepository } from "../users/users.repository.js";
import type { User } from "../users/users.types.js";
import type { RegisterBody } from "./auth.schemas.js";
import { hashPassword } from "./password.js";
import { generateSessionToken, hashSessionToken } from "./session-token.js";
import type { SessionsRepository } from "./sessions.repository.js";

export interface AuthResult {
  user: User;
  /** The raw session token. Goes into the cookie, and nowhere else. */
  sessionToken: string;
  expiresAt: Date;
}

export interface AuthService {
  register(input: RegisterBody, userAgent: string | null): Promise<AuthResult>;
  /** Returns who a session token belongs to, or null if it's unknown or expired. */
  authenticate(sessionToken: string): Promise<{ userId: string; sessionId: string } | null>;
  // Challenges add: login, logout, changePassword
}

export function createAuthService(deps: {
  users: UsersRepository;
  sessions: SessionsRepository;
  clock: Clock;
  sessionTtlDays: number;
}): AuthService {
  const { users, sessions, clock, sessionTtlDays } = deps;

  /** Creates a session row and returns the raw token for the cookie. */
  async function startSession(userId: string, userAgent: string | null) {
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(clock.now().getTime() + sessionTtlDays * 24 * 60 * 60 * 1000);
    await sessions.create({
      userId,
      tokenHash: hashSessionToken(sessionToken),
      expiresAt: expiresAt.toISOString(),
      userAgent,
    });
    return { sessionToken, expiresAt };
  }

  return {
    async register(input, userAgent) {
      const existing = await users.findByEmailWithPasswordHash(input.email);
      if (existing) {
        throw new ConflictError("An account with that email already exists");
      }

      const passwordHash = await hashPassword(input.password);
      const user = await users.create({
        email: input.email,
        displayName: input.displayName,
        timezone: input.timezone,
        dailyStepGoal: input.dailyStepGoal,
        passwordHash,
      });

      const session = await startSession(user.id, userAgent);
      return { user, ...session };
    },

    async authenticate(sessionToken) {
      return sessions.findActiveUserId(hashSessionToken(sessionToken), clock.now().toISOString());
    },
  };
}
```

- **`startSession` is a private helper** (not in the returned object). Login will reuse it in Challenge 1.
- **The expiry comes from the injected clock**, so a test can register at a fixed time and then check the session is rejected 31 days later.
- **The duplicate-email check gives a friendly 409**, and the database's `UNIQUE` constraint is the real guarantee if two registrations race (translated to the same 409 by `UNIQUE_MESSAGES`).
- **About that 409:** it does tell a visitor "this email has an account." Many apps accept that for registration (users need to know), while making *login* reveal nothing. You'll weigh this in the security review (Challenge 8).

## 3.7 `src/modules/auth/cookies.ts`

```ts
import type { CookieOptions, Response } from "express";
import { config } from "../../config.js";

export const SESSION_COOKIE = "fittrack_session";

function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true, // JavaScript in the browser can't read it → XSS can't steal it
    secure: config.COOKIE_SECURE, // only sent over HTTPS (true in production)
    sameSite: "lax", // not sent on cross-site subrequests → blocks most CSRF
    path: "/",
  };
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(SESSION_COOKIE, token, { ...sessionCookieOptions(), expires: expiresAt });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
}
```

Clearing a cookie requires the **same** path and flags it was set with, which is why both functions share `sessionCookieOptions()`.

## 3.8 `src/modules/auth/auth.routes.ts`

```ts
import express, { type Router } from "express";
import { RegisterBody } from "./auth.schemas.js";
import type { AuthService } from "./auth.service.js";
import { setSessionCookie } from "./cookies.js";

export function createAuthRouter(service: AuthService): Router {
  const router = express.Router();

  // POST /v1/auth/register  → 201 + Set-Cookie + the new user
  router.post("/register", async (req, res) => {
    const body = RegisterBody.parse(req.body);
    const result = await service.register(body, req.get("user-agent") ?? null);

    setSessionCookie(res, result.sessionToken, result.expiresAt);
    res.status(201).json(result.user);
  });

  // Challenges add: POST /login, POST /logout, GET /me, POST /password

  return router;
}
```

The route stays thin: parse → call the service → set the cookie → respond. The raw token goes into the `Set-Cookie` header and **nowhere else**: not the body, not the logs.

## 3.9 `src/middleware/require-auth.ts` and `src/shared/current-user.ts`

```ts
import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AuthService } from "../modules/auth/auth.service.js";
import { SESSION_COOKIE } from "../modules/auth/cookies.js";
import { UnauthorizedError } from "../shared/errors.js";

/** Builds the middleware that every protected router sits behind. */
export function createRequireAuth(authService: AuthService): RequestHandler {
  return async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof token !== "string" || token.length === 0) {
      throw new UnauthorizedError();
    }

    const session = await authService.authenticate(token);
    if (!session) {
      throw new UnauthorizedError(); // unknown, logged out, or expired
    }

    res.locals.userId = session.userId;
    res.locals.sessionId = session.sessionId;
    res.locals.log = res.locals.log.child({ userId: session.userId });
    next();
  };
}
```

```ts
import type { Response } from "express";

/**
 * The logged-in user's ID, set by requireAuth. Throws if it's missing, which can only
 * mean a route was mounted without requireAuth: a programmer error, so it becomes a 500.
 */
export function getUserId(res: Response): string {
  const userId = res.locals.userId;
  if (typeof userId !== "string") {
    throw new Error("getUserId() called on a route that is not behind requireAuth");
  }
  return userId;
}
```

Add the new fields to `res.locals` in **`src/types/express.d.ts`**:

```ts
      /** Set by requireAuth on protected routes. Read it with getUserId(res). */
      userId?: string;
      /** The current session's ID, set by requireAuth. */
      sessionId?: string;
```

- **`createRequireAuth(authService)` is a factory** that returns middleware. The middleware needs the auth service, and this is how it gets it without importing a specific instance.
- **`throw new UnauthorizedError()`** inside async middleware: Express 5 forwards it to the error handler → 401 problem+json.
- **The child logger gains `userId`**, so every log line after authentication says *who* made the request (an ID, never an email).
- **`getUserId(res)` throws a plain `Error` (→ 500) if `userId` is missing.** That can only happen if someone mounted a route without `requireAuth`. That's a bug in your code, not a client mistake, so it shouldn't look like a normal 401.

## 3.10 Wiring: `app.ts` and `composition.ts`

**`src/app.ts`** (the changed parts):

```ts
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { createRequireAuth } from "./middleware/require-auth.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import type { AuthService } from "./modules/auth/auth.service.js";

export interface AppDeps {
  db: Queryable;
  authService: AuthService;
  stepsService: StepsService;
  // ...
}

export function buildApp(deps: AppDeps): Express {
  const app = express();

  app.use(requestContext);
  app.use(helmet());
  app.use(cookieParser());
  app.use(requireJsonBody);
  app.use(express.json({ limit: config.BODY_LIMIT }));

  // /health stays public

  const requireAuth = createRequireAuth(deps.authService);

  // Public routes
  app.use("/v1/auth", createAuthRouter(deps.authService));

  // Protected routes: requireAuth runs first for every request under these prefixes
  app.use("/v1/steps", requireAuth, createStepsRouter(deps.stepsService));
  // Challenge 2 puts exercises, workouts, sets, and stats behind requireAuth too

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
```

**`src/composition.ts`** (the new parts):

```ts
import { config } from "./config.js";
import { createAuthService } from "./modules/auth/auth.service.js";
import { createPgSessionsRepository } from "./modules/auth/sessions.pg-repo.js";
import { createPgUsersRepository } from "./modules/users/users.pg-repo.js";
// ...
  const usersRepo = createPgUsersRepository(pool);
  const sessionsRepo = createPgSessionsRepository(pool);
  // ...
  const authService = createAuthService({
    users: usersRepo,
    sessions: sessionsRepo,
    clock,
    sessionTtlDays: config.SESSION_TTL_DAYS,
  });
  // ...
  return { db: pool, authService, stepsService /* , ... */ };
```

## 3.11 Steps, now behind login

In `steps.routes.ts`, replace the `DEV_USER_ID` import with `import { getUserId } from "../../shared/current-user.js";` and every `DEV_USER_ID` argument with **`getUserId(res)`**:

```ts
router.put("/:date", async (req, res) => {
  const params = StepsDateParams.parse(req.params);
  const body = PutStepsBody.parse(req.body);

  const result = await service.setDay(getUserId(res), params.date, body.steps);
  // ...the rest is unchanged
});
```

✅ **Try it** (curl's `-c jar.txt` saves cookies; `-b jar.txt` sends them back)

```bash
curl -i localhost:3000/v1/steps/2026-10-11                               # 401: not logged in

curl -i -c jar.txt -X POST localhost:3000/v1/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"  Mathew@Example.com ","password":"correct horse battery staple","displayName":"Mathew","timezone":"America/Los_Angeles"}'
# 201, and a header like:
# Set-Cookie: fittrack_session=biZG5I…; Path=/; Expires=…; HttpOnly; SameSite=Lax
# The body's email is "mathew@example.com": trimmed and lowercased. No password hash anywhere.

curl -i -b jar.txt -X PUT localhost:3000/v1/steps/2026-10-11 -H 'Content-Type: application/json' -d '{"steps":9412}'   # 201
curl -i -b jar.txt localhost:3000/v1/steps/2026-10-11                    # 200
curl -i -b 'fittrack_session=forged' localhost:3000/v1/steps/2026-10-11  # 401
curl -sI localhost:3000/health | grep -i -E 'content-security|nosniff|x-powered'   # helmet's headers; no X-Powered-By
```

In `psql`: `SELECT user_id, length(token_hash), expires_at FROM sessions;` The stored hash is 64 hex characters. **Compare it with the cookie value in `jar.txt`: they're completely different.**

Add `jar.txt` to `.gitignore`.

```bash
git add -A && git commit -m "feat(auth): registration, sessions, requireAuth"
```

---

# Part 4 — 🧰 Toolbox

## 4.1 Login without leaking information

```ts
// Computed once, the first time it's needed: a real argon2 hash of a throwaway password.
let dummyHashPromise: Promise<string> | undefined;
function getDummyHash(): Promise<string> {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword("this-is-not-anyone's-password");
  }
  return dummyHashPromise;
}

// In login: when there's no such user (or no password set), STILL run a verify,
// so "unknown email" takes as long as "wrong password".
const user = await users.findByEmailWithPasswordHash(input.email);
const hashToCheck = user?.passwordHash ?? (await getDummyHash());
const passwordMatches = await verifyPassword(hashToCheck, input.password);
if (!user || !user.passwordHash || !passwordMatches) {
  throw new UnauthorizedError("Invalid email or password");   // the SAME message for every failure
}
```

## 4.2 A 429 error that carries `Retry-After`

```ts
// src/shared/errors.ts
export class TooManyRequestsError extends AppError {
  readonly retryAfterSeconds: number;
  constructor(retryAfterSeconds: number) {
    super({ status: 429, slug: "rate-limited", title: "Too many requests",
            detail: "Too many attempts. Try again later." });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// In the error handler's AppError branch, before sending:
if (knownError instanceof TooManyRequestsError) {
  res.set("Retry-After", String(knownError.retryAfterSeconds));
}
```

## 4.3 Rate-limiter building blocks

```ts
// A fixed-window counter: "at most LIMIT failures per WINDOW, per key"
interface Counter {
  count: number;
  windowEndsAtMs: number;
}
const counters = new Map<string, Counter>();     // key: "ip:1.2.3.4" or "email:mathew@example.com"

const nowMs = clock.now().getTime();
const existing = counters.get(key);
if (existing === undefined || existing.windowEndsAtMs <= nowMs) {
  // first failure, or the old window is over: start a new window
} else {
  // inside the window: add to the count
}
const retryAfterSeconds = Math.ceil((counter.windowEndsAtMs - nowMs) / 1000);

req.ip                     // the client's IP (Module 10 makes this correct behind a proxy)
```

Design it as a small object with an interface, for example:

```ts
export interface LoginRateLimiter {
  /** Throws TooManyRequestsError if this IP or this email is currently blocked. */
  assertAllowed(ip: string, email: string): void;
  recordFailure(ip: string, email: string): void;
  recordSuccess(ip: string, email: string): void;   // resets the email's counter
}
```

That interface is exactly what Module 08 reimplements with Redis, without touching the login route.

## 4.4 Tests with real logins

```ts
import { randomUUID } from "node:crypto";
import request from "supertest";
import type { Express } from "express";

/** Registers a brand-new user and returns an agent that keeps their session cookie. */
export async function registerUser(app: Express, overrides: Record<string, unknown> = {}) {
  const agent = request.agent(app);                  // an agent stores cookies between requests
  const res = await agent.post("/v1/auth/register").send({
    email: `user-${randomUUID()}@example.com`,       // unique per test: no collisions, ever
    password: "correct horse battery staple",
    displayName: "Test User",
    timezone: "America/Los_Angeles",
    ...overrides,
  });
  if (res.status !== 201) {
    throw new Error(`registerUser failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { agent, user: res.body as { id: string; email: string } };
}

// Usage
const alice = await registerUser(app);
const bob = await registerUser(app);
await alice.agent.post("/v1/workouts").send({ … });               // sent with Alice's cookie
const res = await bob.agent.get(`/v1/workouts/${aliceWorkoutId}`); // sent with Bob's cookie
```

**With a unique user per test, tests no longer need to reset the database**, because nothing one test does is visible to another user. You can delete `resetDatabase()` from your `beforeEach` hooks, update the factories to take a `userId` (no more `DEV_USER_ID` default), and set `fileParallelism: true` in `vitest.config.ts`. The whole suite gets faster, and it now *proves* user isolation on every run.

## 4.5 Reading and clearing cookies

```ts
req.cookies[SESSION_COOKIE]             // set by cookie-parser; may be undefined
clearSessionCookie(res);                 // from cookies.ts
res.headers["set-cookie"]                // in a Supertest response: an array of Set-Cookie strings
```

---

# Part 5 — 🧩 Challenges

## Challenge 1: Login, logout, me, and password change ★★☆

| Endpoint | Auth | Behavior |
|---|---|---|
| `POST /v1/auth/login` | public | Body `{ email, password }` (`LoginBody`). Success → **200** + a **new** session cookie + the user. Any failure (unknown email, wrong password, no password set) → **401 "Invalid email or password"**, taking about the same time (toolbox 4.1). |
| `POST /v1/auth/logout` | public | If there's a session cookie, delete that session row. Always clear the cookie. Always **204**: logging out twice is fine. |
| `GET /v1/auth/me` | required | **200** with the current user (no hash). |
| `POST /v1/auth/password` | required | Body `{ currentPassword, newPassword }` (the new one follows `NewPassword`'s rules). Wrong current password → 401. Success → update the hash, **delete every other session of this user** (keep the current one), **204**. |

You'll need `updatePasswordHash(userId, hash)` on the users repository, and to use `deleteAllForUserExcept`.

✅ **Acceptance (as integration tests):**
1. Register, log out, then log in → 200 and a new cookie that works on `GET /v1/auth/me`.
2. A wrong password and an unknown email produce the **same** `status`, `title`, and `detail` (only `requestId` differs).
3. After logout, the *old* cookie gets 401 on `/v1/auth/me`.
4. Log in on two agents (two "devices"). Change the password on agent 1. → Agent 1 still works; **agent 2 gets 401**; the old password no longer logs in; the new one does.
5. No response from any auth endpoint contains `passwordHash`, `password_hash`, or the word `argon2`.
6. **Session expiry:** with a movable test clock, log in, move the clock 31 days ahead → 401.

<details><summary>💡 Hint 1</summary>

Login is `register` without the create step: find the user (with hash) → verify (toolbox 4.1) → `startSession`. Logout doesn't need `requireAuth`: read the cookie yourself, and if it's there, `deleteByTokenHash(hashSessionToken(token))`.
</details>

<details><summary>💡 Hint 2</summary>

For password change, the route gets the user ID from `getUserId(res)` and the current session from `res.locals.sessionId`, and passes both to the service. The service needs the user *with* the hash to verify the current password. You can look it up by email via `findById` + `findByEmailWithPasswordHash`, or add a `findByIdWithPasswordHash`.
</details>

<details><summary>💡 Hint 3: test 6</summary>

Build the test app with `createTestClock(...)` instead of `fixedClock`. That means `buildTestApp` needs to accept a `Clock`. Change its signature to `buildTestApp({ clock })`, and keep a small wrapper for the `{ now }` form.
</details>

---

## Challenge 2: Every route behind authentication ★★☆

1. Put `requireAuth` in front of the exercises, workouts, sets, and stats routers in `app.ts`.
2. Replace **every** `DEV_USER_ID` in routes with `getUserId(res)`.
3. Delete `src/shared/dev-user.ts` if nothing else uses it, or keep it only for the seed script.
4. **Update the seed script:** the dev user gets a password from a new optional config value `SEED_PASSWORD`, hashed with `hashPassword`. Print the email to log in with.
5. **Update the tests:** use `registerUser` (toolbox 4.4) everywhere, and switch to "unique user per test."

✅ **Done when:**

```bash
grep -rn "DEV_USER_ID" src     # only the seed script, or nothing
npm test                        # green, with fileParallelism enabled
```

And every protected endpoint returns 401 without a cookie (write one table-driven test that checks every protected method + path).

<details><summary>💡 Hint</summary>

For the table-driven 401 test, list `[method, path]` pairs and use `it.each`. Supertest's `request(app)[method](path)` works with `method` as `"get" | "post" | "put" | "patch" | "delete"`.
</details>

---

## Challenge 3: User settings ★☆☆

`PATCH /v1/auth/me` with optional `displayName`, `timezone` (validated with `isValidTimeZone`), and `dailyStepGoal`. At least one field; strict schema. Your streak and stats endpoints use the timezone and goal, so write one integration test proving that changing the goal changes `GET /v1/stats/streak`.

---

## Challenge 4: Use the user's timezone for "future" dates ★★☆ (stretch)

Module 02's steps rule allowed "tomorrow in UTC" because the timezone was unknown. Now it's known. Change `setDay` so the latest allowed date is **today in the user's timezone** (`localDateOf`, Module 06). The service needs the user's timezone: decide whether it reads it from the users repository or the route passes it in, and record your reasoning. Update the unit tests: a user in `America/Los_Angeles` at `2026-10-12T05:00:00Z` (Oct 11, 10pm local) must **not** be able to log Oct 12 yet.

---

## Challenge 5: Delete my account ★★☆

`DELETE /v1/auth/me` with body `{ password }`. Verify the password, delete the user (the cascades remove everything they own, including sessions), clear the cookie, 204. Integration test: afterwards, the old cookie gets 401, and logging in again fails.

---

## Challenge 6: The IDOR test suite ★★★

Create `tests/integration/authorization.test.ts`. Register **Alice** and **Bob**. Alice creates one of everything: a step day, a custom exercise, a strength workout, and a set in it. Then, as Bob:

| Bob tries to… | Expect | And then check |
|---|---|---|
| `GET` Alice's workout, set, and custom exercise by ID | 404 each | |
| `PATCH` each of them | 404 each | Alice's data is unchanged (read it back as Alice) |
| `DELETE` each of them | 404 each | Alice's data still exists |
| `GET /v1/steps/<Alice's date>` | 404 | |
| Add a set to **Alice's** workout | 404 | Alice's workout still has 1 set |
| Use Alice's custom exercise ID in a set on **his own** workout | 422 | |
| List workouts, exercises, steps, stats | Only his own data (none of Alice's) | |
| Send `"userId": "<Alice's id>"` in a create body | 400 (strict schema) | |

✅ **Done when:** every row is a passing test. Then, **break one query on purpose** (remove `AND user_id = $2` from the workouts `findById`) and confirm this suite catches it.

---

## Challenge 7: Rate-limit login ★★☆

Implement the `LoginRateLimiter` interface from toolbox 4.3, in memory:
- At most **5 failed logins per 15 minutes per IP**, and **per email** (separate counters).
- A blocked request gets **429** with a `Retry-After` header, **before** any password check (don't even spend the CPU on argon2).
- A successful login resets that email's counter.
- Inject the clock, so tests can move time forward instead of waiting 15 minutes.

✅ **Acceptance (integration tests):** 5 wrong passwords → 401 × 5; the 6th → 429 with `Retry-After`; the *correct* password is also refused while blocked (429); 15 minutes later (move the clock) → login works.

<details><summary>💡 Hint</summary>

Keep the counters in a `Map` inside a factory function (`createMemoryLoginRateLimiter({ clock, limit, windowMs })`). Put the limiter in `AppDeps` (or the auth service's dependencies). In tests, build it with a movable clock.
</details>

---

## Challenge 8: Security review ★★☆

1. **OWASP walk-through.** Go through the table in 1.11 against *your* code. For each row, write in the tracker: status (✅ / ⚠️ / ❌), evidence (a file, a test, a header), and any fix you made.
2. **Inventory:** list every route (`method path`). Is there anything left over from earlier modules (`/boom`, `/block`, `/echo`)? Delete it.
3. **Decisions:** record in the decisions log: sessions vs. JWTs (your reasoning), the session lifetime, the rate-limit values, 404 vs. 403 for other users' data, and whether registration may reveal an existing email.
4. **Response audit:** one test that calls every endpoint as a logged-in user and asserts that no response body contains `password`, `hash`, or `token`.

```bash
git add -A && git commit -m "feat(auth): login, logout, password change, rate limiting, IDOR suite"
```

---

## Definition of done

- [ ] Every user-data route is behind `requireAuth`, and every user-data query has a `user_id` condition.
- [ ] `DEV_USER_ID` is gone from routes.
- [ ] Passwords are argon2id; session tokens are random, hashed at rest, and sent only in an `HttpOnly`, `SameSite=Lax` cookie.
- [ ] Logout and password change revoke sessions immediately (tested).
- [ ] The IDOR suite passes and catches a deliberately broken query.
- [ ] Login is rate-limited with 429 + `Retry-After` (tested).
- [ ] No password, hash, or token appears in any log line or response.
- [ ] The tests use a unique user per test and run in parallel.

---

## ✍️ Checkpoint

1. Explain authentication vs. authorization, using an example from your API for each. Which status code does each failure get?
2. Why is `SHA-256(salt + password)` a bad password hash? What do argon2id and bcrypt do differently?
3. Why store a hash of the session token instead of the token itself? Why is a fast hash acceptable *here* but not for passwords?
4. Give two advantages each of sessions and JWTs. Why did this app choose sessions?
5. Explain each cookie flag you set and the attack it mitigates.
6. What is IDOR/BOLA? Show the vulnerable query and the fixed query for `GET /v1/workouts/:id`. Where does the user ID come from?
7. Should accessing another user's workout return 403 or 404? Defend your answer.
8. Your login responds "No account with that email" in one case and "Wrong password" in another. What's the problem? And why does your login run argon2 even when the email doesn't exist?
9. Why doesn't CORS protect your API from a malicious script or `curl`? What *does* protect you from CSRF in this app?
10. A user changes their password because they think their account was compromised. What must the backend do with existing sessions, and why?

**Explain it back:** Walk through the full flow of login → an authenticated request → logout. Describe what's in the database and in the cookie at each step.

---

## 📋 Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Progress
- [ ] Part 1: Concepts read (1.1–1.11)
- [ ] Part 2: Packages, migration, config, error class
- [ ] Part 3: Registration + sessions + requireAuth; steps behind login
- [ ] Challenge 1: Login, logout, me, password change
- [ ] Challenge 2: Every route behind auth; tests on real users
- [ ] Challenge 3: User settings
- [ ] Challenge 4: Timezone-aware "future" rule (stretch)
- [ ] Challenge 5: Delete my account
- [ ] Challenge 6: IDOR suite
- [ ] Challenge 7: Login rate limiting
- [ ] Challenge 8: Security review
- [ ] Checkpoint passed (≥ 8/10)

### Concepts I can explain without notes
- [ ] AuthN vs. AuthZ; 401 vs. 403 vs. 404 (1.1)
- [ ] The session flow (1.2)
- [ ] Password hashing with argon2id; no-leak login (1.3)
- [ ] Why session tokens are hashed at rest (1.4)
- [ ] Sessions vs. JWTs (1.5)
- [ ] Cookie flags (1.6)
- [ ] CSRF and its defenses (1.7)
- [ ] IDOR/BOLA (1.8)
- [ ] Rate limiting (1.9)
- [ ] Hardening: headers, no hashes in responses, limits, CORS's real role, secrets (1.10)
- [ ] OWASP API Top 10 (1.11)

### OWASP self-review (Challenge 8)
| # | Risk | Status | Evidence / fix |
|---|---|---|---|
| 1 | BOLA | | |
| 2 | Broken authentication | | |
| 3 | Property-level authorization | | |
| 4 | Resource consumption | | |
| 5 | Function-level authorization | | |
| 6 | Sensitive business flows | | |
| 7 | SSRF | | |
| 8 | Misconfiguration | | |
| 9 | Inventory management | | |
| 10 | Unsafe API consumption | | |

### Route inventory (Challenge 8)
| Method | Path | Auth? | Notes |
|---|---|---|---|
| | | | |

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
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP Session Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP API Security Top 10 (2023): https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- The Copenhagen Book (a practical guide to implementing auth): https://thecopenhagenbook.com/
- MDN, Using HTTP cookies: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
- node-argon2: https://github.com/ranisalt/node-argon2
- helmet: https://helmetjs.github.io/
