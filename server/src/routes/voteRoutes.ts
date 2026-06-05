import { Router } from "express";
import { submitVoteHandler, getResultsHandler } from "../controllers/voteController";

// Mounted at /api/polls — paths here are relative to that prefix
// POST /api/polls/:pollId/votes    — cast a vote
// GET  /api/polls/:pollId/results  — fetch aggregated results
const router = Router();

router.post("/:pollId/votes", submitVoteHandler);
router.get("/:pollId/results", getResultsHandler);

export default router;
