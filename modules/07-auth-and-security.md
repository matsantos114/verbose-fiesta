# Module 07: Authentication, Authorization & Security

| | |
|---|---|
| **Status** | ⬜ Not started |
| **Estimated time** | 10–12 hours |
| **Prerequisites** | Module 06 |
| **Project milestone** | Register / login / logout / me with server-side sessions; every query scoped to the logged-in user; IDOR test suite; rate-limited login; an OWASP self-review |

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
