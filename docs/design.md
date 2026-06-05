# design.md

# Live Poll Application - Technical Design

## 1. Architecture Overview

The application follows a simple client-server architecture with a clear separation between presentation, business logic, and persistence.

text React Client │ │ HTTP/JSON ▼ Express API │ ▼ Service Layer │ ▼ Prisma ORM │ ▼ SQLite Database

### Design Principles

- Simplicity over completeness.
- Clear separation of concerns.
- Type safety across the stack.
- Minimal dependencies.
- Easy local setup and deployment.

---

# 2. Technology Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- shadcn/ui
- Zod

## Backend

- Express
- TypeScript
- Prisma
- Zod

## Database

- SQLite

## Deployment

Frontend:

- Vercel

Backend:

- Railway

---

# 3. Project Structure

live-poll-app/

├── client/
│ ├── src/
│ │ ├── pages/
│ │ │ ├── CreatePollPage.tsx
│ │ │ ├── VotePollPage.tsx
│ │ │ └── ResultsPage.tsx
│ │ │
│ │ ├── components/
│ │ │ ├── poll/
│ │ │ │ ├── PollForm.tsx
│ │ │ │ ├── VoteForm.tsx
│ │ │ │ └── ResultsChart.tsx
│ │ │ │
│ │ │ └── ui/
│ │ │
│ │ ├── hooks/
│ │ │ ├── usePoll.ts
│ │ │ ├── useResults.ts
│ │ │ └── usePolling.ts
│ │ │
│ │ ├── services/
│ │ │ └── pollApi.ts
│ │ │
│ │ ├── schemas/
│ │ │ ├── createPollSchema.ts
│ │ │ └── voteSchema.ts
│ │ │
│ │ ├── types/
│ │ │ └── poll.ts
│ │ │
│ │ ├── lib/
│ │ │ └── utils.ts
│ │ │
│ │ ├── router/
│ │ │ └── index.tsx
│ │ │
│ │ ├── App.tsx
│ │ └── main.tsx
│ │
│ └── package.json
│
├── server/
│ ├── src/
│ │ ├── routes/
│ │ │ └── pollRoutes.ts
│ │ │
│ │ ├── controllers/
│ │ │ └── pollController.ts
│ │ │
│ │ ├── services/
│ │ │ └── pollService.ts
│ │ │
│ │ ├── schemas/
│ │ │ ├── createPollSchema.ts
│ │ │ └── voteSchema.ts
│ │ │
│ │ ├── middleware/
│ │ │ └── errorHandler.ts
│ │ │
│ │ ├── prisma/
│ │ │ └── client.ts
│ │ │
│ │ ├── types/
│ │ │ └── poll.ts
│ │ │
│ │ ├── app.ts
│ │ └── server.ts
│ │
│ ├── prisma/
│ │ └── schema.prisma
│ │
│ └── package.json
│
├── docs/
│ ├── requirements.md
│ ├── design.md
│ └── tasks.md
│
└── README.md

---

# 4. Frontend Design

## Routing

| Route            | Purpose           |
| ---------------- | ----------------- |
| /                | Create a poll     |
| /poll/:pollId    | Vote on a poll    |
| /results/:pollId | View poll results |

---

## Create Poll Page

### Responsibilities

- Display poll creation form.
- Validate user input.
- Submit poll creation request.
- Display generated poll URL.
- Provide navigation to voting and results pages.

### Validation

- Question required.
- Question max length: 255 characters.
- Minimum 2 options.
- Maximum 5 options.
- No empty options.
- No duplicate options.

---

## Vote Poll Page

### Responsibilities

- Fetch poll details.
- Display poll question and options.
- Allow selection of a single option.
- Submit vote.

### User Flow

1. Open poll link.
2. Select option.
3. Submit vote.
4. Redirect to results page.

---

## Results Page

### Responsibilities

- Display aggregated results.
- Display vote counts.
- Display percentages.
- Automatically refresh results.

### Visual Representation

Results are displayed using:

- Progress bars.
- Vote count labels.
- Percentage labels.

No charting library is required.

---

# 5. Backend Design

## Layer Responsibilities

### Routes

Responsibilities:

