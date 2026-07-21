const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Skip the refresh-on-401 retry (used by the refresh call itself to avoid loops). */
  skipAuthRetry?: boolean;
};

/**
 * In-memory access token. Never persisted (no localStorage/sessionStorage) —
 * the refresh token is an httpOnly cookie the browser manages, and the
 * access token only needs to survive for the lifetime of the tab, restored
 * via /auth/refresh on load. Read/write only through get/setAccessToken.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/**
 * Set by AuthProvider so apiFetch can trigger a refresh-on-401 without a
 * circular import. Not called directly outside this module.
 */
let refreshHandler: (() => Promise<string | null>) | null = null;

export function setRefreshHandler(handler: (() => Promise<string | null>) | null): void {
  refreshHandler = handler;
}

/**
 * Minimal typed fetch wrapper. Every call to the FastAPI backend goes
 * through this so headers, base URL, and error handling stay in one place.
 * Attaches the in-memory access token as a Bearer header when present, and
 * on a 401 tries exactly one refresh-and-retry before giving up.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, skipAuthRetry, ...rest } = options;

  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // Refresh token lives in an httpOnly cookie — must be sent/received
      // for /auth/refresh and /auth/logout to work cross-origin.
      credentials: "include",
      cache: "no-store",
    });

  let res = await doFetch();

  if (res.status === 401 && !skipAuthRetry && refreshHandler) {
    const newToken = await refreshHandler();
    if (newToken) {
      res = await doFetch();
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(text || res.statusText, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export type HealthResponse = {
  status: "ok";
  service: string;
};

export function getHealth() {
  return apiFetch<HealthResponse>("/health");
}

export type User = {
  id: string;
  email: string;
  display_name: string;
  avatar_initials: string;
  current_rating: number;
  onboarding_completed: boolean;
  onboarding_step: number;
};

export type UserProfile = {
  id: string;
  user_id: string;
  bio: string | null;
  job_title: string | null;
  company: string | null;
  communication_goals: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdatePayload = {
  bio?: string | null;
  job_title?: string | null;
  company?: string | null;
  communication_goals?: string | null;
};

export type OnboardingUpdatePayload = {
  onboarding_completed: boolean;
  onboarding_step: number;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type SignupPayload = {
  email: string;
  password: string;
  display_name: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export function signup(payload: SignupPayload) {
  return apiFetch<TokenResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: payload,
    skipAuthRetry: true,
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: payload,
    skipAuthRetry: true,
  });
}

export function refreshSession() {
  return apiFetch<TokenResponse>("/api/v1/auth/refresh", {
    method: "POST",
    skipAuthRetry: true,
  });
}

export function logout() {
  return apiFetch<void>("/api/v1/auth/logout", {
    method: "POST",
    skipAuthRetry: true,
  });
}

export function getCurrentUser() {
  return apiFetch<User>("/api/v1/users/me");
}

export function getProfile() {
  return apiFetch<UserProfile>("/api/v1/profile");
}

export function updateProfile(payload: ProfileUpdatePayload) {
  return apiFetch<UserProfile>("/api/v1/profile", {
    method: "PUT",
    body: payload,
  });
}

export function updateOnboarding(payload: OnboardingUpdatePayload) {
  return apiFetch<User>("/api/v1/profile/onboarding", {
    method: "POST",
    body: payload,
  });
}

export type SessionMode = "impromptu" | "debate" | "interview" | "storytelling";
export type SessionStatus = "pending" | "uploading" | "recording" | "processing" | "transcribing" | "analyzing" | "completed" | "failed";

export type TimelineEntry = {
  timestamp_seconds: number;
  label: string;
  description: string;
  type: "strong" | "weakness" | "improvement" | "neutral";
};

export type TranscriptAnnotation = {
  text: string;
  annotation: string;
  type: "strong" | "weakness" | "neutral";
};

export type SessionStatistics = {
  duration_seconds: number;
  words_spoken: number;
  speaking_rate_wpm: number | null;
  longest_pause_seconds: number | null;
  filler_word_count: number;
  vocabulary_diversity: number | null;
  sentence_variety: number | null;
  avg_response_length_words: number | null;
};

export type SkillDetail = {
  name: string;
  score: number;
  description: string;
  improvement_tip: string;
};

export type ProgressDelta = {
  skill_name: string;
  change: number;
};

export type NextChallenge = {
  mode: SessionMode;
  difficulty: string;
  reason: string;
};

export type FeedbackReport = {
  id: string;
  session_id: string;
  overall_score: number;
  structure_score: number;
  relevance_score: number;
  evidence_score: number;
  persuasion_score: number;
  confidence_score: number;
  examples_score: number;
  skills: SkillDetail[];
  timeline: TimelineEntry[];
  transcript_annotations: TranscriptAnnotation[];
  statistics: SessionStatistics | null;
  next_challenge: NextChallenge | null;
  strongest_skill: string;
  weakest_skill: string;
  next_focus: string;
  summary: string | null;
  rating_before: number;
  rating_after: number;
  rating_change: number;
  created_at: string;
};

export type SessionResult = {
  session_id: string;
  status: string;
  feedback: FeedbackReport | null;
  transcript_text: string | null;
  progress_deltas: ProgressDelta[];
};

export type ReflectionData = {
  id: string;
  session_id: string;
  most_difficult_part: string | null;
  what_to_improve: string | null;
};

export type PracticeSession = {
  id: string;
  user_id: string;
  mode: SessionMode;
  prompt_text: string | null;
  prep_seconds: number;
  speak_seconds: number;
  status: SessionStatus;
  duration_seconds: number | null;
  audio_url: string | null;
  created_at: string;
  completed_at: string | null;
};

export type SessionListResponse = {
  sessions: PracticeSession[];
  total: number;
};

export type SessionCreatePayload = {
  mode: SessionMode;
  prompt_text?: string | null;
  prep_seconds?: number;
  speak_seconds?: number;
};

export type SessionUpdatePayload = {
  status?: SessionStatus;
  duration_seconds?: number;
  audio_url?: string;
};

export function createSession(payload: SessionCreatePayload) {
  return apiFetch<PracticeSession>("/api/v1/sessions", {
    method: "POST",
    body: payload,
    skipAuthRetry: true,
  });
}

export function getSessions(skip = 0, limit = 20) {
  return apiFetch<SessionListResponse>(`/api/v1/sessions?skip=${skip}&limit=${limit}`);
}

export function getSession(sessionId: string) {
  return apiFetch<PracticeSession>(`/api/v1/sessions/${sessionId}`);
}

export function updateSession(sessionId: string, payload: SessionUpdatePayload) {
  return apiFetch<PracticeSession>(`/api/v1/sessions/${sessionId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function getSessionResult(sessionId: string) {
  return apiFetch<SessionResult>(`/api/v1/sessions/${sessionId}/result`);
}

export function getReflection(sessionId: string) {
  return apiFetch<ReflectionData | null>(`/api/v1/reflections/${sessionId}`);
}

export function saveReflection(
  sessionId: string,
  payload: { most_difficult_part?: string; what_to_improve?: string }
) {
  return apiFetch<ReflectionData>(`/api/v1/reflections/${sessionId}`, {
    method: "PUT",
    body: { session_id: sessionId, ...payload },
  });
}

export function uploadAudio(sessionId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ audio_file_id: string; storage_url: string; session_id: string }>(
    `/api/v1/sessions/${sessionId}/audio`,
    {
      method: "POST",
      body: formData,
      headers: {}, // let browser set content-type for multipart
    }
  );
}

export function getSessionStatus(sessionId: string) {
  return apiFetch<{ id: string; status: string; duration_seconds: number | null; audio_url: string | null }>(
    `/api/v1/sessions/${sessionId}/status`
  );
}
