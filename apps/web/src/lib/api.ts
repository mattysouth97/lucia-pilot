import type { ZodSchema } from 'zod';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function get<T>(path: string, schema: ZodSchema<T>): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} failed: ${res.status} ${res.statusText}`);
  }

  const json: unknown = await res.json();
  return schema.parse(json);
}

export const apiClient = { get };
