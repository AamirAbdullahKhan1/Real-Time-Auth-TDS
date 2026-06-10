import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, HelpCircle } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';

const TwoFactorAuth = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newCode = [...code];
    // Allow pasting full 6 digits
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || '';
      }
      setCode(newCode);
      
      // Focus last filled input or end
      const lastFilledIndex = newCode.findLastIndex(val => val !== '');
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    newCode[index] = value;
    setCode(newCode);

    // Auto-advance
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        // Move to previous input and clear it if current is empty
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    console.log('2FA attempt:', fullCode);
  };

  const headerRight = (
    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
      <Shield className="w-4 h-4" />
      <span className="text-xs font-bold tracking-wide">Secure Protocol v4.2</span>
    </div>
  );

  return (
    <AuthLayout headerRight={headerRight}>
      <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 border border-gray-100 flex flex-col items-center">
        
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-100">
          <Shield className="text-dark-bg w-7 h-7" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight mb-3 text-center">Two-Factor Auth</h2>
        <p className="text-sm font-medium text-text-muted text-center leading-relaxed mb-8 max-w-sm">
          We've sent a 6-digit verification code to <strong className="text-gray-800">admin@ironclad.io</strong>. Please enter it below to proceed.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="flex justify-between gap-2 md:gap-3 w-full">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6} // to allow pasting multiple chars into one box
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-dark-bg rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <Button type="submit" className="py-3.5 text-sm font-bold tracking-wide">
              Verify Identity
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            
            <Button type="button" variant="secondary" className="py-3.5 text-sm font-bold tracking-wide bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200">
              Resend Code
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 w-full pt-6">
          <Link to="/help" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
            <HelpCircle className="w-4 h-4" />
            Having trouble logging in?
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default TwoFactorAuth;
