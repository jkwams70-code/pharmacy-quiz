# Admin Guide

## Access
- URL: `/admin`
- Enter `ADMIN_KEY` from `Quiz/backend/.env`.

## Daily Actions
- View platform stats on `Stats` tab.
- Manage users on `Users` tab.
- Manage questions on `Questions` tab (create/edit/delete).
- Export data from `Export` tab (JSON/CSV).

## Sensitive Operations
- `Seed Questions` reloads from `Quiz/data.js`.
- `Reset System` deletes users/attempts/sync data and reseeds questions.
- Always run `npm run backup` before reset.

## Admin Security
- Rotate `ADMIN_KEY` regularly.
- Share key only with authorized admins.
- Review `Quiz/backend/logs/admin-access.log`.

## Incident Steps
1. Check backend health: `GET /api/health`.
2. Check API logs: `Quiz/backend/logs/access.log` and `error.log`.
3. Restore from latest backup in `Quiz/backend/backups/`.
