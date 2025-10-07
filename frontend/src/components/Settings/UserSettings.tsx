import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Lock, Trash2, AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface DeleteAccountForm {
  confirmationText: string;
}

export default function UserSettings() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm<ChangePasswordForm>();

  const {
    register: registerDelete,
    handleSubmit: handleSubmitDelete,
    reset: resetDelete,
    formState: { errors: deleteErrors }
  } = useForm<DeleteAccountForm>();

  const newPassword = watchPassword('newPassword');

  const onChangePassword = async (data: ChangePasswordForm) => {
    setIsChangingPassword(true);
    try {
      await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const onDeleteAccount = async (data: DeleteAccountForm) => {
    setIsDeletingAccount(true);
    try {
      await axios.delete(`${API_URL}/data-subject/delete-account`);

      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <p className="text-sm text-gray-500">Your account details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {user?.username}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {user?.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-gray-900 capitalize">{user?.role}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                {...registerPassword('currentPassword', {
                  required: 'Current password is required'
                })}
                type="password"
                id="currentPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter current password"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                id="newPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter new password"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                {...registerPassword('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Confirm new password"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isChangingPassword ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
              <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-semibold text-red-900 mb-2">Warning: This action cannot be undone</h3>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>All your personal data will be permanently deleted</li>
              <li>You will be logged out immediately</li>
              <li>This action is irreversible</li>
            </ul>
          </div>

          <form onSubmit={handleSubmitDelete(onDeleteAccount)} className="space-y-4">
            {/* Confirmation Text */}
            <div>
              <label htmlFor="confirmationText" className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold">DELETE MY ACCOUNT</span> to confirm
              </label>
              <input
                {...registerDelete('confirmationText', {
                  required: 'Confirmation text is required',
                  validate: value => value === 'DELETE MY ACCOUNT' || 'Please type exactly: DELETE MY ACCOUNT'
                })}
                type="text"
                id="confirmationText"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="DELETE MY ACCOUNT"
              />
              {deleteErrors.confirmationText && (
                <p className="mt-1 text-sm text-red-600">{deleteErrors.confirmationText.message}</p>
              )}
            </div>

            {/* Delete Button */}
            <button
              type="submit"
              disabled={isDeletingAccount}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isDeletingAccount ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete My Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Need help? Contact{' '}
          <a href="mailto:cesaire@sheetsolved.com" className="text-blue-600 hover:text-blue-700 font-medium">
            cesaire@sheetsolved.com
          </a>
        </p>
      </div>
    </div>
  );
}
