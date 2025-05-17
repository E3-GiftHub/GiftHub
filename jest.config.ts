module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  testEnvironment: 'node', // Ensure Jest runs in a Node.js environment
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1", // Adjust according to your project structure
  },
};
