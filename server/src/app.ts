import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import pollRoutes from "./routes/pollRoutes";

const app = express();

// Parse JSON request bodies for all routes
app.use(express.json());

// Allow cross-origin requests from the Vite dev server and future Vercel deployment
app.use(cors());

// ---------------------------------------------------------------------------
// Health check – used by Railway and local smoke tests to verify the server
// is up before running the full integration suite.
// ---------------------------------------------------------------------------
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes — vote routes are added in Phase 5
app.use("/api/polls", pollRoutes);

// The error handler must be the very last middleware — Express identifies it
// by its 4-parameter signature and only calls it when next(err) is invoked.
app.use(errorHandler);

export default app;
