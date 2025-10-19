import { PrismaClient } from '@prisma/client';

// Mock Prisma Client for all tests
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    vehicle: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    weeklyData: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    dataSubjectRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    userConsent: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.PORT = '5001';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Global test utilities
beforeAll(() => {
  // Setup before all tests
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});
