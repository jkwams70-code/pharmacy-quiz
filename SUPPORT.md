# Support and Escalation

## Contacts
- Admin contact: `admin@example.com`
- Support email: `support@example.com`
- Infrastructure contact: `infra@example.com`

## Escalation Process
1. L1 triage (support): collect issue details and timestamps.
2. L2 application (admin/dev): validate via logs and API health.
3. L3 infrastructure: proxy/host/network remediation.

## Response Targets (SLA)
- Critical (service down): acknowledge within 15 minutes.
- High (major feature broken): acknowledge within 1 hour.
- Medium (degraded, workaround exists): acknowledge within 4 hours.
- Low (cosmetic/minor): acknowledge within 1 business day.

## Incident Artifacts
- Health endpoint output
- Recent `error.log` lines
- Request samples and timestamps
- Current deployment version
