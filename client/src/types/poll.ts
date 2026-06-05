// These types mirror the backend API response shapes.
// They are intentionally kept in sync with server/src/types/poll.ts by hand
// rather than sharing a package — the project is small enough that a shared
// types package would add more complexity than it saves.

export interface PollOption {
  id: string;
  text: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export interface CreatePollResponse {
  id: string;
}

export interface OptionResult {
  optionId: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface PollResults {
  totalVotes: number;
  results: OptionResult[];
}
