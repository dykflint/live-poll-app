import { voteSchema } from "../voteSchema";

describe("voteSchema", () => {
  it("accepts a valid optionId", () => {
    expect(() => voteSchema.parse({ optionId: "abc123" })).not.toThrow();
  });

  it("rejects a missing optionId", () => {
    expect(() => voteSchema.parse({})).toThrow();
  });

  it("rejects an empty optionId", () => {
    expect(() => voteSchema.parse({ optionId: "" })).toThrow();
  });

  it("rejects non-string optionId", () => {
    expect(() => voteSchema.parse({ optionId: 42 })).toThrow();
  });
});
