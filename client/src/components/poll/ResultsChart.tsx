import type { PollResults } from "@/types/poll";

interface ResultsChartProps {
  results: PollResults;
}

// Pure display component: renders a labelled progress bar for each option.
// The parent (ResultsPage) owns the polling logic and passes fresh data on
// each interval tick; this component just reflects whatever it receives.
export default function ResultsChart({ results }: ResultsChartProps) {
  const { totalVotes, results: options } = results;

  return (
    <div className="space-y-5">
      {options.map((option) => (
        <div key={option.optionId} className="space-y-1.5">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-medium">{option.text}</span>
            <span className="text-muted-foreground tabular-nums">
              {option.votes} {option.votes === 1 ? "vote" : "votes"} &middot; {option.percentage}%
            </span>
          </div>

          {/* Progress bar — width driven by inline style so Tailwind's
              class purging doesn't strip arbitrary percentage values. */}
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 ease-in-out"
              style={{ width: `${option.percentage}%` }}
              role="progressbar"
              aria-valuenow={option.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${option.text}: ${option.percentage}%`}
            />
          </div>
        </div>
      ))}

      <p className="text-right text-sm text-muted-foreground tabular-nums">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"} total
      </p>
    </div>
  );
}
