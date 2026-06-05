import { NextFunction, Request, Response } from "express";
import { createPollSchema } from "../schemas/createPollSchema";
import { createPoll, getPollById } from "../services/pollService";

// Controllers contain no business logic — they are thin HTTP adapters.
// Validation happens via Zod .parse(); a ZodError thrown here is caught by
// next(err) and formatted by the central errorHandler as a 400 response.

export async function createPollHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createPollSchema.parse(req.body);
    const result = await createPoll(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPollHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pollId = req.params.pollId as string;
    const poll = await getPollById(pollId);
    res.json(poll);
  } catch (err) {
    next(err);
  }
}
