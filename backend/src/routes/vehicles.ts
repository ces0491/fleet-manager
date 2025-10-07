import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Vehicle from '../models/Vehicle';
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

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } }
      ];
    }

    const vehicles = await Vehicle.find(query).sort({ vehicleNumber: 1 });
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
    const vehicle = await Vehicle.findById(req.params.id);
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
      const existingVehicle = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
      if (existingVehicle) {
        return res.status(400).json({ message: 'Vehicle with this number already exists' });
      }

      const vehicle = new Vehicle({
        vehicleNumber: vehicleNumber.toUpperCase(),
        driverName,
        phoneNumber,
        status: status || 'active',
        notes
      });

      await vehicle.save();
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

      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      // Check if new vehicle number conflicts with existing
      if (vehicleNumber && vehicleNumber !== vehicle.vehicleNumber) {
        const existingVehicle = await Vehicle.findOne({
          vehicleNumber: vehicleNumber.toUpperCase(),
          _id: { $ne: req.params.id }
        });
        if (existingVehicle) {
          return res.status(400).json({ message: 'Vehicle with this number already exists' });
        }
        vehicle.vehicleNumber = vehicleNumber.toUpperCase();
      }

      if (driverName) vehicle.driverName = driverName;
      if (phoneNumber) vehicle.phoneNumber = phoneNumber;
      if (status) vehicle.status = status;
      if (notes !== undefined) vehicle.notes = notes;

      await vehicle.save();
      res.json({ message: 'Vehicle updated successfully', vehicle });
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
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Failed to delete vehicle', error: error.message });
  }
});

export default router;
