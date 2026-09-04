# UI Redesign Checklist

This checklist is the end-to-end redesign plan for the learner-facing app first, then the admin area. The goal is to move the product from a template-like or AI-generated feel to a premium, realistic, clinical interface closer to established medical platforms.

## Project Goal

- [x] Redesign the UI to feel clinical, trustworthy, premium, calm, and human-made.
- [x] Keep the backend and core quiz logic working throughout the redesign.
- [x] Prioritize the learner-facing experience before the admin dashboard.
- [x] Replace decorative, theatrical, and generic UI patterns with restrained product design.
- [x] Make the product feel like a serious medical learning platform rather than a quiz toy.
- [x] Keep redesign work local-first until the interface is approved.
- [x] Keep the live product flow untouched until we intentionally plan deployment.
- [x] Review each major redesign phase locally before moving forward.

## Phase 1: Audit The Current Product

- [x] Inventory every screen in `index.html`.
- [x] Inventory every modal in `index.html`.
- [x] Inventory every major interaction state in `engine.js`.
- [x] Inventory all user flows from entry to results.
- [x] List all learner-facing modules currently exposed in the menu.
- [x] List all analytics and dashboard surfaces currently shown to users.
- [x] List all auth states: signed out, signed in, register, resume, logout.
- [x] List all exam/session states: setup, active, paused, review, complete.
- [x] List all special modes: study, exam, smart exam, daily quiz, weak practice, topic library.
- [x] Mark which features stay unchanged in behavior.
- [x] Mark which features need only visual redesign.
- [x] Mark which features need structural UX changes.
- [ ] Mark anything that should be removed or merged.
- [ ] Capture screenshots of current learner screens before redesign starts.
- [x] Write down the specific UI patterns that currently feel fake, generic, or overdone.

## Phase 2: Lock The New Product Direction

- [x] Define the new design direction in one sentence.
- [x] Define the target feel using adjectives: clinical, editorial, premium, modern, restrained, trustworthy.
- [x] Confirm that the visual reference direction is closer to Medscape and premium medical apps.
- [x] Decide that content hierarchy matters more than decoration.
- [x] Decide that gradients will be reduced drastically.
- [x] Decide that gamified or theatrical framing will be toned down.
- [x] Decide that the first impression should feel like a real product, not a concept demo.
- [x] Choose the core brand voice for the UI copy.
- [x] Decide how serious the app should feel compared with how encouraging it should feel.
- [x] Decide whether dark mode remains supported or is deprioritized until later.
- [x] Decide whether admin redesign happens in this same redesign track or after learner completion.

## Phase 3: Rewrite The Information Architecture

- [x] Define the top-level learner flow.
- [x] Decide on the primary app structure: Home, Learn, Assess, Review, Analytics, Profile.
- [x] Decide whether the main navigation should be top navigation, sidebar, or hybrid.
- [ ] Reduce duplication across entry points and menus.
- [ ] Simplify the home-to-action journey.
- [ ] Make the user hub feel intentional, not like a collection of tiles.
- [ ] Decide whether dashboard is a standalone destination or part of a profile/analytics hub.
- [ ] Decide where daily quiz belongs in the product hierarchy.
- [ ] Decide where topic library belongs in the product hierarchy.
- [ ] Decide how settings should be accessed.
- [ ] Decide how session resume should be surfaced.
- [ ] Standardize naming for all major screens.
- [ ] Remove overly dramatic naming such as "portal" if it hurts credibility.
- [ ] Standardize how "Study," "Exam," "Smart Exam," and "Daily Quiz" are described.

## Phase 4: Create The Design System

- [ ] Replace the current root visual system in `styles.css` with a more restrained one.
- [ ] Define new background colors.
- [ ] Define new surface colors.
- [ ] Define new text colors for primary, secondary, muted, inverse.
- [ ] Define new border colors.
- [ ] Define new accent colors.
- [ ] Define new semantic colors for success, warning, danger, info.
- [ ] Define a premium clinical palette anchored by neutrals, navy, and muted teal.
- [ ] Limit accent usage to meaningful emphasis only.
- [ ] Reduce the number of visual themes that compete with each other.
- [ ] Define a tighter border radius system.
- [ ] Define a shadow system with subtle elevation.
- [ ] Define a spacing scale for consistent vertical rhythm.
- [ ] Define a layout width system for desktop, tablet, and mobile.
- [ ] Define a clear type scale for display, page title, section title, card title, body, label, caption.
- [ ] Decide on the primary typeface direction.
- [ ] Replace default-feeling font usage with a more intentional stack if appropriate.
- [ ] Define button variants.
- [ ] Define input and select variants.
- [ ] Define card variants.
- [ ] Define badge, chip, and status styles.
- [ ] Define table/list styles where needed.
- [ ] Define modal styles.
- [ ] Define empty-state styles.
- [ ] Define loading-state styles.
- [ ] Define focus, hover, active, selected, disabled, and error states.
- [ ] Define responsive breakpoints.
- [ ] Define motion principles: subtle, purposeful, non-gimmicky.
- [ ] Define accessibility baselines for contrast and focus visibility.

