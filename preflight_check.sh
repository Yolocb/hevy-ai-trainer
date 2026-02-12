#!/bin/bash
echo "=== FINAL PRE-FLIGHT CHECK ==="
echo ""

echo "1. Check for common sensitive file patterns:"
find . -type f \( -name "*.env*" -o -name "*.key" -o -name "*.pem" -o -name "*secret*" -o -name "*password*" \) -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | while read file; do
  if git check-ignore "$file" > /dev/null 2>&1; then
    echo "  ✓ $file (ignored)"
  else
    echo "  ✗ WARNING: $file NOT IGNORED!"
  fi
done
echo ""

echo "2. Check for TODO/FIXME comments that should be addressed:"
grep -rn "TODO\|FIXME\|XXX\|HACK" src/ --include="*.ts" --include="*.js" 2>/dev/null | head -5 || echo "  ✓ No critical TODOs found"
echo ""

echo "3. Check for console.log statements (might leak data):"
console_count=$(grep -rn "console\.\(log\|debug\|info\)" src/ --include="*.ts" 2>/dev/null | wc -l)
echo "  Found $console_count console statements"
if [ "$console_count" -gt 20 ]; then
  echo "  ⚠ Consider removing debug console.logs before release"
else
  echo "  ✓ Acceptable amount"
fi
echo ""

echo "4. Check package.json for sensitive info:"
if grep -qiE "password|secret|token" package.json 2>/dev/null; then
  echo "  ✗ WARNING: Sensitive keywords in package.json"
else
  echo "  ✓ package.json looks clean"
fi
echo ""

echo "5. Check for personal info in comments:"
grep -rn "@author\|@email\|@personal" src/ --include="*.ts" 2>/dev/null | head -3 || echo "  ✓ No personal info in comments"
echo ""

echo "6. Verify node_modules is ignored:"
if [ -d "node_modules" ]; then
  git check-ignore node_modules > /dev/null 2>&1 && echo "  ✓ node_modules is ignored" || echo "  ✗ WARNING: node_modules NOT ignored!"
else
  echo "  ✓ node_modules doesn't exist yet"
fi
echo ""

echo "7. Check for large files (>1MB) that shouldn't be committed:"
find . -type f -size +1M -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | while read file; do
  if git check-ignore "$file" > /dev/null 2>&1; then
    echo "  ✓ $file (large but ignored)"
  else
    echo "  ⚠ Large file: $file ($(du -h "$file" | cut -f1))"
  fi
done
echo ""

echo "8. Check if package-lock.json should be committed:"
if [ -f "package-lock.json" ]; then
  git check-ignore package-lock.json > /dev/null 2>&1 && echo "  ⚠ package-lock.json is ignored (consider including it)" || echo "  ✓ package-lock.json will be committed"
else
  echo "  ℹ No package-lock.json found"
fi
echo ""

echo "9. Check for missing essential files:"
for file in "README.md" "LICENSE" ".gitignore" "package.json" ".env.example"; do
  [ -f "$file" ] && echo "  ✓ $file exists" || echo "  ✗ MISSING: $file"
done
echo ""

echo "10. Check git repository status:"
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "  ✓ Git repository initialized"
  branch=$(git branch --show-current 2>/dev/null)
  echo "  Current branch: $branch"
  
  if git remote -v | grep -q "origin"; then
    echo "  ✓ Remote 'origin' configured"
    git remote -v | head -2
  else
    echo "  ℹ No remote configured yet (will add before push)"
  fi
else
  echo "  ✗ Not a git repository!"
fi
echo ""

echo "11. Check for email addresses or phone numbers:"
grep -rn "[a-zA-Z0-9._%+-]\+@[a-zA-Z0-9.-]\+\.[a-zA-Z]\{2,\}\|[0-9]\{3\}[-.][0-9]\{3\}[-.][0-9]\{4\}" src/ README.md --include="*.ts" 2>/dev/null | grep -v "noreply@\|example\|claude\|anthropic" | head -3 || echo "  ✓ No personal contact info found"
echo ""

echo "12. Check for API endpoint URLs that might be personal:"
grep -rn "http://\|https://" src/ --include="*.ts" 2>/dev/null | grep -v "api.hevyapp.com\|console.anthropic.com\|github.com\|localhost" | head -3 || echo "  ✓ Only expected API URLs found"
echo ""

echo "13. Verify dist/ and build/ are ignored:"
for dir in "dist" "build"; do
  if [ -d "$dir" ]; then
    git check-ignore "$dir" > /dev/null 2>&1 && echo "  ✓ $dir/ is ignored" || echo "  ✗ WARNING: $dir/ NOT ignored!"
  else
    echo "  ℹ $dir/ doesn't exist"
  fi
done
echo ""

echo "14. Check for development-only dependencies in production:"
if command -v npm > /dev/null; then
  dev_deps=$(npm list --depth=0 --dev 2>/dev/null | wc -l)
  echo "  Development dependencies: $dev_deps"
  echo "  ✓ Check package.json devDependencies are correct"
fi
echo ""

echo "15. Final security sweep - search for common credential patterns:"
if grep -rnE "password\s*[:=]\s*['\"][^'\"]+['\"]|api_key\s*[:=]\s*['\"][^'\"]+['\"]|secret\s*[:=]\s*['\"][^'\"]+['\"]" src/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "process.env\|getEnv\|config\." | head -3; then
  echo "  ⚠ Potential hardcoded credentials found above!"
else
  echo "  ✓ No hardcoded credentials detected"
fi

