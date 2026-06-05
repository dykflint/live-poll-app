// jest.mock() is hoisted by Jest to run before any import statement.
// This replaces the real PrismaClient with a plain object of jest.fn() stubs,
// so the service can be tested without a real database.
jest.mock("../../prisma/client", () => ({
  __esModule: true,
  default: {
    poll: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import prisma from "../../prisma/client";
import { createPoll, getPollById } from "../pollService";
import { AppError } from "../../middleware/errorHandler";

// Cast the stubs to jest.Mock so TypeScript allows .mockResolvedValue() etc.
const mockCreate = prisma.poll.create as jest.Mock;
const mockFindUnique = prisma.poll.findUnique as jest.Mock;

describe("pollService", () => {
  describe("createPoll", () => {
    it("creates a poll and returns its id", async () => {
      mockCreate.mockResolvedValue({ id: "poll-1" });

      const result = await createPoll({
        question: "Favourite language?",
        options: ["TypeScript", "Go"],
      });

      expect(result).toEqual({ id: "poll-1" });
    });

    it("passes question and options to Prisma in the correct shape", async () => {
      mockCreate.mockResolvedValue({ id: "poll-2" });

      await createPoll({ question: "Q?", options: ["A", "B"] });

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          question: "Q?",
          options: { create: [{ text: "A" }, { text: "B" }] },
        },
      });
    });
  });

  describe("getPollById", () => {
    const dbPoll = {
      id: "poll-1",
      question: "Favourite language?",
      createdAt: new Date(),
      options: [
        { id: "opt-1", text: "TypeScript", pollId: "poll-1" },
        { id: "opt-2", text: "Go", pollId: "poll-1" },
      ],
    };

    it("returns the poll with stripped options (no pollId or createdAt)", async () => {
      mockFindUnique.mockResolvedValue(dbPoll);

      const result = await getPollById("poll-1");

      expect(result).toEqual({
        id: "poll-1",
        question: "Favourite language?",
        options: [
          { id: "opt-1", text: "TypeScript" },
          { id: "opt-2", text: "Go" },
        ],
      });
    });

    it("throws AppError(404) when the poll does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(getPollById("nonexistent")).rejects.toThrow(AppError);
      await expect(getPollById("nonexistent")).rejects.toMatchObject({
        statusCode: 404,
        message: "Poll not found",
      });
    });
  });
});
