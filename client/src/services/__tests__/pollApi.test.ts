import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPoll, getPoll, submitVote, getResults } from "../pollApi";

// Helper that creates a fake fetch response
function mockFetch(body: unknown, ok = true, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("createPoll", () => {
  it("POSTs to /api/polls and returns the created poll id", async () => {
    const spy = mockFetch({ id: "poll-1" }, true, 201);

    const result = await createPoll({ question: "Q?", options: ["A", "B"] });

    expect(spy).toHaveBeenCalledOnce();
    const [url, init] = spy.mock.calls[0];
    expect(url).toContain("/api/polls");
    expect((init as RequestInit).method).toBe("POST");
    expect(result).toEqual({ id: "poll-1" });
  });
});

describe("getPoll", () => {
  it("GETs /api/polls/:pollId and returns the poll", async () => {
    const poll = { id: "poll-1", question: "Q?", options: [] };
    const spy = mockFetch(poll);

    const result = await getPoll("poll-1");

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("/api/polls/poll-1");
    expect(result).toEqual(poll);
  });
});

describe("submitVote", () => {
  it("POSTs the optionId to /api/polls/:pollId/votes", async () => {
    const spy = mockFetch({ success: true }, true, 201);

    const result = await submitVote("poll-1", "opt-1");

    const [url, init] = spy.mock.calls[0];
    expect(url).toContain("/api/polls/poll-1/votes");
    expect((init as RequestInit).method).toBe("POST");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      optionId: "opt-1",
    });
    expect(result).toEqual({ success: true });
  });
});

describe("getResults", () => {
  it("GETs /api/polls/:pollId/results and returns the results", async () => {
    const results = { totalVotes: 5, results: [] };
    const spy = mockFetch(results);

    const result = await getResults("poll-1");

    expect(spy.mock.calls[0][0]).toContain("/api/polls/poll-1/results");
    expect(result).toEqual(results);
  });
});

describe("error handling", () => {
  it("throws with the backend message on a non-ok response", async () => {
    mockFetch({ message: "Poll not found" }, false, 404);

    await expect(getPoll("bad-id")).rejects.toThrow("Poll not found");
  });

  it("throws a generic message when the error body has no message field", async () => {
    mockFetch({}, false, 500);

    await expect(getPoll("bad-id")).rejects.toThrow("Request failed");
  });
});
