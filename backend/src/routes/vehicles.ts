import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/vehicles
 * Get all vehicles
 */
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    const where: any = {};

    if (status) {
      where.status = (status as string).toUpperCase();
    }

    if (search) {
      where.OR = [
        { vehicleNumber: { contains: search as string, mode: 'insensitive' } },
        { driverName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { vehicleNumber: 'asc' }
    });

    res.json(vehicles);
  } catch (error: any) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Failed to fetch vehicles', error: error.message });
  }
});

/**
 * GET /api/vehicles/:id
 * Get vehicle by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id }
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error: any) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: 'Failed to fetch vehicle', error: error.message });
  }
});

/**
 * POST /api/vehicles
 * Create new vehicle
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
    body('driverName').trim().notEmpty().withMessage('Driver name is required'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('status').optional().isIn(['active', 'inactive', 'maintenance'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { vehicleNumber, driverName, phoneNumber, status, notes } = req.body;

      // Check if vehicle already exists
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { vehicleNumber: vehicleNumber.toUpperCase() }
      });

      if (existingVehicle) {
        return res.status(400).json({ message: 'Vehicle with this number already exists' });
      }

      const vehicle = await prisma.vehicle.create({
        data: {
          vehicleNumber: vehicleNumber.toUpperCase(),
          driverName,
          phoneNumber,
          status: status ? (status.toUpperCase() as any) : 'ACTIVE',
          notes
        }
      });

      res.status(201).json({ message: 'Vehicle created successfully', vehicle });
    } catch (error: any) {
      console.error('Create vehicle error:', error);
      res.status(500).json({ message: 'Failed to create vehicle', error: error.message });
    }
  }
);

/**
 * PUT /api/vehicles/:id
 * Update vehicle
 */
router.put(
  '/:id',
  authorize('admin', 'manager'),
  async (req, res) => {
    try {
      const { vehicleNumber, driverName, phoneNumber, status, notes } = req.body;

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: req.params.id }
      });

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      // Check if new vehicle number conflicts with existing
      if (vehicleNumber && vehicleNumber !== vehicle.vehicleNumber) {
        const existingVehicle = await prisma.vehicle.findFirst({
          where: {
            vehicleNumber: vehicleNumber.toUpperCase(),
            NOT: { id: req.params.id }
          }
        });

        if (existingVehicle) {
          return res.status(400).json({ message: 'Vehicle with this number already exists' });
        }
      }

      const updatedVehicle = await prisma.vehicle.update({
        where: { id: req.params.id },
        data: {
          ...(vehicleNumber && { vehicleNumber: vehicleNumber.toUpperCase() }),
          ...(driverName && { driverName }),
          ...(phoneNumber && { phoneNumber }),
          ...(status && { status: status.toUpperCase() }),
          ...(notes !== undefined && { notes })
        }
      });

      res.json({ message: 'Vehicle updated successfully', vehicle: updatedVehicle });
    } catch (error: any) {
      console.error('Update vehicle error:', error);
      res.status(500).json({ message: 'Failed to update vehicle', error: error.message });
    }
  }
);

/**
 * DELETE /api/vehicles/:id
 * Delete vehicle
 */
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Failed to delete vehicle', error: error.message });
  }
});

export default router;