## Phase 5: Build The New App Shell

- [ ] Redesign the overall screen framing in `index.html`.
- [ ] Define the new main header or app shell structure.
- [ ] Define persistent navigation behavior across screens.
- [ ] Define content container widths and alignment rules.
- [ ] Define section header patterns.
- [ ] Define page intro/header patterns.
- [ ] Define how secondary actions are placed.
- [ ] Define how back navigation appears.
- [ ] Define how user identity/account controls appear.
- [ ] Make sure the shell works on small screens before deeper screen work starts.
- [ ] Make sure the shell feels consistent across learner pages.

## Phase 6: Redesign The Home Experience

- [ ] Remove the current theatrical landing-page feel.
- [ ] Replace the current hero with a clinical, product-grade welcome screen.
- [ ] Create a stronger headline and supporting copy.
- [ ] Use more believable product messaging.
- [ ] Rebuild the hero layout with stronger spacing and typography.
- [ ] Reduce decorative symbols and novelty framing.
- [ ] Add clear primary and secondary actions.
- [ ] Ensure the home screen introduces the product clearly in under a few seconds.
- [ ] Make the first screen feel premium on both mobile and desktop.

## Phase 7: Redesign The Learner Hub Or Main Menu

- [ ] Replace the current menu design with a more realistic dashboard or hub.
- [ ] Reorganize actions into clearer groupings.
- [ ] Reduce tile overload and visual noise.
- [ ] Add meaningful hierarchy between primary and secondary actions.
- [ ] Make analytics, topics, and quiz modes feel related.
- [ ] Improve account/profile presentation.
- [ ] Improve the signed-out state.
- [ ] Improve the signed-in state.
- [ ] Improve the resume-session visibility.
- [ ] Make the hub feel like a real product workspace.

## Phase 8: Redesign Setup Screens

- [ ] Redesign study setup.
- [ ] Redesign exam setup.
- [ ] Redesign daily quiz setup if it has its own screen/state.
- [ ] Standardize all setup cards and controls.
- [ ] Improve select fields and input presentation.
- [ ] Improve labels and helper text.
- [ ] Improve spacing between controls.
- [ ] Improve grouping of related controls.
- [ ] Improve question count selectors and mode options.
- [ ] Make the setup screens feel calm, clear, and efficient.
- [ ] Ensure study and exam screens share the same system but keep distinct cues.

## Phase 9: Redesign The Topic Library

- [ ] Redesign the topic library overview.
- [ ] Improve category filtering UI.
- [ ] Improve search UI.
- [ ] Improve topic list readability.
- [ ] Improve metadata styling.
- [ ] Improve topic viewer layout.
- [ ] Make long-form reading feel editorial and comfortable.
- [ ] Make the topic library feel like a knowledge resource, not a leftover utility screen.

## Phase 10: Redesign The Live Quiz Experience

- [ ] Redesign the quiz header.
- [ ] Simplify the information shown in the top bar.
- [ ] Improve the placement of score, progress, timer, and streak.
- [ ] Make the question card the visual priority.
- [ ] Improve answer option layout and spacing.
- [ ] Improve selected, correct, wrong, and locked states.
- [ ] Improve explanation display styling.
- [ ] Improve clinical case presentation if applicable.
- [ ] Improve the visual distinction between study and exam sessions.
- [ ] Improve exam seriousness without making the UI look dated.
- [ ] Improve timer urgency styling without becoming flashy.
- [ ] Improve CTA placement for next, finish, review, and exit.
- [ ] Improve the feel of progression from one question to the next.
- [ ] Keep the experience readable under pressure.
- [ ] Ensure mobile answering feels easy and safe.

## Phase 11: Redesign Results And Review

- [ ] Redesign the result screen.
- [ ] Improve score presentation.
- [ ] Improve feedback copy.
- [ ] Improve review-entry actions.
- [ ] Improve review content hierarchy.
- [ ] Improve how explanations are presented after completion.
- [ ] Improve how weak areas and performance insights are shown.
- [ ] Make the result screen feel meaningful and premium rather than celebratory by default.
- [ ] Make exam results feel distinct from study results.

## Phase 12: Redesign Analytics And Dashboard

- [ ] Redesign the learner dashboard.
- [ ] Improve the card structure for metrics.
- [ ] Improve the visual hierarchy of important metrics.
- [ ] Improve category performance presentation.
- [ ] Improve charts or chart-like summaries if present.
- [ ] Improve layout density so it feels product-grade.
- [ ] Make analytics useful at a glance.
- [ ] Keep the interface restrained and professional.
- [ ] Make the dashboard feel like a premium medical learning dashboard.

## Phase 13: Redesign Auth And Account UI

- [ ] Redesign the auth modal.
- [ ] Simplify login and registration layout.
- [ ] Improve field grouping and progressive disclosure.
- [ ] Improve validation styling.
- [ ] Improve error messaging.
- [ ] Improve account-related microcopy.
- [ ] Improve the user profile or account hub if present.
- [ ] Make auth feel integrated with the product design system.

## Phase 14: Redesign Modals, Overlays, And Secondary States

