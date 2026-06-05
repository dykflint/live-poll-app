import prisma from "../prisma/client";
import { AppError } from "../middleware/errorHandler";
import { CreatePollInput } from "../schemas/createPollSchema";
import { CreatePollResponse, PollResponse } from "../types/poll";

// Creates a poll and its options in a single Prisma nested write.
// Returns only the new poll ID — the client uses it to construct share URLs.
export async function createPoll(data: CreatePollInput): Promise<CreatePollResponse> {
  const poll = await prisma.poll.create({
    data: {
      question: data.question,
      options: {
        // Prisma's nested create lets us insert Poll + all Options atomically.
        create: data.options.map((text) => ({ text })),
      },
    },
  });

  return { id: poll.id };
}

// Fetches a poll with its options.
// Throws AppError(404) so the controller doesn't need to know about "not found"
// — the error handler will convert it to a 404 JSON response automatically.
export async function getPollById(pollId: string): Promise<PollResponse> {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true },
  });

  if (!poll) {
    throw new AppError(404, "Poll not found");
  }

  return {
    id: poll.id,
    question: poll.question,
    // Strip the pollId foreign key — clients only need the option id and text.
    options: poll.options.map((o) => ({ id: o.id, text: o.text })),
  };
}
