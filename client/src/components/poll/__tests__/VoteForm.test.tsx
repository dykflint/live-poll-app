import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VoteForm from "../VoteForm";
import type { Poll } from "@/types/poll";

const fakePoll: Poll = {
  id: "poll-1",
  question: "Favourite language?",
  options: [
    { id: "opt-1", text: "TypeScript" },
    { id: "opt-2", text: "Go" },
    { id: "opt-3", text: "Rust" },
  ],
};

function renderForm(props?: Partial<React.ComponentProps<typeof VoteForm>>) {
  return render(
    <VoteForm
      poll={fakePoll}
      onSubmit={vi.fn(() => Promise.resolve())}
      isSubmitting={false}
      {...props}
    />
  );
}

describe("VoteForm", () => {
  describe("rendering", () => {
    it("displays the poll question", () => {
      renderForm();
      expect(screen.getByText("Favourite language?")).toBeInTheDocument();
    });

    it("renders a radio button for each option", () => {
      renderForm();
      expect(screen.getAllByRole("radio")).toHaveLength(3);
      expect(screen.getByLabelText("TypeScript")).toBeInTheDocument();
      expect(screen.getByLabelText("Go")).toBeInTheDocument();
      expect(screen.getByLabelText("Rust")).toBeInTheDocument();
    });

    it("renders no option pre-selected", () => {
      renderForm();
      screen.getAllByRole("radio").forEach((radio) => {
        expect(radio).not.toBeChecked();
      });
    });
  });

  describe("selection", () => {
    it("selects an option when clicked", async () => {
      renderForm();
      await userEvent.click(screen.getByLabelText("TypeScript"));
      expect(screen.getByLabelText("TypeScript")).toBeChecked();
    });

    it("moves the selection when a different option is clicked", async () => {
      renderForm();
      await userEvent.click(screen.getByLabelText("TypeScript"));
      await userEvent.click(screen.getByLabelText("Go"));
      expect(screen.getByLabelText("Go")).toBeChecked();
      expect(screen.getByLabelText("TypeScript")).not.toBeChecked();
    });
  });

  describe("validation", () => {
    it("shows an error when submitting without selecting an option", async () => {
      renderForm();
      await userEvent.click(screen.getByRole("button", { name: /submit vote/i }));
      await waitFor(() => {
        expect(screen.getByText(/please select an option/i)).toBeInTheDocument();
      });
    });

    it("does not call onSubmit when no option is selected", async () => {
      const onSubmit = vi.fn(() => Promise.resolve());
      renderForm({ onSubmit });
      await userEvent.click(screen.getByRole("button", { name: /submit vote/i }));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("calls onSubmit with the selected optionId on valid submission", async () => {
      const onSubmit = vi.fn(() => Promise.resolve());
      renderForm({ onSubmit });
      await userEvent.click(screen.getByLabelText("Go"));
      await userEvent.click(screen.getByRole("button", { name: /submit vote/i }));
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith("opt-2");
      });
    });
  });

  describe("external state", () => {
    it("disables the fieldset and submit button while submitting", () => {
      renderForm({ isSubmitting: true });
      expect(screen.getByRole("button", { name: /submitting/i })).toBeDisabled();
      // The fieldset itself should be disabled (disables all inputs inside it)
      screen.getAllByRole("radio").forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it("shows an API-level error passed from the page", () => {
      renderForm({ error: "Vote submission failed" });
      expect(screen.getByText(/vote submission failed/i)).toBeInTheDocument();
    });
  });
});
