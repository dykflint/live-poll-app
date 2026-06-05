import { execSync } from "child_process";
import path from "path";

// Runs once in the main Jest process before any test suite starts.
// Applies the Prisma migration to the test database so the schema is ready.
export default async function globalSetup() {
  const serverDir = path.resolve(__dirname, "../../");

  execSync("npx prisma migrate deploy", {
    cwd: serverDir,
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
    stdio: "pipe",
  });
}
