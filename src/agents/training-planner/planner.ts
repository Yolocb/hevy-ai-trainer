/**
 * AGENT B: Training Logic & Routine Planner
 *
 * Core planning logic for generating optimal training routines
 */

import { ExerciseStats } from './analyzer';
import { TrainingConfig, HypertrophyRules as Rules } from './rules';

export interface PlannedSet {
  type: 'normal' | 'warmup';
  reps: number;
  targetWeight?: number;
  restSeconds: number;
}

export interface PlannedExercise {
  exerciseTemplateId: string;
  exerciseName: string;
  sets: PlannedSet[];
  notes?: string;
  isCompound: boolean;
  estimatedDurationSeconds: number;
  progressionStrategy?: 'pyramid' | 'reverse-pyramid' | 'wave' | 'flat';
}

export interface PlannedRoutine {
  title: string;
  exercises: PlannedExercise[];
  totalEstimatedMinutes: number;
  notes: string;
}

export class RoutinePlanner {
  /**
   * Plan today's routine based on historical stats and training config
   */
  planTodayRoutine(
    categorizedStats: ReturnType<import('./analyzer').WorkoutAnalyzer['categorizeExercises']>,
    config: TrainingConfig,
    theme: string = 'lotr'
  ): PlannedRoutine {
    const selectedExercises: PlannedExercise[] = [];
    let totalDuration = 0;
    const targetSeconds = config.targetSessionMinutes * 60;

    // Selection strategy: balanced focus on chest, shoulders, arms
    // 1-2 chest compound
    this.selectExercises(
      categorizedStats.chestCompound,
      1,
      config,
      selectedExercises,
      'chest compound'
    );

    // 1-2 shoulder compound
    this.selectExercises(
      categorizedStats.shoulderCompound,
      1,
      config,
      selectedExercises,
      'shoulder compound'
    );

    // 1-2 chest isolation
    this.selectExercises(
      categorizedStats.chestIsolation,
      1,
      config,
      selectedExercises,
      'chest isolation'
    );

    // 1-2 shoulder isolation
    this.selectExercises(
      categorizedStats.shoulderIsolation,
      1,
      config,
      selectedExercises,
      'shoulder isolation'
    );

    // 1-2 triceps
    this.selectExercises(
      categorizedStats.triceps,
      1,
      config,
      selectedExercises,
      'triceps'
    );

    // 1-2 biceps
    this.selectExercises(
      categorizedStats.biceps,
      1,
      config,
      selectedExercises,
      'biceps'
    );

    // Calculate total duration
    totalDuration = selectedExercises.reduce(
      (sum, ex) => sum + ex.estimatedDurationSeconds,
      0
    );

    // If we're under target and have room, add one more exercise
    const [minExercises, maxExercises] = config.exerciseCount;
    if (
      selectedExercises.length < maxExercises &&
      totalDuration < targetSeconds * 0.85
    ) {
      // Add from "other" or double up on a category
      const remaining = [
        ...categorizedStats.other,
        ...categorizedStats.chestIsolation.slice(1),
        ...categorizedStats.shoulderIsolation.slice(1),
      ].filter(
        (s) =>
          !selectedExercises.some((e) => e.exerciseTemplateId === s.exerciseTemplateId)
      );

      if (remaining.length > 0) {
        this.selectExercises(remaining, 1, config, selectedExercises, 'additional');
        totalDuration = selectedExercises.reduce(
          (sum, ex) => sum + ex.estimatedDurationSeconds,
          0
        );
      }
    }

    // Generate intelligent routine title based on exercise composition
    const title = this.generateRoutineTitle(selectedExercises, categorizedStats, theme);

    return {
      title,
      exercises: selectedExercises,
      totalEstimatedMinutes: Math.round(totalDuration / 60),
      notes: `AI-generated hypertrophy routine focusing on ${config.focusMuscles.join(', ')}. Progressive overload applied.`,
    };
  }

