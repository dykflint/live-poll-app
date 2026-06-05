import { z } from "zod";

// The vote payload only carries the chosen option's ID.
// .min(1) guards against an empty string being submitted.
export const voteSchema = z.object({
  optionId: z.string().min(1, "optionId is required"),
});

export type VoteInput = z.infer<typeof voteSchema>;
