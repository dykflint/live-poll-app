import { Router } from "express";
import { createPollHandler, getPollHandler } from "../controllers/pollController";

const router = Router();

// POST /api/polls       — create a new poll
// GET  /api/polls/:pollId — fetch a poll by ID
router.post("/", createPollHandler);
router.get("/:pollId", getPollHandler);

export default router;
