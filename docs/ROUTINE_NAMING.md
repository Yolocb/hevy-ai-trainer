# Routine Naming System

## Overview

Routines are now named based on **muscle group emphasis** and **training focus** rather than dates. This provides clear, descriptive names that reflect the workout's purpose.

---

## Naming Categories

### 1. Complete Upper Body
**When:** Chest + Shoulders + Arms all included
**Names:**
- "Fellowship Complete Upper" - The complete fellowship of muscle groups
- "Mithril Total Upper Body" - Legendary unbreakable strength
- "Council of Elrond Session" - All groups gathered for one purpose
- "Return of the Gains" - Epic comeback training
- "Tower of Ecthelion Push" - Reaching new heights
- "Paths of the Swole" - Journey to complete development
- "March of the Ents" - Powerful, unstoppable force
- "Army of the Muscled" - Complete mobilization

**Example Composition:**
- Chest press (compound)
- Shoulder press (compound)
- Chest isolation (flyes/butterfly)
- Shoulder isolation (raises)
- Triceps exercise
- Biceps exercise

---

### 2. Chest & Shoulders
**When:** Both chest and shoulders included, limited arm work
**Names:**
- "Mithril Push Power" - Legendary pressing strength
- "Elven Upper Body Strength" - Graceful yet powerful
- "Dwarven Pressing Power" - Mighty and enduring
- "Gondor Chest & Shoulders" - Noble and strong
- "Rohan Pressing Session" - Swift and powerful
- "Rivendell Upper Strength" - Timeless power
- "Erebor Push Training" - Mountain forge strength
- "Strength of Numenor" - Ancient legendary power

**Example Composition:**
- Incline chest press
- Shoulder press
- Chest flyes
- Lateral raises

---

### 3. Chest & Arms
**When:** Chest exercises + arm specialization
**Names:**
- "Fellowship Chest & Arms" - United strength training
- "Legendary Upper Body Pump" - Epic muscle engagement
- "Quest Pressing + Arms" - Journey toward peak performance
- "Mithril Chest Triceps Focus" - Unbreakable upper body
- "Shire Strength Builder" - Humble yet effective
- "Lothlorien Arms & Chest" - Elegant power combination
- "One Rep to Rule Them All" - Iconic maximal effort
- "Aragorn Upper Power" - Ranger strength and endurance

**Example Composition:**
- Bench press
- Chest flyes
- Tricep pushdowns
- Bicep curls
- Additional arm work

---

### 4. Shoulders & Arms
**When:** Shoulder exercises + arm specialization
**Names:**
- "Elven Shoulders & Arms" - Precise and graceful
- "Forge Deltoid Development" - Crafting powerful shoulders
- "Helm's Deep Shoulder Blast" - Defensive strength
- "Gandalf Upper Sculpt" - Wise and powerful training
- "Isengard Arm Builder" - Industrial strength building
- "Minas Tirith Deltoids" - Tower of strength
- "Legolas Shoulder Precision" - Accurate and focused
- "Strength of the Rohirrim" - Horse-lord power

**Example Composition:**
- Shoulder press
- Lateral raises
- Front raises
- Tricep extensions
- Bicep variations

---

### 5. Arm Specialization
**When:** Primary focus on biceps and triceps
**Names:**
- "Dwarven Arm Specialization" - Mighty and focused
- "Forge Arm Development" - Crafting powerful arms
- "Mithril Biceps Triceps Focus" - Legendary arm strength
- "Gimli Peak Arms" - Dwarf warrior power
- "Moria Arm Builder" - Deep strength training
- "Battle of Pelennor Arms" - Epic arm warfare
- "Strength & Honor Focus" - Warrior's dedication
- "Swords Reforged Protocol" - Rebuilding strength

**Example Composition:**
- Multiple tricep exercises
- Multiple bicep exercises
- Minimal compound work

---

### 6. Chest Specialization
**When:** Dominant chest focus
**Names:**
- "Mithril Chest Focus" - Legendary chest armor
- "Forge Pec Development" - Crafting powerful pecs
- "Dwarven Chest Builder" - Mountain-strong torso
- "Boromir Chest Protocol" - Warrior chest training
- "Shield Wall Pec Session" - Defensive strength
- "Armor of Gondor Build" - Noble chest development
- "King's Chest Hypertrophy" - Royal chest growth
- "Uruk-Hai Chest Power" - Berserker chest strength

