import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import WeeklyData from '../models/WeeklyData';
import Vehicle from '../models/Vehicle';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/weekly-data
 * Get weekly data with filters
 */
router.get('/', async (req, res) => {
  try {
    const { vehicleId, weekStart, weekEnd } = req.query;

    const query: any = {};
    if (vehicleId) {
      query.vehicleId = vehicleId;
    }
    if (weekStart) {
      query.weekStartDate = { $gte: new Date(weekStart as string) };
    }
    if (weekEnd) {
      query.weekEndDate = { $lte: new Date(weekEnd as string) };
    }

    const data = await WeeklyData.find(query)
      .populate('vehicleId')
      .sort({ weekStartDate: -1 });

    res.json(data);
  } catch (error: any) {
    console.error('Get weekly data error:', error);
    res.status(500).json({ message: 'Failed to fetch weekly data', error: error.message });
  }
});

/**
 * GET /api/weekly-data/:id
 * Get weekly data by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const data = await WeeklyData.findById(req.params.id).populate('vehicleId');
    if (!data) {
      return res.status(404).json({ message: 'Weekly data not found' });
    }
    res.json(data);
  } catch (error: any) {
    console.error('Get weekly data error:', error);
    res.status(500).json({ message: 'Failed to fetch weekly data', error: error.message });
  }
});

/**
 * POST /api/weekly-data
 * Create or update weekly data
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('weekStartDate').isISO8601().withMessage('Valid week start date is required'),
    body('weekEndDate').isISO8601().withMessage('Valid week end date is required'),
    body('cashCollected').isNumeric().withMessage('Cash collected must be a number'),
    body('onlineEarnings').isNumeric().withMessage('Online earnings must be a number'),
    body('dieselExpense').isNumeric().withMessage('Diesel expense must be a number'),
    body('tollsParking').isNumeric().withMessage('Tolls/parking must be a number'),
    body('maintenanceRepairs').isNumeric().withMessage('Maintenance must be a number'),
    body('otherExpenses').isNumeric().withMessage('Other expenses must be a number')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        vehicleId,
        weekStartDate,
        weekEndDate,
        cashCollected,
        onlineEarnings,
        dieselExpense,
        tollsParking,
        maintenanceRepairs,
        otherExpenses,
        totalTrips,
        totalDistance,
        averageRating,
        notes
      } = req.body;

      // Verify vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      // Check if data already exists for this week
      const existingData = await WeeklyData.findOne({
        vehicleId,
        weekStartDate: new Date(weekStartDate)
      });

      if (existingData) {
        // Update existing data
        existingData.weekEndDate = new Date(weekEndDate);
        existingData.cashCollected = cashCollected;
        existingData.onlineEarnings = onlineEarnings;
        existingData.dieselExpense = dieselExpense;
        existingData.tollsParking = tollsParking;
        existingData.maintenanceRepairs = maintenanceRepairs;
        existingData.otherExpenses = otherExpenses;
        if (totalTrips !== undefined) existingData.totalTrips = totalTrips;
        if (totalDistance !== undefined) existingData.totalDistance = totalDistance;
        if (averageRating !== undefined) existingData.averageRating = averageRating;
        if (notes !== undefined) existingData.notes = notes;
        existingData.submittedBy = req.user?._id as mongoose.Types.ObjectId | undefined;
        existingData.submittedAt = new Date();

        await existingData.save();
        return res.json({ message: 'Weekly data updated successfully', data: existingData });
      }

      // Create new data
      const weeklyData = new WeeklyData({
        vehicleId,
        weekStartDate: new Date(weekStartDate),
        weekEndDate: new Date(weekEndDate),
        cashCollected,
        onlineEarnings,
        dieselExpense,
        tollsParking,
        maintenanceRepairs,
        otherExpenses,
        totalTrips,
        totalDistance,
        averageRating,
        notes,
        submittedBy: req.user?._id,
        submittedAt: new Date()
      });

      await weeklyData.save();
      res.status(201).json({ message: 'Weekly data created successfully', data: weeklyData });
    } catch (error: any) {
      console.error('Create weekly data error:', error);
      res.status(500).json({ message: 'Failed to save weekly data', error: error.message });
    }
  }
);

/**
 * DELETE /api/weekly-data/:id
 * Delete weekly data
 */
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const data = await WeeklyData.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Weekly data not found' });
    }
    res.json({ message: 'Weekly data deleted successfully' });
  } catch (error: any) {
    console.error('Delete weekly data error:', error);
    res.status(500).json({ message: 'Failed to delete weekly data', error: error.message });
  }
});

export default router;
