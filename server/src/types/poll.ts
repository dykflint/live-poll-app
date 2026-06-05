// These types describe what the API *returns*, not what Prisma stores.
// Keeping them separate means internal DB fields (createdAt, pollId foreign
// keys, etc.) are never accidentally included in a response.

export interface PollOption {
  id: string;
  text: string;
}

export interface PollResponse {
  id: string;
  question: string;
  options: PollOption[];
}

export interface CreatePollResponse {
  id: string;
}
