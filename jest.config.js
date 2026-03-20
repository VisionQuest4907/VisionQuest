module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "server.js",
    "routes/**/*.js",
    "middleware/**/*.js",
    "config/**/*.js",
    "models/**/*.js"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ]
};