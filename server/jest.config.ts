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
  clearMocks: true,
  // Runs once before all suites: applies Prisma migrations to test.db
  globalSetup: "<rootDir>/src/test/globalSetup.ts",
  // Runs inside each worker before module loading: sets DATABASE_URL for test.db
  setupFiles: ["<rootDir>/src/test/envSetup.ts"],
};

export default config;
