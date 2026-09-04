# Question Bank Audit

Snapshot date: 2026-08-28

## Summary

- Total questions: 1456
- Unique IDs: 1456
- Duplicate IDs: 0
- ID gaps: 1203, 1300, 1345
- Case groups: 49
- Case-like questions without `caseId`: 80
- Questions with a `caseId` but only one row in the group: 1
- Normalized question stem collisions: 11 groups

## What Looks Clean

- The backend bank itself is not suffering from duplicate question IDs.
- Every `caseId` group has at least one `caseBlock` somewhere in the group.
- There are no blank question texts.
- Combo questions are structurally valid.

## What Looks Messy

### 1. Mixed case styles

Some case series store the shared story once and expect the frontend to inherit it.
Other case series repeat the same `caseBlock` on every row.
There are also 80 case-like items that use `Case 21A`, `Case 21B`, etc. in the question text but do not have a `caseId`.

### 2. Duplicate prompt families

There are 11 normalized stem collisions.
These are usually repeated topic headers such as:

- `Isosorbide dinitrate`
- `Gout`
- `Nifedipine`
- `Paroxetine`
- `Shingles`
- `Metformin`

These may be intentional, but they should be reviewed because they make the bank harder to reason about.

### 3. Inconsistent case-story storage

38 case groups have some rows with `caseBlock` and other rows without it.
That is not necessarily wrong, but it means the frontend must reliably inherit the shared story by `caseId`.

## Recommendation

Do not renumber IDs yet.
The IDs are already unique, and renumbering would risk breaking history, attempts, and any stored references.

Instead, normalize the bank in this order:

1. Keep question IDs immutable.
2. Assign `caseId` to every case-series question.
3. Move each shared case story into one canonical case record per `caseId`.
4. Have every question in that series resolve its story from the canonical case record.
5. Review the 11 duplicate stem families and either merge, retire, or intentionally separate them.
6. After the bank is clean, decide how GPPQE should sit alongside it without mixing sources.

