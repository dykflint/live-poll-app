// Integration tests: the full HTTP stack hits a real SQLite test database.
// supertest mounts the Express app without binding to a port, so tests run
// in-process and stay fast while still exercising routing, validation,
// the service layer, and Prisma together.
import request from "supertest";
import app from "../../app";
import { clearDatabase } from "../../test/dbHelpers";

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  // Allow the Prisma connection to close gracefully after the suite finishes
  const prisma = (await import("../../prisma/client")).default;
  await prisma.$disconnect();
});

// ─── POST /api/polls ────────────────────────────────────────────────────────

describe("POST /api/polls", () => {
  it("creates a poll and returns 201 with the new poll id", async () => {
    const res = await request(app).post("/api/polls").send({
      question: "Best language?",
      options: ["TypeScript", "Go", "Rust"],
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(typeof res.body.id).toBe("string");
  });

  it("returns 400 when question is missing", async () => {
    const res = await request(app).post("/api/polls").send({
      options: ["A", "B"],
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 when fewer than 2 options are provided", async () => {
    const res = await request(app).post("/api/polls").send({
      question: "Q?",
      options: ["OnlyOne"],
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when more than 5 options are provided", async () => {
    const res = await request(app).post("/api/polls").send({
      question: "Q?",
      options: ["A", "B", "C", "D", "E", "F"],
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 for duplicate options", async () => {
    const res = await request(app).post("/api/polls").send({
      question: "Q?",
      options: ["Same", "same"],
    });

    expect(res.status).toBe(400);
  });
});

// ─── GET /api/polls/:pollId ──────────────────────────────────────────────────

describe("GET /api/polls/:pollId", () => {
  it("returns the poll with its options", async () => {
    // First create a poll so we have a real ID to fetch
    const createRes = await request(app).post("/api/polls").send({
      question: "Favourite language?",
      options: ["TypeScript", "Go"],
    });
    const { id } = createRes.body;

    const res = await request(app).get(`/api/polls/${id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id,
      question: "Favourite language?",
      options: expect.arrayContaining([
        expect.objectContaining({ text: "TypeScript" }),
        expect.objectContaining({ text: "Go" }),
      ]),
    });
  });

  it("returns 404 for a non-existent poll", async () => {
    const res = await request(app).get("/api/polls/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Poll not found" });
  });
});
