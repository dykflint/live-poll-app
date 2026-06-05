import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PollForm from "../PollForm";

// A no-op submit handler used when we only care about validation, not submission
const noop = vi.fn(() => Promise.resolve());

function renderForm(props?: Partial<React.ComponentProps<typeof PollForm>>) {
  return render(
    <PollForm onSubmit={noop} isSubmitting={false} {...props} />
  );
}

describe("PollForm", () => {
  describe("rendering", () => {
    it("renders question input and two option inputs by default", () => {
      renderForm();
      expect(screen.getByLabelText(/question/i)).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(2);
    });

    it("does not show Remove buttons when only 2 options exist", () => {
      renderForm();
      expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
    });

    it("shows the Add option button when fewer than 5 options", () => {
      renderForm();
      expect(screen.getByRole("button", { name: /add option/i })).toBeInTheDocument();
    });
  });

  describe("adding and removing options", () => {
    it("adds an option when Add option is clicked", async () => {
      renderForm();
      await userEvent.click(screen.getByRole("button", { name: /add option/i }));
      expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(3);
    });

    it("shows Remove buttons once there are more than 2 options", async () => {
      renderForm();
      await userEvent.click(screen.getByRole("button", { name: /add option/i }));
      expect(screen.getAllByRole("button", { name: /remove/i })).toHaveLength(3);
    });

    it("hides Add option button at 5 options", async () => {
      renderForm();
      for (let i = 0; i < 3; i++) {
        await userEvent.click(screen.getByRole("button", { name: /add option/i }));
      }
      expect(screen.queryByRole("button", { name: /add option/i })).not.toBeInTheDocument();
    });

    it("removes an option when Remove is clicked", async () => {
      renderForm();
      await userEvent.click(screen.getByRole("button", { name: /add option/i }));
      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      await userEvent.click(removeButtons[0]);
      expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(2);
    });
  });

  describe("validation", () => {
    it("shows error when submitting with an empty question", async () => {
      renderForm();
      fireEvent.submit(screen.getByRole("button", { name: /create poll/i }).closest("form")!);
      await waitFor(() => {
        expect(screen.getByText(/question is required/i)).toBeInTheDocument();
      });
    });

    it("shows error when an option is empty", async () => {
      renderForm();
      await userEvent.type(screen.getByLabelText(/question/i), "My question?");
      fireEvent.submit(screen.getByRole("button", { name: /create poll/i }).closest("form")!);
      await waitFor(() => {
        expect(screen.getByText(/option text cannot be empty/i)).toBeInTheDocument();
      });
    });

    it("shows duplicate options error", async () => {
      renderForm();
      const inputs = screen.getAllByPlaceholderText(/option/i);
      await userEvent.type(screen.getByLabelText(/question/i), "Q?");
      await userEvent.type(inputs[0], "Same");
      await userEvent.type(inputs[1], "same");
      fireEvent.submit(screen.getByRole("button", { name: /create poll/i }).closest("form")!);
      await waitFor(() => {
        expect(screen.getByText(/options must be unique/i)).toBeInTheDocument();
      });
    });

    it("calls onSubmit with trimmed data when the form is valid", async () => {
      const onSubmit = vi.fn(() => Promise.resolve());
      renderForm({ onSubmit });
      const inputs = screen.getAllByPlaceholderText(/option/i);

      await userEvent.type(screen.getByLabelText(/question/i), "Best language?");
      await userEvent.type(inputs[0], "TypeScript");
      await userEvent.type(inputs[1], "Go");
      await userEvent.click(screen.getByRole("button", { name: /create poll/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          question: "Best language?",
          options: ["TypeScript", "Go"],
        });
      });
    });
  });

  describe("external state", () => {
    it("disables inputs and buttons while submitting", () => {
      renderForm({ isSubmitting: true });
      screen.getAllByRole("textbox").forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it("displays an API-level error message", () => {
      renderForm({ error: "Something went wrong on the server" });
      expect(screen.getByText(/something went wrong on the server/i)).toBeInTheDocument();
    });
  });
});
