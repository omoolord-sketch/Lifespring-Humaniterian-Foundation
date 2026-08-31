const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:5000" : "");

export function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

export async function readApiMessage(response: Response) {
  const fallback = response.ok
    ? "Request completed successfully."
    : "Something went wrong. Please try again.";

  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallback;
  } catch {
    return fallback;
  }
}
