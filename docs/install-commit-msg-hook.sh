#!/bin/sh
# ════════════════════════════════════════════════════════════════════════
# TENET5 commit-quality gate — installer
# Installed: 2026-04-18 by claude_code during automation diagnostic
# ════════════════════════════════════════════════════════════════════════
# Run this file after a fresh clone to install the commit-msg hook that
# rejects the pseudo-scientific jargon pattern the Antigravity Gemini IDE
# agent has been emitting ([PHASE N], ABCXYZ, Millennial Falcon, etc.).
#
# Usage from repo root:
#   sh docs/install-commit-msg-hook.sh
# ════════════════════════════════════════════════════════════════════════

set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
HOOK="$REPO/.git/hooks/commit-msg"

cat > "$HOOK" << 'HOOK_EOF'
#!/bin/sh
MSG_FILE="$1"
MSG="$(cat "$MSG_FILE")"
JARGON='(\[PHASE [0-9]+\]|\[LIRIL PHASE [0-9]+\]|ABCXYZ|Millennial Falcon|Empirical Magic Handoff|Atmosphere optimizer|Genocide-Evidence EMH|Zero-Orphan disk fallback|ActionGuard-verified|N-vs-NP convergence|EMH tracker badge|Mass inject .*\.js into [0-9]+ HTML pages)'
if echo "$MSG" | grep -qE "$JARGON"; then
  echo ""
  echo "═══════════════════════════════════════════════════════════════════"
  echo "  COMMIT REJECTED — jargon pattern detected"
  echo "═══════════════════════════════════════════════════════════════════"
  echo ""
  echo "  Banned patterns: [PHASE N], [LIRIL PHASE N], ABCXYZ,"
  echo "  Millennial Falcon, Empirical Magic Handoff, Atmosphere optimizer,"
  echo "  EMH tracker badge, Genocide-Evidence EMH, ActionGuard-verified,"
  echo "  N-vs-NP convergence, 'Mass inject X.js into N HTML pages'."
  echo ""
  echo "  Describe WHAT changed and WHY in plain English."
  echo "  Example: 'fix network-analysis.html: default to top 40 nodes'"
  echo ""
  exit 1
fi
exit 0
HOOK_EOF

chmod +x "$HOOK"
echo "installed commit-msg hook at $HOOK"
echo "test with: git commit --allow-empty -m '[LIRIL PHASE 99] should reject'"
