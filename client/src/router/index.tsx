import { createBrowserRouter } from "react-router-dom";
import CreatePollPage from "../pages/CreatePollPage";
import VotePollPage from "../pages/VotePollPage";
import ResultsPage from "../pages/ResultsPage";

// Declaring routes as a data structure (rather than JSX <Routes>) is the
// React Router v6+ recommended pattern.  It enables future data-loading APIs
// and keeps the full routing table visible in one place.
const router = createBrowserRouter([
  { path: "/", element: <CreatePollPage /> },
  { path: "/poll/:pollId", element: <VotePollPage /> },
  { path: "/results/:pollId", element: <ResultsPage /> },
]);

export default router;
