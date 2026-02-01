// Test setup file
const { beforeAll, afterAll } = require('@jest/globals');

beforeAll(async () => {
  // Setup test database or mock services
  console.log('Setting up tests...');
});

afterAll(async () => {
  // Cleanup after tests
  console.log('Cleaning up tests...');
});