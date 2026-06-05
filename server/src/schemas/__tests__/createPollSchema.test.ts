import { createPollSchema } from "../createPollSchema";

// A valid baseline payload reused across tests
const valid = {
  question: "What is your favourite language?",
  options: ["TypeScript", "Go", "Rust"],
};

describe("createPollSchema", () => {
  describe("valid inputs", () => {
    it("accepts a well-formed poll", () => {
      expect(() => createPollSchema.parse(valid)).not.toThrow();
    });

    it("trims whitespace from question and options", () => {
      const result = createPollSchema.parse({
        question: "  Trimmed?  ",
        options: ["  A  ", "  B  "],
      });
      expect(result.question).toBe("Trimmed?");
      expect(result.options).toEqual(["A", "B"]);
    });

    it("accepts exactly 2 options", () => {
      expect(() =>
        createPollSchema.parse({ ...valid, options: ["A", "B"] })
      ).not.toThrow();
    });

    it("accepts exactly 5 options", () => {
      expect(() =>
        createPollSchema.parse({ ...valid, options: ["A", "B", "C", "D", "E"] })
      ).not.toThrow();
    });
  });

  describe("question validation", () => {
    it("rejects a missing question", () => {
      const { question: _q, ...withoutQuestion } = valid;
      expect(() => createPollSchema.parse(withoutQuestion)).toThrow();
    });

    it("rejects an empty question", () => {
      expect(() =>
        createPollSchema.parse({ ...valid, question: "" })
      ).toThrow();
    });

    it("rejects a whitespace-only question", () => {
      expect(() =>
        createPollSchema.parse({ ...valid, question: "   " })
      ).toThrow();
    });

    it("rejects a question longer than 255 characters", () => {
      expect(() =>
        createPollSchema.parse({ ...valid, question: "x".repeat(256) })
      ).toThrow();
    });

    it("accepts a question of exactly 255 characters", () => {
      expect(() =>
        createPollSchema.parse({ ...valid, question: "x".repeat(255) })
      ).not.toThrow();
    });
  });

  describe("options validation", () => {
    it("rejects fewer than 2 options", () => {
      expect(() =>
        createPollSchema.parse({ ...valid, options: ["OnlyOne"] })
      ).toThrow();
    });

    it("rejects more than 5 options", () => {
      expect(() =>
        createPollSchema.parse({
          ...valid,
          options: ["A", "B", "C", "D", "E", "F"],
        })
      ).toThrow();
    });

    it("rejects empty option strings", () => {
      expect(() =>
        createPollSchema.parse({ ...valid, options: ["A", ""] })
      ).toThrow();
    });

    it("rejects whitespace-only options", () => {
      expect(() =>
        createPollSchema.parse({ ...valid, options: ["A", "   "] })
      ).toThrow();
    });

    it("rejects duplicate options (case-insensitive)", () => {
      expect(() =>
        createPollSchema.parse({ ...valid, options: ["TypeScript", "typescript"] })
      ).toThrow();
    });

    it("accepts options that differ only by case after trimming", () => {
      // "Go" and "GO" are duplicates — must be rejected
      expect(() =>
        createPollSchema.parse({ ...valid, options: ["Go", "GO"] })
      ).toThrow();
    });
  });
});
