const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// Schlanker fetch-Wrapper, keine externe HTTP-Bibliothek nötig.
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include', // Session-Cookie (siehe PRD 9.4)
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options
  });
  const body: ApiEnvelope<T> = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error ?? `API-Fehler (${res.status})`);
  }
  return body.data as T;
}
