import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../../test/dbHelpers";

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  const prisma = (await import("../../prisma/client")).default;
  await prisma.$disconnect();
});

// Helper: creates a poll and returns its id + the first option's id
async function seedPoll() {
  const res = await request(app).post("/api/polls").send({
    question: "Best language?",
    options: ["TypeScript", "Go", "Rust"],
  });
  const pollId = res.body.id as string;

  const pollRes = await request(app).get(`/api/polls/${pollId}`);
  const firstOptionId = pollRes.body.options[0].id as string;

  return { pollId, firstOptionId };
}

// ─── POST /api/polls/:pollId/votes ──────────────────────────────────────────

describe("POST /api/polls/:pollId/votes", () => {
  it("accepts a valid vote and returns 201 with { success: true }", async () => {
    const { pollId, firstOptionId } = await seedPoll();

    const res = await request(app)
      .post(`/api/polls/${pollId}/votes`)
      .send({ optionId: firstOptionId });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true });
  });

  it("returns 400 when optionId is missing from the body", async () => {
    const { pollId } = await seedPoll();

    const res = await request(app)
      .post(`/api/polls/${pollId}/votes`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 when the poll does not exist", async () => {
    const res = await request(app)
      .post("/api/polls/nonexistent/votes")
      .send({ optionId: "any" });

    expect(res.status).toBe(404);
  });

  it("returns 404 when optionId belongs to a different poll", async () => {
    const { pollId } = await seedPoll();

    // Create a second poll and grab one of its option IDs
    const other = await seedPoll();

    const res = await request(app)
      .post(`/api/polls/${pollId}/votes`)
      .send({ optionId: other.firstOptionId });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Option not found" });
  });
});

// ─── GET /api/polls/:pollId/results ─────────────────────────────────────────

describe("GET /api/polls/:pollId/results", () => {
  it("returns zero counts when no votes have been cast", async () => {
    const { pollId } = await seedPoll();

    const res = await request(app).get(`/api/polls/${pollId}/results`);

    expect(res.status).toBe(200);
    expect(res.body.totalVotes).toBe(0);
    res.body.results.forEach((r: { percentage: number }) => {
      expect(r.percentage).toBe(0);
    });
  });

  it("reflects votes immediately after submission", async () => {
    const { pollId, firstOptionId } = await seedPoll();

    await request(app)
      .post(`/api/polls/${pollId}/votes`)
      .send({ optionId: firstOptionId });

    const res = await request(app).get(`/api/polls/${pollId}/results`);

    expect(res.body.totalVotes).toBe(1);
    const voted = res.body.results.find(
      (r: { optionId: string }) => r.optionId === firstOptionId
    );
    expect(voted.votes).toBe(1);
    expect(voted.percentage).toBe(100);
  });

  it("calculates percentages correctly across multiple options", async () => {
    const { pollId } = await seedPoll();
    const pollRes = await request(app).get(`/api/polls/${pollId}`);
    const [optA, optB] = pollRes.body.options;

    // Cast 3 votes for A, 1 for B → 75% / 25%
    for (let i = 0; i < 3; i++) {
      await request(app).post(`/api/polls/${pollId}/votes`).send({ optionId: optA.id });
    }
    await request(app).post(`/api/polls/${pollId}/votes`).send({ optionId: optB.id });

    const res = await request(app).get(`/api/polls/${pollId}/results`);

    expect(res.body.totalVotes).toBe(4);
    const resultA = res.body.results.find((r: { optionId: string }) => r.optionId === optA.id);
    const resultB = res.body.results.find((r: { optionId: string }) => r.optionId === optB.id);
    expect(resultA.percentage).toBe(75);
    expect(resultB.percentage).toBe(25);
  });

  it("returns 404 for a non-existent poll", async () => {
    const res = await request(app).get("/api/polls/nonexistent/results");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Poll not found" });
  });
});
