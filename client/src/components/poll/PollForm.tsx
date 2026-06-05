import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPollSchema } from "@/schemas/createPollSchema";

interface PollFormProps {
  // Called with validated data only — the page handles the API call
  onSubmit: (data: { question: string; options: string[] }) => Promise<void>;
  isSubmitting: boolean;
  // API-level error passed down from the page
  error?: string;
}

// Field-level errors extracted from a Zod parse result
type FieldErrors = {
  question?: string[];
  options?: string[];
};

export default function PollForm({ onSubmit, isSubmitting, error }: PollFormProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function updateOption(index: number, value: string): void {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    if (options.length < 5) setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    if (options.length > 2) setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    // safeParse returns { success, data } or { success: false, error }
    // instead of throwing, making it ideal for inline form validation.
    const result = createPollSchema.safeParse({ question, options });

    if (!result.success) {
      // flatten() converts a ZodError into { fieldErrors: { field: string[] } }
      setFieldErrors(result.error.flatten().fieldErrors as FieldErrors);
      return;
    }

    await onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question */}
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you want to ask?"
          maxLength={255}
          disabled={isSubmitting}
        />
        {fieldErrors.question && (
          <p className="text-sm text-destructive">{fieldErrors.question[0]}</p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        <Label>Options</Label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              disabled={isSubmitting}
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeOption(index)}
                disabled={isSubmitting}
                aria-label={`Remove option ${index + 1}`}
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        {/* options-level errors (e.g. "must be unique") appear once below the list */}
        {fieldErrors.options && (
          <p className="text-sm text-destructive">{fieldErrors.options[0]}</p>
        )}

        {options.length < 5 && (
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            disabled={isSubmitting}
            className="w-full"
          >
            + Add option
          </Button>
        )}
      </div>

      {/* API-level error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating…" : "Create poll"}
      </Button>
    </form>
  );
}
