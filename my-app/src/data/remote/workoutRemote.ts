import { deleteDoc, doc, setDoc } from 'firebase/firestore';

import { getFirebase } from '../../config/firebase';

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

export async function saveWorkoutRemote(row: WorkoutRemotePayload): Promise<void> {
  const fb = getFirebase();
  if (!fb) {
    return;
  }
  await setDoc(doc(fb.db, 'workouts', String(row.id)), {
    ...row,
    syncedAt: new Date().toISOString(),
  });
}

export async function deleteWorkoutRemote(id: number): Promise<void> {
  const fb = getFirebase();
  if (!fb) {
    return;
  }
  try {
    await deleteDoc(doc(fb.db, 'workouts', String(id)));
  } catch {
    // документ мог не существовать
  }
}
