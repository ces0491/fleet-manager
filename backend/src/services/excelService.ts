import ExcelJS from 'exceljs';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import prisma from '../config/database';

interface ExportOptions {
  weekStartDate: Date;
  weekEndDate?: Date;
}

export class ExcelService {
  /**
   * Generate comprehensive weekly report for all vehicles
   */
  async generateWeeklyReport(options: ExportOptions): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weekly Fleet Report', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    // Set up the workbook properties
    workbook.creator = 'Fleet Manager by Sheet Solved';
    workbook.created = new Date();
    workbook.modified = new Date();

    const weekStart = startOfWeek(options.weekStartDate, { weekStartsOn: 1 });
    const weekEnd = options.weekEndDate || endOfWeek(weekStart, { weekStartsOn: 1 });

    // Title and Header
    worksheet.mergeCells('A1:N1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Weekly Fleet Report - ${format(weekStart, 'MMM dd')} to ${format(weekEnd, 'MMM dd, yyyy')}`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C3E50' }
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 30;

    // Column headers
    const headers = [
      'Vehicle #',
      'Driver Name',
      'Phone',
      'Cash Collected',
      'Online Earnings',
      'Total Revenue',
      'Diesel',
      'Tolls/Parking',
      'Maintenance',
      'Other Expenses',
      'Total Deductions',
      'Net Profit',
      'Profit %',
      'Notes'
    ];

    const headerRow = worksheet.getRow(3);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF34495E' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    headerRow.height = 40;

    // Set column widths
    worksheet.columns = [
      { width: 12 },  // Vehicle #
      { width: 20 },  // Driver Name
      { width: 15 },  // Phone
      { width: 14 },  // Cash Collected
      { width: 14 },  // Online Earnings
      { width: 14 },  // Total Revenue
      { width: 12 },  // Diesel
      { width: 14 },  // Tolls/Parking
      { width: 14 },  // Maintenance
      { width: 14 },  // Other Expenses
      { width: 14 },  // Total Deductions
      { width: 14 },  // Net Profit
      { width: 10 },  // Profit %
      { width: 25 }   // Notes
    ];

