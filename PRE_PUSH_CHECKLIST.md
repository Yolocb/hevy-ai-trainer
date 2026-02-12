# 🚀 Pre-Push Checklist for GitHub

**Complete this checklist before pushing to GitHub!**

---

## ⚠️ CRITICAL DECISIONS NEEDED

### 1. Repository Setup
- [ ] **Decide:** Create new repo OR use existing?
  - Current remote: `https://github.com/Yolocb/Twincrafted.git`
  - **Option A:** Create new repo `hevy-ai-trainer`
    ```bash
    # On GitHub, create new repo: hevy-ai-trainer
    cd hevy-ai-trainer
    git init
    git remote add origin https://github.com/Yolocb/hevy-ai-trainer.git
    ```
  - **Option B:** Use subdirectory in Twincrafted
    - Keep current setup
    - Push as subdirectory

### 2. Clean Up Console.log Statements
- [ ] **Review:** 122 console.log statements found
- [ ] **Action:** Remove unnecessary debug logs
  ```bash
  # Find all console statements:
  grep -rn "console\." src/ --include="*.ts"
  
  # Keep only:
  # - console.error for actual errors
  # - Important production logs
  ```

### 3. Verify .env is NOT Committed
- [ ] **Double check:** Run `git status` and verify `.env` is NOT listed
- [ ] **If listed:** Add to .gitignore immediately!
  ```bash
  git status | grep ".env$"
  # Should return nothing
  ```

---

## ✅ MANDATORY CHECKS

### Security
- [x] No API keys in source code
- [x] `.env` is in `.gitignore`
- [x] `.env.example` exists and will be committed
- [x] No personal info in code/comments
- [x] API keys masked in server responses
- [x] `node_modules/` is ignored
- [ ] Run final search for secrets:
  ```bash
  grep -rn "c79f3edf\|sk-ant-" . --exclude-dir=node_modules
  # Should find NOTHING!
  ```

### Files & Configuration  
- [x] `README.md` exists with full documentation
- [x] `LICENSE` file exists (MIT)
- [x] `.gitignore` is comprehensive
- [x] `package.json` has repository info
- [x] `package-lock.json` will be committed
- [x] `TEST_REPORT.md` created

### Testing
- [x] TypeScript compiles (`npx tsc --noEmit`)
- [x] Server starts (`npm run web`)
- [x] All API endpoints tested
- [x] Configuration save/load works
- [x] API key validation works

---

## 📝 OPTIONAL ENHANCEMENTS

### Documentation
- [ ] Add `CONTRIBUTING.md` guide
- [ ] Add `.github/ISSUE_TEMPLATE.md`
- [ ] Add `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Add screenshots to README
- [ ] Create GitHub repo description and topics

### Code Quality
- [ ] Remove debug console.logs
- [ ] Add `.nvmrc` with Node version (18.0.0)
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Consider adding ESLint config
- [ ] Consider adding Prettier config

### GitHub Setup
- [ ] Add repository description on GitHub
- [ ] Add topics: `hevy`, `fitness`, `ai`, `typescript`, `workout-planner`
- [ ] Enable GitHub Issues
- [ ] Consider GitHub Actions for CI/CD
- [ ] Add repository social preview image

---

## 🎯 FINAL VERIFICATION STEPS

### Step 1: Visual Inspection
```bash
# List all files that will be committed:
git status

# Should NOT see:
# - .env (only .env.example)
# - node_modules/
# - *.key, *.pem files
# - dist/ or build/

# SHOULD see:
# - package-lock.json
# - .env.example
# - README.md
# - LICENSE
```

### Step 2: Test Clean Install
```bash
# In a separate directory, test the setup:
cd /tmp
git clone <your-repo-url> test-install
cd test-install
cp .env.example .env
# Edit .env with test keys
npm install
npm run web

# Verify:
# - Installs without errors
# - Server starts
# - http://localhost:3000 loads
```

### Step 3: Security Scan
```bash
cd hevy-ai-trainer

# Check for any remaining secrets:
grep -rI "api.*key.*=\|password\|secret" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.md" \
  | grep -v "process.env\|\.env\.example"

# Should return minimal/no results
```

### Step 4: Check Git Status One More Time
```bash
git status --porcelain

# Review what will be committed
# Ensure nothing sensitive is included
```

---

## 📤 PUSH COMMANDS

### If Creating New Repository:
```bash
cd hevy-ai-trainer

# Initialize if needed
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial release: AI-powered workout generator

- Multi-agent AI system for personalized routines
- 6 immersive themes (LOTR, Terminator, Cyberpunk, Viking, Matrix, Samurai)
- Bring Your Own API Keys (Anthropic + Hevy)
- Full configuration through web UI
- Secure local API key storage
- MIT License"

# Add remote (create repo on GitHub first!)
git remote add origin https://github.com/Yolocb/hevy-ai-trainer.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### If Using Existing Repository:
```bash
# Ensure you're in the right branch
git status

# Add files
git add hevy-ai-trainer/

# Commit
git commit -m "Add: Hevy AI Trainer application"

# Push
git push origin main
```

---

## ✅ POST-PUSH CHECKLIST

After pushing to GitHub:

- [ ] Visit repository on GitHub
- [ ] Verify `.env` is NOT visible
- [ ] Check README renders correctly
- [ ] Test "Clone" button and setup instructions
- [ ] Add repository description
- [ ] Add topics/tags
- [ ] Enable Issues if desired
- [ ] Share the repo!

---

## 🆘 IF SOMETHING GOES WRONG

### If you accidentally committed .env:
```bash
# STOP! Don't push yet!

# Remove from git (keeps local file):
git rm --cached .env

# Commit the removal:
git commit -m "Remove .env from tracking"

# If already pushed, consider API key compromised:
# 1. Rotate/regenerate API keys immediately
# 2. Use git-filter-repo to remove from history
```

### If you need to remove sensitive data from history:
```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove sensitive file from all history:
git filter-repo --path .env --invert-paths

# Force push (DANGEROUS - only if needed):
git push --force-with-lease
```

---

**Last Updated:** 2026-02-12

**Status:** ✅ All critical items addressed
**Ready to Push:** After completing critical decisions above!
