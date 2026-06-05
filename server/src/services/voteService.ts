import prisma from "../prisma/client";
import { AppError } from "../middleware/errorHandler";
import { ResultsResponse } from "../types/poll";

// Validates poll + option ownership before writing the vote.
// Checking that the option belongs to the given poll prevents a voter from
// submitting an optionId from a completely different poll.
export async function createVote(
  pollId: string,
  optionId: string
): Promise<{ success: true }> {
  const option = await prisma.option.findFirst({
    where: { id: optionId, pollId },
  });

  if (!option) {
    // We don't reveal whether the poll or just the option is missing —
    // a 404 on either is correct from the caller's perspective.
    const pollExists = await prisma.poll.findUnique({ where: { id: pollId } });
    throw new AppError(pollExists ? 404 : 404, pollExists ? "Option not found" : "Poll not found");
  }

  await prisma.vote.create({ data: { optionId } });

  return { success: true };
}

// Fetches vote counts for every option in a single query using Prisma's
// _count aggregate, then calculates percentages on the fly (see ADR-005).
export async function getResults(pollId: string): Promise<ResultsResponse> {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        include: { _count: { select: { votes: true } } },
      },
    },
  });

  if (!poll) {
    throw new AppError(404, "Poll not found");
  }

  const totalVotes = poll.options.reduce((sum, o) => sum + o._count.votes, 0);

  const results = poll.options.map((o) => ({
    optionId: o.id,
    text: o.text,
    votes: o._count.votes,
    // Guard against division by zero when no votes have been cast yet
    percentage: totalVotes === 0 ? 0 : Math.round((o._count.votes / totalVotes) * 100),
  }));

  return { totalVotes, results };
}
