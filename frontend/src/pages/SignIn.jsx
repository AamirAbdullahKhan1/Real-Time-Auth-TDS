import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authRequest, clearSession } from '../authApi';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setError('');
    setPending(true);
    try {
      const challenge = await authRequest('/login', {
        method: 'POST',
        body: { email: formData.email, password: formData.password },
      });
      clearSession();
      navigate('/2fa', { replace: true, state: challenge });
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 border border-gray-100">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight mb-2">Welcome Back</h2>
          <p className="text-sm font-medium text-text-muted">Enter your password to request an email verification code.</p>
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
              <label htmlFor="login-password" className="text-sm font-medium text-text-main">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="login-password" name="password" autoComplete="current-password"
                placeholder="••••••••"
                className="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-10 sm:text-sm focus:ring-primary focus:border-primary transition-colors duration-200 text-text-main"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button" aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <Button type="submit" disabled={pending} className="mt-2 py-3.5 text-sm font-bold tracking-wide">
            {pending ? 'Signing in…' : 'Sign In'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm font-medium text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:text-primary-hover transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
