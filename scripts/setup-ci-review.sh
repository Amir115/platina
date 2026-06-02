#!/usr/bin/env bash
# Verifies that the repo is correctly configured for Claude CI Code Review.
# Run this script once after adding the claude-review.yml workflow.
set -euo pipefail

REPO="Amir115/platina"
BRANCH="main"
CHECK_NAME="Claude Code Review"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

pass() { echo -e "${GREEN}✅  $1${NC}"; ((PASS++)) || true; }
warn() { echo -e "${YELLOW}⚠️   $1${NC}"; }
fail() { echo -e "${RED}❌  $1${NC}"; ((FAIL++)) || true; }
section() { echo -e "\n─────────────────────────────────────────"; echo "  $1"; echo "─────────────────────────────────────────"; }

# ── Preflight ─────────────────────────────────────────────────────────────────

section "Preflight"

if ! command -v gh &>/dev/null; then
  fail "gh CLI not installed — install it from https://cli.github.com"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  fail "gh CLI not authenticated — run: gh auth login"
  exit 1
fi
pass "gh CLI authenticated"

CURRENT_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [ "$CURRENT_REPO" != "$REPO" ]; then
  fail "Not in $REPO (found: '${CURRENT_REPO:-unknown}'). Run this script from inside the platina repo."
  exit 1
fi
pass "Repo is $REPO"

# ── Secrets ───────────────────────────────────────────────────────────────────

section "Repository Secrets"

SECRETS=$(gh secret list --repo "$REPO" 2>/dev/null || echo "")

if echo "$SECRETS" | grep -q "^ANTHROPIC_API_KEY"; then
  pass "ANTHROPIC_API_KEY secret exists"
else
  fail "ANTHROPIC_API_KEY secret is missing"
  echo "      → Add it: gh secret set ANTHROPIC_API_KEY --repo $REPO"
  echo "        (Get the key from https://console.anthropic.com/settings/keys)"
fi

if echo "$SECRETS" | grep -q "^CLAUDE_REVIEW_TOKEN"; then
  pass "CLAUDE_REVIEW_TOKEN secret exists"
else
  warn "CLAUDE_REVIEW_TOKEN secret not set (optional but recommended)"
  echo "      → Without it, the workflow falls back to GITHUB_TOKEN."
  echo "        GITHUB_TOKEN cannot approve PRs opened by github-actions[bot]."
  echo "        To create a fine-grained PAT:"
  echo "          1. Go to https://github.com/settings/tokens?type=beta"
  echo "          2. New token → Repository: $REPO"
  echo "          3. Permissions: Pull requests (read & write)"
  echo "          4. gh secret set CLAUDE_REVIEW_TOKEN --repo $REPO"
fi

# ── Workflow file ─────────────────────────────────────────────────────────────

section "Workflow File"

if [ -f ".github/workflows/claude-review.yml" ]; then
  pass ".github/workflows/claude-review.yml exists"
else
  fail ".github/workflows/claude-review.yml is missing"
  echo "      → Create it from the template in the repo."
fi

if [ -f ".claude/skills/review/REVIEW_STANDARDS.md" ]; then
  pass ".claude/skills/review/REVIEW_STANDARDS.md exists"
else
  fail ".claude/skills/review/REVIEW_STANDARDS.md is missing — the workflow depends on it"
fi

# ── Branch Protection ─────────────────────────────────────────────────────────

section "Branch Protection — $BRANCH"

PROTECTION=$(gh api "repos/$REPO/branches/$BRANCH/protection" 2>/dev/null || echo "null")

if [ "$PROTECTION" = "null" ]; then
  warn "Branch protection is not enabled on $BRANCH"
  echo "      → To require the review check before merging:"
  echo "        1. Go to https://github.com/$REPO/settings/branches"
  echo "        2. Add a branch protection rule for '$BRANCH'"
  echo "        3. Enable 'Require status checks to pass before merging'"
  echo "        4. Add '$CHECK_NAME' as a required status check"
else
  pass "Branch protection is enabled on $BRANCH"

  REQUIRED_CHECKS=$(echo "$PROTECTION" | python3 -c "
import sys, json
data = json.load(sys.stdin)
checks = data.get('required_status_checks', {}).get('checks', [])
print('\n'.join(c['context'] for c in checks))
" 2>/dev/null || echo "")

  if echo "$REQUIRED_CHECKS" | grep -qF "$CHECK_NAME"; then
    pass "'$CHECK_NAME' is a required status check"
  else
    warn "'$CHECK_NAME' is NOT a required status check"
    echo "      → Without this, the review can be bypassed."
    echo "        Add '$CHECK_NAME' to required checks in:"
    echo "        https://github.com/$REPO/settings/branches"
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────

section "Summary"
echo -e "  Passed: ${GREEN}$PASS${NC}   Failed: ${RED}$FAIL${NC}"

if [ "$FAIL" -gt 0 ]; then
  echo -e "\n${RED}Setup incomplete — fix the issues above before the workflow will work correctly.${NC}"
  exit 1
else
  echo -e "\n${GREEN}All required checks passed. Claude CI Review is ready.${NC}"
fi
