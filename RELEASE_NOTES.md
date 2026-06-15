# Release Notes - v1.1.0 (2026-02-23)

## Highlights
- Production hardening for backend security and reliability.
- Admin panel stability fixes and edit workflow completion.
- Backup, cleanup, and process-management tooling.

## New Operational Commands
- `npm run backup`
- `npm run cleanup`
- `npm run smoke`
- `npm run pm2:start`
- `npm run pm2:status`

## Upgrade Notes
- Restart backend to load new `.env` keys/settings.
- Review `CORS_ORIGIN` to match deployed frontend domains.
- Configure PM2 startup on host (`pm2 startup` + `pm2 save`).

## Risk Notes
- `POST /api/admin/reset` remains destructive by design.
- Ensure backups exist before reset or migration.
