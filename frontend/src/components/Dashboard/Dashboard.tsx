import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Plus, Calendar, Settings, LogOut, User } from 'lucide-react';
import fleetManagerLogo from '../../assets/fleet-manager-logo.png';
import axios from 'axios';
import { startOfWeek, endOfWeek } from 'date-fns';
import DashboardStats from './DashboardStats';
import FleetTable from './FleetTable';
import AddVehicleModal from './AddVehicleModal';
import { Vehicle, WeeklyData, DashboardStats as DashboardStatsType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

// Use relative path in production, absolute in development
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api');

export default function Dashboard() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStatsType>({
    queryKey: ['dashboard-stats', weekStart.toISOString()],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        params: { weekStart: weekStart.toISOString() }
      });
      return response.data;
    }
  });

  // Fetch vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/vehicles`);
      return response.data;
    }
  });

  // Fetch weekly data
  const { data: weeklyData = [], isLoading: weeklyDataLoading } = useQuery<WeeklyData[]>({
    queryKey: ['weekly-data', weekStart.toISOString()],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/weekly-data`, {
        params: {
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString()
        }
      });
      return response.data;
    }
  });

  const handleExportExcel = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/weekly-excel`, {
        params: {
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString()
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fleet-report-${weekStart.toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <img
                src={fleetManagerLogo}
                alt="Fleet Manager"
                className="h-10 w-auto mr-3"
              />
              <h1 className="text-xl font-bold text-gray-900">Fleet Manager</h1>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Account Settings
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Fleet Dashboard</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your fleet operations and track performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-white rounded-lg shadow px-4 py-2" title="Select week to view data">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="week"
                  value={weekStart.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedWeek(new Date(e.target.value))}
                  className="border-none focus:ring-0 text-sm"
                  title="Choose a week to view performance data"
                />
              </div>
              <button
                onClick={handleExportExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow"
                title="Download weekly report as Excel spreadsheet"
              >
                <Download className="h-5 w-5 mr-2" />
                Export Excel
              </button>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
                title="Add a new vehicle to your fleet"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Vehicle
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && <DashboardStats stats={stats} isLoading={statsLoading} />}

        {/* Fleet Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Fleet Overview</h2>
            <div className="text-sm text-gray-500">
              {vehicles.length} total vehicles • {vehicles.filter(v => v.status === 'active').length} active
            </div>
          </div>
          <FleetTable
            vehicles={vehicles}
            weeklyData={weeklyData}
            onEdit={(vehicle) => console.log('Edit:', vehicle)}
            onDelete={(id) => console.log('Delete:', id)}
            onView={(vehicle) => console.log('View:', vehicle)}
          />
        </div>

        {/* Top Performers */}
        {stats && stats.topPerformers && stats.topPerformers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performers This Week</h2>
            <div className="space-y-3">
              {stats.topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-full">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performer.vehicleNumber}</p>
                      <p className="text-sm text-gray-500">{performer.driverName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                      R{performer.profit.toLocaleString('en-ZA')}
                    </p>
                    <p className="text-xs text-gray-500">Net Profit</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
      />
    </div>
  );
}
