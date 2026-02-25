# Restore Drill Log

Use this log for each backup restoration test.

## Drill Metadata
- Date:
- Performed by:
- Environment (local/staging/production-like):
- Backup folder used:
- Backend version:

## Pre-Drill Snapshot
- Current users count:
- Current attempts count:
- Current questions count:
- Current syncPerformance count:
- Current syncSessions count:

## Restore Steps
1. Selected backup folder in `Quiz/backend/backups/`.
2. Executed:
   - `powershell -ExecutionPolicy Bypass -File Quiz/backend/restore-from-backup.ps1 -BackupFolderName <folder>`
3. Restarted backend service.
4. Ran smoke checks:
   - `GET /api/health`
   - `GET /api/admin/stats`
   - `npm run smoke`

## Post-Drill Validation
- Users restored correctly: `YES/NO`
- Attempts restored correctly: `YES/NO`
- Questions restored correctly: `YES/NO`
- Sync data restored correctly: `YES/NO`
- Admin dashboard functional: `YES/NO`
- Quiz flow functional: `YES/NO`

## Outcome
- Drill status: `PASS/FAIL`
- Recovery time (minutes):
- Issues found:
- Corrective actions:
