# Canonical workspace verification

Verified on 2026-09-10. This file carries forward the recovered project context.

## Working location and history

- Sole working folder: C:\Users\John_Israel\Desktop\AJIX\AjiXPharmacy-Final.
- The pasted C:\Users\John\_Israel path does not exist on this machine.
- Do not use AjixPharmacy-mainmerge or the older AjixPharmacy folders.
- Branch: merge-main-publish.
- Origin: https://github.com/jkwams70-code/pharmacy-quiz.
- HEAD at verification: 14ce5c3 (Update application features and fixes).
- Recovery commit b118f0c is an ancestor of HEAD, followed by a19becf and 14ce5c3.
- The initial working tree was clean, with no unmerged index entries.
- Do not reset, clean, broadly restore files, or rebuild the app from scratch.
- No commits, pushes, deployment, or history changes were performed during verification.

## Active app

Use www as the frontend source of truth, as described in PREVIEW_WORKFLOW.md.
The backend serves this same www directory.

- Frontend: http://localhost:8000/.
- Backend: http://localhost:4000/.
- API health: http://localhost:4000/api/health returned HTTP 200 and status ok.
- Temporary unique marker requests proved that both running services serve this exact www directory. The marker was removed immediately afterward.
- Served frontend index.html, engine.js, and styles.css matched the canonical files byte for byte; the backend-served index matched too.
- www/index.html and www/styles.css exactly match b118f0c. Nine other www files include later committed changes; those changes were preserved.
- All 58 tracked JavaScript files checked under www and backend/src passed node --check.
- Headless Edge checks passed on both local URLs: landing-page entry opened authentication, switching to registration displayed the form, and the 390px mobile viewport had no horizontal overflow or uncaught JavaScript exceptions. External HTTPS requests were blocked for this local-only check; no account was created. Authenticated quiz, payment, external integrations, and full offline flows were not exercised by this browser check.

## Recovered local data

- backend/.env exists and is ignored by Git; secret values were not displayed.
- DB_PATH resolves to this workspace's backend/data. DATABASE_URL is not configured.
- The question bank contains exactly 2,241 questions with no duplicate question IDs.
- All 34 local JSON files parsed successfully. No duplicate user IDs were found.
- Read-only relationship checks found 6 attempts with missing user references, 50 question references in attempts that are absent from the current question bank, and 6 sync records with missing user references.
- These counts are references, not necessarily distinct missing users or questions.
- No recovered data was edited, renumbered, reseeded, repaired, or deleted by this verification. Investigate the historical references before choosing any data repair.

Do not commit backend/.env or backend/data. The backend ignore rule now covers the entire data directory, including non-JSON runtime files. However, backend/data/questions.json was already tracked in HEAD: ignore rules do not untrack it. Its content and index entry were left unchanged. Avoid broad staging; explicitly inspect the staged paths before any future commit. Any future untracking change needs to account for deployment behavior so that a pull cannot remove a deployed question bank.

## Foundation changes and testing

- Removed the unused, invalid quiz: file:.. dependency from the backend manifest, lockfile, and local installation. Removed its orphaned parent-package lock entry. Existing registry dependency versions were retained.
- npm ls --omit=dev --depth=0 --prefix backend now passes with all ten direct dependencies resolved.
- Added a sequential command for the existing account regression tests:

~~~powershell
npm test --prefix backend
~~~

The final run passed all 11 tests, including concurrent account writes, stale-write protection, corrupt-store behavior, shared file locking, registration/login overlap, backup, and restart persistence. Tests use isolated synthetic fixtures, not backend/data. Running the two test files concurrently initially produced a server startup timeout and a lock timeout on this machine; both passed separately and in the final sequential run. Runtime account-lock behavior was not changed.

## Remaining inherited issues

1. Git-tracked conflict marker lines remain in 35 root/legacy files, including README.md, deployment/runbook documents, root data.js, status.html, and root topics files. None were found in the active www or backend/src trees. These are committed file contents, not an active Git merge. Resolve them individually with historical context rather than restoring whole trees.
2. Seven backend npm commands reference five missing source files: repair:data; renumber:questions and renumber:questions:apply; questions:expand and questions:expand:apply; preflight:prod; secrets:generate. Their targets are repairDataRelations.js, renumberQuestionIds.js, generateQuestionExpansion.js, preflightProduction.js, and generateSecrets.js under backend/src/scripts. They were not executed or reconstructed.
3. The recovered data has the historical reference issues listed above. Preserve those records pending a targeted investigation.
4. backend/data/questions.json is already tracked. Do not include it in future commits under the current instruction.

The canonical location, active source, local services, question count, and account regression baseline are verified for continued local development. This is not a deployment-readiness approval. Keep deployment on hold while the inherited issues and any intended release changes are reviewed.
