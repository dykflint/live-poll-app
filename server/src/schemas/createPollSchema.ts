import { z } from "zod";

// z.object() describes a plain JS object with named fields.
// Each field is itself a Zod type — z.string(), z.array(), etc.
// Chained methods like .min() / .max() / .trim() add constraints.
export const createPollSchema = z.object({
  // .trim() strips accidental whitespace before the length check runs.
  // .min(1) after .trim() means the *trimmed* value must not be empty.
  question: z.string().trim().min(1, "Question is required").max(255, "Question must be 255 characters or fewer"),

  options: z
    .array(
      // Each element in the array is also a trimmed, non-empty string.
      z.string().trim().min(1, "Option text cannot be empty")
    )
    .min(2, "At least 2 options are required")
    .max(5, "No more than 5 options allowed")
    // .refine() lets you add arbitrary business-logic checks that plain
    // type constraints can't express.  It receives the parsed value and
    // must return true (valid) or false (invalid).
    .refine(
      (opts) => new Set(opts.map((o) => o.toLowerCase())).size === opts.length,
      { message: "Options must be unique" }
    ),
});

// z.infer extracts the TypeScript type directly from the schema.
// This is the only place the shape is defined — no duplicate interface needed.
export type CreatePollInput = z.infer<typeof createPollSchema>;
