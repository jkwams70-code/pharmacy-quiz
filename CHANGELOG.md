# Changelog

## [1.1.0] - 2026-02-23
- Fixed admin dashboard tab behavior and export authentication flow.
- Added admin question edit workflow in `admin/index.html`.
- Hardened backend config validation for production env.
- Added CORS allowlist parsing and API rate limiter.
- Added log files (`access.log`, `error.log`, `admin-access.log`).
- Blocked `/backend/*` static exposure.
- Added backup and cleanup scripts.
- Added PM2 ecosystem configuration and scripts.
- Added operations documentation set (admin/user/troubleshooting/runbook/rollback).
