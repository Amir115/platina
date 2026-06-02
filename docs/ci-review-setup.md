# CI Code Review — Setup Guide

The `claude-review.yml` GitHub Actions workflow runs Claude Code as an automated reviewer on every PR push. It posts inline comments, a summary, and either approves the PR or blocks merge when blocking issues exist.

---

## How It Works

1. A PR is opened, pushed to, reopened, or marked ready for review.
2. Claude checks out the repo and reads `.claude/skills/review/REVIEW_STANDARDS.md`.
3. Claude fetches the PR diff and analyzes every changed line against those standards.
4. Claude dismisses any previous review it posted (so the new review is authoritative).
5. Claude posts a single GitHub review with inline comments on specific lines.
6. Claude posts a top-level summary comment.
7. If there are **zero blocking issues**: Claude approves the PR and the CI check passes.
8. If there are **blocking issues**: Claude requests changes and the CI check fails, blocking merge.

---

## Required Setup

### 1. `ANTHROPIC_API_KEY` repo secret

The workflow calls the Anthropic API directly.

```bash
gh secret set ANTHROPIC_API_KEY --repo Amir115/platina
```

Get the key from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).

### 2. `CLAUDE_REVIEW_TOKEN` repo secret (recommended)

GitHub does not allow the built-in `GITHUB_TOKEN` (acting as `github-actions[bot]`) to approve PRs that were opened by the same bot. For PRs opened by human users, `GITHUB_TOKEN` works fine. For safety and full support, create a fine-grained PAT:

1. Go to [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
2. Create a new token with:
   - **Repository access**: Only `Amir115/platina`
   - **Permissions**: Pull requests — Read and write
3. Add it as a repo secret:
   ```bash
   gh secret set CLAUDE_REVIEW_TOKEN --repo Amir115/platina
   ```

If this secret is not set, the workflow automatically falls back to `GITHUB_TOKEN`. PR approvals may not work in edge cases.

---

## Requiring the Check Before Merge

To enforce the review (block merge when blocking issues exist):

1. Go to `https://github.com/Amir115/platina/settings/branches`
2. Add or edit the branch protection rule for `main`
3. Enable **"Require status checks to pass before merging"**
4. Search for and add **`Claude Code Review`** as a required status check

The check name must exactly match the `name:` field in the workflow job (`Claude Code Review`).

---

## Re-push Flow

When new commits are pushed to a PR that was previously blocked:

1. The workflow runs again from scratch.
2. Claude dismisses its previous review (`dismissed` state) so old comments are clearly marked as superseded.
3. Claude analyzes the new diff and posts a fresh review.
4. If the blocking issues are gone: Claude approves and the check turns green.
5. Old inline comments remain visible but are shown as "outdated" by GitHub (they are attached to the old commit).

---

## Temporarily Bypassing the Review

**When acceptable:**

- Urgent hotfix to production with no time to wait for review
- Review is consistently failing due to a bug in the workflow itself (not the code)

**How to bypass:**

1. Repo admin goes to the PR → "Merge without waiting for requirements to be met"  
   (only available to admins when branch protection allows admin override)
2. Or temporarily disable the required check in branch protection settings.

**Always create a follow-up PR to address any skipped findings.**

Never use `--no-verify` or similar bypasses on the local git side — that only affects hooks, not CI.

---

## Verification

After completing setup, run the verification script to confirm everything is configured correctly:

```bash
bash scripts/setup-ci-review.sh
```

The script checks:

- `gh` CLI is authenticated
- `ANTHROPIC_API_KEY` secret exists
- `CLAUDE_REVIEW_TOKEN` secret exists (warns if missing, not required)
- Workflow file is present
- `REVIEW_STANDARDS.md` is present
- Branch protection is enabled on `main`
- `Claude Code Review` is a required status check

---

## Files

| File                                        | Purpose                               |
| ------------------------------------------- | ------------------------------------- |
| `.github/workflows/claude-review.yml`       | The workflow definition               |
| `.claude/skills/review/REVIEW_STANDARDS.md` | Review rules (single source of truth) |
| `scripts/setup-ci-review.sh`                | Setup verification script             |
| `docs/ci-review-setup.md`                   | This document                         |
