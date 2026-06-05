import { Link, useParams } from "react-router-dom";
import ResultsChart from "@/components/poll/ResultsChart";
import { usePoll } from "@/hooks/usePoll";
import { useResults } from "@/hooks/useResults";

export default function ResultsPage() {
  const { pollId } = useParams<{ pollId: string }>();

  // Fetch the question once; errors here are non-fatal — the chart
  // renders regardless and falls back to a generic heading.
  const { poll } = usePoll(pollId ?? "");

  const { results, loading, error } = useResults(pollId ?? "");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading results…</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-destructive">{error ?? "Could not load results."}</p>
          <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">
            Create a new poll
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">
            {poll?.question ?? "Poll results"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Results update automatically every 2 seconds.
          </p>
        </div>

        <ResultsChart results={results} />

        <div className="flex justify-center">
          <Link
            to={pollId ? `/poll/${pollId}` : "/"}
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Vote on this poll
          </Link>
        </div>
      </div>
    </div>
  );
}
