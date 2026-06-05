import { useCallback, useState } from "react";
import { getResults } from "@/services/pollApi";
import type { PollResults } from "@/types/poll";
import { usePolling } from "./usePolling";

interface UseResultsResult {
  results: PollResults | null;
  loading: boolean;
  error: string | null;
}

export function useResults(
  pollId: string,
  intervalMs = 2000
): UseResultsResult {
  const [results, setResults] = useState<PollResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useCallback keeps the reference stable across renders so the usePolling
  // ref update doesn't cause the interval to restart on every render cycle.
  const fetchResults = useCallback(async () => {
    try {
      const data = await getResults(pollId);
      setResults(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results");
    } finally {
      // Only set loading false once — subsequent polling ticks update in place
      // so the UI doesn't flash a loading state on every refresh.
      setLoading((prev) => (prev ? false : prev));
    }
  }, [pollId]);

  usePolling(fetchResults, intervalMs);

  return { results, loading, error };
}
