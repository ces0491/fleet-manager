import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Car, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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
    // For now, just show a message since email service is not set up
    setIsSubmitted(true);
    toast.success('Password reset instructions would be sent to your email');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <Car className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Manager</h1>
          <p className="mt-2 text-gray-600">Reset your password</p>
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

              {/* Info Box */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 font-medium mb-2">
                  Email Service Not Configured
                </p>
                <p className="text-xs text-yellow-700">
                  Password reset functionality requires email service setup. Please contact the administrator at{' '}
                  <a href="mailto:cesaire@sheetsolved.com" className="font-semibold underline">
                    cesaire@sheetsolved.com
                  </a>{' '}
                  for assistance with password reset.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-sm text-gray-600 mb-6">
                If an account exists with that email, you will receive password reset instructions.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-2">
                  Need immediate assistance?
                </p>
                <p className="text-xs text-blue-700">
                  Contact the administrator at{' '}
                  <a href="mailto:cesaire@sheetsolved.com" className="font-semibold underline">
                    cesaire@sheetsolved.com
                  </a>
                </p>
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
