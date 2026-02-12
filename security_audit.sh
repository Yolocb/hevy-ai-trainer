#!/bin/bash
echo "=== SECURITY AUDIT ==="
echo ""

echo "1. Checking for hardcoded API keys in source code:"
grep -r -i "sk-ant-\|api.*key.*=.*['\"][a-zA-Z0-9]" src/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "process.env\|apiKey:" | head -5 || echo "✓ No hardcoded API keys found in source"
echo ""

echo "2. Checking for API keys in config files:"
grep -i "api.*key" config/*.json 2>/dev/null | grep -v "null\|\"\"" || echo "✓ No API keys in config files"
echo ""

echo "3. Checking if .env is tracked by git:"
git ls-files .env 2>/dev/null && echo "✗ WARNING: .env is tracked!" || echo "✓ .env is not tracked"
echo ""

echo "4. Checking .gitignore effectiveness:"
cat .gitignore | grep -E "\.env|\.key|secrets" | head -5
echo ""

echo "5. Checking for exposed secrets in git history:"
git log --all --pretty=format: --name-only | sort -u | grep -E "\.env$|secret|\.key" || echo "✓ No secret files in git history"
echo ""

echo "6. Testing API response for key leakage:"
response=$(curl -s http://localhost:3000/api/config)
echo "$response" | grep -E "c79f3edf|sk-ant-" && echo "✗ CRITICAL: Full API key exposed!" || echo "✓ API keys properly masked"
echo ""

