# Local Redesign Workflow

This redesign will be developed and reviewed locally first. Production should remain untouched until the new interface is approved screen by screen.

## Working Agreement

- We do not deploy redesign work while the current live app is still serving users.
- You stay involved in each phase before we move to the next one.
- We make changes locally, review them locally, refine them locally, and only discuss deployment after the redesign is stable.
- We avoid changes that would unintentionally affect the live product flow.

## Recommended Safe Workflow

### 1. Work Locally Only

All redesign work happens in the local project on your desktop.

Use the existing local setup:

- Frontend: local static server
- Backend: local Node server if needed for auth/data/API-backed testing

### 2. Keep Production Untouched

Production remains untouched because:

- We are not pushing a deployment as part of this redesign phase.
- We are redesigning iteratively and validating locally first.
- We only move to deployment planning after visual approval and QA.

### 3. Review Gate After Each Major Step

We should pause for your review after each of these:

1. Design system foundation
2. App shell
3. Home screen
4. Learner hub
5. Setup screens
6. Quiz screen
7. Results and dashboard
8. Topic library, profile, auth, and secondary flows

We do not treat a phase as complete until you have seen it locally and signed off to continue.

## Development Modes We Can Use

### Option A: Redesign In Place, Review Locally

We update the real app files locally:

- `index.html`
- `styles.css`
- `engine.js` only when necessary

Benefits:

- Fastest path
- Every change reflects the real app immediately
- No duplicate markup to maintain

Tradeoff:

- Your local app changes as we work, even though production stays untouched

### Option B: Parallel Local Preview Layer

We build the redesign in a separate local preview surface first, then merge it into the main interface later.

Possible forms:

- separate preview HTML/CSS files
- a redesign-only entry screen
- a redesign shell applied to a limited subset of screens first

Benefits:

- The current local app remains more stable while the redesign evolves
- Easier side-by-side comparison
- Lower risk while exploring layout changes

Tradeoff:

- Slightly slower
- More temporary structure to manage

## Recommended Path

Use a hybrid approach:

- Keep production untouched
- Work locally only
- Redesign the real app files in small controlled phases
- Pause after each major phase for your review
- Avoid deployment until the learner UI is approved and tested

This gives the best balance of realism, speed, and safety.

## How You Will Review Changes

For each phase:

1. I make the next set of local UI changes
2. You open the app locally on your desktop
3. You review the screen/flow
4. You tell me what feels right and what still feels off
5. I refine before moving on

## Local Run Reference

Frontend local preview:

```bash
python -m http.server 8000
```

Backend local API:

```bash
cd backend
npm run dev
```

Typical local URLs:

- Learner app: `http://localhost:8000`
- Admin: `http://localhost:8000/admin`
- API: `http://localhost:4000`

## Non-Deployment Rule

Until you explicitly say otherwise:

- no production deployment
- no deployment prep changes unless needed for local testing
- no switching live users to the redesign

## What This Means For The Checklist

The redesign should now be treated as:

- local-first
- review-gated
- production-safe
- phased and reversible
