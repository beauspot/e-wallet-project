import { JestConfigWithTsJest } from "ts-jest";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const config: JestConfigWithTsJest = {
  testEnvironment: "node",
  preset: "ts-jest",
  clearMocks: true,
  forceExit: true,
  collectCoverage: true,
  verbose: true,
  roots: ["<rootDir>"],
  modulePaths: [compilerOptions.baseUrl],
  collectCoverageFrom: ["<rootDir>/src/api/**/*.ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  testMatch: ["**/**/*.test.ts", "**/**/*.spec.ts"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};

export default config;
