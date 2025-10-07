import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

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

    const where: any = {};

    if (vehicleId) {
      where.vehicleId = vehicleId as string;
    }

    if (weekStart) {
      where.weekStartDate = { gte: new Date(weekStart as string) };
    }

    if (weekEnd) {
      where.weekEndDate = { lte: new Date(weekEnd as string) };
    }

    const data = await prisma.weeklyData.findMany({
      where,
      include: {
        vehicle: true
      },
      orderBy: { weekStartDate: 'desc' }
    });

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
    const data = await prisma.weeklyData.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true }
    });

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
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId }
      });

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      // Calculate fields (previously done by Mongoose pre-save hook)
      const totalRevenue = cashCollected + onlineEarnings;
      const totalDeductions = dieselExpense + tollsParking + maintenanceRepairs + otherExpenses;
      const netProfit = totalRevenue - totalDeductions;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Check if data already exists for this week
      const existingData = await prisma.weeklyData.findFirst({
        where: {
          vehicleId,
          weekStartDate: new Date(weekStartDate)
        }
      });

      if (existingData) {
        // Update existing data
        const updatedData = await prisma.weeklyData.update({
          where: { id: existingData.id },
          data: {
            weekEndDate: new Date(weekEndDate),
            cashCollected,
            onlineEarnings,
            totalRevenue,
            dieselExpense,
            tollsParking,
            maintenanceRepairs,
            otherExpenses,
            totalDeductions,
            netProfit,
            profitMargin,
            ...(totalTrips !== undefined && { totalTrips }),
            ...(totalDistance !== undefined && { totalDistance }),
            ...(averageRating !== undefined && { averageRating }),
            ...(notes !== undefined && { notes }),
            submittedBy: req.user?.id,
            submittedAt: new Date()
          }
        });

        return res.json({ message: 'Weekly data updated successfully', data: updatedData });
      }

      // Create new data
      const weeklyData = await prisma.weeklyData.create({
        data: {
          vehicleId,
          weekStartDate: new Date(weekStartDate),
          weekEndDate: new Date(weekEndDate),
          cashCollected,
          onlineEarnings,
          totalRevenue,
          dieselExpense,
          tollsParking,
          maintenanceRepairs,
          otherExpenses,
          totalDeductions,
          netProfit,
          profitMargin,
          totalTrips,
          totalDistance,
          averageRating,
          notes,
          submittedBy: req.user?.id,
          submittedAt: new Date()
        }
      });

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
    await prisma.weeklyData.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Weekly data deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Weekly data not found' });
    }
    console.error('Delete weekly data error:', error);
    res.status(500).json({ message: 'Failed to delete weekly data', error: error.message });
  }
});

export default router;
