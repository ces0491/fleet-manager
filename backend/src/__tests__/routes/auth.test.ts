import request from 'supertest';
import express, { Express } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import authRouter from '../../routes/auth';

// Mock dependencies
jest.mock('../../config/database');
jest.mock('../../middleware/auditLogger', () => ({
  logAuthAttempt: jest.fn(),
  createAuditLog: jest.fn(),
}));

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Authentication Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'VIEWER' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(newUser),
          },
          userConsent: {
            createMany: jest.fn().mockResolvedValue({ count: 3 }),
          },
        };
        return callback(tx);
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('viewer');
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should fail with invalid username (too short)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0].msg).toContain('Username must be between 3 and 50 characters');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with password too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '12345',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0].msg).toContain('Password must be at least 6 characters');
    });

    it('should fail if user already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists with this email or username');
    });

    it('should register user with admin role when specified', async () => {
      const adminUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: 'hashedpassword',
        role: 'ADMIN' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(adminUser),
          },
          userConsent: {
            createMany: jest.fn().mockResolvedValue({ count: 3 }),
          },
        };
        return callback(tx);
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'admin',
          email: 'admin@example.com',
          password: 'password123',
          role: 'admin',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe('admin');
    });
  });

  describe('POST /api/auth/login', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: '',
      role: 'VIEWER' as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
    };

    beforeEach(async () => {
      // Create a hashed password for testing
      const salt = await bcrypt.genSalt(10);
      mockUser.password = await bcrypt.hash('password123', salt);
    });

    it('should login successfully with valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        lastLogin: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.message).toBe('Login successful');
    });

    it('should fail with invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail with invalid password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail if account is inactive', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Account is inactive. Please contact administrator.');
    });

    it('should fail with validation errors for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/me', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'VIEWER' as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
    };

    it('should return user profile when authenticated', async () => {
      const token = jwt.sign(
        { userId: mockUser.id },
        process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
        { expiresIn: '1h' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.username).toBe('testuser');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should fail if user not found in database', async () => {
      const token = jwt.sign(
        { userId: 999 },
        process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
        { expiresIn: '1h' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or inactive user');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: '',
      role: 'VIEWER' as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
    };

    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      mockUser.password = await bcrypt.hash('oldpassword123', salt);
    });

    it('should change password successfully', async () => {
      const token = jwt.sign(
        { userId: mockUser.id },
        process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
        { expiresIn: '1h' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should fail with incorrect current password', async () => {
      const token = jwt.sign(
        { userId: mockUser.id },
        process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
        { expiresIn: '1h' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Current password is incorrect');
    });

    it('should fail with new password too short', async () => {
      const token = jwt.sign(
        { userId: mockUser.id },
        process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
        { expiresIn: '1h' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword123',
          newPassword: '12345',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authentication required');
    });
  });
});
