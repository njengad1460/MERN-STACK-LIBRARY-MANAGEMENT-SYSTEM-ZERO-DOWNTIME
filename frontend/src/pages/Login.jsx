import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Library, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../componets/LoadingSpinner';
import libraryBg from '../assets/library_bg.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!formData.email.trim()) validationErrors.email = 'Email is required';
    if (!formData.password.trim()) validationErrors.password = 'Password is required';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await login(formData.email, formData.password);

    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ form: result.message || 'Login failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans overflow-hidden">
      {/* Left Side: Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/5 relative">
        <img 
          src={libraryBg} 
          alt="Modern Library" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-primary-900/40 flex flex-col justify-end p-12">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Library className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Library Management System</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight tracking-tight text-balance">
              Empowering Minds, <br />
              <span className="text-primary-300">One Book at a Time.</span>
            </h1>
            <p className="text-base text-primary-100/80 mb-8 max-w-xs">
              Welcome to the next generation of library management. Access vast resources with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-3/5 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-white dark:bg-slate-900 relative">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-12">
            <div className="p-2 bg-primary-600 rounded-xl">
              <Library className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">EduLib</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`input-modern pl-11 ${errors.email ? 'border-red-500 bg-red-50/30' : ''}`}
                  placeholder="name@mmarau.ac.ke"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link to="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input-modern pl-11 pr-11 ${errors.password ? 'border-red-500 bg-red-50/30' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{errors.password}</p>}
            </div>

            {/* General form error */}
            {errors.form && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
                <p className="text-red-600 text-xs font-medium">{errors.form}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-modern w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-center text-slate-600 dark:text-slate-400">
              New to our library?{' '}
              <Link
                to="/register"
                className="font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default Login;