  /**
   * Generate intelligent routine title based on exercise composition and focus
   * Uses descriptive names that reflect training emphasis
   */
  private generateRoutineTitle(
    selectedExercises: PlannedExercise[],
    categorizedStats: ReturnType<import('./analyzer').WorkoutAnalyzer['categorizeExercises']>,
    theme: string = 'lotr'
  ): string {
    // Count exercise types
    const hasChestCompound = selectedExercises.some(e =>
      categorizedStats.chestCompound.some(s => s.exerciseTemplateId === e.exerciseTemplateId)
    );
    const hasShoulderCompound = selectedExercises.some(e =>
      categorizedStats.shoulderCompound.some(s => s.exerciseTemplateId === e.exerciseTemplateId)
    );
    const hasTriceps = selectedExercises.some(e =>
      categorizedStats.triceps.some(s => s.exerciseTemplateId === e.exerciseTemplateId)
    );
    const hasBiceps = selectedExercises.some(e =>
      categorizedStats.biceps.some(s => s.exerciseTemplateId === e.exerciseTemplateId)
    );
    const hasChestIsolation = selectedExercises.some(e =>
      categorizedStats.chestIsolation.some(s => s.exerciseTemplateId === e.exerciseTemplateId)
    );
    const hasShoulderIsolation = selectedExercises.some(e =>
      categorizedStats.shoulderIsolation.some(s => s.exerciseTemplateId === e.exerciseTemplateId)
    );

    // Determine primary focus
    const chestFocus = hasChestCompound || hasChestIsolation;
    const shoulderFocus = hasShoulderCompound || hasShoulderIsolation;
    const armFocus = hasTriceps && hasBiceps;

    // Get theme-specific names
    const names = this.getThemeNames(theme);

    // Select appropriate category
    let categoryNames: string[];

    if (chestFocus && shoulderFocus && armFocus) {
      categoryNames = names.fullUpper;
    } else if (chestFocus && shoulderFocus) {
      categoryNames = names.chestShoulder;
    } else if (chestFocus && armFocus) {
      categoryNames = names.chestArms;
    } else if (shoulderFocus && armFocus) {
      categoryNames = names.shoulderArms;
    } else if (chestFocus) {
      categoryNames = names.chestSpecialization;
    } else if (shoulderFocus) {
      categoryNames = names.shoulderSpecialization;
    } else if (armFocus) {
      categoryNames = names.armSpecialization;
    } else {
      categoryNames = names.fullUpper;
    }

    // Use consistent randomization based on current date + exercise count
    // This ensures same day + same composition = same name
    const today = new Date();
    const seed = today.getDate() + today.getMonth() * 31 + selectedExercises.length;
    const index = seed % categoryNames.length;

    return categoryNames[index];
  }

