import { useState } from 'react';
import { X, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api');

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VehicleForm {
  vehicleNumber: string;
  driverName: string;
  phoneNumber: string;
  status?: 'active' | 'inactive' | 'maintenance';
  notes?: string;
}

export default function AddVehicleModal({ isOpen, onClose }: AddVehicleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<VehicleForm>({
    defaultValues: {
      status: 'active'
    }
  });

  const onSubmit = async (data: VehicleForm) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      await axios.post(`${API_URL}/vehicles`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Vehicle added successfully!');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      reset();
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add vehicle';
      toast.error(message);
      console.error('Add vehicle error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900">Add New Vehicle</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Add a vehicle to your fleet to start tracking performance and revenue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Vehicle Number */}
          <div>
            <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number *
            </label>
            <input
              {...register('vehicleNumber', {
                required: 'Vehicle number is required',
                minLength: { value: 2, message: 'Vehicle number must be at least 2 characters' }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CA 123 456"
              title="Enter the vehicle's license plate or registration number"
            />
            {errors.vehicleNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber.message}</p>
            )}
            {!errors.vehicleNumber && (
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Enter the license plate or vehicle ID number
              </p>
            )}
          </div>

          {/* Driver Name */}
          <div>
            <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
              Driver Name *
            </label>
            <input
              {...register('driverName', {
                required: 'Driver name is required',
                minLength: { value: 3, message: 'Driver name must be at least 3 characters' }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., John Doe"
              title="Enter the driver's full name"
            />
            {errors.driverName && (
              <p className="mt-1 text-sm text-red-600">{errors.driverName.message}</p>
            )}
            {!errors.driverName && (
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Full name of the driver assigned to this vehicle
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              {...register('phoneNumber', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9\s\+\-\(\)]+$/,
                  message: 'Invalid phone number format'
                }
              })}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., +27 82 123 4567"
              title="Enter the driver's contact number"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
            {!errors.phoneNumber && (
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Driver's contact number for communication
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Select the current operational status"
            >
              <option value="active">Active - Currently operational</option>
              <option value="inactive">Inactive - Not in service</option>
              <option value="maintenance">Maintenance - Under repair</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Vehicle's current operational status
            </p>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Special maintenance requirements, insurance details, etc."
              title="Add any additional information about this vehicle"
            />
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Add special notes, insurance info, or other details
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
