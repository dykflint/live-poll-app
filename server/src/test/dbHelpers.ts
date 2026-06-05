import prisma from "../prisma/client";

// Deletes all rows from every table in reverse dependency order.
// Called in beforeEach of integration tests to guarantee a clean slate.
export async function clearDatabase() {
  await prisma.vote.deleteMany();
  await prisma.option.deleteMany();
  await prisma.poll.deleteMany();
}
