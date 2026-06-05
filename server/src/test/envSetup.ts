// This file runs inside each Jest worker process before any module is imported.
// Setting DATABASE_URL here ensures the PrismaClient singleton (loaded lazily
// on first import) connects to the test database instead of dev.db.
process.env.DATABASE_URL = "file:./prisma/test.db";
