import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import fleetManagerLogo from '../../assets/fleet-manager-logo.png';
import sheetSolvedLogo from '../../assets/sheetsolved-logo.svg';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL ||
        (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api');

      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reset email');
      }

      setIsSubmitted(true);
      toast.success('Password reset instructions sent! Check your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

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
          <p className="mt-3 text-gray-600">Reset your password</p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!isSubmitted ? (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition font-medium"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send Reset Instructions
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-sm text-gray-600 mb-4">
                If an account exists with that email, you will receive password reset instructions within a few minutes.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-2">
                  Didn't receive the email?
                </p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside text-left">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Contact support at <a href="mailto:cesaire@sheetsolved.com" className="font-semibold underline">cesaire@sheetsolved.com</a></li>
                </ul>
              </div>
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