**Example Composition:**
- 2+ chest compounds
- Chest isolation
- Limited other muscle groups

---

### 7. Shoulder Specialization
**When:** Dominant shoulder focus
**Names:**
- "Elven Shoulder Focus" - Graceful deltoid power
- "Forge Deltoid Builder" - Crafting mighty shoulders
- "Eagles Are Coming Delts" - Soaring shoulder strength
- "Beacon Hill Shoulders" - Signal of strength
- "White Tree Deltoid Build" - Noble shoulder growth
- "Strider Shoulder Protocol" - Ranger endurance
- "Horn of Gondor Session" - Call to shoulder strength
- "Shadowfax Shoulder Speed" - Swift and powerful

**Example Composition:**
- 2+ shoulder presses
- Multiple raise variations
- Limited other muscle groups

---

## Name Selection Logic

The system analyzes the generated routine and determines:

1. **Chest Focus:** Has chest compound OR chest isolation?
2. **Shoulder Focus:** Has shoulder compound OR shoulder isolation?
3. **Arm Focus:** Has both triceps AND biceps?

Then applies this decision tree:

```
IF chest + shoulders + arms:
  → "Complete Upper" category

ELSE IF chest + shoulders:
  → "Chest & Shoulders" category

ELSE IF chest + arms:
  → "Chest & Arms" category

ELSE IF shoulders + arms:
  → "Shoulders & Arms" category

ELSE IF chest only:
  → "Chest Specialization" category

ELSE IF shoulders only:
  → "Shoulder Specialization" category

ELSE IF arms only:
  → "Arm Specialization" category

ELSE:
  → Default to "Complete Upper"
```

---

## Consistency

The name is **deterministic** based on:
- Current date (day + month)
- Number of exercises in routine

This ensures:
- ✅ Same day + same composition = same name
- ✅ Different compositions on same day = different names
- ✅ Consistent naming for similar routines

---

## Benefits

### Clear Purpose
Names immediately communicate workout focus:
- "Fellowship Chest & Arms" → Complete chest and arm training
- "Helm's Deep Shoulder Blast" → Defensive shoulder strength

### Epic Motivation
Lord of the Rings inspired names add legendary inspiration:
- "One Rep to Rule Them All" - Makes every rep feel heroic
- "Return of the Gains" - Comeback motivation
- "March of the Ents" - Unstoppable power and patience
- "Eagles Are Coming Delts" - Victory is near

### Better Organization
In Hevy app, routines are grouped by theme:
- Easy to find chest-focused workouts
- Identify arm specialization sessions
- Track balanced vs. focused training

### Professional & Epic Appearance
Combines fitness terminology with Middle-earth mythology:
- "Mithril Push Power" - Unbreakable strength
- "Fellowship" - Unity and complete training
- "Forge" - Strength building and craftsmanship
- More inspiring than generic "AI Routine 2026-02-11"

### Tracking Progress
Clear focus allows better tracking:
- Compare all "Mithril Chest Focus" sessions
- Track "Council of Elrond Session" progression
- Identify specialization cycles

---

## Lord of the Rings Reference Guide

### Iconic Places
- **Gondor** - The great kingdom of Men, symbolizing nobility and strength
- **Rohan** - Land of horse-lords, representing speed and power
- **Rivendell** - Elven sanctuary, timeless strength and wisdom
- **Erebor** - The Lonely Mountain, dwarven forge of legendary items
- **Shire** - Humble beginnings leading to greatness
- **Lothlorien** - Mystical elven forest, grace and power combined
- **Minas Tirith** - Tower of Guard, defensive strength
- **Isengard** - Industrial power and strength building
- **Helm's Deep** - Legendary defensive fortress
- **Moria** - Ancient dwarven kingdom, deep strength

### Legendary Characters
- **Aragorn** - Ranger turned king, endurance and leadership
- **Gandalf** - Wise and powerful wizard
- **Legolas** - Elven archer, precision and grace
- **Gimli** - Dwarf warrior, mighty and steadfast
- **Boromir** - Noble warrior of Gondor
- **Shadowfax** - Fastest horse in Middle-earth

