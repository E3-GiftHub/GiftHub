module.exports = {
  preset: 'ts-jest',
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  testEnvironment: 'node', // Ensure Jest runs in a Node.js environment
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1", // Adjust according to your project structure
  },
   transformIgnorePatterns: [
    // Add any other problematic node_modules if needed
    '/node_modules/(?!(superjson|@trpc|next-auth|react|next)/).+\\.js$'
  ],
  
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
