const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function http<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Error de servidor" }));
    throw new Error(error.detail ?? `Error ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
