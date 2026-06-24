# Standing prompt — weekly puzzle generation routine

This is the instruction set for the scheduled cloud agent that keeps the `/learn/` puzzle path
topped up. It runs weekly. Paste/point the routine at this file.

## Goal

Maintain a **buffer of at least 12 published-but-unsolved lessons** ahead of Tristan's current spot.
Never run further ahead than that — so his feedback always has a chance to land before the path
commits to too much. A "lesson" = one puzzle page **and** its solution page.

## Procedure

1. **Sync**: `git pull` in the repo (`tristancode-workspace`).
2. **Read his position** `L` (last completed lesson number):
   ```bash
   curl -s "https://tristancode.com/api/progress?token=$LEARN_TOKEN" | jq -r '.lastCompleted // 0'
   ```
   `$LEARN_TOKEN` is provided to the routine as a secret. If the backend is unreachable or not yet
   deployed (Phase A), treat `L = 0`.
3. **Find the highest published lesson** `P` = max `lesson_number` across
   `content/learn/*-puzzle.md`.
4. **Compute** `buffer = P - L`. If `buffer >= 12`, **stop — do nothing** (commit nothing, exit).
5. Otherwise author `need = 12 - buffer` new lessons, numbered `P+1 … P+need`.
6. **Read context before writing**:
   - `notes/puzzle-curriculum.md` — the ordered spine. Continue from `last_generated_lesson`,
     taking the next unchecked items in order. Mark them `[x]` as you add them and bump
     `last_generated_lesson`.
   - `notes/puzzle-feedback.md` — apply all of it. If feedback says "re-run this week", regenerate
     the most recent unsolved lessons instead of only appending (see Re-runs below).
   - One or two existing lessons (e.g. `0003-puzzle.md` + `0003-solution.md`) as the quality/format
     template.
7. **Write each lesson** as two files (schema below), following the hard rules in the curriculum doc
   (standalone, re-define terms, `builds_on` backlinks, 5–10 min, concept over jargon, classical
   before clever, solution fully teaches).
8. **Validate**: `python3 scripts/check-internal-links.py` (if it covers /learn/) and a local
   `hugo --minify` build with no errors. Fix anything broken.
9. **Commit & push** on `main` (Netlify auto-deploys):
   ```
   Add learn lessons NNNN–MMMM (<concepts>)
   ```
   Keep solution/answer content out of the commit message.

## File + front-matter schema

Two files per lesson, zero-padded to 4 digits:

`content/learn/NNNN-puzzle.md`
```yaml
---
title: "Short puzzle title"
description: "One-sentence summary for SEO/cards."
lesson_number: N                # integer, matches the filename
concept: "Pure functions"       # short concept label (shown in eyebrow/archive)
stage: 0                        # curriculum stage number
layout: puzzle                  # selects layouts/learn/puzzle.html
role: puzzle                    # used by templates to find puzzle/solution pairs
answer_type: mcq                # "reveal" or "mcq" (no "code" until Phase D)
builds_on: [1, 3]               # lesson numbers; [] if none. Renders backlinks.
skin: chalkboard
mcq:                            # ONLY when answer_type: mcq
  question: "Which function is pure?"
  options:
    - "First option"
    - "Second option"
  correct: 1                    # 0-based index of the correct option
---

Puzzle body in Markdown. Define every term. Pose one clear challenge.
```

`content/learn/NNNN-solution.md`
```yaml
---
title: "Solution: same/related title"
description: "One-sentence summary."
lesson_number: N                # MUST equal the puzzle's number (pairs them)
concept: "Pure functions"
stage: 0
layout: solution                # selects layouts/learn/solution.html
role: solution
builds_on: [1, 3]
skin: chalkboard
---

Full explanation: the answer, why it's right, the underlying concept, common pitfalls, and a
forward hook to what it sets up.
```

Notes:
- The templates pair a puzzle with its solution by matching `lesson_number`. Keep them equal.
- Ordering, the resume button, and the buffer math all key off `lesson_number`, not the filename —
  but keep the filename's number in sync to stay sane.
- For `reveal` puzzles, omit the `mcq:` block; the solution link shows immediately. For `mcq`, the
  solution link unlocks when the reader picks the correct option.

## Re-runs (when feedback says "re-run this week")

Regenerate only lessons **above** `L` (his last completed) — never rewrite a lesson he's already
finished, since that would change something he may have learned from and (if anyone else uses the
path) wipe their context. Overwrite the relevant `NNNN-puzzle.md` / `NNNN-solution.md` in place,
keeping the same numbers.

## Definition of done

- `buffer >= 12` after the run (or it was already, and nothing changed).
- Local `hugo --minify` builds clean; internal links pass.
- Curriculum doc's `[x]` marks and `last_generated_lesson` updated.
- Changes committed and pushed to `main`.
