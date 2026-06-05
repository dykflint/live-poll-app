import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Poll } from "@/types/poll";

interface VoteFormProps {
  poll: Poll;
  onSubmit: (optionId: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export default function VoteForm({ poll, onSubmit, isSubmitting, error }: VoteFormProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedOptionId) {
      setValidationError("Please select an option before voting.");
      return;
    }

    setValidationError(null);
    await onSubmit(selectedOptionId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold">{poll.question}</h2>

      <fieldset disabled={isSubmitting} className="space-y-3">
        <legend className="sr-only">Poll options</legend>

        {poll.options.map((option) => (
          <label
            key={option.id}
            className="flex items-center gap-3 rounded-md border border-input bg-background px-4 py-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent"
          >
            <input
              type="radio"
              name="option"
              value={option.id}
              checked={selectedOptionId === option.id}
              onChange={() => setSelectedOptionId(option.id)}
              className="accent-primary"
            />
            <span className="text-sm">{option.text}</span>
          </label>
        ))}
      </fieldset>

      {(validationError ?? error) && (
        <p className="text-sm text-destructive">{validationError ?? error}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting…" : "Submit vote"}
      </Button>
    </form>
  );
}
