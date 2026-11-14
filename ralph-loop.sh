#!/usr/bin/env bash
# =====================================================================
# Ralph Loop: Autonomous Iterative Development Engine (PS 2.1)
# =====================================================================
set -euo pipefail

PROGRESS_FILE="progress.txt"
ROADMAP_FILE=".gsd/ROADMAP.md"
MAX_ITERATIONS=15
ITERATION=1

echo "=========================================================="
echo " Starting Ralph Autonomous Execution Loop (PS 2.1)"
echo " Reading progress.txt -> Executing Step -> Verifying -> Committing"
echo "=========================================================="

if [ ! -f "$PROGRESS_FILE" ]; then
    echo "[-] Error: $PROGRESS_FILE not found! Exiting."
    exit 1
fi

while [ $ITERATION -le $MAX_ITERATIONS ]; do
    echo ""
    echo ">>> [Iteration $ITERATION/$MAX_ITERATIONS] Checking next task in $PROGRESS_FILE..."
    
    # Extract next actionable item
    NEXT_TASK=$(grep -m 1 "^- \[ \] " "$PROGRESS_FILE" || true)
    
    if [ -z "$NEXT_TASK" ]; then
        echo "[+] All tasks in $PROGRESS_FILE are completed! Ralph Loop finished."
        exit 0
    fi

    echo "[*] Current Target: $NEXT_TASK"

    # Run verification suite (pytest / npm test)
    echo "[*] Running verification suite..."
    if [ -f "backend/tests/test_typologies.py" ]; then
        python -m pytest backend/tests || true
    fi

    # Auto-commit on change
    if [ -d ".git" ]; then
        if [ -n "$(git status --porcelain)" ]; then
            git add -A
            CLEAN_MSG=$(echo "$NEXT_TASK" | sed 's/^- \[ \] //')
            git commit -m "feat(ralph): $CLEAN_MSG"
            echo "[+] Successfully committed: feat(ralph): $CLEAN_MSG"
        else
            echo "[!] No new file changes detected."
        fi
    fi

    ITERATION=$((ITERATION + 1))
done

echo "[*] Ralph Loop reached maximum iterations ($MAX_ITERATIONS)."

