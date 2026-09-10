# Preview Workflow

Use `www` as the source of truth for local UI work.

See [CANONICAL_WORKSPACE.md](CANONICAL_WORKSPACE.md) for the recovered workspace baseline, test command, and outstanding verification findings.

## Edit here

- `www/index.html`
- `www/engine.js`
- `www/styles.css`

## Run the preview

- `start-local-preview.cmd`
- or `start-local-preview.ps1`

## What the preview serves

- Frontend: `http://localhost:8000`
- Backend API: `http://localhost:4000`

## Rule of thumb

- If you want to see a UI change immediately, edit the `www` files only.
- Treat the root-level copies as supporting mirrors for other builds and exports.

## Deployment note

- This does not hurt live deployment.
- The deploy scripts already sync from `www`:
  - `scripts/vps-deploy.sh`
  - `scripts/deploy-push.ps1`
  - `scripts/publish-release.ps1`
- So if you commit and push `www` changes, the VPS pull/deploy flow should pick them up from the same place.
- Only edit root-level copies if you are intentionally changing a separate build target or legacy mirror.
