# 🔑 Anthropic API Key Setup Guide

## ⚠️ Current Issue

You're seeing this error:
```
⚠ ANOMALY DETECTED: Anthropic API key not configured
```

**Why:** The key you entered is not a valid Anthropic API key.

---

## ❌ What You Currently Have

Your config file contains:
```
ff5760b9-7a48-447c-9f0e-a493369ab8cc
```

This is **NOT** an Anthropic API key. It's a UUID (36 characters).

---

## ✅ What You Need

An Anthropic API key looks like this:
```
sk-ant-api03-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

**Key characteristics:**
- Starts with: `sk-ant-api03-`
- Length: 100+ characters
- Contains: letters and numbers

---

## 🚀 How to Get Your Real API Key

### Step 1: Visit Anthropic Console
Go to: https://console.anthropic.com/settings/keys

### Step 2: Sign In
- Use your Anthropic account
- Or create a new account (free)

### Step 3: Create API Key
1. Click **"Create Key"** button
2. Give it a name: `Hevy Trainer`
3. Click **"Create"**
4. **COPY the key immediately** (you can't see it again!)

### Step 4: Save It Somewhere Safe
The key will look like:
```
sk-ant-api03-[very long string of characters]
```

---

## 📝 How to Add It to Your App

### Method 1: Via Web UI (Easiest)

1. Open: http://localhost:3000
2. Click **"Configuration"** button (top right)
3. Scroll to top: **🔑 API Keys** section
4. Find: **"Anthropic API Key"** field
5. Paste your real key (starts with `sk-ant-`)
6. Scroll down and click **"💾 Save Configuration"**
7. Close config panel
8. Try generating a workout!

### Method 2: Via .env File

```bash
# Edit the .env file:
notepad C:\Users\D043877\VSCode\hevy-ai-trainer\.env

# Uncomment and add your key:
ANTHROPIC_API_KEY=sk-ant-api03-your-real-key-here

# Save file
# Restart server: npm run web
```

---

## 🧪 Test It Works

After adding your key:

1. Refresh the page: http://localhost:3000
2. Click the **"Generate"** button (⚔ Forge New Quest)
3. You should see: "The Council convenes... Forging your legendary routine..."
4. AI will generate a workout!

---

## 🆘 Troubleshooting

### Still Getting Error?
- Make sure your key starts with `sk-ant-`
- Make sure you clicked "Save" in the UI
- Try restarting the server
- Clear your browser cache (Ctrl+Shift+R)

### Where is My Key Stored?
After saving via UI, it's in:
```
C:\Users\D043877\VSCode\hevy-ai-trainer\config\default.json
```

### Can I Use Free Tier?
Yes! Anthropic has a free trial with credits. Check pricing:
https://www.anthropic.com/pricing

---

## 🔒 Security Notes

- ✅ Your key is stored locally on your machine
- ✅ It's NOT committed to GitHub (in .gitignore)
- ✅ Only you have access to it
- ⚠️ Never share your API key publicly
- ⚠️ Don't commit it to GitHub

---

## 📊 Summary

**Current Status:**
- ❌ Invalid key: `ff5760b9-...` (UUID, not Anthropic key)
- ✅ Server running: http://localhost:3000
- ⏳ Waiting for: Real Anthropic API key

**Next Step:**
1. Get real key from: https://console.anthropic.com/settings/keys
2. Add via UI: http://localhost:3000 → Configuration → API Keys
3. Click "Save"
4. Generate workout!

---

**That's it! Once you add a real Anthropic API key, AI generation will work perfectly!** 🤖💪

