import { WorkoutSplit, WorkoutDay, ExerciseItem } from '../types/hunter';

/**
 * Downloads a workout split as a formatted JSON file.
 */
export function exportSplitToJsonFile(split: WorkoutSplit): void {
  const cleanData = {
    splitId: split.splitId,
    name: split.name,
    description: split.description || '',
    days: split.days.map((day) => ({
      id: day.id,
      dayName: day.dayName,
      targetFocus: day.targetFocus || '',
      exercises: day.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        targetMuscle: ex.targetMuscle || 'General',
        sets: Number(ex.sets) || 3,
        reps: Number(ex.reps) || 10,
        weightKg: Number(ex.weightKg) || 0,
        xpValue: Number(ex.xpValue) || 250,
        progressiveOverloadTip: ex.progressiveOverloadTip || '',
        notes: ex.notes || '',
      })),
    })),
    exportedAt: new Date().toISOString(),
    system: 'Solo Leveling Hunter OS',
  };

  const jsonString = JSON.stringify(cleanData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeFilename =
    (split.name || 'workout_split')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 40) + '_split.json';

  const link = document.createElement('a');
  link.href = url;
  link.download = safeFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads all configured workout splits as a single JSON file backup.
 */
export function exportAllSplitsToJsonFile(splits: WorkoutSplit[]): void {
  const cleanSplits = splits.map((split) => ({
    splitId: split.splitId,
    name: split.name,
    description: split.description || '',
    days: split.days,
  }));

  const jsonString = JSON.stringify(cleanSplits, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `hunter_workout_splits_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and converts raw JSON string into a structured WorkoutSplit object.
 */
export function parseAndValidateSplitJson(
  rawJson: string,
  userId = 'local-hunter'
): { valid: boolean; split?: WorkoutSplit; error?: string } {
  try {
    const parsed = JSON.parse(rawJson);

    // Support single split or array containing split
    const data = Array.isArray(parsed) ? parsed[0] : parsed;

    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Uploaded JSON is empty or not a valid object.' };
    }

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      return { valid: false, error: 'Split JSON is missing a valid "name" field.' };
    }

    const splitName = data.name.trim();
    const splitDescription =
      typeof data.description === 'string' ? data.description.trim() : 'Imported Hunter routine';

    const timestamp = Date.now();
    const rawDays = Array.isArray(data.days) ? data.days : [];

    const validatedDays: WorkoutDay[] = rawDays.map((dayItem: any, dayIdx: number) => {
      const dayId = dayItem.id ? String(dayItem.id) : `day_${timestamp}_${dayIdx + 1}`;
      const dayName =
        dayItem.dayName && typeof dayItem.dayName === 'string'
          ? dayItem.dayName.trim()
          : `Day ${dayIdx + 1}: Training Routine`;
      const targetFocus =
        dayItem.targetFocus && typeof dayItem.targetFocus === 'string'
          ? dayItem.targetFocus.trim()
          : 'Hypertrophy & Strength';

      const rawExercises = Array.isArray(dayItem.exercises) ? dayItem.exercises : [];
      const exercises: ExerciseItem[] = rawExercises.map((exItem: any, exIdx: number) => {
        const exId = exItem.id ? String(exItem.id) : `ex_${timestamp}_${dayIdx}_${exIdx + 1}`;
        const name =
          exItem.name && typeof exItem.name === 'string'
            ? exItem.name.trim()
            : `Exercise ${exIdx + 1}`;
        const targetMuscle =
          exItem.targetMuscle && typeof exItem.targetMuscle === 'string'
            ? exItem.targetMuscle.trim()
            : 'Compound';
        const sets = Math.max(1, Math.min(20, Number(exItem.sets) || 3));
        const reps = Math.max(1, Math.min(100, Number(exItem.reps) || 10));
        const weightKg = Math.max(0, Math.min(600, Number(exItem.weightKg) || 0));
        const rawXp = Number(exItem.xpValue);
        const xpValue = isNaN(rawXp) ? 250 : Math.max(50, Math.min(1000, rawXp));
        const progressiveOverloadTip =
          typeof exItem.progressiveOverloadTip === 'string'
            ? exItem.progressiveOverloadTip.trim()
            : '';
        const notes = typeof exItem.notes === 'string' ? exItem.notes.trim() : '';

        return {
          id: exId,
          name,
          targetMuscle,
          sets,
          reps,
          weightKg,
          xpValue,
          progressiveOverloadTip,
          notes,
        };
      });

      return {
        id: dayId,
        dayName,
        targetFocus,
        exercises,
      };
    });

    const newSplit: WorkoutSplit = {
      splitId: `split_json_${timestamp}`,
      userId,
      name: splitName,
      description: splitDescription,
      days: validatedDays,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    return { valid: true, split: newSplit };
  } catch (err: any) {
    return {
      valid: false,
      error: `Failed to parse JSON file: ${err?.message || 'Invalid syntax'}`,
    };
  }
}
