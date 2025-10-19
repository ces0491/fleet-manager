import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

/**
 * Generate a valid JWT token for testing
 */
export const generateTestToken = (userId: number, role: Role = 'VIEWER'): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
    { expiresIn: '1h' }
  );
};

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  password: '$2a$10$xxxxxHashedPasswordxxxxx', // Hashed password
  role: 'VIEWER' as Role,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastLogin: new Date('2024-01-01'),
};

export const mockAdminUser = {
  ...mockUser,
  id: 2,
  username: 'admin',
  email: 'admin@example.com',
  role: 'ADMIN' as Role,
};

export const mockManagerUser = {
  ...mockUser,
  id: 3,
  username: 'manager',
  email: 'manager@example.com',
  role: 'MANAGER' as Role,
};

/**
 * Mock vehicle data for testing
 */
export const mockVehicle = {
  id: 1,
  vehicleNumber: 'ABC123',
  driverName: 'John Doe',
  phoneNumber: '1234567890',
  status: 'ACTIVE' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Mock weekly data for testing
 */
export const mockWeeklyData = {
  id: 1,
  vehicleId: 1,
  weekStartDate: new Date('2024-01-01'),
  weekEndDate: new Date('2024-01-07'),
  cashCollected: 5000,
  onlineEarnings: 3000,
  totalRevenue: 8000,
  dieselExpense: 2000,
  tollsParking: 500,
  maintenanceRepairs: 300,
  otherExpenses: 200,
  totalDeductions: 3000,
  netProfit: 5000,
  profitMargin: 62.5,
  totalTrips: 50,
  totalDistance: 1000,
  averageRating: 4.5,
  submittedById: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Mock audit log data for testing
 */
export const mockAuditLog = {
  id: 1,
  userId: 1,
  action: 'CREATE' as const,
  resource: 'VEHICLE' as const,
  resourceId: '1',
  details: 'Created vehicle ABC123',
  ipAddress: '127.0.0.1',
  userAgent: 'jest-test',
  success: true,
  errorMessage: null,
  metadata: {},
  timestamp: new Date('2024-01-01'),
};

/**
 * Create mock Express request with authentication
 */
export const createMockAuthRequest = (user: any, body: any = {}, params: any = {}, query: any = {}) => ({
  user,
  body,
  params,
  query,
  headers: {},
  ip: '127.0.0.1',
  get: jest.fn((header: string) => {
    if (header === 'user-agent') return 'jest-test';
    return undefined;
  }),
});

/**
 * Create mock Express response
 */
export const createMockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Create mock Express next function
 */
export const createMockNext = () => jest.fn();

/**
 * Calculate financial totals (same logic as backend)
 */
export const calculateFinancials = (data: {
  cashCollected: number;
  onlineEarnings: number;
  dieselExpense: number;
  tollsParking: number;
  maintenanceRepairs: number;
  otherExpenses: number;
}) => {
  const totalRevenue = data.cashCollected + data.onlineEarnings;
  const totalDeductions =
    data.dieselExpense + data.tollsParking + data.maintenanceRepairs + data.otherExpenses;
  const netProfit = totalRevenue - totalDeductions;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalDeductions,
    netProfit,
    profitMargin: Math.round(profitMargin * 100) / 100, // Round to 2 decimals
  };
};
