import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const testQueryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock user data for testing
export const mockAuthUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'viewer',
  isActive: true,
  lastLogin: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
};

export const mockVehicle = {
  id: '1',
  vehicleNumber: 'ABC123',
  driverName: 'John Doe',
  phoneNumber: '1234567890',
  status: 'ACTIVE',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockWeeklyData = {
  id: '1',
  vehicleId: '1',
  weekStartDate: new Date('2024-01-01'),
  weekEndDate: new Date('2024-01-07'),
  cashCollected: 5000,
  onlineEarnings: 3000,
  totalRevenue: 8000,
  dieselExpense: 2000,
  tollsParking: 500,
  maintenanceRepairs: 300,
  otherExpenses: 200,
  totalDeductions: 3000,
  netProfit: 5000,
  profitMargin: 62.5,
  totalTrips: 50,
  totalDistance: 1000,
  averageRating: 4.5,
  submittedById: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Helper to mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};

// Helper to set auth token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Helper to clear auth token from localStorage
export const clearAuthToken = () => {
  localStorage.removeItem('token');
};
