#!/bin/bash
echo "=== Testing UI Security and Quality ==="
echo ""

echo "1. Checking for XSS vulnerabilities in HTML:"
if grep -n "innerHTML\|eval\|dangerouslySetInnerHTML" public/index.html | head -3; then
  echo "  ⚠ Potential XSS vectors found (review above)"
else
  echo "  ✓ No obvious XSS vectors"
fi
echo ""

echo "2. Checking for hardcoded API keys in HTML/JS:"
if grep -iE "sk-ant-[a-zA-Z0-9]{20,}|api.*key.*=.*['\"][a-zA-Z0-9]{20,}" public/index.html | head -2; then
  echo "  ✗ API key found in frontend!"
else
  echo "  ✓ No API keys in frontend"
fi
echo ""

echo "3. Checking password field types for API keys:"
grep -n 'id=".*[Aa]pi[Kk]ey"' public/index.html | grep 'type="password"' > /dev/null && echo "  ✓ API key fields use password type" || echo "  ⚠ API key fields may not be password type"
echo ""

echo "4. Checking for HTTPS/security headers:"
curl -I -s http://localhost:3000/ | grep -iE "Content-Security-Policy|X-Frame-Options|X-Content-Type" || echo "  ⚠ No security headers (acceptable for local dev)"
echo ""

echo "5. Checking form validation:"
grep -c "required\|min=\|max=" public/index.html | xargs echo "  Found validation attributes:"
echo ""

