# Topic Linking Schema

This document defines how questions map to study notes.

## Goal

Support both:

- A standalone `Topic Library` where learners browse notes
- A per-question `Review Topic` deep link in study mode

## Question Fields

Each question may include these optional fields:

- `topicSlug`
- `sectionId`

Example:

```json
{
  "id": 150,
  "category": "Cardiovascular Disorders",
  "topicSlug": "hypertension",
  "sectionId": "first-line-drug-classes"
}
```

Behavior:

- If `topicSlug` is missing, no deep-link button is shown.
- If `topicSlug` exists, link target is `topics/<topicSlug>.html`.
- If `sectionId` exists, link target becomes
  `topics/<topicSlug>.html#<sectionId>`.

## Topic Registry

`topics/topics.json` is the source of truth for:

- Available topic slugs
- Category mapping
- Note files
- Valid deep-link section IDs

## Naming Conventions

### `topicSlug`

- Lowercase
- Kebab-case only
- Allowed chars: `a-z`, `0-9`, `-`
- Regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`

### `sectionId`

- Lowercase kebab-case only
- Allowed chars: `a-z`, `0-9`, `-`
- Regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Must match an anchor `id` inside the topic note page

## Content Structure Recommendation

For each topic note page:

1. Clinical overview
2. Classification/diagnosis
3. Management algorithm
4. Key drugs and monitoring
5. Exam traps
6. Quick revision summary

## Operational Rules

- `Review Topic` links are available in `Study` mode and review mode.
- `Review Topic` links are hidden in timed exam modes.
- Topic mapping is backward-compatible with existing question records.
