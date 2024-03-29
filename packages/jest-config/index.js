/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "rollup-jest",
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
};
