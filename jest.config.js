module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "@/(.*)$": "<rootDir>/$1"
  },
  "transformIgnorePatterns": [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$"
  ],
  "moduleDirectories": [
    "node_modules"
  ],
  "testTimeout": 60000
};
