# Operations Runbook

## Daily Tasks
- Verify health endpoint: `/api/health`
- Check `logs/error.log` for new critical errors
- Confirm backup folder exists and latest timestamp is current

## Weekly Tasks
<<<<<<< HEAD
<<<<<<< HEAD
- Run API smoke tests: `cd AjixPharmacy/backend && npm run smoke`
=======
- Run API smoke tests: `cd Quiz/backend && npm run smoke`
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
=======
- Run API smoke tests: `cd Quiz/backend && npm run smoke`
>>>>>>> 6072f75 (Initial production-ready baseline + topic library updates)
- Review `admin-access.log` for suspicious activity
- Verify disk free space on deployment host

## Monthly Tasks
- Rotate `ADMIN_KEY`
- Rotate `JWT_SECRET` (planned maintenance)
- Run backup restore drill in staging/local
- Review CORS allowlist
- Review inactive-user cleanup results (`logs/maintenance.log`)

## Quarterly Tasks
- Dependency updates and security patches
- Review firewall/reverse-proxy settings
- Review monitoring thresholds and on-call process

## Annual Tasks
- Full security review
- Disaster recovery rehearsal
- Documentation review and refresh

## Emergency Procedure
1. Put system in maintenance mode (or stop writes).
2. Capture backup (`npm run backup`).
3. Investigate logs (`access.log`, `error.log`, `admin-access.log`).
4. Roll back using `ROLLBACK_PLAN.md`.