  /**
   * Get theme-specific routine names
   */
  private getThemeNames(theme: string) {
    const themes: Record<string, any> = {
      lotr: {
        chestShoulder: [
          'Mithril Push Power',
          'Elven Upper Body Strength',
          'Dwarven Pressing Power',
          'Gondor Chest & Shoulders',
          'Rohan Pressing Session',
          'Rivendell Upper Strength',
          'Erebor Push Training',
          'Strength of Numenor',
        ],
        chestArms: [
          'Fellowship Chest & Arms',
          'Legendary Upper Body Pump',
          'Quest Pressing + Arms',
          'Mithril Chest Triceps Focus',
          'Shire Strength Builder',
          'Lothlorien Arms & Chest',
          'One Rep to Rule Them All',
          'Aragorn Upper Power',
        ],
        shoulderArms: [
          'Elven Shoulders & Arms',
          'Forge Deltoid Development',
          'Helm\'s Deep Shoulder Blast',
          'Gandalf Upper Sculpt',
          'Isengard Arm Builder',
          'Minas Tirith Deltoids',
          'Legolas Shoulder Precision',
          'Strength of the Rohirrim',
        ],
        fullUpper: [
          'Fellowship Complete Upper',
          'Mithril Total Upper Body',
          'Council of Elrond Session',
          'Return of the Gains',
          'Tower of Ecthelion Push',
          'Paths of the Swole',
          'March of the Ents',
          'Army of the Muscled',
        ],
        armSpecialization: [
          'Dwarven Arm Specialization',
          'Forge Arm Development',
          'Mithril Biceps Triceps Focus',
          'Gimli Peak Arms',
          'Moria Arm Builder',
          'Battle of Pelennor Arms',
          'Strength & Honor Focus',
          'Swords Reforged Protocol',
        ],
        chestSpecialization: [
          'Mithril Chest Focus',
          'Forge Pec Development',
          'Dwarven Chest Builder',
          'Boromir Chest Protocol',
          'Shield Wall Pec Session',
          'Armor of Gondor Build',
          'King\'s Chest Hypertrophy',
          'Uruk-Hai Chest Power',
        ],
        shoulderSpecialization: [
          'Elven Shoulder Focus',
          'Forge Deltoid Builder',
          'Eagles Are Coming Delts',
          'Beacon Hill Shoulders',
          'White Tree Deltoid Build',
          'Strider Shoulder Protocol',
          'Horn of Gondor Session',
          'Shadowfax Shoulder Speed',
        ],
      },
      terminator: {
        chestShoulder: [
          'COMBAT PROTOCOL ALPHA',
          'UPPER BODY TERMINATION',
          'PRESSING SEQUENCE ACTIVE',
          'SKYNET CHEST DELTOID',
          'CYBERDYNE PUSH SYSTEM',
          'T-800 UPPER PROTOCOL',
          'JUDGMENT DAY PRESSING',
          'NEURAL NET PUSH SEQUENCE',
        ],
        chestArms: [
          'CHEST ARM PROTOCOL',
          'PUMP PROTOCOL ENGAGED',
          'PRESSING + ARM SEQUENCE',
          'TRICEP CHEST PROTOCOL',
          'UPPER BODY TERMINATOR',
          'ARM CHEST EXECUTION',
          'RESISTANCE PROTOCOL 101',
          'ARNOLD PROTOCOL ALPHA',
        ],
        shoulderArms: [
          'DELTOID ARM SEQUENCE',
          'SHOULDER PROTOCOL BETA',
          'DELTOID BLAST SYSTEM',
          'UPPER LIMB PROTOCOL',
          'ARM BUILDER SEQUENCE',
          'SHOULDER PROTOCOL DELTA',
          'PRECISION ARM SYSTEM',
          'DELTOID STRENGTH MATRIX',
        ],
        fullUpper: [
          'COMPLETE UPPER PROTOCOL',
          'TOTAL UPPER TERMINATION',
          'SYSTEM OVERRIDE SESSION',
          'MAXIMUM PROTOCOL ENGAGED',
          'FULL SPECTRUM PUSH',
          'COMPREHENSIVE PROTOCOL',
          'COMPLETE COMBAT SYSTEM',
          'TOTAL UPPER SEQUENCE',
        ],
        armSpecialization: [
          'ARM PROTOCOL SPECIALIZED',
          'BICEP TRICEP SYSTEM',
          'ARM FOCUS PROTOCOL',
          'PEAK ARM SEQUENCE',
          'ARM BUILDER MATRIX',
          'ARM COMBAT PROTOCOL',
          'SPECIALIZED ARM SYSTEM',
          'ARM REFORGE PROTOCOL',
        ],
        chestSpecialization: [
          'CHEST PROTOCOL FOCUSED',
          'PEC DEVELOPMENT SYSTEM',
          'CHEST BUILDER SEQUENCE',
          'PECTORAL PROTOCOL ALPHA',
          'CHEST SESSION MATRIX',
          'ARMOR BUILDING PROTOCOL',
          'CHEST HYPERTROPHY SYSTEM',
          'PEC POWER SEQUENCE',
        ],
        shoulderSpecialization: [
          'SHOULDER FOCUS PROTOCOL',
          'DELTOID BUILDER SYSTEM',
          'SHOULDER PROTOCOL OMEGA',
          'DELTOID FOCUS SEQUENCE',
          'SHOULDER BUILD MATRIX',
          'DELTOID PROTOCOL ALPHA',
          'SHOULDER SESSION SYSTEM',
          'DELTOID SPEED PROTOCOL',
        ],
      },
      cyberpunk: {
        chestShoulder: [
          'Neon Push Protocol',
          'Chrome Upper Assault',
          'Street Samurai Press',
          'Corpo Chest & Delts',
          'Night City Upper Grind',
          'Edgerunner Push Session',
          'Netrunner Press Power',
          'Cyberdeck Upper Protocol',
        ],
        chestArms: [
          'Street Cred Chest Arms',
          'Chrome Pump Session',
          'Ripperdoc Upper Build',
          'Chest Tricep Netrun',
          'Nomad Strength Build',
          'Neon Arms & Chest',
          'One Rep to Jack In',
          'Corpo Upper Power',
        ],
        shoulderArms: [
          'Neon Shoulder Arms',
          'Chrome Deltoid Dev',
          'Cyber Shoulder Blast',
          'Digital Upper Sculpt',
          'Ripperdoc Arm Builder',
          'Night City Deltoids',
          'Edgerunner Precision',
          'Street Samurai Delts',
        ],
        fullUpper: [
          'Complete Netrunner Upper',
          'Total Chrome Upper',
          'Night City Full Session',
          'Return of Street Cred',
          'Corpo Tower Push',
          'Braindance Upper Path',
          'Cyberpsycho March',
          'Nomad Upper Army',
        ],
        armSpecialization: [
          'Chrome Arm Specialist',
          'Ripperdoc Arm Dev',
          'Neon Bicep Tricep',
          'Mantis Blade Arms',
          'Cyberware Arm Build',
          'Street Fight Arms',
          'Nomad Arm Protocol',
          'Cyber Arms Reforged',
        ],
        chestSpecialization: [
          'Chrome Chest Focus',
          'Corpo Pec Dev',
          'Street Samurai Chest',
          'Netrunner Chest Protocol',
          'Edgerunner Pec Session',
          'Night City Chest Build',
          'Corpo Chest Hypertrophy',
          'Chrome Chest Power',
        ],
        shoulderSpecialization: [
          'Neon Shoulder Focus',
          'Chrome Deltoid Builder',
          'Aerial Drop Delts',
          'Megabuilding Shoulders',
          'Kiroshi Deltoid Build',
          'Nomad Shoulder Protocol',
          'Braindance Shoulder Sesh',
          'Quickhack Shoulder Speed',
        ],
      },
      viking: {
        chestShoulder: [
          'Berserker Push Power',
          'Norse Upper Strength',
          'Warrior Pressing Power',
          'Valhalla Chest & Shoulders',
          'Shield Wall Press',
          'Asgard Upper Strength',
          'Longship Push Training',
          'Strength of the North',
        ],
        chestArms: [
          'Raider Chest & Arms',
          'Legendary Viking Pump',
          'Conquest Press + Arms',
          'Thor Chest Triceps',
          'Village Strength Builder',
          'Fjord Arms & Chest',
          'One Rep to Rule North',
          'Odin Upper Power',
        ],
        shoulderArms: [
          'Valkyrie Shoulders & Arms',
          'Forge Warrior Delts',
          'Ragnarok Shoulder Blast',
          'Mjolnir Upper Sculpt',
          'Raider Arm Builder',
          'Valhalla Deltoids',
          'Berserker Precision',
          'Strength of Warriors',
        ],
        fullUpper: [
          'Complete Viking Upper',
          'Total Norse Body',
          'War Council Session',
          'Return of the Raiders',
          'Longship Push',
          'Path of the Warrior',
          'March of Vikings',
          'Army of the North',
        ],
        armSpecialization: [
          'Berserker Arm Specialist',
          'Forge Arm Development',
          'Norse Bicep Triceps',
          'Thor Peak Arms',
          'Raider Arm Builder',
          'Battle of North Arms',
          'Honor & Strength Focus',
          'Axes Reforged Protocol',
        ],
        chestSpecialization: [
          'Viking Chest Focus',
          'Forge Pec Development',
          'Warrior Chest Builder',
          'Shield Bearer Protocol',
          'Norse Pec Session',
          'Armor of Odin Build',
          'Jarl Chest Hypertrophy',
          'Berserker Chest Power',
        ],
        shoulderSpecialization: [
          'Norse Shoulder Focus',
          'Forge Deltoid Builder',
          'Ravens Coming Delts',
          'Mountain Shoulders',
          'Yggdrasil Deltoid Build',
          'Raider Shoulder Protocol',
          'War Horn Session',
          'Sleipnir Shoulder Speed',
        ],
      },
      matrix: {
        chestShoulder: [
          'Red Pill Push Power',
          'Code Upper Strength',
          'Digital Press Power',
          'Zion Chest & Shoulders',
          'Nebuchadnezzar Press',
          'Matrix Upper Strength',
          'Sentinel Push Training',
          'Strength of The One',
        ],
        chestArms: [
          'Operator Chest & Arms',
          'Legendary Code Pump',
          'Kung Fu Press + Arms',
          'Neo Chest Triceps',
          'Mainframe Builder',
          'Zion Arms & Chest',
          'One Rep to Free Minds',
          'Morpheus Upper Power',
        ],
        shoulderArms: [
          'Oracle Shoulders & Arms',
          'Code Deltoid Dev',
          'Agent Shoulder Blast',
          'Kung Fu Upper Sculpt',
          'Resistance Arm Builder',
          'Zion Deltoids',
          'Operator Precision',
          'Strength of Resistance',
        ],
        fullUpper: [
          'Complete Code Upper',
          'Total Matrix Body',
          'War Room Session',
          'Return of The One',
          'Construct Push',
          'Path of The Operator',
          'March of Resistance',
          'Army of Zion',
        ],
        armSpecialization: [
          'Operator Arm Specialist',
          'Code Arm Development',
          'Digital Bicep Triceps',
          'Neo Peak Arms',
          'Resistance Arm Builder',
          'Battle of Zion Arms',
          'Honor & Code Focus',
          'Guns Reloaded Protocol',
        ],
        chestSpecialization: [
          'Digital Chest Focus',
          'Code Pec Development',
          'Operator Chest Builder',
          'Sentinel Protocol',
          'Matrix Pec Session',
          'Armor of Zion Build',
          'Neo Chest Hypertrophy',
          'Agent Chest Power',
        ],
        shoulderSpecialization: [
          'Oracle Shoulder Focus',
          'Code Deltoid Builder',
          'Sentinels Incoming Delts',
          'Construct Shoulders',
          'Matrix Tree Deltoid Build',
          'Operator Shoulder Protocol',
          'Mainframe Session',
          'Hovership Shoulder Speed',
        ],
      },
      samurai: {
        chestShoulder: [
          'Bushido Push Power',
          'Ronin Upper Strength',
          'Warrior Press Power',
          'Dojo Chest & Shoulders',
          'Katana Press',
          'Temple Upper Strength',
          'Shogun Push Training',
          'Strength of Honor',
        ],
        chestArms: [
          'Samurai Chest & Arms',
          'Legendary Warrior Pump',
          'Discipline Press + Arms',
          'Miyamoto Chest Triceps',
          'Village Builder',
          'Kyoto Arms & Chest',
          'One Rep to Rule Dojo',
          'Musashi Upper Power',
        ],
        shoulderArms: [
          'Geisha Shoulders & Arms',
          'Forge Warrior Delts',
          'Ronin Shoulder Blast',
          'Martial Upper Sculpt',
          'Daimyo Arm Builder',
          'Temple Deltoids',
          'Samurai Precision',
          'Strength of Bushido',
        ],
        fullUpper: [
          'Complete Samurai Upper',
          'Total Warrior Body',
          'Council Session',
          'Return of the Ronin',
          'Temple Push',
          'Path of the Warrior',
          'March of Samurai',
          'Army of Honor',
        ],
        armSpecialization: [
          'Ronin Arm Specialist',
          'Forge Arm Development',
          'Bushido Bicep Triceps',
          'Miyamoto Peak Arms',
          'Dojo Arm Builder',
          'Battle of Honor Arms',
          'Discipline Focus',
          'Swords Reforged Protocol',
        ],
        chestSpecialization: [
          'Warrior Chest Focus',
          'Forge Pec Development',
          'Samurai Chest Builder',
          'Honor Guard Protocol',
          'Dojo Pec Session',
          'Armor of Shogun Build',
          'Master Chest Hypertrophy',
          'Ronin Chest Power',
        ],
        shoulderSpecialization: [
          'Samurai Shoulder Focus',
          'Forge Deltoid Builder',
          'Dragons Coming Delts',
          'Mountain Temple Shoulders',
          'Cherry Blossom Deltoid',
          'Warrior Shoulder Protocol',
          'Gong Session',
          'Wind Shoulder Speed',
        ],
      },
      spartan: {
        chestShoulder: [
          'Spartan Shield Press',
          '300 Warriors Upper Power',
          'Thermopylae Push Strength',
          'Leonidas Chest & Shoulders',
          'Phalanx Wall Press',
          'Hot Gates Upper Strength',
          'Sparta Push Training',
          'Strength of 300',
        ],
        chestArms: [
          'Spartan Chest & Arms',
          'Legendary Warrior Pump',
          'Battle Press + Arms',
          'Leonidas Chest Triceps',
          'Sparta Strength Builder',
          'Thermopylae Arms & Chest',
          'This Is Sparta Session',
          'King Leonidas Upper Power',
        ],
        shoulderArms: [
          'Spartan Shoulders & Arms',
          'Forge Warrior Delts',
          'Hot Gates Shoulder Blast',
          'Phalanx Upper Sculpt',
          '300 Arm Builder',
          'Sparta Deltoids',
          'Warrior Precision',
          'Strength of Spartans',
        ],
        fullUpper: [
          'Complete Spartan Upper',
          'Total 300 Warrior Body',
          'War Council Session',
          'Return from Battle',
          'Hot Gates Push',
          'Path of the Warrior',
          'March to Thermopylae',
          'Army of 300',
        ],
        armSpecialization: [
          'Spartan Arm Specialist',
          'Forge Arm Development',
          'Bronze Bicep Triceps',
          'Leonidas Peak Arms',
          'Sparta Arm Builder',
          'Battle of 300 Arms',
          'Honor & Strength Focus',
          'Spears Reforged Protocol',
        ],
        chestSpecialization: [
          'Spartan Chest Focus',
          'Forge Pec Development',
          'Warrior Chest Builder',
          'Shield Bearer Protocol',
          'Sparta Pec Session',
          'Bronze Armor Build',
          'King Chest Hypertrophy',
          '300 Chest Power',
        ],
        shoulderSpecialization: [
          'Spartan Shoulder Focus',
          'Forge Deltoid Builder',
          'Eagles of Sparta Delts',
          'Hot Gates Shoulders',
          'Phalanx Deltoid Build',
          'Warrior Shoulder Protocol',
          'Battle Cry Session',
          'Lightning Shoulder Speed',
        ],
      },
      got: {
        chestShoulder: [
          'Iron Throne Push Power',
          'Westeros Upper Strength',
          'Dragon Press Power',
          'King\'s Landing Chest & Shoulders',
          'Winterfell Press',
          'Castle Upper Strength',
          'House Push Training',
          'Strength of Dragons',
        ],
        chestArms: [
          'Game of Gains Chest & Arms',
          'Legendary House Pump',
          'Winter Press + Arms',
          'Jon Snow Chest Triceps',
          'Castle Builder',
          'Winterfell Arms & Chest',
          'One Rep to Rule Westeros',
          'Targaryen Upper Power',
        ],
        shoulderArms: [
          'Dragon Shoulders & Arms',
          'Forge Westeros Delts',
          'Battle Shoulder Blast',
          'Stark Upper Sculpt',
          'Lannister Arm Builder',
          'Iron Throne Deltoids',
          'Knight Precision',
          'Strength of Houses',
        ],
        fullUpper: [
          'Complete Westeros Upper',
          'Total Dragon Body',
          'Small Council Session',
          'Return of the King',
          'Castle Wall Push',
          'Path to the Throne',
          'March of Dragons',
          'Army of the Dead',
        ],
        armSpecialization: [
          'Knight Arm Specialist',
          'Forge Arm Development',
          'Dragon Bicep Triceps',
          'Jon Snow Peak Arms',
          'Winterfell Arm Builder',
          'Battle of Bastards Arms',
          'Honor & Fire Focus',
          'Swords Reforged Protocol',
        ],
        chestSpecialization: [
          'Dragon Chest Focus',
          'Forge Pec Development',
          'Knight Chest Builder',
          'King\'s Guard Protocol',
          'Castle Pec Session',
          'Armor of Houses Build',
          'King Chest Hypertrophy',
          'Dragon Chest Power',
        ],
        shoulderSpecialization: [
          'Dragon Shoulder Focus',
          'Forge Deltoid Builder',
          'Dragons Rising Delts',
          'The Wall Shoulders',
          'Iron Throne Deltoid Build',
          'Knight Shoulder Protocol',
          'Battle Horn Session',
          'Raven Shoulder Speed',
        ],
      },
    };

    return themes[theme] || themes.lotr;
  }

