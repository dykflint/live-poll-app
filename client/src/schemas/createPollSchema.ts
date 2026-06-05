import { z } from "zod";

// Mirrors server/src/schemas/createPollSchema.ts intentionally.
// Frontend validation exists purely for UX — it catches mistakes before a
// round-trip to the server.  The backend is still the authoritative validator.
export const createPollSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(255, "Question must be 255 characters or fewer"),

  options: z
    .array(z.string().trim().min(1, "Option text cannot be empty"))
    .min(2, "At least 2 options are required")
    .max(5, "No more than 5 options allowed")
    .refine(
      (opts) => new Set(opts.map((o) => o.toLowerCase())).size === opts.length,
      { message: "Options must be unique" }
    ),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
