# Rollback Plan

## Trigger Conditions
- Deployment causes repeated 5xx errors.
- Authentication/admin access broken after release.
- Data integrity checks fail.

## Pre-Rollback
1. Capture current backup: `cd Quiz/backend && npm run backup`
2. Save current logs.
3. Announce rollback start to stakeholders.

## Rollback Steps
1. Stop application process.
2. Revert to previous release artifact/commit.
3. Restore last known good `backend/data` backup if needed.
4. Start service and verify:
   - `/api/health`
   - `/api/admin/stats`
   - smoke tests (`npm run smoke`)

## Post-Rollback
- Document root cause.
- Record timeline and corrective actions.
- Create follow-up patch plan before next deploy.
