# Adaptive Progressive Overload System

## 🧠 **How It Works**

The system tracks your last 5 performances for each exercise and analyzes trends to adapt weight progression intelligently.

---

## 📊 **Performance Trend Detection**

### **Analyzing Last 3 Workouts:**

The system compares volume (weight × reps) across your last 3 sessions:

```
Workout 1 (most recent): 50kg × 10 = 500
Workout 2: 48kg × 10 = 480
Workout 3 (oldest): 46kg × 10 = 460
```

**Trend: 📈 IMPROVING** → Each workout is better than the previous

---

### **Three Possible Trends:**

1. **📈 Improving**: Volume increasing consistently
   - You're getting stronger!
   - Apply standard progression: **+2.5%**

2. **➡️ Plateaued**: Volume stable or mixed
   - You're stuck at the same level
   - Apply micro-progression: **+1%**
   - Small increases break through plateaus

3. **📉 Regressing**: Volume decreasing
   - You're struggling or overtrained
   - Apply deload: **-2.5%**
   - Reduce weight to allow recovery

---

## ⚙️ **Adaptive Weight Calculation**

### **The Formula:**

```typescript
if (regressing || consecutiveFailures >= 2) {
  newWeight = lastWeight × 0.975  // -2.5% deload
}
else if (plateaued || consecutiveFailures === 1) {
  newWeight = lastWeight × 1.01   // +1% micro-progression
}
else if (improving) {
  newWeight = lastWeight × 1.025  // +2.5% standard progression
}
else {
  newWeight = lastWeight × 1.00   // maintain
}
```

---

## 🎯 **Real Examples from Your Data**

### **Example 1: Butterfly (Plateaued)**

**Performance History:**
- Session 1: 70kg × 10
- Session 2: 68kg × 11
- Session 3: 70kg × 9

**Analysis**: Mixed results, no clear upward trend
**Trend**: ➡️ Plateaued
**Action**: Micro-progression → **70kg + 1% = 70.5kg** (rounded to 70kg)

**Why it works**: Small 1% increases are achievable when 2.5% would fail

---

### **Example 2: Lateral Raise (Improving)**

**Performance History:**
- Session 1: 20kg × 10 = 200 volume
- Session 2: 19kg × 10 = 190 volume
- Session 3: 18kg × 10 = 180 volume

**Analysis**: Clear upward trend!
**Trend**: 📈 Improving
**Action**: Full progression → **20kg + 2.5% = 20.5kg**

**Why it works**: You're demonstrating strength gains, push further!

---

### **Example 3: Hypothetical Regressing Case**

**Performance History:**
- Session 1: 50kg × 8 = 400
- Session 2: 52kg × 8 = 416
- Session 3: 54kg × 8 = 432

**Analysis**: Volume decreasing (overreaching)
**Trend**: 📉 Regressing
**Action**: Deload → **50kg - 2.5% = 48.5kg**

**Why it works**: Reduce stress, allow recovery, come back stronger

---

## 🔄 **The Feedback Loop**

```
┌─────────────────────────────────────────────┐
│  Perform Workout in Hevy App                │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Agent A: Fetch workout data via API        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Agent B: Analyze last 3-5 performances     │
│           - Calculate volumes               │
│           - Detect trend (↗ ➡ ↘)           │
│           - Track consecutive failures      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Agent B: Calculate adaptive weight         │
│           - Improving: +2.5%                │
│           - Plateaued: +1%                  │
│           - Regressing: -2.5%               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Agent B: Generate next routine             │
│           - Dynamic weight per set          │
│           - Pyramid/Wave/Flat patterns      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Agent C: Publish to Hevy                   │
│           - New routine with adapted        │
│             weights ready to perform        │
└──────────────┬──────────────────────────────┘
               │
               ▼
       Perform next workout
              │
              └─────> Loop continues
```

---

## 💡 **Benefits**

### **1. Prevents Overreaching**
- Won't blindly add weight if you're struggling
- Automatically reduces load when performance drops

### **2. Breaks Plateaus**
- Micro-progression (1%) succeeds where larger jumps fail
- Small wins build momentum

### **3. Optimizes Recovery**
- Deload feature prevents burnout
- System adapts to your actual capacity

### **4. Maximizes Gains**
- Standard progression when you're improving
- Pushes you appropriately based on performance

### **5. Individual Exercise Tracking**
- Each exercise has its own trend
- Chest might be improving while shoulders plateau
- Independent adaptation per movement

---

## 📈 **Long-Term Strategy**

### **Month 1-2: Building Base**
- Most exercises start as "plateaued" (no trend data)
- Micro-progressions establish new baselines
- System learns your capacity

### **Month 3-6: Progressive Overload**
- Clear trends emerge
- Improving exercises get 2.5% increases
- Plateaus get micro-bumps
- Occasional deloads maintain sustainability

### **Month 6+: Optimized Training**
- System fully adapted to your patterns
- Intelligent cycling between progression and maintenance
- Maximum gains with minimal risk

---

## 🔧 **Manual Override (Future Feature)**

If you want to force a specific progression:

```bash
# Not yet implemented, but planned:
npm run dev -- --force-progression=2.5  # Override to 2.5% for all
npm run dev -- --deload                  # Force deload week
```

---

## 🎓 **Training Wisdom Applied**

This system implements proven periodization principles:

1. **Auto-regulation**: Adjusts based on performance, not arbitrary schedules
2. **Progressive Overload**: Core principle of strength training
3. **Deload Cycles**: Prevents overtraining
4. **Individual Variability**: Different exercises progress differently
5. **Sustainable Growth**: Long-term gains over short-term spikes

---

## ✅ **Summary**

Your system now:
- ✅ Tracks performance trends per exercise
- ✅ Adapts weight progression (2.5% / 1% / -2.5%)
- ✅ Prevents runaway progression
- ✅ Breaks plateaus with micro-steps
- ✅ Applies deload when regressing
- ✅ Shows trend indicators in routine notes

**Result**: Sustainable, intelligent training that adapts to YOUR capacity, not arbitrary percentages! 💪🧠📊
