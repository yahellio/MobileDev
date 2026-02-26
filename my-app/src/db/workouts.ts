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
      exercises_csv TEXT NOT NULL
    );
  `);
}

export async function getWorkouts(): Promise<Workout[]> {
  const db = await dbPromise;
  return db.getAllAsync<Workout>(
    'SELECT * FROM workouts ORDER BY workout_date DESC, id DESC;'
  );
}

export async function createWorkout(data: WorkoutForm) {
  const db = await dbPromise;
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO workouts (title, description, workout_date, duration_minutes, exercises_csv)
     VALUES (?, ?, ?, ?, ?);`,
    data.title.trim(),
    data.description.trim(),
    now,
    Number(data.duration_minutes) || 0,
    data.exercises_csv.trim()
  );
}

export async function updateWorkout(id: number, data: WorkoutForm) {
  const db = await dbPromise;
  await db.runAsync(
    `UPDATE workouts
       SET title = ?, description = ?, duration_minutes = ?, exercises_csv = ?
     WHERE id = ?;`,
    data.title.trim(),
    data.description.trim(),
    Number(data.duration_minutes) || 0,
    data.exercises_csv.trim(),
    id
  );
}

export async function removeWorkout(id: number) {
  const db = await dbPromise;
  await db.runAsync('DELETE FROM workouts WHERE id = ?;', id);
}
