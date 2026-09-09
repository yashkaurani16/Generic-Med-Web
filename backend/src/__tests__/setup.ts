// Jest global test setup
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-session-secret-for-jest';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/genericmed_test';

// Increase timeout for DB operations
jest.setTimeout(30000);
