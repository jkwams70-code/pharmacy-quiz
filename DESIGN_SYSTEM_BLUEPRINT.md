# Design System Blueprint

This blueprint defines the visual system for the learner-facing redesign. It is intentionally restrained and product-oriented, with a clinical editorial feel closer to premium medical platforms.

## 1. Design Intent

The interface should feel:

- Clinical
- Calm
- Premium
- Trustworthy
- Editorial
- Highly readable
- Human-designed

The interface should not feel:

- Playful
- Over-gamified
- Template-like
- Gradient-driven
- Over-branded
- AI-generated

## 2. Color Direction

### Core Palette

Use a restrained light theme built around neutral medical-product tones:

- Canvas: warm off-white
- Surface: white
- Surface-alt: cool stone
- Ink: deep slate
- Muted text: medium slate
- Primary: deep navy
- Accent: muted teal
- Success: controlled green
- Warning: ochre/amber
- Danger: restrained crimson

### Suggested Token Values

These are starting values, not final sacred values:

- `--bg`: `#f5f7fa`
- `--bg-soft`: `#eef2f6`
- `--surface`: `#ffffff`
- `--surface-muted`: `#f8fafc`
- `--surface-strong`: `#e9eef5`
- `--text`: `#17212b`
- `--text-soft`: `#5d6b79`
- `--text-faint`: `#7d8b99`
- `--border`: `#d8e0e8`
- `--border-strong`: `#c7d1db`
- `--primary`: `#173a63`
- `--primary-strong`: `#102b49`
- `--primary-soft`: `#e7eef7`
- `--accent`: `#246b67`
- `--accent-soft`: `#e4f1ef`
- `--success`: `#2f6f4f`
- `--warning`: `#9a6a1f`
- `--danger`: `#a24646`
- `--info`: `#356b93`

### Color Rules

- Use navy for structure, navigation, emphasis, and key actions.
- Use muted teal sparingly for secondary emphasis and informational highlights.
- Keep success/warning/danger semantic, not decorative.
- Avoid full-page saturated gradients as default screen backgrounds.
- Prefer tint blocks, subtle borders, and tone-on-tone layering.

## 3. Typography Direction

### Typography Goals

- Strong readability for long questions and study content
- Serious editorial tone
- Better visual hierarchy than the current UI
- Less default-system feel without becoming flashy

### Recommended Structure

- Primary UI font: a clean, modern grotesk or neo-grotesk sans
- Optional secondary headline font: only if it genuinely adds editorial polish

### Fallback Strategy

If no custom font is introduced yet, keep the stack clean and serious:

`"Segoe UI", "Helvetica Neue", Arial, sans-serif`

Later, if we add web fonts, choose something with a premium editorial feel and good medical-product readability.

### Type Scale Direction

- Display: for key home headline only
- Page title: for screen titles
- Section title: for card groups and content sections
- Card title: for module names and analytics sections
- Body: default reading size
- Meta: labels, helper text, timestamps, category metadata

### Typography Rules

- Use tighter title hierarchy than the current UI.
- Limit all-caps usage.
- Reduce emoji use in headings.
- Let spacing and weight create hierarchy, not color alone.

## 4. Layout And Spacing

### Shell Direction

Move toward a true app shell:

- Top bar with product identity and user actions
- Optional secondary section navigation
- Stable content container with predictable widths
- Fewer full-screen one-off compositions

### Width Strategy

- Narrow reading width for questions and topics
- Medium content width for setup pages and results
- Wider analytics width for dashboard surfaces

### Spacing Strategy

Use a consistent spacing scale:

- `4`
- `8`
- `12`
- `16`
- `24`
- `32`
- `40`
- `56`
- `72`

### Layout Rules

- Increase whitespace between sections.
- Reduce gratuitous framing boxes.
- Use grid only when it clarifies hierarchy.
- Avoid centering everything by default.
- Left alignment should dominate content-heavy screens.

## 5. Shape, Borders, And Shadows

### Radius Direction

Reduce current roundedness and move to a tighter system:

- Small radius for fields, pills, utility buttons
- Medium radius for standard cards
- Large radius only for select hero or modal surfaces

Suggested direction:

- `--radius-sm`: `8px`
- `--radius-md`: `12px`
- `--radius-lg`: `16px`
- `--radius-xl`: `20px`

### Border Direction

- Light, cool borders
- Clear separation without looking boxy
- Prefer subtle outlines over thick framing

### Shadow Direction

- Very soft elevation
- Stronger shadows only for overlays and major floating panels
- Avoid dramatic floating-card shadows

## 6. Component Rules

### Buttons

We should standardize into:

- Primary
- Secondary
- Tertiary
- Destructive
- Ghost/icon

Rules:

- One obvious primary action per area
- Secondary actions quieter
- Icon-only controls should still feel deliberate

### Inputs And Selects

Rules:

- Calm borders
- Serious labels
- Strong focus states
- Cleaner vertical rhythm
- Better helper/error presentation

### Cards

Cards should become more disciplined:

- Clear title
- Clear supporting text
- Limited decorative chrome
- Consistent padding
- One visual job per card

### Chips And Statuses

- Use chips sparingly
- Avoid colorful pill overload
- Use muted backgrounds and border-led styles

### Modals

Rules:

- Cleaner hierarchy
- Less generic "modal card" feeling
- Tighter actions
- Better copy tone

## 7. Screen-Specific Direction

### Home

- Editorial product intro
- Fewer decorative symbols
- Immediate clarity on what the app does
- Strong primary CTA

### Learner Hub

- Replace tile-wall feeling with a structured workspace
- Feature quick actions, recent activity, analytics snapshot, and learning paths

### Setup Screens

- Clean forms
- Better option grouping
- More restrained headers

### Quiz Screen

- Question area is king
- Header becomes slimmer and more useful
- Better answer density and state styling
- Explanation and AI help become premium support surfaces

### Results And Analytics

- Analytical tone
- Better hierarchy between score, insight, and next actions
- More dashboard credibility

### Topic Library

- Feels like a medical knowledge area
- Better reading layout
- Better browse and search structure

## 8. Navigation Pattern

### Desktop

- Top bar for product identity, user access, and global actions
- Secondary nav row or side rail for major sections
- Content below with stable spacing

### Mobile

- Top bar with compact section controls
- Internal subnavigation where needed
- Avoid huge header stacks that consume vertical space

## 9. Motion Direction

Use motion for:

- Screen entrance polish
- Overlay appearance
- Small state changes
- Progress transitions

Do not use motion for:

- Decoration for its own sake
- Constant animation
- Flashy feedback loops

## 10. Features To De-Emphasize In The Visual Language

- Theme-switching as a major product feature
- Novelty font switching
- Decorative authority bars
- Emoji-driven headings
- Loud gradient identities per mode
- Overuse of streak/game cues in serious study flows

## 11. First Implementation Targets

The first implementation pass should change:

1. Root tokens in `styles.css`
2. `body` and page background behavior
3. Main app shell structure in `index.html`
4. Home screen composition
5. Learner hub composition

The first implementation pass should avoid:

- Deep logic rewrites
- Renaming IDs without need
- Theme-system expansion
- Admin restyling before learner surfaces are stable