- Define API endpoints.
- Map requests to controllers.

---

### Controllers

Responsibilities:

- Parse request parameters.
- Call service methods.
- Return HTTP responses.

Controllers contain no business logic.

---

### Services

Responsibilities:

- Business logic.
- Validation orchestration.
- Database interaction through Prisma.

---

# 6. API Design

Base URL:

text /api

---

## Create Poll

### Request

http POST /api/polls

json { "question": "Best programming language?", "options": [ "TypeScript", "Go", "Rust" ] }

### Response

json { "id": "poll-id" }

Status:

text 201 Created

---

## Get Poll

### Request

http GET /api/polls/:pollId

### Response

json { "id": "poll-id", "question": "Best programming language?", "options": [ { "id": "option-id", "text": "TypeScript" } ] }

Status:

text 200 OK

---

## Submit Vote

### Request

http POST /api/polls/:pollId/votes

json { "optionId": "option-id" }

### Response

json { "success": true }

Status:

text 201 Created

---

## Get Results

### Request

http GET /api/polls/:pollId/results

### Response

json { "totalVotes": 10, "results": [ { "optionId": "option-id", "text": "TypeScript", "votes": 6, "percentage": 60 } ] }

Status:

text 200 OK

---

# 7. Database Design

## Entity Relationships

text Poll └── Option └── Vote

A poll contains multiple options.

Each vote belongs to exactly one option.

Vote totals are calculated dynamically.

---

## Prisma Schema

### Poll

prisma model Poll { id String @id @default(cuid()) question String createdAt DateTime @default(now()) options Option[] }

### Option

prisma model Option { id String @id @default(cuid()) text String pollId String poll Poll @relation(fields: [pollId], references: [id]) votes Vote[] }

### Vote

prisma model Vote { id String @id @default(cuid()) optionId String option Option @relation(fields: [optionId], references: [id]) createdAt DateTime @default(now()) }

---

# 8. Validation Strategy

## Frontend Validation

Zod schemas validate:

- Poll creation form.
- Vote submission form.

Validation occurs before API requests are sent.

---

## Backend Validation

Zod schemas validate:

- Request bodies.
- Route parameters where appropriate.

Backend validation is the source of truth.

Frontend validation exists only for user experience.

---

# 9. Result Calculation

Results are calculated on demand.

Algorithm:

text totalVotes = sum(optionVotes) percentage = (optionVotes / totalVotes) \* 100

Display values are rounded to whole numbers.

### Rationale

Advantages:

- Simpler implementation.
- Easier correctness verification.
- No synchronization concerns.

Trade-off:

- Additional aggregation queries.

Acceptable for MVP scale.

---

# 10. Live Update Strategy

Results page uses polling.

Polling interval:

text 2 seconds

Flow:

text Results Page │ ▼ GET /api/polls/:pollId/results │ ▼ Update UI │ ▼ Repeat every 2 seconds

### Rationale

Advantages:

- Simple implementation.
- Minimal infrastructure.
- Easy debugging.

Future alternatives:

- Server-Sent Events (SSE)
- WebSockets

---

# 11. Error Handling

Standard HTTP status codes are used.

Examples:

text 200 OK 201 Created 400 Bad Request 404 Not Found 500 Internal Server Error

Error format:

json { "message": "Poll not found" }

A centralized Express error handler is responsible for formatting unexpected errors.

---

# 12. Security Considerations

In Scope:

- Input validation.
- Request validation.
- Route parameter validation.

Out of Scope:

- Authentication.
- Authorization.
- Duplicate vote prevention.
- Rate limiting.
- CSRF protection.

These omissions are intentional and align with MVP requirements.

---

# 13. Scalability Considerations

Current design is optimized for simplicity.

Future improvements:

- PostgreSQL instead of SQLite.
- Vote count materialization.
- Query caching.
- Rate limiting.
- Horizontal API scaling.
- WebSocket-based updates.

These enhancements are unnecessary for the expected workload of this application.

---

# 14. Deployment Strategy

Frontend:

- Vercel

Backend:

- Railway

Database:

- SQLite file managed alongside backend deployment.

Primary evaluation target remains local execution using documented setup instructions.
