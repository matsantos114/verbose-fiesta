# Module 07: Authentication, Authorization & Security

> 📝 **Outline version.** This module currently holds the syllabus: topics, milestone, and checkpoint. The 🎓 tutor prompt below expands it to full depth automatically the first time you use it (or ask Claude to **"Expand Module 07 to full depth"**). You'll get the same structure as Modules 01–02: in-depth reading, type-along setup, a complete worked example for each new pattern, a toolbox, and challenges with acceptance tests and hints. The "Build" list below shows what you'll build; the expanded version teaches you how.

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Content depth** | 📝 Outline (expand before starting) |
| **Estimated time** | 10–12 hours |
| **Prerequisites** | Module 06 |
| **Project milestone** | Register / login / logout / me with server-side sessions; every query scoped to the logged-in user; IDOR test suite; rate-limited login; an OWASP self-review |

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

## Why this matters
The moment your API is on the internet, people will probe it. Auth mistakes are among the most common and most damaging backend bugs. The most common one isn't broken crypto; it's forgetting to check *who owns the data*.

## Learning objectives
- Explain authentication vs authorization.
- Store passwords correctly, and explain why.
- Implement server-side sessions with secure cookies; compare them with JWTs and justify the choice.
- Understand CSRF, and how SameSite and request design mitigate it.
- Prevent IDOR/BOLA and mass assignment by construction.
- Rate-limit sensitive endpoints.
- Run a security review against the OWASP API Security Top 10.

---

## Learn

### 7.1 AuthN vs AuthZ
- **Authentication:** *who are you?* (login, sessions) → failure is **401**.
- **Authorization:** *are you allowed to do this?* (ownership, roles) → failure is **403**, or **404** when even revealing that the resource exists would leak information.

### 7.2 Password storage
- **Never** store plaintext passwords, and never use encryption you can reverse.
- **Fast hashes (SHA-256, MD5) are the wrong tool.** A GPU can try billions of guesses per second. A salt prevents precomputed tables, but it doesn't slow down guessing.
- **Use a slow, salted, memory-hard password hash: argon2id** (bcrypt is acceptable). The library embeds the salt and parameters in the hash string and compares safely.
- Login error messages: `Invalid email or password` for both cases. Saying "no account with that email" lets anyone discover who has an account.
- Normalize emails (trim, lowercase) before storing and looking them up.

### 7.3 Server-side sessions
1. On login, generate a random token: `crypto.randomBytes(32)`, base64url-encoded.
2. Store **a SHA-256 hash of the token** in `sessions(id, user_id, token_hash, created_at, expires_at)`. If the DB leaks, the hashes can't be used as cookies. (A fast hash is fine here, because a 256-bit random token can't be brute-forced.)
3. Send the **raw token** to the client in a cookie.
4. On each request: hash the cookie value → look up an unexpired session → attach the user to the request.
5. **Logout** deletes the row, so revocation is instant. A password change deletes all of the user's other sessions.

### 7.4 JWTs, and why we're not using them here
- A JWT is a signed, self-contained token: the server can verify it without a DB lookup.
- **The catch:** you can't easily revoke one before it expires. That leads to short-lived access tokens + refresh tokens + rotation + a revocation list, and at that point you've rebuilt sessions with extra steps.
- Storing tokens in `localStorage` exposes them to any XSS bug.
- JWTs fit better for service-to-service auth, third-party API access, or stateless verification across many independent services.
- **Decision for this app: sessions.** Confirm it in your decisions log, with your own reasoning.

### 7.5 Cookie flags
| Flag | What it does | Protects against |
|---|---|---|
| `HttpOnly` | JavaScript can't read the cookie | Token theft via XSS |
| `Secure` | Only sent over HTTPS | Interception on the network |
| `SameSite=Lax` | Not sent on cross-site subrequests (sent on top-level navigation) | Most CSRF |
| `Max-Age` / `Expires` | Lifetime | Stale sessions |
| `Path=/` | Scope | — |

In local dev over `http://localhost`, browsers relax some `Secure` behavior. Make it configurable, and verify the real behavior in M10.

### 7.6 CSRF
Browsers attach cookies automatically, so a malicious site could make your browser submit a request to your API. Mitigations:
- `SameSite=Lax` (or `Strict`).
- State-changing endpoints only accept `Content-Type: application/json`. A plain HTML form can't send that without a CORS preflight, which your API won't approve for unknown origins.
- For defense in depth: require a custom header, or use a CSRF token.
- `GET` must never change state.

### 7.7 Authorization: IDOR / BOLA
```sql
-- ❌ Any logged-in user can read any workout by guessing or enumerating IDs
SELECT * FROM workouts WHERE id = $1;

-- ✅ Ownership enforced in the query itself
SELECT * FROM workouts WHERE id = $1 AND user_id = $2;
```
- The `userId` **always comes from the session**, never from the URL, the body, or a header the client controls.
- Your M2 repository design (where every method takes `userId`) makes this structural, not something you have to remember.
- For another user's resource, return **404**: don't confirm that it exists.
- Nested resources (sets) must check ownership through their parent workout.
- Use a `requireAuth` middleware, and extend Express's `Request` type with `user` via declaration merging.