  /**
   * Select exercises from a category and add to the routine
   * Uses weighted randomization to ensure variety while favoring frequently-used exercises
   */
  private selectExercises(
    candidates: ExerciseStats[],
    count: number,
    config: TrainingConfig,
    selectedExercises: PlannedExercise[],
    category: string
  ): void {
    if (candidates.length === 0) return;

    let added = 0;
    const availableCandidates = candidates.filter(
      (c) => !selectedExercises.some((e) => e.exerciseTemplateId === c.exerciseTemplateId)
    );

    if (availableCandidates.length === 0) return;

    // Create a pool with weighted selection
    // Top exercises have higher weight but not guaranteed selection
    const pool = this.createWeightedPool(availableCandidates);

    for (let attempt = 0; attempt < pool.length && added < count; attempt++) {
      const stat = pool[attempt];

      // Skip if already selected
      if (
        selectedExercises.some((e) => e.exerciseTemplateId === stat.exerciseTemplateId)
      ) {
        continue;
      }

      const isCompound = Rules.isCompoundExercise(stat.exerciseName);
      const sets = this.determineSets(config);
      const strategy = this.selectProgressionStrategy(isCompound, stat);
      const plannedSets = this.planSets(stat, sets, config, isCompound);
      const duration = Rules.estimateExerciseDuration(
        sets,
        isCompound,
        config.hypertrophy
      );

      // Build notes with performance context
      const trendEmoji = {
        'improving': '📈',
        'plateaued': '➡️',
        'regressing': '📉'
      }[stat.progressionTrend || 'plateaued'];

      const trendText = stat.progressionTrend
        ? ` | ${trendEmoji} ${stat.progressionTrend}`
        : '';

      const notes = `Last: ${stat.lastPerformed?.toLocaleDateString() || 'N/A'}${trendText}`;

      selectedExercises.push({
        exerciseTemplateId: stat.exerciseTemplateId,
        exerciseName: stat.exerciseName,
        sets: plannedSets,
        isCompound,
        estimatedDurationSeconds: duration,
        progressionStrategy: strategy,
        notes,
      });

      added++;
    }
  }

