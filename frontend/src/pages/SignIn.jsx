import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('SignIn attempt:', formData);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 border border-gray-100">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight mb-2">Welcome Back</h2>
          <p className="text-sm font-medium text-text-muted">Access your secure enterprise dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@company.com"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <div className="relative">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-text-main">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-primary hover:text-primary-hover">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-10 sm:text-sm focus:ring-primary focus:border-primary transition-colors duration-200 text-text-main"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center mt-1">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
              Remember this device for 30 days
            </label>
          </div>

          <Button type="submit" className="mt-2 py-3.5 text-sm font-bold tracking-wide">
            Sign In
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm font-medium text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:text-primary-hover transition-colors">
              Register your organization
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
