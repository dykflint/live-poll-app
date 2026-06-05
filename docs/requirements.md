# requirements.md

# Live Poll Application

## 1. Overview

The Live Poll Application enables users to create simple polls, share them with others, collect votes, and view aggregated results.

The application is intended as a lightweight MVP that demonstrates full-stack application development, including frontend, backend, database persistence, and deployment considerations.

---

# 2. Goals

The application must allow:

1. Poll creation with a question and multiple answer options.
2. Poll sharing through a unique URL.
3. Voting on an existing poll.
4. Viewing poll results.
5. Persistent storage of poll data and votes.

The application should prioritize simplicity, maintainability, and clarity over advanced functionality.

---

# 3. User Roles

## Poll Creator

A user who creates a poll and shares it with others.

Capabilities:

- Create a poll.
- Access the voting page.
- Access the results page.

## Voter

A user who receives a poll link.

Capabilities:

- View a poll.
- Cast a vote.
- View poll results.

No authentication is required for either role.

---

# 4. Functional Requirements

## FR-1: Create Poll

The system shall allow a user to create a poll.

A poll must contain:

- A question.
- Between 2 and 5 answer options.

Upon successful creation:

- The poll shall be persisted.
- A unique poll identifier shall be generated.
- The user shall receive a shareable URL.

### Acceptance Criteria

- Question is required.
- Minimum of 2 options.
- Maximum of 5 options.
- Empty options are not allowed.

---

## FR-2: View Poll

The system shall allow a user to retrieve and view a poll using its unique identifier.

### Acceptance Criteria

- Poll question is displayed.
- Available options are displayed.
- Invalid poll IDs return a not found response.

---

## FR-3: Cast Vote

The system shall allow a user to vote for a single option.

### Acceptance Criteria

- One option can be selected per submission.
- Vote is persisted.
- User receives confirmation of successful submission.

### Out of Scope

The following are intentionally excluded:

- Authentication
- User accounts
- Duplicate vote prevention
- Vote editing
- Vote deletion

---

## FR-4: View Results

The system shall display poll results.

For each option, the system shall display:

- Total vote count.
- Percentage of total votes.

Results should be presented visually.

### Acceptance Criteria

- Vote counts are accurate.
- Percentages are accurate.
- Results update automatically without requiring a full page refresh.

---

## FR-5: Live Updates

The results page shall periodically refresh data.

### Acceptance Criteria

- Results are refreshed automatically.
- Polling interval should be configurable.
- Default polling interval is 2 seconds.

---

# 5. Non-Functional Requirements

## NFR-1: Simplicity

The solution should favor simplicity over completeness.

The architecture should be understandable by a developer unfamiliar with the project.

---

## NFR-2: Maintainability

The solution should separate:

- Presentation logic
- Business logic
- Data access concerns

---

## NFR-3: Type Safety

Frontend and backend code should be implemented using TypeScript.

---

## NFR-4: Persistence

Polls and votes must persist across application restarts.

---

## NFR-5: Local Development

The application must be runnable locally using documented setup instructions.

---

# 6. Technical Constraints

## Frontend

- React
- TypeScript
- Vite

## Backend

- Express
- TypeScript

## Database

- SQLite
- Prisma ORM

---

# 7. Assumptions

The following assumptions are made:

- Polls remain available indefinitely.
- Anonymous voting is acceptable.
- Poll volume is expected to be low.
- SQLite is sufficient for the expected workload.
- The application will be evaluated primarily on correctness and architecture rather than feature completeness.

---

# 8. Future Enhancements

Potential improvements outside the scope of this MVP:

- Authentication and user accounts.
- Duplicate vote prevention.
- Poll expiration dates.
- Poll editing.
- Poll deletion.
- WebSocket-based real-time updates.
- Analytics and reporting.
- Multi-select polls.
- Rate limiting.
- Access control.
