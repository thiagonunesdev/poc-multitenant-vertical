import { apiBaseUrl } from "../config/env";

export interface HttpClientConfig {
  path: string;
  searchParams?: Record<string, string>;
  init?: RequestInit;
}

export async function httpGet<T>({
  path,
  searchParams,
  init,
}: HttpClientConfig): Promise<T> {
  const url = new URL(path, apiBaseUrl);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(
      `GET ${url.toString()} failed with status ${response.status}`
    );
  }

  return (await response.json()) as T;
}
