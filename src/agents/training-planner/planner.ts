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
    config: TrainingConfig
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
    const title = this.generateRoutineTitle(selectedExercises, categorizedStats);

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
    categorizedStats: ReturnType<import('./analyzer').WorkoutAnalyzer['categorizeExercises']>
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

    // Name patterns based on muscle group emphasis - LOTR inspired
    const names = {
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
    };

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
