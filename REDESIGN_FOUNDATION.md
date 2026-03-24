# Redesign Foundation

This document locks the first execution pass of the redesign: what the current learner product includes, what is hurting the interface, and what direction we are committing to before screen-by-screen rebuilding begins.

## 1. Current Product Inventory

### Learner Screens

The learner app currently exposes 14 major screens through `showScreen()` in `engine.js`:

1. `home-screen`
2. `quiz-menu`
3. `profile-screen`
4. `study-setup`
5. `exam-setup`
6. `daily-setup`
7. `topic-library`
8. `topic-viewer`
9. `tour-screen`
10. `settings-screen`
11. `quiz-area`
12. `review-screen`
13. `dashboard`
14. `study-result-screen`

### Modal Surfaces

The current primary modals in `index.html` are:

1. `exam-exit-modal`
2. `study-exit-modal`
3. `session-resume-modal`
4. `auth-modal`

### Learner-Facing Modules In The Product

The current user-facing product includes:

- Home / entry screen
- Main learner menu / control panel
- Study mode
- Exam mode
- Smart exam mode
- Daily quiz
- Topic library
- Topic viewer / note reader
- Performance dashboard
- Session history
- Review screen
- Result screen
- Profile
- Settings
- Tour / onboarding

### Auth And Account States

The current auth/account experience includes:

- Signed out
- Signed in
- Login
- Register
- Forgot password
- Reset code flow
- Resume session prompt
- Profile update
- Password change
- Account deactivation
- Account deletion

### Session And Quiz States

The current session system includes:

- Setup
- Active question flow
- Answered state
- Explanation state
- Review state
- Result state
- Resume state
- Timed state
- Untimed study state
- Daily completion state

### Special Learning Modes

The current quiz engine supports:

- Normal study
- Weak-area study
- Normal exam
- Smart exam
- Daily quiz
- Rapid drill
- Sudden death drill
- Clinical drill
- Topic-linked study flow

### Analytics Surfaces

The learner-facing analytics currently appear in:

- Home metrics
- Menu/history widgets
- Quiz header live stats
- Result summaries
- Dashboard metric cards
- Category performance list
- Weak-question/weak-area indicators
- Streak tracking
- Daily streak and gems metrics

## 2. What Stays, What Changes, What Goes

### Keep The Product Capability

These should largely stay in behavior:

- Study mode
- Exam mode
- Smart exam mode
- Daily quiz
- Topic library
- Results and review
- Dashboard analytics
- Authentication and saved progress
- Resume session support

### Needs Mainly Visual Redesign

These are useful features that mostly need a new interface language:

- Home screen
- Main menu
- Setup screens
- Dashboard
- Result screen
- Auth modal
- Profile screen
- Topic library shell
- Settings screen
- Tour screen
- Modals

### Needs Structural UX Improvement

These likely need layout and flow changes, not only a reskin:

- Main menu / learner hub
- Navigation between major areas
- Quiz header and live session chrome
- Topic library placement in the overall product
- Dashboard placement in the overall product
- Review entry and result actions
- Settings discoverability
- Tour screen relevance and presentation

### Candidate Removals, Merges, Or De-emphasis

These are not necessarily bad features, but they currently add visual or conceptual noise:

- "Portal" framing and authority theatrics
- Repeated "PHARMACY EXAMINATION AUTHORITY" bars
- Overly decorative gradients as a default background language
- Too many theme variants competing with the core product identity
- Too many font options, including novelty-feeling ones
- Tour as a first-class standalone screen if the same guidance can live inline
- Settings choices that weaken brand consistency

## 3. Why The Current UI Feels AI-Generated

The current interface reads as generated or template-like for a few concrete reasons:

