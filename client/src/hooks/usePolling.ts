import { useEffect, useRef } from "react";

// A generic interval hook: calls `callback` immediately on mount, then
// every `intervalMs` milliseconds until the component unmounts.
//
// The ref pattern keeps the interval stable: updating the callback ref on
// every render means the interval always calls the latest closure without
// needing to be torn down and restarted each time.
export function usePolling(callback: () => void, intervalMs = 2000): void {
  const callbackRef = useRef(callback);

  // Keep the ref pointing at the latest callback so stale closures are
  // never called by the interval.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Fire immediately so the UI is populated before the first interval tick
    callbackRef.current();

    const id = setInterval(() => callbackRef.current(), intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]); // Only restart the interval if the duration changes
}
