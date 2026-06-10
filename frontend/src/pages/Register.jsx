import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, Mail, Lock, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import SplitLayout from '../layouts/SplitLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register attempt:', formData);
  };

  const bannerContent = (
    <div className="flex flex-col gap-12">
      <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
        Secure.<br/>
        <span className="text-gray-300">Scalable.</span><br/>
        <span className="text-primary">Ironclad.</span>
      </h1>
      
      <p className="text-lg text-gray-400 font-medium max-w-md leading-relaxed">
        Join the thousands of organizations protecting their data architecture with our centralized control suite.
      </p>

      <div className="flex items-center gap-4 mt-8 bg-white/5 backdrop-blur-md rounded-full p-2 pr-6 border border-white/10 w-fit">
        <div className="flex -space-x-3">
          <img className="w-10 h-10 rounded-full border-2 border-dark-bg object-cover" src="https://i.pravatar.cc/100?img=11" alt="User" />
          <img className="w-10 h-10 rounded-full border-2 border-dark-bg object-cover" src="https://i.pravatar.cc/100?img=5" alt="User" />
          <div className="w-10 h-10 rounded-full border-2 border-dark-bg bg-primary flex items-center justify-center text-xs font-bold shadow-lg">
            +5k
          </div>
        </div>
        <span className="text-sm font-semibold tracking-wide text-gray-200">Security Admins online</span>
      </div>
    </div>
  );

  return (
    <SplitLayout bannerContent={bannerContent}>
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-dark-bg rounded-xl flex items-center justify-center mb-6 shadow-md shadow-dark-bg/20">
          <Shield className="text-white w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-text-main tracking-tight mb-2">Create Account</h2>
        <p className="text-sm font-medium text-text-muted">Enterprise-grade security for your data workspace.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

        <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg border-l-4 border-primary mt-2">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-gray-700 leading-snug">
            Passwords must be at least 12 characters with symbols.
          </p>
        </div>

        <Button type="submit" className="mt-4 py-3.5 text-sm font-bold tracking-wide uppercase">
          Sign Up
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="mt-8 text-center border-t border-gray-100 pt-6">
        <p className="text-sm font-medium text-gray-600">
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
