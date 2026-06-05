import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultsChart from "../ResultsChart";
import type { PollResults } from "@/types/poll";

const twoOptionResults: PollResults = {
  totalVotes: 10,
  results: [
    { optionId: "opt-1", text: "TypeScript", votes: 7, percentage: 70 },
    { optionId: "opt-2", text: "Go", votes: 3, percentage: 30 },
  ],
};

const singleVoteResults: PollResults = {
  totalVotes: 1,
  results: [
    { optionId: "opt-1", text: "TypeScript", votes: 1, percentage: 100 },
    { optionId: "opt-2", text: "Go", votes: 0, percentage: 0 },
  ],
};

const noVoteResults: PollResults = {
  totalVotes: 0,
  results: [
    { optionId: "opt-1", text: "TypeScript", votes: 0, percentage: 0 },
    { optionId: "opt-2", text: "Go", votes: 0, percentage: 0 },
  ],
};

describe("ResultsChart", () => {
  describe("rendering", () => {
    it("renders a row for each option", () => {
      render(<ResultsChart results={twoOptionResults} />);
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("Go")).toBeInTheDocument();
    });

    it("shows vote counts and percentages for each option", () => {
      render(<ResultsChart results={twoOptionResults} />);
      // The label combines votes and percentage
      expect(screen.getByText(/7 votes/)).toBeInTheDocument();
      expect(screen.getByText(/70%/)).toBeInTheDocument();
      expect(screen.getByText(/3 votes/)).toBeInTheDocument();
      expect(screen.getByText(/30%/)).toBeInTheDocument();
    });

    it("displays the total vote count", () => {
      render(<ResultsChart results={twoOptionResults} />);
      expect(screen.getByText(/10 votes total/)).toBeInTheDocument();
    });
  });

  describe("progress bars", () => {
    it("sets the progressbar width to the option percentage", () => {
      render(<ResultsChart results={twoOptionResults} />);
      const bars = screen.getAllByRole("progressbar");
      expect(bars[0]).toHaveStyle({ width: "70%" });
      expect(bars[1]).toHaveStyle({ width: "30%" });
    });

    it("sets aria-valuenow to the percentage", () => {
      render(<ResultsChart results={twoOptionResults} />);
      const bars = screen.getAllByRole("progressbar");
      expect(bars[0]).toHaveAttribute("aria-valuenow", "70");
      expect(bars[1]).toHaveAttribute("aria-valuenow", "30");
    });

    it("renders a zero-width bar for options with no votes", () => {
      render(<ResultsChart results={noVoteResults} />);
      const bars = screen.getAllByRole("progressbar");
      bars.forEach((bar) => {
        expect(bar).toHaveStyle({ width: "0%" });
        expect(bar).toHaveAttribute("aria-valuenow", "0");
      });
    });
  });

  describe("pluralisation", () => {
    it("uses singular 'vote' for an option with exactly one vote", () => {
      render(<ResultsChart results={singleVoteResults} />);
      // Verify "1 vote" appears at least once and "1 votes" never does
      expect(screen.getAllByText(/1 vote\b/).length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText(/1 votes/)).not.toBeInTheDocument();
    });

    it("uses singular 'vote total' when totalVotes is one", () => {
      render(<ResultsChart results={singleVoteResults} />);
      expect(screen.getByText(/1 vote total/)).toBeInTheDocument();
    });

    it("uses plural 'votes total' for multiple total votes", () => {
      render(<ResultsChart results={twoOptionResults} />);
      expect(screen.getByText(/10 votes total/)).toBeInTheDocument();
    });
  });
});
