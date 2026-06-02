---
description: Review changed files against REVIEW_STANDARDS.md and report findings by severity
---

# /review — Code Review Skill

Your goal is to review every file changed since this branch diverged from `main` and produce a structured report of findings. Work through each step below in order.

---

## Step 1 — Identify changed files

Run:

```bash
git diff --name-only origin/main...HEAD
```

If the branch has no commits ahead of main, fall back to:

```bash
git diff --name-only HEAD
git status --short
```

Collect the full list of changed file paths. Skip deleted files and binary files (images, fonts, lock files).

---

## Step 2 — Read each changed file in full

For every file in the list from Step 1, read the **entire file** — not just the diff. You need full context to identify issues like missing exhaustiveness checks, N+1 query patterns, or missing `dark:` variants that appear outside the changed lines.

---

## Step 3 — Read the review standards

Read `.claude/skills/review/REVIEW_STANDARDS.md` in full. Apply every rule in that document to every file you read in Step 2.

---

## Step 4 — Produce findings

For each issue found, record:

- **File path and line number** (e.g., `app/api/customers/route.ts:42`)
- **What the issue is** — one clear sentence
- **How to fix it** — concrete, actionable, not vague ("add Zod validation" → show which schema to use or what fields to validate)

Group findings into four severity buckets:

```
🔴 BLOCKING — must fix before merge
🟡 WARNING — should fix (with reason)
🔵 SUGGESTION — nice to have
✅ LGTM — what looks good (brief)
```

**Severity guidance:**

| Severity      | When to use                                                                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 BLOCKING   | Violates a hard rule: `any` type, missing auth check, hardcoded secret, floating promise, silent catch, missing Zod validation on API input, raw SQL without comment, missing `dark:` variant |
| 🟡 WARNING    | Rule violation that isn't immediately dangerous but degrades quality: N+1 query, missing test coverage for an edge case, missing exhaustive union check, inline style                         |
| 🔵 SUGGESTION | Non-rule improvement: extract a helper, rename for clarity, add a comment explaining a non-obvious invariant                                                                                  |
| ✅ LGTM       | Specific things that are done well — call these out briefly to reinforce good patterns                                                                                                        |

---

## Step 5 — Output format

Print the report in this exact structure:

```
## Code Review

### 🔴 Blocking

**`<file>:<line>`** — <what the issue is>
→ Fix: <how to fix it>

(repeat for each blocking issue)

---

### 🟡 Warnings

**`<file>:<line>`** — <what the issue is>
→ Fix: <how to fix it>

(repeat for each warning)

---

### 🔵 Suggestions

**`<file>:<line>`** — <what the issue is>
→ Fix: <how to fix it>

(repeat for each suggestion)

---

### ✅ LGTM

- <brief note on something done well>
- <another if applicable>

---

## Summary
🔴 Blocking: N
🟡 Warnings: N
🔵 Suggestions: N

Verdict: [Ready to push] / [Fix blocking issues first]
```

**Verdict rule:** "Ready to push" only if blocking count is 0. Otherwise "Fix blocking issues first."

If a section has no findings, omit it (do not print an empty section header).

---

## Notes

- Report only real issues — do not invent problems to fill buckets
- If a file has no issues at all, include it in LGTM with a one-line note
- Do not suggest changes that are out of scope for the current diff (e.g., refactoring unrelated code)
- "How to fix" must be specific: include the correct type, the right utility, or the exact pattern to use — never just say "fix this"
