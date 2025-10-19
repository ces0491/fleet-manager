export interface Vehicle {
  id: string;
  vehicleNumber: string;
  driverName: string;
  phoneNumber: string;
  status: 'active' | 'inactive' | 'maintenance';
  addedDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyData {
  id: string;
  vehicleId: string | Vehicle;
  weekStartDate: string;
  weekEndDate: string;
  cashCollected: number;
  onlineEarnings: number;
  totalRevenue: number;
  dieselExpense: number;
  tollsParking: number;
  maintenanceRepairs: number;
  otherExpenses: number;
  totalDeductions: number;
  netProfit: number;
  profitMargin: number;
  totalTrips?: number;
  totalDistance?: number;
  averageRating?: number;
  notes?: string;
  submittedBy?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  weeklyRevenue: number;
  weeklyProfit: number;
  averageProfitMargin: number;
  topPerformers: Array<{
    vehicleNumber: string;
    driverName: string;
    profit: number;
  }>;
}