- Too many visual personalities coexist at once.
- Decorative gradients carry too much of the brand identity.
- The design relies on broad signals like tiles, badges, glows, and identity bars rather than strong layout hierarchy.
- The tone of the copy drifts between exam simulator, portal, dashboard, game, and app demo.
- The landing screen feels theatrical rather than product-grade.
- The main menu feels like a collection of feature tiles rather than a coherent workspace.
- The app exposes multiple color themes and multiple font families that reduce editorial consistency.
- Some wording and presentation choices feel generic or overly dramatic rather than human and product-specific.

## 4. Locked Redesign Direction

### Core Product Positioning

Ajix should present itself as a premium clinical learning and assessment platform for pharmacy learners and professionals.

### One-Sentence Direction

Build a restrained, editorial, clinical interface that feels like a serious medical learning product rather than a stylized quiz portal.

### Brand Adjectives

- Clinical
- Trustworthy
- Premium
- Calm
- Editorial
- Modern
- Serious
- Human-made

### Visual Rules We Are Locking

- Content hierarchy wins over decoration.
- The question, topic content, and performance insight should be the visual focus.
- Gradients become rare accent tools, not the default page treatment.
- Cards should feel premium and restrained, not glossy or playful.
- Color should support clarity, not perform branding by itself.
- Motion should be subtle and functional.
- Typography should feel intentional and professional.

### UX Rules We Are Locking

- The product should feel like one coherent application.
- The home screen should lead quickly into meaningful action.
- The learner hub should feel like a workspace, not a tile gallery.
- Study, exam, and analytics should feel related but clearly distinguished.
- The live quiz should prioritize readability and decision-making under pressure.
- Results should feel analytical and useful, not cartoonishly celebratory.

## 5. Information Architecture Direction

### Top-Level Learner Flow

The recommended learner flow is:

1. Home
2. Learner hub
3. Choose path: Learn, Assess, Review, Analytics, Profile
4. Configure session
5. Take session
6. Review results
7. Continue to analytics, topic reading, or another session

### Primary Product Buckets

The learner app should be reorganized around:

- Learn
- Assess
- Review
- Analytics
- Profile

### Navigation Direction

Use a hybrid app-shell approach:

- Desktop: structured top bar with a clear section rail or secondary navigation area
- Mobile: top bar plus stacked section navigation or segmented controls

This is a better fit than a tile-only homepage and better matches premium clinical product patterns.

### Product Naming Direction

Recommended naming updates:

- De-emphasize or remove "portal"
- Remove repeated authority-bar phrasing
- Prefer direct names like `Study`, `Assessments`, `Topics`, `Analytics`, `Account`
- Keep "Daily Quiz" only if it remains an important recurring product feature

## 6. Design System Direction

### Palette Direction

Use a premium clinical palette built around:

- Warm off-white backgrounds
- Soft stone and slate neutrals
- Deep navy as the primary anchor
- Muted teal as the accent
- Controlled semantic colors for success, warning, and error

### Typography Direction

The type should feel editorial and product-grade:

- One strong UI sans-serif for most of the application
- Optional restrained serif only if used very sparingly for select headlines
- Remove novelty-feeling font options from the core design language

### Surface Direction

- More subtle borders
- Softer shadows
- Lower radius values than the current interface
- Greater use of whitespace and alignment
- Fewer decorative containers competing for attention

## 7. Scope Decisions For The Next Steps

These decisions are now set unless we intentionally revise them later:

- Learner-facing redesign comes first.
- Admin redesign comes after the learner experience is coherent.
- Dark mode is deprioritized until the main light-theme system is strong.
- Theme switching should not drive the product identity.
- Font switching should not drive the product identity.
- The next implementation step is to rebuild the design system and app shell before redesigning individual screens.

## 8. Immediate Execution Order

1. Build the new design system in `styles.css`
2. Rebuild the learner app shell in `index.html`
3. Redesign the home screen
4. Redesign the learner hub
5. Redesign setup flows
6. Redesign live quiz
7. Redesign results and analytics
8. Redesign topic library, profile, auth, and secondary surfaces
9. Redesign admin
