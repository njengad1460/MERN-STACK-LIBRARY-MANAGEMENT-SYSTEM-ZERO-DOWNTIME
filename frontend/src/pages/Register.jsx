import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Library, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../componets/LoadingSpinner';
import libraryBg from '../assets/library_bg.png';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@(student\.)?mmarau\.ac\.ke$/.test(formData.email)) {
      newErrors.email = 'Use school email (@mmarau.ac.ke)';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ server: result.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans overflow-hidden">
      {/* Left Side: Image & Branding */}
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
              Your Journey into <br />
              <span className="text-primary-300">Knowledge Starts Here.</span>
            </h1>
            <p className="text-base text-primary-100/80 mb-8 max-w-xs">
              Create an account to unlock full access to our digital and physical collections.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full lg:w-3/5 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-white dark:bg-slate-900 relative overflow-y-auto py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-primary-600 rounded-xl">
              <Library className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">EduLib</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400">Join our library management system</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500" />
                  <input
                    name="firstName"
                    type="text"
                    className={`input-modern pl-11 py-2.5 ${errors.firstName ? 'border-red-500 bg-red-50/30' : ''}`}
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  className={`input-modern py-2.5 ${errors.lastName ? 'border-red-500 bg-red-50/30' : ''}`}
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.lastName}</p>}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Username / Admission Number</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  name="username"
                  type="text"
                  className={`input-modern pl-11 py-2.5 ${errors.username ? 'border-red-500 bg-red-50/30' : ''}`}
                  placeholder="e.g. SB06/SR/MN/...../...."
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">School Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  name="email"
                  type="email"
                  className={`input-modern pl-11 py-2.5 ${errors.email ? 'border-red-500 bg-red-50/30' : ''}`}
                  placeholder="Your university email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`input-modern pl-11 py-2.5 ${errors.password ? 'border-red-500 bg-red-50/30' : ''}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-primary-500 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input-modern pl-11 py-2.5 ${errors.confirmPassword ? 'border-red-500 bg-red-50/30' : ''}`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-primary-500 transition-colors">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            {errors.server && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-red-600 text-[10px] font-medium text-center">{errors.server}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-modern w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <LoadingSpinner size="small" /> : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-center text-slate-600 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
; 