### 7.8 Rate limiting
- Login is a brute-force target. Limit it per IP **and** per account, e.g., 5 failures per 15 minutes → `429` with `Retry-After`.
- An in-memory limiter only works with a single instance. With two instances, each one counts separately. M8 moves the counter to Redis.
- Also limit expensive endpoints (stats, imports).

### 7.9 Other hardening
- Security headers via `helmet`.
- Body size limits (M1), `limit` caps (M2), and strict schemas (M3). Together these cover **"unrestricted resource consumption"** and **mass assignment**.
- **CORS is not a security boundary for your API.** Browsers enforce it; `curl` and scripts ignore it. It controls which *web pages* can read responses.
- Secrets live only in env vars. Rotate any secret that's ever committed; deleting the commit isn't enough.

### 7.10 OWASP API Security Top 10 (2023), mapped to this app
1. **Broken Object Level Authorization (BOLA)**: IDOR on workouts and sets → 7.7
2. **Broken Authentication**: weak sessions or hashing, no brute-force protection → 7.2–7.3, 7.8
3. **Broken Object Property Level Authorization**: mass assignment, over-returning fields like `password_hash` → M3, 7.9
4. **Unrestricted Resource Consumption**: no pagination caps or size limits → M1–M3
5. **Broken Function Level Authorization**: users editing built-in exercises → role checks
6. **Unrestricted Access to Sensitive Business Flows**: e.g., mass account creation → rate limits
7. **Server-Side Request Forgery**: relevant if you ever fetch URLs users supply (e.g., an import from a URL)
8. **Security Misconfiguration**: verbose errors, missing headers, default credentials
9. **Improper Inventory Management**: forgotten old endpoints or versions
10. **Unsafe Consumption of APIs**: trusting third-party responses without validation

---

## Build

- [ ] **B1** Migration: add `users.password_hash`, a case-insensitive unique email (normalize it, or use a unique index on `lower(email)`), and a `sessions` table with an index on `token_hash`.
- [ ] **B2** Build `POST /v1/auth/register`, `POST /v1/auth/login`, `POST /v1/auth/logout`, and `GET /v1/auth/me` using argon2id.
- [ ] **B3** Session tokens: random, hashed at rest, cookie flags from config, an expiry (e.g., 30 days), and optionally a sliding refresh.
- [ ] **B4** Add `requireAuth` middleware. **Remove the hardcoded dev user.** Every route gets the user from the session.
- [ ] **B5** **IDOR test suite:** user A cannot read, update, or delete user B's workouts, sets, steps, or custom exercises. Each attempt returns 404, and the data is unchanged.
- [ ] **B6** Rate-limit login per IP and per email → 429 with `Retry-After`. Include tests.
- [ ] **B7** Add `helmet`. Confirm `password_hash` never appears in any response (write a test for it).
- [ ] **B8** `POST /v1/auth/password`: verify the current password, set the new hash, and **delete every other session**.
- [ ] **B9** Walk through the OWASP API Top 10 against your API. Record findings and fixes in the table below.
- [ ] **B10** Update the decisions log: sessions vs JWT, and your rate limit values.

## Definition of done
- No route touches user data without `requireAuth`, and no query on user-owned data lacks a `user_id` condition.
- The IDOR suite passes for every resource type.
- Passwords and tokens never appear in logs or responses.
- Logout and password change revoke sessions immediately.

---

## Checkpoint

1. Explain authentication vs authorization, using an example from your API for each.
2. Why is `SHA-256(salt + password)` a bad password hash? What do argon2id and bcrypt do differently?
3. Why store a hash of the session token instead of the token itself? Why is a fast hash acceptable *here* but not for passwords?
4. Give two advantages each of sessions and JWTs. Why did this app choose sessions?
5. Explain each cookie flag you set and the attack it mitigates.
6. What is IDOR/BOLA? Show the vulnerable query and the fixed query for `GET /v1/workouts/:id`.
7. Should accessing another user's workout return 403 or 404? Defend your answer.
8. Your login responds "No account with that email" in one case and "Wrong password" in another. What's the problem?
9. Why doesn't CORS protect your API from a malicious script or `curl`?
10. A user changes their password because they think their account was compromised. What must the backend do with existing sessions, and why?

**Explain it back:** Walk through the full flow of login → an authenticated request → logout. Describe what's in the database and in the cookie at each step.

---

## Tracker

**Status:** ⬜ · **Started:** — · **Completed:** — · **Quiz score:** — / 10

### Concepts understood
- [ ] 7.1 AuthN vs AuthZ
- [ ] 7.2 Password hashing
- [ ] 7.3 Server-side sessions
- [ ] 7.4 JWT trade-offs
- [ ] 7.5 Cookie flags
- [ ] 7.6 CSRF
- [ ] 7.7 IDOR/BOLA and ownership
- [ ] 7.8 Rate limiting
- [ ] 7.9 Hardening (headers, limits, CORS's real role, secrets)
- [ ] 7.10 OWASP API Top 10

### OWASP self-review (B9)
| # | Risk | Status in my API | Fix / evidence |
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
- OWASP API Security Top 10: https://owasp.org/API-Security/
- The Copenhagen Book (practical auth guide): https://thecopenhagenbook.com/
- MDN, HTTP cookies: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
