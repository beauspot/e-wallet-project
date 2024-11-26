import { pathsToModuleNameMapper, JestConfigWithTsJest } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const jestConfig: JestConfigWithTsJest = {
  testEnvironment: "node",
  preset: "ts-jest",
  clearMocks: true,
  forceExit: true,
  collectCoverage: true,
  verbose: true,
  roots: ["<rootDir>/src"],
  collectCoverageFrom: ["<rootDir>/src/api/**/*.ts"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testMatch: ["**/**/*.test.ts", "**/**/*.spec.ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/src/",
  }),
};
export default jestConfig;
