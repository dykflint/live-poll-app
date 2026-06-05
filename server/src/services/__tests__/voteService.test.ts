jest.mock("../../prisma/client", () => ({
  __esModule: true,
  default: {
    poll: { findUnique: jest.fn() },
    option: { findFirst: jest.fn() },
    vote: { create: jest.fn() },
  },
}));

import prisma from "../../prisma/client";
import { createVote, getResults } from "../voteService";
import { AppError } from "../../middleware/errorHandler";

const mockFindFirst = prisma.option.findFirst as jest.Mock;
const mockPollFindUnique = prisma.poll.findUnique as jest.Mock;
const mockVoteCreate = prisma.vote.create as jest.Mock;

// A minimal poll shape with _count on options, matching the Prisma include shape
const dbPollWithCounts = {
  id: "poll-1",
  question: "Q?",
  options: [
    { id: "opt-1", text: "A", pollId: "poll-1", _count: { votes: 6 } },
    { id: "opt-2", text: "B", pollId: "poll-1", _count: { votes: 4 } },
  ],
};

describe("voteService", () => {
  describe("createVote", () => {
    it("creates a vote and returns { success: true }", async () => {
      mockFindFirst.mockResolvedValue({ id: "opt-1", pollId: "poll-1" });
      mockVoteCreate.mockResolvedValue({ id: "vote-1" });

      const result = await createVote("poll-1", "opt-1");

      expect(result).toEqual({ success: true });
      expect(mockVoteCreate).toHaveBeenCalledWith({ data: { optionId: "opt-1" } });
    });

    it("throws AppError(404) with 'Poll not found' when poll does not exist", async () => {
      // findFirst returns null (option not found), then findUnique also returns
      // null (poll does not exist) — exercising the nested lookup path
      mockFindFirst.mockResolvedValue(null);
      mockPollFindUnique.mockResolvedValue(null);

      await expect(createVote("bad-poll", "opt-1")).rejects.toMatchObject({
        statusCode: 404,
        message: "Poll not found",
      });
    });

    it("throws AppError(404) with 'Option not found' when option does not belong to poll", async () => {
      mockFindFirst.mockResolvedValue(null);
      // Poll exists but option is from a different poll
      mockPollFindUnique.mockResolvedValue({ id: "poll-1" });

      await expect(createVote("poll-1", "opt-from-other-poll")).rejects.toMatchObject({
        statusCode: 404,
        message: "Option not found",
      });
    });
  });

  describe("getResults", () => {
    it("returns totalVotes and correctly calculated percentages", async () => {
      mockPollFindUnique.mockResolvedValue(dbPollWithCounts);

      const result = await getResults("poll-1");

      expect(result.totalVotes).toBe(10);
      expect(result.results).toEqual([
        { optionId: "opt-1", text: "A", votes: 6, percentage: 60 },
        { optionId: "opt-2", text: "B", votes: 4, percentage: 40 },
      ]);
    });

    it("returns 0% for all options when no votes have been cast", async () => {
      mockPollFindUnique.mockResolvedValue({
        ...dbPollWithCounts,
        options: dbPollWithCounts.options.map((o) => ({
          ...o,
          _count: { votes: 0 },
        })),
      });

      const result = await getResults("poll-1");

      expect(result.totalVotes).toBe(0);
      result.results.forEach((r) => expect(r.percentage).toBe(0));
    });

    it("rounds percentages to whole numbers", async () => {
      // 1 vote out of 3 = 33.33...% → should round to 33
      mockPollFindUnique.mockResolvedValue({
        ...dbPollWithCounts,
        options: [
          { id: "opt-1", text: "A", pollId: "poll-1", _count: { votes: 1 } },
          { id: "opt-2", text: "B", pollId: "poll-1", _count: { votes: 2 } },
        ],
      });

      const result = await getResults("poll-1");

      expect(result.results[0].percentage).toBe(33);
      expect(result.results[1].percentage).toBe(67);
    });

    it("throws AppError(404) when the poll does not exist", async () => {
      mockPollFindUnique.mockResolvedValue(null);

      await expect(getResults("bad-poll")).rejects.toMatchObject({
        statusCode: 404,
        message: "Poll not found",
      });
    });
  });
});
