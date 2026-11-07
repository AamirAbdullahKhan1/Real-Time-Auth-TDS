import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import SplitLayout from '../layouts/SplitLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authRequest, clearSession } from '../authApi';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    const { fullName, email, password, confirmPassword } = formData;
    if (password !== confirmPassword) {
      setError('Passwords must match.');
      return;
    }

    setError('');
    setPending(true);
    try {
      const challenge = await authRequest('/register', {
        method: 'POST',
        body: { name: fullName, email, password },
      });
      clearSession();
      navigate('/2fa', { replace: true, state: challenge });
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  };

  const bannerContent = (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
        Secure.<br/>
        <span className="text-gray-300">Scalable.</span><br/>
        <span className="text-primary">Ironclad.</span>
      </h1>
      
      <p className="text-base text-gray-400 font-medium max-w-md leading-relaxed">
        Create an Ironclad account and review your recent sign-in activity.
      </p>


    </div>
  );

  return (
    <SplitLayout bannerContent={bannerContent}>
      <div className="flex flex-col items-center mb-5">
        <div className="w-10 h-10 bg-dark-bg rounded-xl flex items-center justify-center mb-3 shadow-md shadow-dark-bg/20">
          <Shield className="text-white w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-text-main tracking-tight mb-1">Create Account</h2>
        <p className="text-xs font-medium text-text-muted">We will email a code to verify your address.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Full Name"
          name="fullName"
          placeholder="John Doe"
          icon={User}
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Work Email"
          name="email"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            icon={CheckCircle2}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center gap-2 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <p className="text-[11px] font-medium text-gray-700 leading-snug">
            Must be 12+ chars with symbols & numbers.
          </p>
        </div>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={pending} className="mt-1 py-2.5 text-xs font-bold tracking-wider uppercase">
          {pending ? 'Creating account…' : 'Sign Up'}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="mt-4 text-center border-t border-gray-100 pt-3.5">
        <p className="text-xs font-medium text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:text-primary-hover transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </SplitLayout>
  );
};

export default Register;