  /**
   * Create a weighted pool of exercises with randomization
   * Exercises with higher frequency/volume get higher weight but variety is ensured
   */
  private createWeightedPool(candidates: ExerciseStats[]): ExerciseStats[] {
    if (candidates.length === 0) return [];
    if (candidates.length <= 2) return this.shuffleArray([...candidates]);

    // Take top performers and some variety
    const topCount = Math.min(3, candidates.length);
    const remainingCount = Math.max(0, candidates.length - topCount);

    // 70% chance to include top exercises, 30% for variety from remaining
    const pool: ExerciseStats[] = [];

    // Always include at least one top exercise
    const shuffledTop = this.shuffleArray(candidates.slice(0, topCount));
    pool.push(shuffledTop[0]);

    // Add more top exercises with probability
    for (let i = 1; i < topCount; i++) {
      if (Math.random() < 0.7) {
        pool.push(shuffledTop[i]);
      }
    }

    // Add variety from remaining exercises
    if (remainingCount > 0) {
      const remaining = this.shuffleArray(candidates.slice(topCount));
      const varietyCount = Math.min(2, remaining.length);

      for (let i = 0; i < varietyCount; i++) {
        if (Math.random() < 0.4) {  // 40% chance to include variety exercise
          pool.push(remaining[i]);
        }
      }
    }

    // Shuffle the final pool
    return this.shuffleArray(pool);
  }

