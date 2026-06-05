import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PollForm from "@/components/poll/PollForm";
import { createPoll } from "@/services/pollApi";

export default function CreatePollPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>();
  // Once a poll is created this holds its ID; the page switches to the success view
  const [pollId, setPollId] = useState<string | null>(null);

  async function handleSubmit(data: { question: string; options: string[] }) {
    setIsSubmitting(true);
    setApiError(undefined);
    try {
      const result = await createPoll(data);
      setPollId(result.id);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Build absolute URLs so they can be copied and opened on any device
  const voteUrl = pollId ? `${window.location.origin}/poll/${pollId}` : "";

  if (pollId) {
    return (
      <div className="min-h-screen bg-background flex items-start justify-center pt-16 px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold">Poll created!</h1>
            <p className="text-muted-foreground text-sm">Share the link below to start collecting votes.</p>
          </div>

          {/* Vote link */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Vote link</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={voteUrl}
                className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm"
                onFocus={(e) => e.target.select()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(voteUrl)}
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Quick navigation */}
          <div className="flex flex-col gap-2">
            <Link to={`/poll/${pollId}`} className={cn(buttonVariants(), "justify-center")}>
              Go to voting page
            </Link>
            <Link to={`/results/${pollId}`} className={cn(buttonVariants({ variant: "outline" }), "justify-center")}>
              View results
            </Link>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => { setPollId(null); setApiError(undefined); }}
          >
            Create another poll
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Create a poll</h1>
          <p className="text-muted-foreground text-sm">Add a question and up to 5 options.</p>
        </div>
        <PollForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={apiError}
        />
      </div>
    </div>
  );
}
