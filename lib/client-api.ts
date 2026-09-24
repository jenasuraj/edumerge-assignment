export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message || "Something went wrong",
      response.status,
    );
  }

  return payload as ApiEnvelope<T>;
}
