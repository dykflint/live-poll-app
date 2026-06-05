# Live Poll App

## AI Usage

AI tools were used to:

- Generate initial project scaffolding
- Draft validation schemas
- Generate CRUD endpoint boilerplate
- Review architecture decisions

All generated code was reviewed, modified, and tested manually.

---

**Live demo: https://live-poll-app-six.vercel.app**

---

A real-time polling application: create a poll, share the link, collect votes, and watch the results update live.

## Features

- Create a poll with a question and 2–5 options
- Share a vote link — no account required
- Results page refreshes automatically every 2 seconds
- Validation on both client and server

## Tech stack

| Layer      | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| Frontend   | React 19, TypeScript, Vite, React Router v7                  |
| Styling    | Tailwind CSS v3, shadcn/ui                                   |
| Validation | Zod (mirrored schemas on both sides)                         |
| Backend    | Express 4, TypeScript                                        |
| ORM        | Prisma 5                                                     |
| Database   | SQLite                                                       |
| Testing    | Vitest + Testing Library (client), Jest + Supertest (server) |

## Architecture

```
client/          React SPA (Vite)
└── src/
    ├── pages/           CreatePollPage, VotePollPage, ResultsPage
    ├── components/poll/ PollForm, VoteForm, ResultsChart
    ├── hooks/           usePoll, useResults, usePolling
    ├── services/        pollApi.ts  (fetch wrapper)
    ├── schemas/         Zod validation (mirrors server)
    └── types/           Shared TypeScript interfaces

server/          Express API
└── src/
    ├── routes/          pollRoutes, voteRoutes
    ├── controllers/     pollController, voteController
    ├── services/        pollService, voteService
    ├── schemas/         Zod validation (source of truth)
    ├── middleware/       errorHandler
    └── prisma/          PrismaClient singleton
```

Results are calculated on demand — the database stores individual `Vote` rows and the API aggregates them with a `_count` query. This keeps the logic simple and the history intact.

The results page polls `GET /api/polls/:id/results` every 2 seconds via a `usePolling` hook that fires immediately on mount and uses a `useRef` pattern to keep the interval stable across re-renders.

## API

| Method | Path                         | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| `GET`  | `/health`                    | Health check                  |
| `POST` | `/api/polls`                 | Create a poll                 |
| `GET`  | `/api/polls/:pollId`         | Get poll question and options |
| `POST` | `/api/polls/:pollId/votes`   | Submit a vote                 |
| `GET`  | `/api/polls/:pollId/results` | Get live results              |

## Local development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure the server environment
cd ../server
cp .env.example .env          # DATABASE_URL and PORT are already set correctly
```

The database file (`server/prisma/dev.db`) is created automatically on first run — no separate setup step needed.

### Running

Open two terminals from the project root:

```bash
# Terminal 1 — backend (http://localhost:3001)
cd server && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client && npm run dev
```

Then open **http://localhost:5173** in your browser.

Both servers use hot reload — saving a file restarts the relevant process automatically.

### Tests

```bash
# Server (Jest + Supertest, hits a real test.db)
cd server && npm test

# Client (Vitest + Testing Library)
cd client && npx vitest run
```

### Resetting the database

```bash
cd server && npx prisma migrate reset --force
```

## Environment variables

### Server (`server/.env`)

| Variable       | Description                     | Default         |
| -------------- | ------------------------------- | --------------- |
| `DATABASE_URL` | Prisma SQLite connection string | `file:./dev.db` |
| `PORT`         | Port the API listens on         | `3001`          |

### Client (`client/.env.local`)

| Variable       | Description                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Base URL of the Express API. Omit for local development — defaults to `http://localhost:3001` |

## Deployment

### Backend → Railway

1. Create a new Railway project and connect this repository.
2. Set the **Root Directory** to `server/`.
3. Add a **Volume** mounted at `/data`.
4. Set the environment variable `DATABASE_URL=file:/data/poll.db`.

Railway picks up `railway.json` automatically. The `start` script runs `prisma migrate deploy` before the server starts, so the schema is always in sync.

### Frontend → Vercel

1. Create a new Vercel project and connect this repository.
2. Set the **Root Directory** to `client/`.
3. Add the environment variable `VITE_API_URL=https://your-railway-app.railway.app`.

`client/vercel.json` rewrites all paths to `index.html` so React Router handles client-side navigation correctly.
