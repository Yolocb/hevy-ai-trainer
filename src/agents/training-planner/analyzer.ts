/**
 * AGENT B: Training Logic & Routine Planner
 *
 * Analyzes workout history to build exercise statistics
 */

import { Workout, WorkoutExercise, ExerciseTemplate } from '../hevy-api-architect/models';

export interface ExerciseStats {
  exerciseTemplateId: string;
  exerciseName: string;
  totalSets: number;
  totalVolume: number; // kg * reps
  frequency: number; // number of workouts this exercise appeared in
  lastPerformed?: Date;
  topSet?: {
    weight: number;
    reps: number;
    date: Date;
  };
  recentPerformance?: {
    weight: number;
    reps: number;
    date: Date;
  }[]; // Last 5 performances
  avgWeight?: number;
  avgReps?: number;
  muscleGroup?: string;
  otherMuscles?: string[];
  progressionTrend?: 'improving' | 'plateaued' | 'regressing';
  consecutiveFailures?: number; // Times you couldn't hit target
}

export class WorkoutAnalyzer {
  /**
   * Build comprehensive statistics from workout history
   */
  buildExerciseStats(
    workouts: Workout[],
    exerciseTemplates: ExerciseTemplate[]
  ): Map<string, ExerciseStats> {
    const statsMap = new Map<string, ExerciseStats>();
    const templateMap = new Map(exerciseTemplates.map((t) => [t.id, t]));

    // Group workouts by exercise for trend analysis
    const exerciseHistory = new Map<string, Array<{date: Date, weight: number, reps: number}>>();

    for (const workout of workouts) {
      const workoutDate = new Date(workout.start_time);

      for (const exercise of workout.exercises) {
        const templateId = exercise.exercise_template_id;
        const template = templateMap.get(templateId);

        if (!statsMap.has(templateId)) {
          statsMap.set(templateId, {
            exerciseTemplateId: templateId,
            exerciseName: exercise.title || template?.title || 'Unknown Exercise',
            totalSets: 0,
            totalVolume: 0,
            frequency: 0,
            muscleGroup: template?.primary_muscle_group,
            otherMuscles: template?.secondary_muscle_groups || [],
            recentPerformance: [],
            consecutiveFailures: 0,
          });
        }

        const stats = statsMap.get(templateId)!;
        stats.frequency += 1;

        // Process sets
        const workingSets = exercise.sets.filter((s) => s.type === 'normal');
        stats.totalSets += workingSets.length;

        let workoutBestSet: {weight: number, reps: number} | null = null;

        for (const set of workingSets) {
          const weight = set.weight_kg || 0;
          const reps = set.reps || 0;

          // Data validation: Filter out obviously incorrect weights
          // Skip sets with unrealistic weights (likely data entry errors)
          if (weight > 300) {
            console.log(`   ⚠️  Skipping outlier: ${stats.exerciseName} - ${weight}kg (likely typo)`);
            continue;
          }

          const volume = weight * reps;

          stats.totalVolume += volume;

          // Track top set
          if (!stats.topSet || volume > stats.topSet.weight * stats.topSet.reps) {
            stats.topSet = {
              weight,
              reps,
              date: workoutDate,
            };
          }

          // Track best set this workout
          if (!workoutBestSet || volume > workoutBestSet.weight * workoutBestSet.reps) {
            workoutBestSet = { weight, reps };
          }
        }

        // Store performance history
        if (workoutBestSet && workoutBestSet.weight > 0) {
          if (!exerciseHistory.has(templateId)) {
            exerciseHistory.set(templateId, []);
          }
          exerciseHistory.get(templateId)!.push({
            date: workoutDate,
            weight: workoutBestSet.weight,
            reps: workoutBestSet.reps
          });
        }

        // Track last performed
        if (!stats.lastPerformed || workoutDate > stats.lastPerformed) {
          stats.lastPerformed = workoutDate;
        }
      }
    }

    // Analyze trends and recent performance
    for (const [templateId, stats] of statsMap.entries()) {
      const history = exerciseHistory.get(templateId) || [];

      // Sort by date and keep last 5 performances
      history.sort((a, b) => b.date.getTime() - a.date.getTime());
      stats.recentPerformance = history.slice(0, 5);

      // Detect progression trend
      if (history.length >= 3) {
        const last3 = history.slice(0, 3);
        const volumes = last3.map(h => h.weight * h.reps);

        // Check if improving (each workout better than previous)
        const improving = volumes[0] > volumes[1] && volumes[1] > volumes[2];
        const regressing = volumes[0] < volumes[1] && volumes[1] < volumes[2];

        if (improving) {
          stats.progressionTrend = 'improving';
          stats.consecutiveFailures = 0;
        } else if (regressing) {
          stats.progressionTrend = 'regressing';
          stats.consecutiveFailures = 2;
        } else {
          stats.progressionTrend = 'plateaued';
          stats.consecutiveFailures = 1;
        }
      }

      // Calculate averages
      if (stats.totalSets > 0 && history.length > 0) {
        stats.avgWeight = history.slice(0, 5).reduce((sum, h) => sum + h.weight, 0) / Math.min(5, history.length);
        stats.avgReps = history.slice(0, 5).reduce((sum, h) => sum + h.reps, 0) / Math.min(5, history.length);
      }
    }

    return statsMap;
  }

