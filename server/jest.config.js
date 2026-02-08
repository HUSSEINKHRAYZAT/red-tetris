module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server/index.js', // Exclude server entry point
    '!**/node_modules/**',
  ],

  // Coverage thresholds (as per subject requirements)
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 50,
      functions: 70,
      lines: 70,
    },
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
  ],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],

  // Test timeout
  testTimeout: 10000,
};
