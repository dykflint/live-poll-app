import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResults } from "../useResults";
import { getResults } from "@/services/pollApi";

// Test useResults + usePolling together (no mock on usePolling).
// Fake timers freeze setInterval so tests run instantly; we flush
// async state updates with `await act(async () => {})`.
vi.mock("@/services/pollApi");
const mockGetResults = vi.mocked(getResults);

const fakeResults = {
  totalVotes: 10,
  results: [
    { optionId: "opt-1", text: "TypeScript", votes: 7, percentage: 70 },
    { optionId: "opt-2", text: "Go", votes: 3, percentage: 30 },
  ],
};

// Helper: flush all pending Promise microtasks so async state updates land.
const flushPromises = () => act(async () => {});

beforeEach(() => {
  vi.useFakeTimers();
  mockGetResults.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useResults", () => {
  it("starts in a loading state before the first fetch resolves", () => {
    mockGetResults.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useResults("poll-1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.results).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("populates results and clears loading on success", async () => {
    mockGetResults.mockResolvedValue(fakeResults);

    const { result } = renderHook(() => useResults("poll-1"));
    await flushPromises();

    expect(result.current.loading).toBe(false);
    expect(result.current.results).toEqual(fakeResults);
    expect(result.current.error).toBeNull();
  });

  it("sets an error and clears loading on failure", async () => {
    mockGetResults.mockRejectedValue(new Error("Poll not found"));

    const { result } = renderHook(() => useResults("poll-1"));
    await flushPromises();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Poll not found");
    expect(result.current.results).toBeNull();
  });

  it("updates results on the next polling tick without re-entering loading", async () => {
    mockGetResults
      .mockResolvedValueOnce(fakeResults)
      .mockResolvedValueOnce({ ...fakeResults, totalVotes: 11 });

    const { result } = renderHook(() => useResults("poll-1", 2000));

    // Flush the immediate on-mount fetch
    await flushPromises();
    expect(result.current.results?.totalVotes).toBe(10);
    expect(result.current.loading).toBe(false);

    // Advance the interval clock to fire the next setInterval tick,
    // then flush the resulting async state update.
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    await flushPromises();

    expect(result.current.results?.totalVotes).toBe(11);
    // loading must not have re-entered — the UI should not flash a spinner
    expect(result.current.loading).toBe(false);
  });
});