  /**
   * Fisher-Yates shuffle for array randomization
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Determine number of sets for an exercise
   */
  private determineSets(config: TrainingConfig): number {
    const [min, max] = config.hypertrophy.setsPerExercise;
    // Prefer 3-4 sets for hypertrophy
    return Math.random() > 0.5 ? max : min;
  }

  /**
   * Plan individual sets with dynamic progression strategies
   *
   * Implements multiple progression schemes with ADAPTIVE overload:
   * - If improving: Apply full progression (2.5%)
   * - If plateaued: Maintain or micro-progress (1%)
   * - If regressing: Reduce load (-2.5%) to allow recovery
   *
   * 1. Pyramid (ascending): Start lighter, increase weight each set
   * 2. Reverse Pyramid: Start heavy, decrease weight each set
   * 3. Flat Load: Same weight across all sets (traditional)
   * 4. Wave Loading: Oscillate between heavy and moderate
   */
  private planSets(
    stat: ExerciseStats,
    numSets: number,
    config: TrainingConfig,
    isCompound: boolean
  ): PlannedSet[] {
    const sets: PlannedSet[] = [];
    const [minReps, maxReps] = config.hypertrophy.repsRange;

    // Calculate baseline weight with ADAPTIVE progressive overload
    const lastWeight = stat.topSet?.weight || 0;
    const baseWeight = this.calculateAdaptiveWeight(stat, lastWeight, config);

    const restTime = isCompound
      ? config.hypertrophy.restCompound
      : config.hypertrophy.restIsolation;

    // Choose progression strategy based on exercise type
    const strategy = this.selectProgressionStrategy(isCompound, stat);

    switch (strategy) {
      case 'pyramid':
        return this.createPyramidSets(numSets, baseWeight, minReps, maxReps, restTime, 'ascending');

      case 'reverse-pyramid':
        return this.createPyramidSets(numSets, baseWeight, minReps, maxReps, restTime, 'descending');

      case 'wave':
        return this.createWaveSets(numSets, baseWeight, minReps, maxReps, restTime);

      case 'flat':
      default:
        return this.createFlatSets(numSets, baseWeight, minReps, maxReps, restTime);
    }
  }

