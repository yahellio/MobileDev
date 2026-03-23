import * as SQLite from 'expo-sqlite';

type CachedQuote = {
  text: string;
  author: string;
  fetched_at: number;
};

type CachedMuscle = {
  id: number;
  name_ru: string;
  name_en: string;
  fetched_at: number;
};

type CachedExercise = {
  id: number;
  muscle_id: number;
  name_ru: string;
  name_en: string;
  fetched_at: number;
};

const dbPromise = SQLite.openDatabaseAsync('fitness_assistant.db');

async function getTableColumns(tableName: string) {
  const db = await dbPromise;
  const rows = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName});`);
  return new Set(rows.map((row) => row.name));
}

async function recreateMuscleCacheTable() {
  const db = await dbPromise;
  await db.execAsync(`
    DROP TABLE IF EXISTS muscle_cache;
    CREATE TABLE IF NOT EXISTS muscle_cache (
      id INTEGER PRIMARY KEY,
      name_ru TEXT NOT NULL,
      name_en TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );
  `);
}

async function recreateExerciseCacheTable() {
  const db = await dbPromise;
  await db.execAsync(`
    DROP TABLE IF EXISTS exercise_cache;
    CREATE TABLE IF NOT EXISTS exercise_cache (
      id INTEGER NOT NULL,
      muscle_id INTEGER NOT NULL,
      name_ru TEXT NOT NULL,
      name_en TEXT NOT NULL,
      fetched_at INTEGER NOT NULL,
      PRIMARY KEY (id, muscle_id)
    );
  `);
}

export async function initApiCacheDb() {
  const db = await dbPromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS quote_cache (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );
  `);

  const muscleColumns = await getTableColumns('muscle_cache');
  if (!muscleColumns.has('name_ru') || !muscleColumns.has('name_en')) {
    await recreateMuscleCacheTable();
  } else if (muscleColumns.size === 0) {
    await recreateMuscleCacheTable();
  }

  const exerciseColumns = await getTableColumns('exercise_cache');
  if (
    !exerciseColumns.has('id') ||
    !exerciseColumns.has('muscle_id') ||
    !exerciseColumns.has('name_ru') ||
    !exerciseColumns.has('name_en')
  ) {
    await recreateExerciseCacheTable();
  } else if (exerciseColumns.size === 0) {
    await recreateExerciseCacheTable();
  }
}

export async function saveCachedQuote(text: string, author: string, fetchedAt: number) {
  const db = await dbPromise;
  await db.runAsync(
    `INSERT INTO quote_cache (id, text, author, fetched_at)
     VALUES (1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET text = excluded.text, author = excluded.author, fetched_at = excluded.fetched_at;`,
    text,
    author,
    fetchedAt
  );
}

export async function getCachedQuote() {
  const db = await dbPromise;
  return db.getFirstAsync<CachedQuote>(
    'SELECT text, author, fetched_at FROM quote_cache WHERE id = 1 LIMIT 1;'
  );
}

export async function replaceCachedMuscles(
  muscles: Array<{ id: number; name_ru: string; name_en: string }>,
  fetchedAt: number
) {
  const db = await dbPromise;
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM muscle_cache;');
    for (const muscle of muscles) {
      await db.runAsync(
        'INSERT INTO muscle_cache (id, name_ru, name_en, fetched_at) VALUES (?, ?, ?, ?);',
        muscle.id,
        muscle.name_ru,
        muscle.name_en,
        fetchedAt
      );
    }
  });
}

export async function getCachedMuscles() {
  const db = await dbPromise;
  return db.getAllAsync<CachedMuscle>('SELECT * FROM muscle_cache ORDER BY id ASC;');
}

export async function replaceCachedExercisesByMuscle(
  muscleId: number,
  exercises: Array<{ id: number; name_ru: string; name_en: string }>,
  fetchedAt: number
) {
  const db = await dbPromise;
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM exercise_cache WHERE muscle_id = ?;', muscleId);
    for (const exercise of exercises) {
      await db.runAsync(
        'INSERT INTO exercise_cache (id, muscle_id, name_ru, name_en, fetched_at) VALUES (?, ?, ?, ?, ?);',
        exercise.id,
        muscleId,
        exercise.name_ru,
        exercise.name_en,
        fetchedAt
      );
    }
  });
}

export async function getCachedExercisesByMuscle(muscleId: number) {
  const db = await dbPromise;
  return db.getAllAsync<CachedExercise>(
    'SELECT * FROM exercise_cache WHERE muscle_id = ? ORDER BY id ASC;',
    muscleId
  );
}

export async function getCachedExerciseById(exerciseId: number) {
  const db = await dbPromise;
  return db.getFirstAsync<CachedExercise>(
    'SELECT * FROM exercise_cache WHERE id = ? LIMIT 1;',
    exerciseId
  );
}
