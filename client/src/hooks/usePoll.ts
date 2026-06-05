import { useEffect, useState } from "react";
import { getPoll } from "@/services/pollApi";
import type { Poll } from "@/types/poll";

interface UsePollResult {
  poll: Poll | null;
  loading: boolean;
  error: string | null;
}

export function usePoll(pollId: string): UsePollResult {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The cancelled flag prevents a stale response from updating state after
    // the component unmounts or pollId changes mid-flight.
    let cancelled = false;

    async function fetchPoll() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPoll(pollId);
        if (!cancelled) setPoll(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load poll");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPoll();

    return () => {
      cancelled = true;
    };
  }, [pollId]);

  return { poll, loading, error };
}
