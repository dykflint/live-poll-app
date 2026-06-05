import { NextFunction, Request, Response } from "express";
import { voteSchema } from "../schemas/voteSchema";
import { createVote, getResults } from "../services/voteService";

export async function submitVoteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pollId = req.params.pollId as string;
    const { optionId } = voteSchema.parse(req.body);
    const result = await createVote(pollId, optionId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getResultsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pollId = req.params.pollId as string;
    const results = await getResults(pollId);
    res.json(results);
  } catch (err) {
    next(err);
  }
}
