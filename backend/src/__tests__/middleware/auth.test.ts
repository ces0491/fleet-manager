import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { generateTestToken, mockUser, mockAdminUser, mockManagerUser } from '../utils/testHelpers';

jest.mock('../../config/database');

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Authentication Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid token and attach user to request', async () => {
      const token = generateTestToken(mockUser.id, mockUser.role);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      mockReq.headers = {
        authorization: 'Bearer invalid-token-123',
      };

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token for inactive user', async () => {
      const token = generateTestToken(mockUser.id, mockUser.role);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or inactive user' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token for non-existent user', async () => {
      const token = generateTestToken(999, mockUser.role);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or inactive user' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle expired token', async () => {
      // Create an expired token
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: mockUser.id },
        process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      mockReq.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    beforeEach(() => {
      mockReq.user = mockUser;
    });

    it('should allow user with correct role (VIEWER)', () => {
      const middleware = authorize('VIEWER');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow admin user for admin-only route', () => {
      mockReq.user = mockAdminUser;
      const middleware = authorize('ADMIN');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow user with one of multiple allowed roles', () => {
      mockReq.user = mockManagerUser;
      const middleware = authorize('ADMIN', 'MANAGER');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny user without required role', () => {
      mockReq.user = mockUser; // VIEWER role
      const middleware = authorize('ADMIN');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny viewer trying to access manager route', () => {
      mockReq.user = mockUser; // VIEWER role
      const middleware = authorize('ADMIN', 'MANAGER');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny request without user attached', () => {
      mockReq.user = undefined;
      const middleware = authorize('VIEWER');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