    // Fetch data
    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { vehicleNumber: 'asc' }
    });

    const weeklyDataList = await prisma.weeklyData.findMany({
      where: {
        weekStartDate: { gte: weekStart },
        weekEndDate: { lte: weekEnd }
      },
      include: {
        vehicle: true
      }
    });

    // Create a map for quick lookup
    const dataMap = new Map();
    weeklyDataList.forEach(data => {
      dataMap.set(data.vehicleId, data);
    });

    let currentRow = 4;
    let totalCash = 0;
    let totalOnline = 0;
    let totalRevenue = 0;
    let totalDiesel = 0;
    let totalTolls = 0;
    let totalMaintenance = 0;
    let totalOtherExpenses = 0;
    let totalDeductions = 0;
    let totalNetProfit = 0;

    // Add vehicle data
    vehicles.forEach((vehicle, index) => {
      const data = dataMap.get(vehicle.id);
      const row = worksheet.getRow(currentRow);

      // Apply alternating row colors
      const bgColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA';

      const cellValues = [
        vehicle.vehicleNumber,
        vehicle.driverName,
        vehicle.phoneNumber,
        data?.cashCollected || 0,
        data?.onlineEarnings || 0,
        data?.totalRevenue || 0,
        data?.dieselExpense || 0,
        data?.tollsParking || 0,
        data?.maintenanceRepairs || 0,
        data?.otherExpenses || 0,
        data?.totalDeductions || 0,
        data?.netProfit || 0,
        data?.profitMargin || 0,
        data?.notes || ''
      ];

      cellValues.forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };

        // Number formatting
        if (colIndex >= 3 && colIndex <= 11) {
          cell.numFmt = '"R"#,##0.00';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else if (colIndex === 12) {
          cell.numFmt = '0.00"%"';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          // Color code profit margin
          if (typeof value === 'number') {
            cell.font = { color: { argb: value >= 0 ? 'FF27AE60' : 'FFE74C3C' } };
          }
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });

      // Update totals
      if (data) {
        totalCash += data.cashCollected;
        totalOnline += data.onlineEarnings;
        totalRevenue += data.totalRevenue;
        totalDiesel += data.dieselExpense;
        totalTolls += data.tollsParking;
        totalMaintenance += data.maintenanceRepairs;
        totalOtherExpenses += data.otherExpenses;
        totalDeductions += data.totalDeductions;
        totalNetProfit += data.netProfit;
      }

      currentRow++;
    });

    // Add totals row
    const totalsRow = worksheet.getRow(currentRow + 1);
    const overallProfitMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

    const totalsValues = [
      'TOTAL',
      '',
      '',
      totalCash,
      totalOnline,
      totalRevenue,
      totalDiesel,
      totalTolls,
      totalMaintenance,
      totalOtherExpenses,
      totalDeductions,
      totalNetProfit,
      overallProfitMargin,
      ''
    ];

    totalsValues.forEach((value, colIndex) => {
      const cell = totalsRow.getCell(colIndex + 1);
      cell.value = value;
      cell.font = { bold: true, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF39C12' }
      };
      cell.border = {
        top: { style: 'double' },
        left: { style: 'thin' },
        bottom: { style: 'double' },
        right: { style: 'thin' }
      };

      if (colIndex >= 3 && colIndex <= 11) {
        cell.numFmt = '"R"#,##0.00';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else if (colIndex === 12) {
        cell.numFmt = '0.00"%"';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    });
    totalsRow.height = 25;

    // Add summary section
    currentRow += 3;
    this.addSummarySection(worksheet, currentRow, {
      totalVehicles: vehicles.length,
      totalRevenue,
      totalDeductions,
      totalNetProfit,
      averageProfitMargin: overallProfitMargin
    });

    // Freeze panes
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 3 }
    ];

    return await workbook.xlsx.writeBuffer() as ExcelJS.Buffer;
  }

  /**
   * Generate individual vehicle report
   */
  async generateVehicleReport(vehicleId: string, startDate: Date, endDate: Date): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehicle Report');

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const weeklyData = await prisma.weeklyData.findMany({
      where: {
        vehicleId,
        weekStartDate: { gte: startDate },
        weekEndDate: { lte: endDate }
      },
      orderBy: { weekStartDate: 'asc' }
    });

    // Title
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Vehicle Report - ${vehicle.vehicleNumber}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Vehicle info
    worksheet.getCell('A3').value = 'Driver:';
    worksheet.getCell('B3').value = vehicle.driverName;
    worksheet.getCell('A4').value = 'Phone:';
    worksheet.getCell('B4').value = vehicle.phoneNumber;
    worksheet.getCell('A5').value = 'Period:';
    worksheet.getCell('B5').value = `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;

    // Data table
    const headers = ['Week Start', 'Total Revenue', 'Total Deductions', 'Net Profit', 'Profit %', 'Notes'];
    const headerRow = worksheet.getRow(7);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
    });

    let currentRow = 8;
    weeklyData.forEach(data => {
      const row = worksheet.getRow(currentRow);
      row.values = [
        format(data.weekStartDate, 'MMM dd, yyyy'),
        data.totalRevenue,
        data.totalDeductions,
        data.netProfit,
        data.profitMargin,
        data.notes || ''
      ];
      currentRow++;
    });

    return await workbook.xlsx.writeBuffer() as ExcelJS.Buffer;
  }

  /**
   * Add summary section to worksheet
   */
  private addSummarySection(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    summary: {
      totalVehicles: number;
      totalRevenue: number;
      totalDeductions: number;
      totalNetProfit: number;
      averageProfitMargin: number;
    }
  ): void {
    const summaryTitle = worksheet.getCell(`A${startRow}`);
    summaryTitle.value = 'SUMMARY';
    summaryTitle.font = { bold: true, size: 14 };

    const metrics = [
      { label: 'Total Active Vehicles:', value: summary.totalVehicles },
      { label: 'Total Revenue:', value: summary.totalRevenue, format: '"R"#,##0.00' },
      { label: 'Total Deductions:', value: summary.totalDeductions, format: '"R"#,##0.00' },
      { label: 'Total Net Profit:', value: summary.totalNetProfit, format: '"R"#,##0.00' },
      { label: 'Average Profit Margin:', value: summary.averageProfitMargin, format: '0.00"%"' }
    ];

    metrics.forEach((metric, index) => {
      const row = startRow + index + 1;
      worksheet.getCell(`A${row}`).value = metric.label;
      worksheet.getCell(`A${row}`).font = { bold: true };
      const valueCell = worksheet.getCell(`B${row}`);
      valueCell.value = metric.value;
      if (metric.format) {
        valueCell.numFmt = metric.format;
      }
    });
  }
}

export default new ExcelService();
