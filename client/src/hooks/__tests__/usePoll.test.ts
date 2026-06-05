import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePoll } from "../usePoll";
import { getPoll } from "@/services/pollApi";

// vi.mock() is hoisted — it replaces the module before any import runs,
// the same way jest.mock() works on the server.
vi.mock("@/services/pollApi");

const mockGetPoll = vi.mocked(getPoll);

const fakePoll = {
  id: "poll-1",
  question: "Favourite language?",
  options: [
    { id: "opt-1", text: "TypeScript" },
    { id: "opt-2", text: "Go" },
  ],
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("usePoll", () => {
  it("starts in a loading state", () => {
    // Never resolves during this test — keeps loading = true
    mockGetPoll.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePoll("poll-1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.poll).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("returns the poll and clears loading on success", async () => {
    mockGetPoll.mockResolvedValue(fakePoll);

    const { result } = renderHook(() => usePoll("poll-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.poll).toEqual(fakePoll);
    expect(result.current.error).toBeNull();
  });

  it("sets an error message and clears loading on failure", async () => {
    mockGetPoll.mockRejectedValue(new Error("Poll not found"));

    const { result } = renderHook(() => usePoll("bad-id"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Poll not found");
    expect(result.current.poll).toBeNull();
  });

  it("uses a generic message when the error is not an Error instance", async () => {
    mockGetPoll.mockRejectedValue("network failure");

    const { result } = renderHook(() => usePoll("poll-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load poll");
  });

  it("re-fetches when pollId changes", async () => {
    const secondPoll = { ...fakePoll, id: "poll-2", question: "New Q?" };
    mockGetPoll
      .mockResolvedValueOnce(fakePoll)
      .mockResolvedValueOnce(secondPoll);

    const { result, rerender } = renderHook(({ id }) => usePoll(id), {
      initialProps: { id: "poll-1" },
    });

    await waitFor(() => expect(result.current.poll?.id).toBe("poll-1"));

    rerender({ id: "poll-2" });

    await waitFor(() => expect(result.current.poll?.id).toBe("poll-2"));
    expect(mockGetPoll).toHaveBeenCalledTimes(2);
  });
});
