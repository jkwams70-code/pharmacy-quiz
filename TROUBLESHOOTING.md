# Troubleshooting Guide

## Backend not starting
- Verify Node 18+: `node -v`
- Check env file: `Quiz/backend/.env`
- Check port conflicts on `4000`.
- Start manually: `cd Quiz/backend && npm run dev`

## Frontend cannot reach API
- Verify API health: `http://localhost:4000/api/health`
- Set API base in browser:
  - `localStorage.setItem("quizApiBase", "http://localhost:4000/api")`
- Reload page.

## Admin login fails
- Confirm `ADMIN_KEY` value in `Quiz/backend/.env`
- Restart backend after key changes.
- Check `Quiz/backend/logs/admin-access.log`.

## Export not downloading
- Re-authenticate in admin page.
- Confirm admin key header accepted via `/api/admin/stats`.

## Data recovery
1. Stop backend.
2. Copy latest backup from `Quiz/backend/backups/` into `Quiz/backend/data/`.
3. Restart backend and recheck `/api/health`.