- [ ] Redesign confirm-exit modal.
- [ ] Redesign study-exit modal.
- [ ] Redesign session-resume modal.
- [ ] Redesign loading states.
- [ ] Redesign empty states.
- [ ] Redesign warning and destructive confirmation states.
- [ ] Make all overlays feel like the same product.
- [ ] Reduce modal heaviness and visual clutter.

## Phase 15: Rewrite Microcopy

- [ ] Review all visible headings in `index.html`.
- [ ] Review all visible labels in `index.html`.
- [ ] Review all buttons and empty-state copy.
- [ ] Remove robotic, generic, or dramatic wording.
- [ ] Remove gimmicky authority or simulator-style phrases if not essential.
- [ ] Rewrite helper text to sound human and concise.
- [ ] Rewrite action labels to be clearer.
- [ ] Standardize capitalization style across the UI.
- [ ] Standardize punctuation style across the UI.
- [ ] Make all copy sound like one real product team wrote it.

## Phase 16: Interaction Polish

- [ ] Improve transition timing between screens.
- [ ] Improve hover states.
- [ ] Improve focus states.
- [ ] Improve keyboard accessibility for core flows.
- [ ] Improve touch-target sizing for mobile.
- [ ] Improve mobile scrolling behavior.
- [ ] Improve sticky controls where needed.
- [ ] Improve open and close behavior for overlays.
- [ ] Improve feedback timing for answer selection and explanation reveal.
- [ ] Improve perceived performance with subtle skeletons or loading indicators if needed.

## Phase 17: Responsive And Accessibility QA

- [ ] Test home screen on mobile.
- [ ] Test menu/hub on mobile.
- [ ] Test setup screens on mobile.
- [ ] Test quiz screen on mobile.
- [ ] Test dashboard on mobile.
- [ ] Test results on mobile.
- [ ] Test auth modal on mobile.
- [ ] Test the full learner flow on tablet.
- [ ] Test the full learner flow on desktop.
- [ ] Check contrast ratios for primary text.
- [ ] Check contrast ratios for muted text.
- [ ] Check focus visibility across all interactive elements.
- [ ] Check readable font sizing.
- [ ] Check overflow, clipping, and scroll traps.
- [ ] Check form usability with touch and keyboard.

## Phase 18: Code Refactor Safety

- [ ] Keep logic changes separate from visual changes wherever possible.
- [ ] Preserve existing DOM IDs required by `engine.js` unless intentionally updating selectors.
- [ ] Update `engine.js` carefully if markup changes require selector changes.
- [ ] Remove dead CSS after replacement UI is stable.
- [ ] Remove duplicate or conflicting CSS rules.
- [ ] Remove abandoned theme fragments that no longer match the new direction.
- [ ] Keep the app functional after each redesign checkpoint.
- [ ] Avoid introducing regressions while restructuring markup.
- [ ] Verify that auth, quiz, results, and dashboard still bind correctly after each markup revision.

## Phase 19: Admin Redesign

- [ ] Audit the current admin UI in `admin/index.html`.
- [ ] Bring admin into the same clinical premium design language.
- [ ] Redesign the admin login view.
- [ ] Redesign admin header and navigation.
- [ ] Redesign stats cards.
- [ ] Redesign tables and management panels.
- [ ] Redesign forms for question editing and user management.
- [ ] Redesign admin actions and alerts.
- [ ] Ensure admin feels related to the main product, not like a separate template.

## Phase 20: Final QA And Launch Readiness

- [ ] Run end-to-end checks on learner flows.
- [ ] Test login.
- [ ] Test registration.
- [ ] Test logout.
- [ ] Test study flow.
- [ ] Test exam flow.
- [ ] Test smart exam flow.
- [ ] Test daily quiz flow.
- [ ] Test topic library flow.
- [ ] Test dashboard flow.
- [ ] Test result review flow.
- [ ] Test session resume flow.
- [ ] Test signed-out restrictions.
- [ ] Test signed-in persistence.
- [ ] Verify styling consistency across every screen.
- [ ] Verify no legacy visual fragments remain.
- [ ] Verify the interface now feels like a serious, premium medical product.
- [ ] Do one final polish pass for spacing, typography, hierarchy, and motion.

## Suggested Working Order

- [ ] Complete the audit.
- [ ] Lock the new direction.
- [ ] Build the new design system.
- [ ] Rebuild the app shell.
- [ ] Redesign home.
- [ ] Redesign learner hub.
- [ ] Redesign setup flows.
- [ ] Redesign live quiz.
- [ ] Redesign results and dashboard.
- [ ] Redesign topic library and auth.
- [ ] Redesign admin.
- [ ] Run QA and polish.

## In-Scope Files

- [ ] `index.html`
- [ ] `styles.css`
- [ ] `engine.js`
- [ ] `backendClient.js` if UI bindings need it
- [ ] `admin/index.html`

## Notes

- [ ] Keep checking against the target reference feel: premium, editorial, clinical, restrained.
- [ ] If a screen starts looking flashy, cute, or template-like, simplify it.
- [ ] If an element exists only for decoration and does not help trust, hierarchy, or usability, remove it.
- [ ] Prioritize realism over novelty.
