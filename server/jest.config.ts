import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Only pick up files in __tests__ dirs or *.test.ts / *.spec.ts files
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  // Map path aliases to keep test imports consistent with src
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Avoid importing the real Prisma client in unit tests
  // (integration tests wire it up via a real dev DB)
  clearMocks: true,
};

export default config;
