import express from 'express';
import { startOfWeek, endOfWeek } from 'date-fns';
import prisma from '../config/database';
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
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'ACTIVE' } })
    ]);

    // Get weekly data
    const weeklyData = await prisma.weeklyData.findMany({
      where: {
        weekStartDate: { gte: startDate },
        weekEndDate: { lte: endDate }
      },
      include: {
        vehicle: true
      }
    });

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
      .map(data => ({
        vehicleNumber: data.vehicle.vehicleNumber,
        driverName: data.vehicle.driverName,
        profit: data.netProfit
      }));

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

    const where: any = {};
    if (vehicleId) {
      where.vehicleId = vehicleId as string;
    }

    const data = await prisma.weeklyData.findMany({
      where,
      include: {
        vehicle: true
      },
      orderBy: { weekStartDate: 'desc' },
      take: Number(weeks)
    });

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