### Iconic Elements
- **Mithril** - Legendary unbreakable metal, stronger than steel
- **Fellowship** - United strength, nine companions
- **Council of Elrond** - Gathering of all free peoples
- **One Ring** - "One to rule them all" - ultimate power
- **White Tree** - Symbol of Gondor's kings
- **Eagles** - "The Eagles are coming!" - salvation and victory
- **Ents** - Ancient tree shepherds, slow but unstoppable
- **Beacon Hills** - Signal fires of warning and gathering
- **Horn of Gondor** - Call to arms and courage
- **Uruk-Hai** - Powerful orc warriors
- **Rohirrim** - Riders of Rohan, cavalry strength

### Epic Phrases Adapted
- **"One Rep to Rule Them All"** - Inspired by "One Ring to rule them all"
- **"Return of the Gains"** - From "Return of the King"
- **"Paths of the Swole"** - From "Paths of the Dead"
- **"March of the Ents"** - The unstoppable tree march
- **"Army of the Muscled"** - From "Army of the Dead"
- **"Battle of Pelennor"** - Epic battle on Pelennor Fields
- **"Strength & Honor"** - Warrior's creed
- **"Swords Reforged"** - From reforging of Narsil to Andúril
- **"Eagles Are Coming"** - Moment of salvation
- **"Tower of Ecthelion"** - Highest tower of Minas Tirith
- **"Shield Wall"** - Defensive formation
- **"Armor of Gondor"** - Noble protection
- **"Strength of Numenor"** - Ancient legendary civilization

---

## Examples from Real Generations

```
ROUTINE: Mithril Total Upper Body
- Incline Chest Press
- Shoulder Press
- Butterfly
- Lateral Raises
- Tricep Pushdowns
- Hammer Curls
- Seated Row

→ Name: "Mithril Total Upper Body"
→ Reason: Chest + Shoulders + Arms = Complete upper body
```

```
ROUTINE: Fellowship Chest & Arms
- Bench Press
- Chest Flyes
- Tricep Extensions
- Skull Crushers
- Bicep Curls

→ Name: "Fellowship Chest & Arms"
→ Reason: Chest dominant with arm work, no shoulders
```

```
ROUTINE: Forge Deltoid Builder
- Arnold Press
- Shoulder Press
- Lateral Raises
- Front Raises
- Face Pulls

→ Name: "Forge Deltoid Builder"
→ Reason: Shoulder specialization focus
```

---

## Future Enhancements

Potential LOTR-inspired naming additions:

### Intensity Indicators
- **Power**: "Balrog Power Session" vs **Volume**: "Mines of Moria Volume"
- **Explosive**: "Oliphant Charge" vs **Endurance**: "Long Road Marathon"

### Periodization Phases
- **Strength Block**: "Siege of Minas Tirith" vs **Hypertrophy Block**: "Gardens of Gondor"
- **Power Phase**: "Wraith King Power" vs **Volume Phase**: "Bulk of the Mountain"

### Training Splits
- **Push Day A**: "Black Gate Push" vs **Push Day B**: "Doors of Durin Push"
- **Upper A**: "Hobbiton Upper" vs **Upper B**: "Mordor Upper"

### Specialty Techniques
- **Drop Sets**: "Fall of Isengard Drops"
- **Rest-Pause**: "Breath of the Valar Protocol"
- **Supersets**: "Twin Towers Supersets"
- **Giant Sets**: "War of the Ring Giants"

### Character-Themed Progressions
- **Frodo's Journey**: Beginner to advanced progression
- **Aragorn's Path**: Ranger to King strength progression
- **Gandalf's Return**: The Grey to The White power increase

### Battle-Themed Workouts
- "Siege Strength Protocol"
- "Cavalry Charge Cardio"
- "Orc Slayer Upper Body"
- "Troll Destroyer Workout"

---

**Current Implementation:** LOTR-inspired descriptive names based on muscle group composition
**Version:** 2.0 - Middle-earth Edition
**Last Updated:** 2026-02-12
