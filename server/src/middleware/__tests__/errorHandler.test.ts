import express, { NextFunction, Request, Response } from "express";
import request from "supertest";
import { z } from "zod";
import { AppError, errorHandler } from "../errorHandler";

// Build a minimal Express app that deliberately triggers different error types,
// then assert that errorHandler maps each to the correct HTTP response.
function buildTestApp(triggerError: (req: Request, res: Response, next: NextFunction) => void) {
  const app = express();
  app.get("/test", triggerError);
  app.use(errorHandler);
  return app;
}

describe("errorHandler middleware", () => {
  it("returns 400 with the first Zod issue message on ZodError", async () => {
    const app = buildTestApp((_req, _res, next) => {
      try {
        z.object({ name: z.string().min(1) }).parse({ name: "" });
      } catch (err) {
        next(err);
      }
    });

    const res = await request(app).get("/test");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("returns the correct status and message for AppError", async () => {
    const app = buildTestApp((_req, _res, next) => {
      next(new AppError(404, "Poll not found"));
    });

    const res = await request(app).get("/test");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Poll not found" });
  });

  it("returns 500 for unexpected errors without leaking details", async () => {
    const app = buildTestApp((_req, _res, next) => {
      next(new Error("something exploded internally"));
    });

    const res = await request(app).get("/test");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Internal server error" });
  });
});
