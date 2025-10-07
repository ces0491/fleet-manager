import express from 'express';
import { startOfWeek, endOfWeek } from 'date-fns';
import excelService from '../services/excelService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/reports/weekly-excel
 * Generate and download weekly Excel report
 */
router.get('/weekly-excel', async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.query;

    const startDate = weekStart
      ? new Date(weekStart as string)
      : startOfWeek(new Date(), { weekStartsOn: 1 });
    const endDate = weekEnd
      ? new Date(weekEnd as string)
      : endOfWeek(startDate, { weekStartsOn: 1 });

    const buffer = await excelService.generateWeeklyReport({
      weekStartDate: startDate,
      weekEndDate: endDate
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=fleet-report-${startDate.toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Generate weekly report error:', error);
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
});

/**
 * GET /api/reports/vehicle-excel/:vehicleId
 * Generate and download vehicle-specific report
 */
router.get('/vehicle-excel/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const buffer = await excelService.generateVehicleReport(
      vehicleId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=vehicle-report-${vehicleId}.xlsx`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Generate vehicle report error:', error);
    res.status(500).json({ message: 'Failed to generate vehicle report', error: error.message });
  }
});

export default router;
