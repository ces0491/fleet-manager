# Fleet Manager - Setup Guide

## Overview

A comprehensive fleet management system for Uber drivers with features for tracking weekly performance, revenue, expenses, and generating detailed Excel reports.

## Features Implemented

### Backend (Node.js + Express + MongoDB)

- ✅ **MongoDB Schemas**
  - User schema with authentication
  - Vehicle schema with driver information
  - WeeklyData schema with automatic calculations

- ✅ **Authentication System**
  - JWT-based authentication
  - Role-based access control (admin, manager, viewer)
  - Password hashing with bcrypt
  - Protected routes with middleware

- ✅ **Excel Export Service**
  - Comprehensive weekly fleet reports
  - Individual vehicle reports
  - Professional formatting with colors and styling
  - Indian currency formatting (₹)
  - Summary sections and top performers

- ✅ **REST API Endpoints**
  - `/api/auth` - Authentication (login, register, profile)
  - `/api/vehicles` - Vehicle management (CRUD operations)
  - `/api/weekly-data` - Weekly performance data
  - `/api/dashboard` - Dashboard statistics and trends
  - `/api/reports` - Excel report generation

### Frontend (React + TypeScript + Tailwind CSS)

- ✅ **Authentication**
  - Login page with form validation
  - Protected routes
  - Persistent authentication with Zustand

- ✅ **Dashboard Components**
  - Statistics cards (vehicles, revenue, profit, margin)
  - Fleet table with sorting and filtering
  - Top performers section
  - Weekly data visualization

- ✅ **State Management**
  - Zustand for auth state
  - React Query for API data
  - Persistent storage

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

**Backend (.env)**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/uber-fleet
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

```bash
# Start MongoDB service
mongod
```

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This will create:

- Admin user (email: admin@uberfleet.com, password: admin123)
- 5 sample vehicles
- Weekly data for current week

### 5. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Server runs on http://localhost:5000

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend runs on http://localhost:5173

## Usage

### Login

1. Open http://localhost:5173
2. Login with:
   - Email: `admin@uberfleet.com`
   - Password: `admin123`

### Dashboard Features

- View fleet statistics
- Track weekly revenue and profit
- Sort and filter vehicles
- See top performers
- Export Excel reports

### API Testing

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uberfleet.com","password":"admin123"}'
```

**Get Vehicles (with auth):**

```bash
curl http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Export Excel Report:**

```bash
curl "http://localhost:5000/api/reports/weekly-excel?weekStart=2025-10-06" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output report.xlsx
```

## Project Structure

```
uber-fleet-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.ts              # User model
│   │   │   ├── Vehicle.ts           # Vehicle model
│   │   │   └── WeeklyData.ts        # Weekly data model
│   │   ├── middleware/
│   │   │   └── auth.ts              # Auth middleware
│   │   ├── routes/
│   │   │   ├── auth.ts              # Auth routes
│   │   │   ├── vehicles.ts          # Vehicle routes
│   │   │   ├── weeklyData.ts        # Weekly data routes
│   │   │   ├── dashboard.ts         # Dashboard routes
│   │   │   └── reports.ts           # Report routes
│   │   ├── services/
│   │   │   └── excelService.ts      # Excel generation
│   │   ├── utils/
│   │   │   └── seed.ts              # Database seeding
│   │   └── server.ts                # Main server file
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   └── Login.tsx        # Login component
│   │   │   └── Dashboard/
│   │   │       ├── Dashboard.tsx     # Main dashboard
│   │   │       ├── DashboardStats.tsx # Stats cards
│   │   │       └── FleetTable.tsx    # Fleet table
│   │   ├── store/
│   │   │   └── authStore.ts         # Auth state management
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript types
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## API Documentation

### Authentication Endpoints

**POST /api/auth/register**

- Register new user
- Body: `{ username, email, password, role? }`

**POST /api/auth/login**

- Login user
- Body: `{ email, password }`
- Returns: `{ token, user }`

**GET /api/auth/me**

- Get current user profile
- Requires: JWT token

### Vehicle Endpoints

**GET /api/vehicles**

- Get all vehicles
- Query: `?status=active&search=MH01`

**POST /api/vehicles**

- Create new vehicle (admin/manager only)
- Body: `{ vehicleNumber, driverName, phoneNumber, status?, notes? }`

**PUT /api/vehicles/:id**

- Update vehicle (admin/manager only)

**DELETE /api/vehicles/:id**

- Delete vehicle (admin only)

### Weekly Data Endpoints

**GET /api/weekly-data**

- Get weekly data
- Query: `?vehicleId=...&weekStart=...&weekEnd=...`

**POST /api/weekly-data**

- Submit weekly data (admin/manager only)
- Body: `{ vehicleId, weekStartDate, weekEndDate, cashCollected, onlineEarnings, ... }`

### Dashboard Endpoints

**GET /api/dashboard/stats**

- Get dashboard statistics
- Query: `?weekStart=2025-10-06`

**GET /api/dashboard/trends**

- Get trend data
- Query: `?vehicleId=...&weeks=4`

### Report Endpoints

**GET /api/reports/weekly-excel**

- Generate weekly Excel report
- Query: `?weekStart=...&weekEnd=...`
- Returns: Excel file download

**GET /api/reports/vehicle-excel/:vehicleId**

- Generate vehicle-specific report
- Query: `?startDate=...&endDate=...`

## Database Models

### User

- username, email, password
- role: admin | manager | viewer
- isActive, lastLogin

### Vehicle

- vehicleNumber (unique)
- driverName, phoneNumber
- status: active | inactive | maintenance
- notes, addedDate

### WeeklyData

- vehicleId (ref to Vehicle)
- weekStartDate, weekEndDate
- Revenue: cashCollected, onlineEarnings
- Expenses: diesel, tolls, maintenance, other
- Calculated: totalRevenue, totalDeductions, netProfit, profitMargin
- Metrics: totalTrips, totalDistance, averageRating

## Excel Report Features

### Weekly Fleet Report

- Professional formatting with colors
- Header with date range
- Columns: Vehicle #, Driver, Contact, Revenue breakdown, Expenses, Profit
- Totals row with aggregate calculations
- Summary section with key metrics
- Top performers list

### Formatting

- ₹ Indian currency format
- Percentage format for margins
- Color-coded profit margins (green/red)
- Alternating row colors
- Frozen header rows
- Auto-sized columns

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with express-validator

## Development

### Build for Production

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

### TypeScript Compilation
Both projects use TypeScript with strict mode enabled.

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify port 27017 is not in use

### CORS Errors

- Check `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL matches

### Authentication Issues

- Clear browser localStorage
- Re-login with correct credentials
- Check JWT_SECRET is set

### Port Conflicts

- Backend: Change `PORT` in backend `.env`
- Frontend: Use `--port` flag: `vite --port 3000`

## Next Steps

1. **Add More Features:**
   - Vehicle maintenance tracking
   - Driver performance analytics
   - Push notifications
   - Mobile app

2. **Enhance Reports:**
   - PDF export
   - Custom date ranges
   - Comparison reports
   - Email delivery

3. **Improve UI:**
   - Charts and graphs
   - Dark mode
   - Mobile responsiveness
   - Print layouts

4. **Deploy:**
   - Set up production database
   - Configure environment variables
   - Deploy to cloud (Render, Heroku, AWS)
   - Set up CI/CD

## Support

For issues or questions, please check:

1. This documentation
2. Console logs in browser/terminal
3. API error messages
4. MongoDB logs
