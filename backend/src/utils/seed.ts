import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import WeeklyData from '../models/WeeklyData';
import { startOfWeek, endOfWeek } from 'date-fns';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet-manager';

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await WeeklyData.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@fleetmanager.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created admin user');

    // Create sample vehicles
    const vehicles = await Vehicle.create([
      {
        vehicleNumber: 'MH01AB1234',
        driverName: 'Rajesh Kumar',
        phoneNumber: '+91 98765 43210',
        status: 'active'
      },
      {
        vehicleNumber: 'MH02CD5678',
        driverName: 'Amit Sharma',
        phoneNumber: '+91 98765 43211',
        status: 'active'
      },
      {
        vehicleNumber: 'MH03EF9012',
        driverName: 'Suresh Patel',
        phoneNumber: '+91 98765 43212',
        status: 'active'
      },
      {
        vehicleNumber: 'MH04GH3456',
        driverName: 'Vijay Singh',
        phoneNumber: '+91 98765 43213',
        status: 'active'
      },
      {
        vehicleNumber: 'MH05IJ7890',
        driverName: 'Anil Yadav',
        phoneNumber: '+91 98765 43214',
        status: 'maintenance'
      }
    ]);
    console.log(`Created ${vehicles.length} vehicles`);

    // Create sample weekly data
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    const weeklyDataSamples = [
      {
        vehicleId: vehicles[0]._id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        cashCollected: 15000,
        onlineEarnings: 25000,
        dieselExpense: 8000,
        tollsParking: 1500,
        maintenanceRepairs: 2000,
        otherExpenses: 1000,
        totalTrips: 120,
        totalDistance: 850,
        averageRating: 4.7
      },
      {
        vehicleId: vehicles[1]._id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        cashCollected: 12000,
        onlineEarnings: 22000,
        dieselExpense: 7500,
        tollsParking: 1200,
        maintenanceRepairs: 1500,
        otherExpenses: 800,
        totalTrips: 110,
        totalDistance: 780,
        averageRating: 4.5
      },
      {
        vehicleId: vehicles[2]._id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        cashCollected: 18000,
        onlineEarnings: 28000,
        dieselExpense: 9000,
        tollsParking: 1800,
        maintenanceRepairs: 2500,
        otherExpenses: 1200,
        totalTrips: 140,
        totalDistance: 920,
        averageRating: 4.8
      },
      {
        vehicleId: vehicles[3]._id,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        cashCollected: 14000,
        onlineEarnings: 24000,
        dieselExpense: 7800,
        tollsParking: 1400,
        maintenanceRepairs: 1800,
        otherExpenses: 1000,
        totalTrips: 115,
        totalDistance: 800,
        averageRating: 4.6
      }
    ];

    await WeeklyData.create(weeklyDataSamples);
    console.log(`Created ${weeklyDataSamples.length} weekly data entries`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@fleetmanager.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seed();
