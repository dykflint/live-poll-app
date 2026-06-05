import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// Errors thrown by service or controller code carry an optional HTTP status.
// Using a typed subclass lets us distinguish "expected" API errors (404, 400)
// from unexpected crashes (500) without string-matching on messages.
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

// The four-parameter signature is what tells Express this is an error handler
// rather than a regular middleware.  All four parameters must be present even
// if `next` is unused — Express checks the function's .length at registration.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Zod throws ZodError when .parse() fails in a controller.
  // We surface the first issue as a human-readable 400 rather than a raw
  // Zod error object, which would be confusing to API consumers.
  if (err instanceof ZodError) {
    res.status(400).json({ message: err.errors[0].message });
    return;
  }

  // AppError is thrown deliberately by service code (e.g. "poll not found").
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Anything else is an unexpected crash — log it and return a generic 500
  // so implementation details are not leaked to the client.
  console.error("[unhandled error]", err);
  res.status(500).json({ message: "Internal server error" });
}
