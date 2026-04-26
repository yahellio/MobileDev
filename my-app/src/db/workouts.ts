import * as SQLite from 'expo-sqlite';

import type { Workout, WorkoutForm } from '../types/workout';

const dbPromise = SQLite.openDatabaseAsync('fitness_assistant.db');

export async function initDb() {
  const db = await dbPromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      workout_date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      exercises_csv TEXT NOT NULL,
      image_url TEXT NOT NULL DEFAULT ''
    );
  `);
  try {
    await db.execAsync(`ALTER TABLE workouts ADD COLUMN image_url TEXT NOT NULL DEFAULT '';`);
  } catch {
    // колонка уже есть в старых БД после миграции
  }
  try {
    await db.execAsync(`ALTER TABLE workouts ADD COLUMN user_id TEXT NOT NULL DEFAULT '';`);
  } catch {}
}

export async function getWorkouts(userId: string): Promise<Workout[]> {
  const db = await dbPromise;
  const rows = await db.getAllAsync<Workout & { user_id?: string }>(
    `SELECT id, title, description, workout_date, duration_minutes, exercises_csv, image_url
     FROM workouts
     WHERE user_id = ?
     ORDER BY workout_date DESC, id DESC;`,
    userId
  );
  return rows.map((w) => ({ ...w, image_url: w.image_url ?? '' }));
}

export async function createWorkout(
  data: WorkoutForm,
  userId: string
): Promise<{ id: number; workout_date: string }> {
  const db = await dbPromise;
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO workouts (title, description, workout_date, duration_minutes, exercises_csv, image_url, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    data.title.trim(),
    data.description.trim(),
    now,
    Number(data.duration_minutes) || 0,
    data.exercises_csv.trim(),
    data.image_url.trim(),
    userId
  );
  return { id: Number(result.lastInsertRowId), workout_date: now };
}

export async function updateWorkout(id: number, data: WorkoutForm, userId: string) {
  const db = await dbPromise;
  await db.runAsync(
    `UPDATE workouts
       SET title = ?, description = ?, duration_minutes = ?, exercises_csv = ?, image_url = ?
     WHERE id = ? AND user_id = ?;`,
    data.title.trim(),
    data.description.trim(),
    Number(data.duration_minutes) || 0,
    data.exercises_csv.trim(),
    data.image_url.trim(),
    id,
    userId
  );
}

export async function removeWorkout(id: number, userId: string) {
  const db = await dbPromise;
  await db.runAsync('DELETE FROM workouts WHERE id = ? AND user_id = ?;', id, userId);
}
