import type { CreatePollResponse, Poll, PollResults } from "../types/poll";

// Base URL is injected at build time via Vite's import.meta.env.
// VITE_API_URL must be set in .env.production; the fallback covers local dev.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

// ---------------------------------------------------------------------------
// Internal request helper
// ---------------------------------------------------------------------------

// All API communication goes through this function.  It centralises error
// handling so individual API methods stay declarative.
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    // The backend always returns { message: string } on errors (see errorHandler)
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Poll endpoints
// ---------------------------------------------------------------------------

export async function createPoll(payload: {
  question: string;
  options: string[];
}): Promise<CreatePollResponse> {
  return request<CreatePollResponse>("/api/polls", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPoll(pollId: string): Promise<Poll> {
  return request<Poll>(`/api/polls/${pollId}`);
}

// ---------------------------------------------------------------------------
// Vote endpoints
// ---------------------------------------------------------------------------

export async function submitVote(
  pollId: string,
  optionId: string
): Promise<{ success: true }> {
  return request<{ success: true }>(`/api/polls/${pollId}/votes`, {
    method: "POST",
    body: JSON.stringify({ optionId }),
  });
}

export async function getResults(pollId: string): Promise<PollResults> {
  return request<PollResults>(`/api/polls/${pollId}/results`);
}
