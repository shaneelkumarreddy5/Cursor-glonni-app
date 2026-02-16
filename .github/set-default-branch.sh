#!/bin/bash
# Script to change the default branch to 'main' on GitHub
# Requires: GitHub CLI (gh) installed and authenticated

set -e

REPO="shaneelkumarreddy5/Cursor-glonni-app"
NEW_DEFAULT_BRANCH="main"

echo "=========================================="
echo "Setting default branch to: $NEW_DEFAULT_BRANCH"
echo "Repository: $REPO"
echo "=========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if gh is authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: GitHub CLI is not authenticated."
    echo "Please run: gh auth login"
    exit 1
fi

echo "Checking current default branch..."
CURRENT_DEFAULT=$(gh repo view "$REPO" --json defaultBranchRef --jq '.defaultBranchRef.name')
echo "Current default branch: $CURRENT_DEFAULT"
echo ""

if [ "$CURRENT_DEFAULT" = "$NEW_DEFAULT_BRANCH" ]; then
    echo "✓ Default branch is already set to '$NEW_DEFAULT_BRANCH'"
    exit 0
fi

echo "Changing default branch to '$NEW_DEFAULT_BRANCH'..."
gh repo edit "$REPO" --default-branch "$NEW_DEFAULT_BRANCH"

echo ""
echo "✓ Successfully changed default branch to '$NEW_DEFAULT_BRANCH'"
echo ""
echo "Next steps:"
echo "1. Update your local repository:"
echo "   git remote set-head origin $NEW_DEFAULT_BRANCH"
echo "   git fetch origin"
echo "   git checkout $NEW_DEFAULT_BRANCH"
echo "   git pull origin $NEW_DEFAULT_BRANCH"
echo ""
echo "2. Consider updating branch protection rules if needed"