  /**
   * Calculate adaptive weight based on performance trend
   *
   * Logic:
   * - Improving: +2.5% (standard progression)
   * - Plateaued: +1% (micro-progression to break through)
   * - Regressing/Failed: -2.5% (deload for recovery)
   * - No recent data: Use last weight (maintain)
   */
  private calculateAdaptiveWeight(
    stat: ExerciseStats,
    lastWeight: number,
    config: TrainingConfig
  ): number {
    if (lastWeight === 0) return 20; // Default starting weight

    const trend = stat.progressionTrend;
    const failures = stat.consecutiveFailures || 0;

    let adjustmentPercent: number;

    if (failures >= 2 || trend === 'regressing') {
      // Deload: reduce weight to allow recovery
      adjustmentPercent = -2.5;
      console.log(`   🔄 Deload applied for ${stat.exerciseName} (regressing trend)`);
    } else if (trend === 'plateaued' || failures === 1) {
      // Micro-progression: small increase to break plateau
      adjustmentPercent = 1.0;
      console.log(`   📊 Micro-progression for ${stat.exerciseName} (plateau)`);
    } else if (trend === 'improving') {
      // Standard progression: you're getting stronger!
      adjustmentPercent = config.hypertrophy.progressiveOverload;
    } else {
      // No clear trend: maintain weight
      adjustmentPercent = 0;
      console.log(`   ➡️  Maintaining weight for ${stat.exerciseName} (no trend data)`);
    }

    const newWeight = lastWeight * (1 + adjustmentPercent / 100);
    return Math.round(newWeight * 2) / 2; // Round to nearest 0.5kg
  }

