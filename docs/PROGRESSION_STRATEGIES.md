# Progression Strategies - Scientific Implementation

## Overview

Each exercise is assigned a **deterministic progression strategy** based on scientific hypertrophy principles. The same exercise will always use the same strategy for consistency and optimal adaptation.

---

## Strategy Types

### 1. Reverse Pyramid (Heavy → Light)
**Pattern:** Set 1: 100% @ 6 reps → Set 4: 80% @ 12 reps

**Scientific Rationale:**
- Central Nervous System (CNS) is freshest at session start
- Maximal neural drive for heavy loads
- Progressive fatigue allows higher rep work as session continues
- Targets both myofibrillar (strength) and sarcoplasmic (size) adaptations

**Applied To:**
- ✅ All compound exercises
- ✅ Multi-joint movements (bench press, shoulder press, rows, squats)
- ✅ Exercises requiring high neural drive

**Examples:**
- Schulterpresse (Kurzhantel) - Shoulder Press
- Brustpresse (Maschine) - Chest Press
- Bankdrücken (Langhantel) - Barbell Bench Press
- Beinpresse - Leg Press

---

### 2. Pyramid (Light → Heavy / Ascending)
**Pattern:** Set 1: 80% @ 12 reps → Set 4: 105% @ 6 reps

**Scientific Rationale:**
- Pre-fatigue increases time under tension (TUT)
- Progressive loading maximizes mechanical tension at lengthened position
- Optimal for exercises with peak contraction or stretch
- Accumulates metabolites before peak intensity

**Applied To:**
- ✅ Stretch-focused exercises (flyes, pullovers)
- ✅ Peak contraction movements (curls)
- ✅ Exercises benefiting from pre-fatigue

**Examples:**
- Butterfly / Fliegende - Chest Flyes
- Bizepscurl (Kurzhantel) - Dumbbell Curls
- Single Arm Curl (Cable)
- Hammer Curl schräg - Incline Hammer Curls
- Überkopf-Trizepsstrecken - Overhead Tricep Extensions

---

### 3. Wave Loading (Oscillating)
**Pattern:** Heavy (95% @ 7 reps) → Moderate (85% @ 11 reps) → Heavy (95% @ 7 reps)

**Scientific Rationale:**
- Undulating periodization prevents accommodation
- Alternates between mechanical tension and metabolic stress
- Ideal for high-frequency training (prevents stagnation)
- Keeps nervous system responsive

**Applied To:**
- ✅ High-frequency exercises (trained >30 times in history)
- ✅ Isolation movements prone to adaptation
- ✅ Exercises where variety enhances hypertrophy

**Examples:**
- Seitheben (Kurzhantel) - Lateral Raises (high frequency)
- Face Pull (high frequency)
- Rudern sitzend (Maschine) - Seated Row Machine
- Latzug (Kabel) - Cable Lat Pulldown (high frequency)

---

### 4. Flat Load (Constant Weight)
**Pattern:** Same weight across all sets with slight rep variation

**Scientific Rationale:**
- Consistent volume maximizes metabolic stress
- Ideal for sarcoplasmic hypertrophy (pump/cell swelling)
- Simple progression tracking
- Best for single-joint movements

**Applied To:**
- ✅ Single-joint isolation exercises
- ✅ Movements targeting "the pump"
- ✅ Extensions, pushdowns, raises (non-stretch focused)

**Examples:**
- Trizepsdrücken - Tricep Pushdowns
- Einarmiges Trizepsdrücken (Kabel) - Single Arm Cable Pushdown
- Frontheben (Kurzhantel) - Front Raises
- Stirndrücken (Kurzhantel) - Skull Crushers
- Seitheben (Kabel) - Cable Lateral Raises

---

## Assignment Logic

```
IF exercise is COMPOUND (multi-joint):
  → Use REVERSE PYRAMID

ELSE IF exercise frequency > 30 workouts:
  → Use WAVE LOADING

ELSE IF exercise name contains "fly", "butterfly", "curl", "pullover":
  → Use PYRAMID (ascending)

ELSE IF exercise name contains "raise", "heben", "pushdown", "drücken", "pull":
  → Use FLAT LOAD

ELSE (default for isolation):
  → Use PYRAMID (ascending)
```

---

## Consistency Guarantee

**Same Exercise = Same Strategy**

The system uses deterministic logic based on:
1. Exercise name patterns (German & English)
2. Compound vs. isolation classification
3. Training frequency history
4. Movement characteristics

This ensures:
- ✅ Predictable adaptations
- ✅ Clear progress tracking
- ✅ Proper recovery patterns
- ✅ Optimal neural adaptation

---

## Scientific References

### Reverse Pyramid
- González-Badillo et al. (2006) - Neural adaptations decline with fatigue
- Schoenfeld (2010) - Heavy loads first optimize strength-hypertrophy continuum

### Pyramid (Ascending)
- Burd et al. (2010) - Time under tension with progressive loading
- Schoenfeld (2013) - Metabolic stress enhances hypertrophy response

### Wave Loading
- Rhea et al. (2002) - Periodization prevents accommodation
- Buford et al. (2007) - Undulating periodization superior for hypertrophy

### Flat Load
- Goto et al. (2004) - Constant load maximizes metabolic stress
- Schoenfeld (2013) - Cellular swelling triggers hypertrophy

---

## Example Routine with Strategies

```
1. Schulterpresse (Kurzhantel) - REVERSE PYRAMID
   100% @ 6 → 92% @ 8 → 85% @ 10 → 80% @ 12

2. Butterfly - WAVE LOADING
   95% @ 7 → 85% @ 11 → 95% @ 7

3. Einarmiges Trizepsdrücken - FLAT LOAD
   100% @ 9 → 100% @ 9 → 100% @ 9 → 100% @ 9

4. Single Arm Curl - PYRAMID
   80% @ 12 → 90% @ 10 → 100% @ 8 → 105% @ 6
```

---

## Adaptive Progressive Overload

All strategies incorporate **adaptive weight progression**:

- **Improving trend:** +2.5% (standard progression)
- **Plateaued:** +1% (micro-progression)
- **Regressing:** -2.5% (deload for recovery)

This ensures progressive overload is applied intelligently across all strategy types.

---

**Generated by Hevy AI Trainer**
*Science-Based Hypertrophy Training*
