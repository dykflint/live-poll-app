import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import VoteForm from "@/components/poll/VoteForm";
import { usePoll } from "@/hooks/usePoll";
import { submitVote } from "@/services/pollApi";

export default function VotePollPage() {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();

  const { poll, loading, error: fetchError } = usePoll(pollId ?? "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  async function handleVote(optionId: string) {
    if (!pollId) return;
    setIsSubmitting(true);
    setSubmitError(undefined);
    try {
      await submitVote(pollId, optionId);
      // Redirect to results as per the user flow in design.md
      navigate(`/results/${pollId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit vote");
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading poll…</p>
      </div>
    );
  }

  if (fetchError || !poll) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-destructive">{fetchError ?? "Poll not found."}</p>
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
          <h1 className="text-2xl font-semibold">Cast your vote</h1>
          <p className="text-muted-foreground text-sm">Select one option and submit.</p>
        </div>

        <VoteForm
          poll={poll}
          onSubmit={handleVote}
          isSubmitting={isSubmitting}
          error={submitError}
        />

        <p className="text-center text-sm text-muted-foreground">
          Want to see results?{" "}
          <Link
            to={`/results/${pollId}`}
            className="underline underline-offset-4"
          >
            View results
          </Link>
        </p>
      </div>
    </div>
  );
}
