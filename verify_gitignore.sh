#!/bin/bash
echo "=== Verifying .gitignore Effectiveness ==="
echo ""

echo "1. Checking .gitignore covers sensitive files:"
for pattern in ".env" ".env.local" "*.key" "*.pem" "config/secrets.json"; do
  if git check-ignore "$pattern" > /dev/null 2>&1; then
    echo "  ✓ $pattern is ignored"
  else
    echo "  ✗ $pattern is NOT ignored!"
  fi
done
echo ""

echo "2. Testing with actual sensitive file names:"
touch test_secret.key test_private.pem test.env.local
for file in test_secret.key test_private.pem test.env.local; do
  if git check-ignore "$file" > /dev/null 2>&1; then
    echo "  ✓ $file would be ignored"
  else
    echo "  ✗ $file would NOT be ignored!"
  fi
  rm -f "$file"
done
echo ""

echo "3. Checking if .env is properly ignored:"
git status --porcelain | grep "\.env$" && echo "  ✗ .env would be committed!" || echo "  ✓ .env is properly ignored"
echo ""

echo "4. Listing files that would be committed:"
git status --porcelain | grep -E "^\?\?" | head -5 || echo "  (No untracked files that would be committed)"
echo ""

