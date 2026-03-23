type FetchJsonOptions = {
  timeoutMs?: number;
};

export async function fetchJson<T>(url: string, options?: FetchJsonOptions): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? 10000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
