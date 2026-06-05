import { PrismaClient } from "@prisma/client";

// A single shared client is exported so that every service imports the same
// connection pool rather than each instantiating its own.  Without this,
// hot-reload cycles in development would leak connections.
const prisma = new PrismaClient();

export default prisma;
