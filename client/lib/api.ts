export type ApiErrorPayload = {
  statusCode?: number;
  message?: string;
  name?: string;
  error?: string | string[];
};

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export type SongRecord = {
  id: string;
  title: string;
  artist: string;
  song: string;
  artwork: string;
  createdAt: string;
};

export type PublicSongRecord = Omit<SongRecord, "song">;

export type PublicSongWithFingerprintRecord = PublicSongRecord & {
  isFingerprintComplete: boolean;
};

export type AddSongApiResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    id: string;
  };
};

export type IdentifySongApiResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    song: SongRecord;
    confidence: number;
  };
};

export type GetSongsApiResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    songs: PublicSongWithFingerprintRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    fingerprinting: {
      pendingCount: number;
      hasPending: boolean;
    };
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const parseApiError = async (response: Response): Promise<never> => {
  let payload: ApiErrorPayload | null = null;

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  const fallbackMessage = `Request failed with status ${response.status}`;
  const rawError = payload?.error;
  const messageFromErrorField = Array.isArray(rawError)
    ? rawError.join(", ")
    : typeof rawError === "string"
      ? rawError
      : undefined;

  throw new ApiError(
    payload?.message ?? messageFromErrorField ?? fallbackMessage,
    payload?.statusCode ?? response.status,
  );
};

const fetchMultipart = async <T>(
  path: string,
  formData: FormData,
  signal?: AbortSignal,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  return (await response.json()) as T;
};

const fetchJson = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  return (await response.json()) as T;
};

export const addSongApi = async (
  payload: {
    title: string;
    artist: string;
    artwork: File;
    song: File;
  },
  signal?: AbortSignal,
): Promise<AddSongApiResponse> => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("artist", payload.artist);
  formData.append("artwork", payload.artwork);
  formData.append("song", payload.song);

  return fetchMultipart<AddSongApiResponse>("/song", formData, signal);
};

export const identifySongApi = async (
  file: File,
  signal?: AbortSignal,
): Promise<IdentifySongApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  return fetchMultipart<IdentifySongApiResponse>(
    "/song/identify",
    formData,
    signal,
  );
};

export const getSongsApi = async (
  params: {
    page: number;
    limit: number;
  },
  signal?: AbortSignal,
): Promise<GetSongsApiResponse> => {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  return fetchJson<GetSongsApiResponse>(
    `/song?${searchParams.toString()}`,
    signal,
  );
};
