---
description: Turn current changes into a clean, labeled GitHub PR on top of an updated main branch
---

# /ship — Perfect PR Skill

Your goal is to take all current changes (staged or unstaged, on any branch) and produce a clean, well-structured, labeled GitHub PR. Work through each step below in order. Stop and report clearly if any step fails — never skip a failure silently.

If the user passed `--draft`, create the PR as a draft. Otherwise create it ready for review.

---

## Step 1 — Pre-flight CI checks

Run all three checks. If any fail, stop immediately and show the exact error output. Do not touch git.

```bash
npx tsc --noEmit
npx eslint . --max-warnings 0
npx vitest run
```

Report which checks passed and which failed. Only continue to Step 2 if all three pass.

---

## Step 2 — Capture and record current state

Run these to understand where we are before touching anything:

```bash
git status
git branch --show-current
git stash list
```

Record:
- **current_branch**: the branch name from `git branch --show-current`
- **on_main**: true if current_branch is `main` or `master`
- **has_uncommitted**: true if `git status` shows any changed or untracked files

---

## Step 3 — Prepare a clean branch on top of updated main

### Case A — Currently on main

1. Stash all changes (staged and unstaged):
   ```bash
   git stash push -u -m "ship: wip before branch"
   ```
2. Pull latest main:
   ```bash
   git pull origin main --ff-only
   ```
3. Skip to Step 4 to determine the branch name from the stash, then create the branch:
   ```bash
   git checkout -b <branch_name>
   ```
4. Pop the stash:
   ```bash
   git stash pop
   ```

### Case B — Currently on a feature branch

1. Stash any uncommitted changes if **has_uncommitted** is true:
   ```bash
   git stash push -u -m "ship: wip before rebase"
   ```
2. Fetch and rebase onto main:
   ```bash
   git fetch origin main
   git rebase origin/main
   ```
   If the rebase produces conflicts, abort it (`git rebase --abort`), pop the stash (`git stash pop`), and stop. Tell the user to resolve conflicts with `git rebase origin/main` manually before re-running `/ship`.
3. Pop the stash if you stashed in step 1:
   ```bash
   git stash pop
   ```

---

## Step 4 — Analyze the diff to determine metadata

Run:
```bash
git diff HEAD
git diff --cached
git status --short
```

Also check the full list of changed file paths. Use this analysis to determine all four of the following:

### 4a — GitHub label (pick exactly one)

Available labels: `Bug`, `Documentation`, `Enhancement`, `Infrastructure`

Mapping rules (apply the first match):
- Any file ending in `.md`, or files under `docs/`, or filenames containing `RESEARCH` or `CHANGELOG` → **Documentation**
- Any of: `package.json`, `package-lock.json`, `tsconfig*.json`, `.github/`, `*.config.ts`, `*.config.js`, `vitest.config.*`, `eslint.config.*`, `prettier*`, `.env*`, `prisma/schema.prisma` → **Infrastructure**
- The change fixes broken or incorrect existing behavior (no new files, description implies a fix) → **Bug**
- Everything else (new features, new routes, new components) → **Enhancement**

### 4b — Branch name (only needed for Case A / creating a new branch)

Format: `<type>/<short-slug>`

- `type` maps from the label: `bug` → `fix`, `Documentation` → `docs`, `Infrastructure` → `infra`, `Enhancement` → `feat`
- `short-slug`: 2–5 lowercase hyphenated words summarizing the change. No IDs, no timestamps.
- Examples: `feat/work-order-status-badge`, `docs/onboarding-guide`, `infra/vitest-setup`

### 4c — Commit message

Follow conventional commits format:
```
<type>(<scope>): <short imperative summary>

<optional body — only if the why is non-obvious>
```
- `type`: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`
- `scope`: optional, the main module or area affected (e.g. `work-orders`, `api`, `ci`)
- Summary: max 72 chars, imperative mood, no period

### 4d — PR title and body

Title: same as the first line of the commit message (the `type(scope): summary` line), max 70 chars.

Body template:
```markdown
## Summary
- <bullet 1>
- <bullet 2>
- <bullet 3 if needed>

## Test plan
- [ ] <thing to verify manually or via CI>
- [ ] <another thing>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Step 5 — Stage and commit

Stage all changes, excluding files that should never be committed:

```bash
git add .
git reset HEAD -- .env .env.local .env.*.local *.pem *.key
```

Then commit:
```bash
git commit -m "<commit message from 4c>"
```

---

## Step 6 — Push and create (or update) the PR

Push the branch:
```bash
git push -u origin <branch_name>
```

Check if a PR already exists for this branch:
```bash
gh pr view --json number,url 2>/dev/null
```

- **If no PR exists**: create one:
  ```bash
  gh pr create \
    --title "<PR title from 4d>" \
    --body "<PR body from 4d>" \
    --label "<label from 4a>" \
    [--draft if user passed --draft]
  ```
- **If a PR already exists**: edit it to update title, body, and label:
  ```bash
  gh pr edit \
    --title "<PR title from 4d>" \
    --body "<PR body from 4d>" \
    --add-label "<label from 4a>"
  ```

---

## Step 7 — Report back

Print a concise summary:
- Which pre-flight checks passed
- Branch name and whether it was created or already existed
- Commit message used
- PR URL
- Label applied
- Whether it's a draft or ready for review
