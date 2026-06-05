import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePolling } from "../usePolling";

beforeEach(() => {
  // Fake timers replace setInterval/clearInterval so tests run in zero time
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("usePolling", () => {
  it("calls the callback immediately on mount", () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 2000));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls the callback again after each interval", () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 2000));

    act(() => { vi.advanceTimersByTime(2000); });
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => { vi.advanceTimersByTime(2000); });
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("stops calling the callback after unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePolling(callback, 2000));

    // 1 call on mount
    unmount();

    // Advancing time after unmount should produce no additional calls
    act(() => { vi.advanceTimersByTime(6000); });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("uses the latest callback without restarting the interval", () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(({ cb }) => usePolling(cb, 2000), {
      initialProps: { cb: first },
    });

    // Replace the callback — this must NOT restart the interval
    rerender({ cb: second });

    act(() => { vi.advanceTimersByTime(2000); });

    expect(second).toHaveBeenCalledTimes(1); // interval tick used new callback
    expect(first).toHaveBeenCalledTimes(1);  // only the initial mount call
  });

  it("respects a custom interval duration", () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 5000));

    act(() => { vi.advanceTimersByTime(4999); });
    expect(callback).toHaveBeenCalledTimes(1); // not yet

    act(() => { vi.advanceTimersByTime(1); });
    expect(callback).toHaveBeenCalledTimes(2); // now
  });
});
