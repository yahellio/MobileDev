import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';

import { getFirebase } from '../../config/firebase';
import type { Workout } from '../../types/workout';

const IMAGEKIT_UPLOAD = 'https://upload.imagekit.io/api/v1/files/upload';

function imageKitAuthHeader(): string | null {
  const key = process.env.EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY?.trim();
  if (!key) {
    return null;
  }
  const raw = `${key}:`;
  const b64 =
    typeof globalThis.btoa === 'function'
      ? globalThis.btoa(raw)
      : Buffer.from(raw, 'utf8').toString('base64');
  return `Basic ${b64}`;
}

export function isImageKitConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY?.trim());
}

export async function uploadWorkoutImage(localUri: string): Promise<string> {
  const auth = imageKitAuthHeader();
  if (!auth) {
    throw new Error('ImageKit is not configured');
  }
  const formData = new FormData();

  formData.append('file', { uri: localUri, type: 'image/jpeg', name: `workout-${Date.now()}.jpg` } as unknown as Blob);
  formData.append('fileName', `workout-${Date.now()}.jpg`);
  formData.append('folder', '/workouts');

  const res = await fetch(IMAGEKIT_UPLOAD, {
    method: 'POST',
    headers: { Authorization: auth },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ImageKit upload failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { url?: string };
  if (!json.url) {
    throw new Error('ImageKit: no url in response');
  }
  return json.url;
}

export type WorkoutRemotePayload = {
  id: number;
  title: string;
  description: string;
  workout_date: string;
  duration_minutes: number;
  exercises_csv: string;
  image_url: string;
};

export async function saveWorkoutRemote(uid: string, row: WorkoutRemotePayload): Promise<void> {
  const fb = getFirebase();
  if (!fb) {
    return;
  }
  await setDoc(doc(fb.db, 'users', uid, 'workouts', String(row.id)), {
    ...row,
    syncedAt: new Date().toISOString(),
  });
}

export async function deleteWorkoutRemote(uid: string, id: number): Promise<void> {
  const fb = getFirebase();
  if (!fb) {
    return;
  }
  try {
    await deleteDoc(doc(fb.db, 'users', uid, 'workouts', String(id)));
  } catch {
    // документ мог не существовать
  }
}

function sortWorkoutsLikeLocal(a: Workout, b: Workout): number {
  const ta = new Date(a.workout_date).getTime();
  const tb = new Date(b.workout_date).getTime();
  if (tb !== ta) {
    return tb - ta;
  }
  return b.id - a.id;
}

function workoutFromFirestoreDoc(data: Record<string, unknown>, docId: string): Workout | null {
  const id = Number.parseInt(docId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  return {
    id,
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    workout_date: String(data.workout_date ?? ''),
    duration_minutes: Number(data.duration_minutes) || 0,
    exercises_csv: String(data.exercises_csv ?? ''),
    image_url: String(data.image_url ?? ''),
  };
}

export function subscribeWorkoutsRemote(uid: string, onUpdate: (workouts: Workout[]) => void): () => void {
  const fb = getFirebase();
  if (!fb) {
    return () => {};
  }
  const ref = collection(fb.db, 'users', uid, 'workouts');
  return onSnapshot(ref, (snap) => {
    const list: Workout[] = [];
    snap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const w = workoutFromFirestoreDoc(data, d.id);
      if (w) {
        list.push(w);
      }
    });
    list.sort(sortWorkoutsLikeLocal);
    onUpdate(list);
  });
}
