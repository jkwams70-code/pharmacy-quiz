# Deployment Completion Checklist (Execution)

Use this file as the live go/no-go checklist. Mark each item only after evidence is collected.

## A) Security Hardening

- [x] Forgot-password endpoint no longer returns reset code by default.
- [x] Forgot-password logs no longer contain raw reset code or contact.
- [x] Added `EXPOSE_RESET_CODE=false` in env template for safe default.
- [x] Set strong `JWT_SECRET` in production `.env` (>= 32 chars).
- [x] Set strong `ADMIN_KEY` in production `.env` (>= 20 chars).
- [x] Set `NODE_ENV=production`.
- [x] Set `CORS_ORIGIN` to exact frontend domain(s), never `*`.
- [x] Set `TRUST_PROXY=true` when behind Nginx/Cloud proxy.

## B) Data Reliability

- [ ] Confirm persistent storage for `backend/data` on your host (volume/disk mount).
- [x] Keep one backend instance if using JSON file store.
- [ ] Run and verify backup job (`npm run backup`) on deployed host.
- [ ] Test restore procedure from backup copy.

## C) Runtime and Networking

- [ ] Backend starts cleanly in production mode.
- [ ] Frontend and admin load from deployed domain.
- [ ] `/api/health` returns HTTP 200 over HTTPS.
- [ ] Admin endpoint `/api/admin/stats` works with `x-admin-key`.
- [ ] HTTP redirects to HTTPS (if TLS enforced at edge/proxy).

## D) End-to-End Functional Smoke

- [x] Register user.
- [x] Login user.
- [x] Start attempt, answer questions, finish attempt.
- [x] Dashboard/history reflects new attempt.
- [x] Admin can add/edit/delete question.
- [x] Admin export works (JSON and CSV).

## E) Verification Commands

Run from `Quiz/backend`:

```bash
npm run preflight:prod
npm run smoke
npm run smoke:ui
npm run security:audit
npm run validate:data
```

Optional hardening checks:

```bash
npm run smoke:mem
npm run smoke:https
```

## F) Release Sign-Off

- [ ] All critical checklist items completed.
- [ ] Backup snapshot taken pre-launch.
- [ ] Rollback plan confirmed.
- [ ] Monitoring/log review completed after launch.

## G) Local Verification Evidence (Completed: 2026-02-26)

- [x] `node --check backend/src/server.js`
- [x] `node --check backend/src/config.js`
- [x] `node --check engine.js`
- [x] `node --check backend/src/scripts/preflightProduction.js`
- [x] `node --check backend/src/scripts/generateSecrets.js`
- [x] `node --check backend/src/scripts/repairDataRelations.js`
- [x] `cmd /c npm --prefix backend run smoke` passed end-to-end.
- [x] `cmd /c npm --prefix backend run smoke:ui` passed (quiz, admin, mobile layout).
- [x] `cmd /c npm --prefix backend run smoke:mem` passed.
- [x] `cmd /c npm --prefix backend run security:audit` passed (0 vulnerabilities).
- [x] `cmd /c npm --prefix backend run repair:data` executed.
- [x] `cmd /c npm --prefix backend run validate:data` passed.
- [x] `cmd /c npm --prefix backend run preflight:prod` fully passed.

## H) Outstanding Production Blockers

- [x] Replace localhost entries in `CORS_ORIGIN` with real internet domain origin(s).
- [ ] Confirm persistent disk/volume mapping for `backend/data` on host.

Deployment date: __________
Verified by: __________

