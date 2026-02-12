# Quick Start Guide - Hevy AI Trainer

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (1 min)

Open a terminal in the project folder and run:

```bash
cd hevy-ai-trainer
npm install
```

### Step 2: Get Your Hevy API Key (2 min)

1. Open your web browser
2. Go to https://hevyapp.com/api-key
3. Log in with your Hevy account
4. Copy your API key

### Step 3: Configure Environment (1 min)

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux use `cp .env.example .env`)

2. Open `.env` in any text editor
3. Replace `your_api_key_here` with your actual API key:
   ```
   HEVY_API_KEY=hvy_sk_abc123xyz456...
   ```

### Step 4: Test with Dry Run (1 min)

Run the app in dry-run mode to preview without creating a routine:

```bash
npm run dev -- --dry-run
```

You should see:
- Your workout history being analyzed
- Exercise categorization
- A planned routine with 6-8 exercises
- Estimated duration ~60 minutes

### Step 5: Create Your First AI Routine!

If the dry-run looks good, run without the flag:

```bash
npm run dev
```

The routine will be created in your Hevy app under the "AI Routines" folder!

---

## ⚙️ Common Customizations

### Change Session Length

60 minutes too short? Try 90:

```bash
npm run dev -- --duration 90
```

### Use a Different Folder

```bash
npm run dev -- --folder "Morning Workouts"
```

### Edit Focus Muscles

Open `config/default.json` and change:

```json
"focusMuscles": ["arms", "shoulders", "chest"]
```

To whatever you want, like:

```json
"focusMuscles": ["legs", "back"]
```

### Adjust Training Volume

In `config/default.json`, under `hypertrophy`:

```json
"setsPerExercise": [3, 4],  // Min and max sets
"repsRange": [6, 12],       // Hypertrophy range
"restCompound": 120,        // 2 minutes for compounds
"restIsolation": 90         // 1.5 minutes for isolation
```

---

## 🐛 Troubleshooting

### "HEVY_API_KEY is required"
- Make sure `.env` file exists
- Check that there are no extra spaces around the API key
- Verify the key starts with `hvy_sk_`

### "Found 0 relevant exercises"
- Ensure you have workout history in Hevy
- Check that your workouts include the target muscles (arms, shoulders, chest by default)
- Try changing `focusMuscles` in the config

### "Cannot find module..."
- Run `npm install` again
- Delete `node_modules` folder and run `npm install`

### API Errors (401, 403)
- Verify your API key is correct
- Ensure your Hevy PRO subscription is active
- Try generating a new API key from Hevy

---

## 📱 Finding Your Routine in Hevy

1. Open the Hevy app
2. Tap "Routines" at the bottom
3. Look for the "AI Routines" folder
4. Find today's date (e.g., "AI Routine 2026-02-11")
5. Tap to view and start your workout!

---

## 🎯 Next Steps

- Run `npm test` to see all tests pass
- Customize the training config to your preferences
- Try scheduling it to run automatically each day
- Extend the agents to add new features

**Need help?** Check the full README.md for detailed documentation.

---

Happy training! 💪🤖
