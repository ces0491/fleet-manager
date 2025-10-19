import { useState } from 'react';
import { Vehicle, WeeklyData } from '../../types';
import { Edit, Trash2, Eye, Phone, AlertCircle, Car } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  vehicles: Vehicle[];
  weeklyData: WeeklyData[];
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
  onView?: (vehicle: Vehicle) => void;
}

export default function FleetTable({ vehicles, weeklyData, onEdit, onDelete, onView }: Props) {
  const [sortField, setSortField] = useState<string>('vehicleNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Create a map of weekly data by vehicle ID
  const weeklyDataMap = new Map<string, WeeklyData>();
  weeklyData.forEach(data => {
    const vehicleId = typeof data.vehicleId === 'string' ? data.vehicleId : data.vehicleId.id;
    weeklyDataMap.set(vehicleId, data);
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedVehicles = [...vehicles].sort((a, b) => {
    let aValue: any = a[sortField as keyof Vehicle];
    let bValue: any = b[sortField as keyof Vehicle];

    // Handle weekly data sorting
    if (sortField === 'profit' || sortField === 'revenue') {
      const aData = weeklyDataMap.get(a.id);
      const bData = weeklyDataMap.get(b.id);
      aValue = sortField === 'profit' ? (aData?.netProfit || 0) : (aData?.totalRevenue || 0);
      bValue = sortField === 'profit' ? (bData?.netProfit || 0) : (bData?.totalRevenue || 0);
    }

    if (typeof aValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getStatusBadge = (status: Vehicle['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('vehicleNumber')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Vehicle #
              </th>
              <th
                onClick={() => handleSort('driverName')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Status
              </th>
              <th
                onClick={() => handleSort('revenue')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Weekly Revenue
              </th>
              <th
                onClick={() => handleSort('profit')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Net Profit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margin
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedVehicles.map((vehicle) => {
              const data = weeklyDataMap.get(vehicle.id);
              const hasData = !!data;

              return (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicle.vehicleNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.driverName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={`tel:${vehicle.phoneNumber}`} className="flex items-center hover:text-blue-600">
                      <Phone className="h-4 w-4 mr-1" />
                      {vehicle.phoneNumber}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vehicle.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {hasData ? (
                      <span className="text-gray-900 font-medium">
                        R{data.totalRevenue.toLocaleString('en-ZA')}
                      </span>
                    ) : (
                      <span className="text-gray-400 flex items-center justify-end">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        No data
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {hasData ? (
                      <span className={`font-medium ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R{data.netProfit.toLocaleString('en-ZA')}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {hasData ? (
                      <span className={`font-medium ${data.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.profitMargin.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(vehicle)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(vehicle)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit vehicle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(vehicle.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete vehicle"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Car className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No vehicles yet</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Start tracking your fleet by adding your first vehicle. Click the "Add Vehicle" button above to get started.
          </p>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Add vehicles to track revenue, expenses, and performance metrics for each vehicle in your fleet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
