import express from "express";
import cors from "cors";

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

export default app;
