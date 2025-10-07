import prisma from '../config/database';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { startOfWeek, endOfWeek } from 'date-fns';

dotenv.config();

async function seed() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');

    // Clear existing data (in correct order due to relations)
    await prisma.weeklyData.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.userConsent.deleteMany({});
    await prisma.dataSubjectRequest.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Cleared existing data');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@fleetmanager.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Created admin user');

    // Create sample vehicles
    const vehicle1 = await prisma.vehicle.create({
      data: {
        vehicleNumber: 'MH01AB1234',
        driverName: 'Rajesh Kumar',
        phoneNumber: '+91 98765 43210',
        status: 'ACTIVE'
      }
    });

    const vehicle2 = await prisma.vehicle.create({
      data: {
        vehicleNumber: 'MH02CD5678',
        driverName: 'Amit Sharma',
        phoneNumber: '+91 98765 43211',
        status: 'ACTIVE'
      }
    });

    const vehicle3 = await prisma.vehicle.create({
      data: {
        vehicleNumber: 'MH03EF9012',
        driverName: 'Suresh Patel',
        phoneNumber: '+91 98765 43212',
        status: 'ACTIVE'
      }
    });

    const vehicle4 = await prisma.vehicle.create({
      data: {
        vehicleNumber: 'MH04GH3456',
        driverName: 'Vijay Singh',
        phoneNumber: '+91 98765 43213',
        status: 'ACTIVE'
      }
    });

    const vehicle5 = await prisma.vehicle.create({
      data: {
        vehicleNumber: 'MH05IJ7890',
        driverName: 'Anil Yadav',
        phoneNumber: '+91 98765 43214',
        status: 'MAINTENANCE'
      }
    });

    console.log('Created 5 vehicles');

    // Create sample weekly data
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    // Helper function to calculate weekly data fields
    const calculateFields = (cash: number, online: number, diesel: number, tolls: number, maintenance: number, other: number) => {
      const totalRevenue = cash + online;
      const totalDeductions = diesel + tolls + maintenance + other;
      const netProfit = totalRevenue - totalDeductions;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      return { totalRevenue, totalDeductions, netProfit, profitMargin };
    };

    const data1 = calculateFields(15000, 25000, 8000, 1500, 2000, 1000);
    await prisma.weeklyData.create({
      data: {
        vehicleId: vehicle1.id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        cashCollected: 15000,
        onlineEarnings: 25000,
        totalRevenue: data1.totalRevenue,
        dieselExpense: 8000,
        tollsParking: 1500,
        maintenanceRepairs: 2000,
        otherExpenses: 1000,
        totalDeductions: data1.totalDeductions,
        netProfit: data1.netProfit,
        profitMargin: data1.profitMargin,
        totalTrips: 120,
        totalDistance: 850,
        averageRating: 4.7
      }
    });

    const data2 = calculateFields(12000, 22000, 7500, 1200, 1500, 800);
    await prisma.weeklyData.create({
      data: {
        vehicleId: vehicle2.id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        cashCollected: 12000,
        onlineEarnings: 22000,
        totalRevenue: data2.totalRevenue,
        dieselExpense: 7500,
        tollsParking: 1200,
        maintenanceRepairs: 1500,
        otherExpenses: 800,
        totalDeductions: data2.totalDeductions,
        netProfit: data2.netProfit,
        profitMargin: data2.profitMargin,
        totalTrips: 110,
        totalDistance: 780,
        averageRating: 4.5
      }
    });

    const data3 = calculateFields(18000, 28000, 9000, 1800, 2500, 1200);
    await prisma.weeklyData.create({
      data: {
        vehicleId: vehicle3.id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        cashCollected: 18000,
        onlineEarnings: 28000,
        totalRevenue: data3.totalRevenue,
        dieselExpense: 9000,
        tollsParking: 1800,
        maintenanceRepairs: 2500,
        otherExpenses: 1200,
        totalDeductions: data3.totalDeductions,
        netProfit: data3.netProfit,
        profitMargin: data3.profitMargin,
        totalTrips: 140,
        totalDistance: 920,
        averageRating: 4.8
      }
    });

    const data4 = calculateFields(14000, 24000, 7800, 1400, 1800, 1000);
    await prisma.weeklyData.create({
      data: {
        vehicleId: vehicle4.id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        cashCollected: 14000,
        onlineEarnings: 24000,
        totalRevenue: data4.totalRevenue,
        dieselExpense: 7800,
        tollsParking: 1400,
        maintenanceRepairs: 1800,
        otherExpenses: 1000,
        totalDeductions: data4.totalDeductions,
        netProfit: data4.netProfit,
        profitMargin: data4.profitMargin,
        totalTrips: 115,
        totalDistance: 800,
        averageRating: 4.6
      }
    });

    console.log('Created 4 weekly data entries');

    console.log('\n✅ Seed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@fleetmanager.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDatabase connection closed');
  }
}

seed();
