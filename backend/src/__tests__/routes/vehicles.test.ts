import request from 'supertest';
import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import vehicleRouter from '../../routes/vehicles';
import { generateTestToken, mockUser, mockAdminUser, mockManagerUser, mockVehicle } from '../utils/testHelpers';

jest.mock('../../config/database');
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = mockUser;
    next();
  },
  authorize: (...roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.map(r => r.toUpperCase()).includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      next();
    };
  },
}));

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Vehicle Routes', () => {
  let app: Express;
  const token = generateTestToken(mockUser.id, mockUser.role);

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/vehicles', vehicleRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/vehicles', () => {
    it('should return all vehicles', async () => {
      const vehicles = [mockVehicle, { ...mockVehicle, id: 2, vehicleNumber: 'XYZ789' }];
      (prisma.vehicle.findMany as jest.Mock).mockResolvedValue(vehicles);

      const response = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(vehicles);
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { vehicleNumber: 'asc' },
      });
    });

    it('should filter vehicles by status', async () => {
      const activeVehicles = [mockVehicle];
      (prisma.vehicle.findMany as jest.Mock).mockResolvedValue(activeVehicles);

      const response = await request(app)
        .get('/api/vehicles?status=active')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(activeVehicles);
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { vehicleNumber: 'asc' },
      });
    });

    it('should search vehicles by vehicle number or driver name', async () => {
      const searchResults = [mockVehicle];
      (prisma.vehicle.findMany as jest.Mock).mockResolvedValue(searchResults);

      const response = await request(app)
        .get('/api/vehicles?search=ABC')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(searchResults);
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { vehicleNumber: { contains: 'ABC', mode: 'insensitive' } },
            { driverName: { contains: 'ABC', mode: 'insensitive' } },
          ],
        },
        orderBy: { vehicleNumber: 'asc' },
      });
    });

    it('should handle database errors', async () => {
      (prisma.vehicle.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch vehicles');
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('should return a single vehicle by ID', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);

      const response = await request(app)
        .get('/api/vehicles/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockVehicle);
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return 404 if vehicle not found', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/vehicles/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Vehicle not found');
    });
  });

  describe('POST /api/vehicles', () => {
    beforeEach(() => {
      // Mock authorize middleware to allow admin/manager
      const authModule = require('../../middleware/auth');
      authModule.authenticate = (req: any, res: any, next: any) => {
        req.user = mockAdminUser;
        next();
      };
    });

    it('should create a new vehicle as admin', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.vehicle.create as jest.Mock).mockResolvedValue(mockVehicle);

      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          vehicleNumber: 'ABC123',
          driverName: 'John Doe',
          phoneNumber: '1234567890',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Vehicle created successfully');
      expect(response.body.vehicle).toBeDefined();
    });

    it('should fail if vehicle number already exists', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);

      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          vehicleNumber: 'ABC123',
          driverName: 'John Doe',
          phoneNumber: '1234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Vehicle with this number already exists');
    });

    it('should fail with validation errors for missing fields', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          driverName: 'John Doe',
          // Missing vehicleNumber and phoneNumber
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should deny access to viewers', async () => {
      // Override auth to use viewer role
      const authModule = require('../../middleware/auth');
      authModule.authenticate = (req: any, res: any, next: any) => {
        req.user = mockUser; // VIEWER
        next();
      };

      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          vehicleNumber: 'ABC123',
          driverName: 'John Doe',
          phoneNumber: '1234567890',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    beforeEach(() => {
      const authModule = require('../../middleware/auth');
      authModule.authenticate = (req: any, res: any, next: any) => {
        req.user = mockManagerUser;
        next();
      };
    });

    it('should update a vehicle as manager', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);
      (prisma.vehicle.update as jest.Mock).mockResolvedValue({
        ...mockVehicle,
        driverName: 'Jane Smith',
      });

      const response = await request(app)
        .put('/api/vehicles/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          driverName: 'Jane Smith',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Vehicle updated successfully');
      expect(response.body.vehicle.driverName).toBe('Jane Smith');
    });

    it('should return 404 if vehicle not found', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/vehicles/999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          driverName: 'Jane Smith',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Vehicle not found');
    });

    it('should prevent updating to duplicate vehicle number', async () => {
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);
      (prisma.vehicle.findFirst as jest.Mock).mockResolvedValue({
        ...mockVehicle,
        id: 2,
        vehicleNumber: 'XYZ789',
      });

      const response = await request(app)
        .put('/api/vehicles/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          vehicleNumber: 'XYZ789',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Vehicle with this number already exists');
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    beforeEach(() => {
      const authModule = require('../../middleware/auth');
      authModule.authenticate = (req: any, res: any, next: any) => {
        req.user = mockAdminUser;
        next();
      };
    });

    it('should delete a vehicle as admin', async () => {
      (prisma.vehicle.delete as jest.Mock).mockResolvedValue(mockVehicle);

      const response = await request(app)
        .delete('/api/vehicles/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Vehicle deleted successfully');
    });

    it('should return 404 if vehicle not found', async () => {
      (prisma.vehicle.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });

      const response = await request(app)
        .delete('/api/vehicles/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Vehicle not found');
    });

    it('should deny access to managers', async () => {
      const authModule = require('../../middleware/auth');
      authModule.authenticate = (req: any, res: any, next: any) => {
        req.user = mockManagerUser;
        next();
      };

      const response = await request(app)
        .delete('/api/vehicles/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });
});