  /**
   * Select the best progression strategy for an exercise based on scientific principles
   * Strategy is deterministic per exercise for consistency
   *
   * Scientific rationale:
   * - Reverse Pyramid: Heavy compounds when CNS is fresh (max strength/neural adaptation)
   * - Pyramid (Ascending): Isolation to build up to peak contraction with pre-fatigue
   * - Wave Loading: Alternate heavy/moderate for undulating periodization (strength + hypertrophy)
   * - Flat Load: Consistent volume for metabolic stress and muscle damage
   */
  private selectProgressionStrategy(isCompound: boolean, stat: ExerciseStats):
    'pyramid' | 'reverse-pyramid' | 'wave' | 'flat' {

    const exerciseName = stat.exerciseName.toLowerCase();

    // COMPOUNDS: Reverse Pyramid (heavy first when CNS is fresh)
    // Scientific basis: Neural drive highest at session start, progressive fatigue
    // Best for: Bench press, shoulder press, rows, squats, deadlifts
    if (isCompound) {
      return 'reverse-pyramid';
    }

    // HIGH-FREQUENCY ISOLATION: Wave Loading (undulating periodization)
    // Scientific basis: Variety in loading prevents accommodation, targets both strength & hypertrophy
    // Best for: Frequently trained muscles that adapt quickly (lateral raises, face pulls)
    if (stat.frequency > 30 && !isCompound) {
      return 'wave';
    }

    // STRETCH-FOCUSED EXERCISES: Pyramid (ascending to peak stretch)
    // Scientific basis: Build fatigue for maximum mechanical tension at lengthened position
    // Best for: Flyes, pullovers, preacher curls, tricep overhead extensions
    if (
      exerciseName.includes('fly') ||
      exerciseName.includes('fliegende') ||
      exerciseName.includes('butterfly') ||
      exerciseName.includes('curl') ||
      exerciseName.includes('pullover') ||
      exerciseName.includes('überzug')
    ) {
      return 'pyramid';
    }

    // SINGLE-JOINT ISOLATION: Flat Load (constant tension/metabolic stress)
    // Scientific basis: Consistent volume for sarcoplasmic hypertrophy and pump
    // Best for: Lateral raises, tricep pushdowns, leg extensions, leg curls
    if (
      exerciseName.includes('raise') ||
      exerciseName.includes('heben') ||
      exerciseName.includes('pushdown') ||
      exerciseName.includes('drücken') ||
      exerciseName.includes('extension') ||
      exerciseName.includes('pull') && !exerciseName.includes('pullover')
    ) {
      return 'flat';
    }

    // DEFAULT: Pyramid for isolation exercises (safe progressive approach)
    return 'pyramid';
  }

  /**
   * Create pyramid sets (ascending or descending)
   */
  private createPyramidSets(
    numSets: number,
    baseWeight: number,
    minReps: number,
    maxReps: number,
    restTime: number,
    direction: 'ascending' | 'descending'
  ): PlannedSet[] {
    const sets: PlannedSet[] = [];

    for (let i = 0; i < numSets; i++) {
      let weightPercent: number;
      let reps: number;

      if (direction === 'ascending') {
        // Start light, get heavier
        // Set 1: 80% @ 12 reps, Set 2: 90% @ 10 reps, Set 3: 100% @ 8 reps, Set 4: 105% @ 6 reps
        const progress = i / (numSets - 1); // 0 to 1
        weightPercent = 0.80 + (progress * 0.25); // 80% to 105%
        reps = Math.round(maxReps - (progress * (maxReps - minReps)));
      } else {
        // Start heavy, get lighter (descending/reverse pyramid)
        // Set 1: 100% @ 6 reps, Set 2: 92% @ 8 reps, Set 3: 85% @ 10 reps, Set 4: 80% @ 12 reps
        const progress = i / (numSets - 1); // 0 to 1
        weightPercent = 1.0 - (progress * 0.20); // 100% to 80%
        reps = Math.round(minReps + (progress * (maxReps - minReps)));
      }

      sets.push({
        type: 'normal',
        reps: Math.max(minReps, Math.min(maxReps, reps)),
        targetWeight: Math.round(baseWeight * weightPercent * 2) / 2, // Round to 0.5kg
        restSeconds: restTime,
      });
    }

    return sets;
  }

  /**
   * Create wave loading sets (oscillating intensity)
   */
  private createWaveSets(
    numSets: number,
    baseWeight: number,
    minReps: number,
    maxReps: number,
    restTime: number
  ): PlannedSet[] {
    const sets: PlannedSet[] = [];
    const midReps = Math.floor((minReps + maxReps) / 2);

    for (let i = 0; i < numSets; i++) {
      // Alternate: Heavy (95%, low reps) → Moderate (85%, high reps)
      const isHeavy = i % 2 === 0;

      sets.push({
        type: 'normal',
        reps: isHeavy ? minReps + 1 : maxReps - 1,
        targetWeight: Math.round(baseWeight * (isHeavy ? 0.95 : 0.85) * 2) / 2,
        restSeconds: restTime,
      });
    }

    return sets;
  }

  /**
   * Create flat loading sets with rep variation
   */
  private createFlatSets(
    numSets: number,
    baseWeight: number,
    minReps: number,
    maxReps: number,
    restTime: number
  ): PlannedSet[] {
    const sets: PlannedSet[] = [];
    const midReps = Math.floor((minReps + maxReps) / 2);

    for (let i = 0; i < numSets; i++) {
      // Same weight, but vary reps slightly for progressive challenge
      // Set 1-2: mid reps, Set 3: mid+1, Set 4: mid-1 (fatigue simulation)
      let reps = midReps;
      if (i === numSets - 2 && numSets >= 3) reps = Math.min(maxReps, midReps + 1);
      if (i === numSets - 1 && numSets >= 4) reps = Math.max(minReps, midReps - 1);

      sets.push({
        type: 'normal',
        reps,
        targetWeight: baseWeight,
        restSeconds: restTime,
      });
    }

    return sets;
  }
}
