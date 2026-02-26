# Pharmacy Quiz Backend

This backend adds persistent server-side APIs for:
- authentication (`register`, `login`, `me`)
- question bank + categories
- exam/study attempt lifecycle
- history + dashboard metrics
- sync endpoints used by the current frontend

## 1) Install

```bash
cd Quiz/backend
npm install
```

## 2) Configure

Copy `.env.example` to `.env` and set at least:

```env
PORT=4000
JWT_SECRET=replace-with-a-random-secret
ENABLE_GZIP=true
HTTPS_ENABLED=false
EXPOSE_RESET_CODE=false
AI_FREE_PROVIDER=openrouter
OPENROUTER_API_KEY=replace-with-openrouter-key
```

`EXPOSE_RESET_CODE` should stay `false` for internet deployments.
Set it to `true` only for local debugging when you need the reset code echoed in API responses.

For production values, start from `.env.production.example`.

## 3) Run

```bash
npm run dev
```

On first startup, questions are auto-seeded from `Quiz/data.js`.

## 4) Frontend

The frontend sends sync events to:

`http://localhost:4000/api`

If your backend runs on a different host/port, set in browser console once:

```js
localStorage.setItem("quizApiBase", "http://localhost:4000/api");
```

Then reload the quiz page.

## 5) Operations Scripts

```bash
npm run backup          # Create timestamped backup of data files
npm run cleanup         # Remove old runtime logs/backups
npm run cleanup:users   # Remove inactive users with no activity history
npm run validate:data   # Validate user/question/sync data references
npm run repair:data     # Repair orphaned user/question references in stored data
npm run renumber:questions        # Dry-run one-time question ID remap plan
npm run renumber:questions:apply  # Apply one-time ID remap (with automatic backup + id-map file)
npm run preflight:prod  # Strict production env readiness checks
npm run secrets:generate # Print secure JWT_SECRET and ADMIN_KEY values
npm run smoke           # API smoke tests
npm run smoke:ui        # Headless UI smoke tests (quiz + admin)
npm run smoke:firefox   # Firefox desktop smoke (headless page render checks)
npm run smoke:mem       # Memory drift check under repeated API load
npm run cert:dev        # Generate local self-signed TLS certificate (Windows)
npm run smoke:https     # Verify HTTPS + HTTP->HTTPS redirect
npm run security:audit  # Dependency vulnerability audit
npm run security:outdated # Available dependency updates
```

## 6) Optional HTTPS (Local/Server)

Enable TLS in `.env`:

```env
HTTPS_ENABLED=true
HTTPS_ENFORCE=true
HTTPS_PORT=4443
HTTPS_PFX_PATH=./certs/localhost-dev.pfx
HTTPS_PFX_PASSPHRASE=your-passphrase
```

Generate local cert (Windows PowerShell):

```bash
npm run cert:dev
```