  /**
   * Filter exercises that target specific muscle groups
   */
  filterArmsShouldersChest(
    stats: Map<string, ExerciseStats>,
    focusMuscles: string[] = ['arms', 'shoulders', 'chest']
  ): ExerciseStats[] {
    const filtered: ExerciseStats[] = [];

    for (const stat of stats.values()) {
      const name = stat.exerciseName.toLowerCase();
      const primaryMuscle = stat.muscleGroup?.toLowerCase() || '';
      const secondaryMuscles = stat.otherMuscles?.map((m) => m.toLowerCase()) || [];

      // Check if exercise targets focus muscles
      const isTargetExercise = focusMuscles.some((muscle) => {
        const m = muscle.toLowerCase();

        // Check primary and secondary muscle groups
        if (primaryMuscle.includes(m) || secondaryMuscles.some((sm) => sm.includes(m))) {
          return true;
        }

        // Check exercise name for keywords (English and German)
        if (name.includes(m)) {
          return true;
        }

        // Specific patterns for common muscle groups
        switch (m) {
          case 'arms':
          case 'biceps':
            return name.includes('curl') || name.includes('bicep') || primaryMuscle === 'biceps';
          case 'triceps':
            return name.includes('tricep') || name.includes('trizeps') || primaryMuscle === 'triceps';
          case 'shoulders':
            return name.includes('shoulder') || name.includes('schulter') || name.includes('press') ||
                   name.includes('raise') || name.includes('heben') || name.includes('facepull') ||
                   primaryMuscle === 'shoulders' || name.includes('front') || name.includes('lateral');
          case 'chest':
            return name.includes('chest') || name.includes('brust') || name.includes('bench') ||
                   name.includes('fly') || name.includes('fliegende') || name.includes('butterfly') ||
                   primaryMuscle === 'chest';
          case 'lats':
          case 'back':
          case 'upper_back':
            return name.includes('lat') || name.includes('row') || name.includes('rudern') ||
                   primaryMuscle === 'lats' || primaryMuscle === 'upper_back' ||
                   name.includes('pull') || name.includes('ziehen');
          case 'legs':
          case 'quadriceps':
          case 'hamstrings':
            return primaryMuscle === 'quadriceps' || primaryMuscle === 'hamstrings' ||
                   primaryMuscle === 'glutes' || name.includes('bein') || name.includes('leg') ||
                   name.includes('squat');
          default:
            return false;
        }
      });

      if (isTargetExercise) {
        filtered.push(stat);
      }
    }

    // Sort by frequency and total volume (prioritize exercises you do often)
    filtered.sort((a, b) => {
      const scoreA = a.frequency * 10 + a.totalVolume / 1000;
      const scoreB = b.frequency * 10 + b.totalVolume / 1000;
      return scoreB - scoreA;
    });

    return filtered;
  }

  /**
   * Categorize exercises by type
   */
  categorizeExercises(stats: ExerciseStats[]): {
    chestCompound: ExerciseStats[];
    shoulderCompound: ExerciseStats[];
    chestIsolation: ExerciseStats[];
    shoulderIsolation: ExerciseStats[];
    triceps: ExerciseStats[];
    biceps: ExerciseStats[];
    other: ExerciseStats[];
  } {
    const categories = {
      chestCompound: [] as ExerciseStats[],
      shoulderCompound: [] as ExerciseStats[],
      chestIsolation: [] as ExerciseStats[],
      shoulderIsolation: [] as ExerciseStats[],
      triceps: [] as ExerciseStats[],
      biceps: [] as ExerciseStats[],
      other: [] as ExerciseStats[],
    };

    for (const stat of stats) {
      const name = stat.exerciseName.toLowerCase();
      const muscle = stat.muscleGroup?.toLowerCase() || '';

      // Biceps
      if (muscle === 'biceps' || name.includes('curl') || name.includes('bizeps')) {
        categories.biceps.push(stat);
      }
      // Triceps
      else if (muscle === 'triceps' || name.includes('tricep') || name.includes('trizeps')) {
        categories.triceps.push(stat);
      }
      // Chest compounds (bench press, dips)
      else if ((muscle === 'chest') && (name.includes('bench') || name.includes('bankdrücken') || name.includes('press') && name.includes('brust'))) {
        categories.chestCompound.push(stat);
      }
      // Chest isolation (flys, pec deck, etc.)
      else if (muscle === 'chest' || name.includes('butterfly') || name.includes('fliegende') || name.includes('fly') || name.includes('chest')) {
        categories.chestIsolation.push(stat);
      }
      // Shoulder compounds (overhead press, shoulder press)
      else if ((muscle === 'shoulders') && (name.includes('press') || name.includes('drücken'))) {
        categories.shoulderCompound.push(stat);
      }
      // Shoulder isolation (raises, face pulls)
      else if (muscle === 'shoulders' || name.includes('heben') || name.includes('raise') || name.includes('facepull') || name.includes('face pull')) {
        categories.shoulderIsolation.push(stat);
      }
      // Other (back, legs, etc.)
      else {
        categories.other.push(stat);
      }
    }

    return categories;
  }
}
