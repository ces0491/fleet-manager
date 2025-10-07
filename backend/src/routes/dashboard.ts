import express from 'express';
import { startOfWeek, endOfWeek } from 'date-fns';
import Vehicle from '../models/Vehicle';
import WeeklyData from '../models/WeeklyData';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { weekStart } = req.query;
    const startDate = weekStart ? new Date(weekStart as string) : startOfWeek(new Date(), { weekStartsOn: 1 });
    const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

    // Get vehicle counts
    const [totalVehicles, activeVehicles] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'active' })
    ]);

    // Get weekly data
    const weeklyData = await WeeklyData.find({
      weekStartDate: { $gte: startDate },
      weekEndDate: { $lte: endDate }
    }).populate('vehicleId');

    // Calculate totals
    let weeklyRevenue = 0;
    let weeklyProfit = 0;
    let totalDeductions = 0;

    weeklyData.forEach(data => {
      weeklyRevenue += data.totalRevenue;
      weeklyProfit += data.netProfit;
      totalDeductions += data.totalDeductions;
    });

    const averageProfitMargin = weeklyRevenue > 0 ? (weeklyProfit / weeklyRevenue) * 100 : 0;

    // Get top performers
    const topPerformers = weeklyData
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, 5)
      .map(data => {
        const vehicle = data.vehicleId as any;
        return {
          vehicleNumber: vehicle.vehicleNumber,
          driverName: vehicle.driverName,
          profit: data.netProfit
        };
      });

    res.json({
      totalVehicles,
      activeVehicles,
      weeklyRevenue,
      weeklyProfit,
      averageProfitMargin,
      topPerformers
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

/**
 * GET /api/dashboard/trends
 * Get trend data for charts
 */
router.get('/trends', async (req, res) => {
  try {
    const { vehicleId, weeks = 4 } = req.query;

    const query: any = {};
    if (vehicleId) {
      query.vehicleId = vehicleId;
    }

    const data = await WeeklyData.find(query)
      .populate('vehicleId')
      .sort({ weekStartDate: -1 })
      .limit(Number(weeks));

    const trends = data.reverse().map(item => ({
      week: item.weekStartDate,
      revenue: item.totalRevenue,
      profit: item.netProfit,
      deductions: item.totalDeductions,
      profitMargin: item.profitMargin
    }));

    res.json(trends);
  } catch (error: any) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Failed to fetch trends', error: error.message });
  }
});

export default router;
