import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import fleetManagerLogo from '../../assets/fleet-manager-logo.png';
import sheetSolvedLogo from '../../assets/sheetsolved-logo.svg';

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ResetPasswordForm>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL ||
        (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api');

      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }

      setIsSuccess(true);
      toast.success('Password reset successful!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // If no token, show error
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src={fleetManagerLogo}
                alt="Fleet Manager"
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Fleet Manager</h1>
            <p className="mt-3 text-gray-600">Reset your password</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid Reset Link</h3>
              <p className="text-sm text-gray-600 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Need help? Contact{' '}
              <a href="mailto:cesaire@sheetsolved.com" className="text-blue-600 hover:text-blue-700 font-medium">
                cesaire@sheetsolved.com
              </a>
            </p>
            <div className="flex items-center justify-center">
              <img
                src={sheetSolvedLogo}
                alt="Sheet Solved"
                className="h-6 w-auto opacity-60"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src={fleetManagerLogo}
              alt="Fleet Manager"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Manager</h1>
          <p className="mt-3 text-gray-600">Create a new password</p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!isSuccess ? (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Enter your new password below. Make sure it's at least 6 characters long.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    {...register('newPassword', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type="password"
                    id="newPassword"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === newPassword || 'Passwords do not match'
                    })}
                    type="password"
                    id="confirmPassword"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 mr-2" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Successful!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your password has been successfully reset.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting you to login in a few seconds...
              </p>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Need help? Contact{' '}
            <a href="mailto:cesaire@sheetsolved.com" className="text-blue-600 hover:text-blue-700 font-medium">
              cesaire@sheetsolved.com
            </a>
          </p>
          <div className="flex items-center justify-center">
            <img
              src={sheetSolvedLogo}
              alt="Sheet Solved"
              className="h-6 w-auto opacity-60"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
