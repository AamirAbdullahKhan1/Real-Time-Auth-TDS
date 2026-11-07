import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, HelpCircle, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';

const TwoFactorAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use email passed from Register/SignIn page or default to fallback user email
  const [userEmail, setUserEmail] = useState(location.state?.email || 'user@company.com');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newCode = [...code];
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || '';
      }
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex(val => val !== '');
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    newCode[index] = value;
    setCode(newCode);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else {
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
    console.log('2FA attempt for:', userEmail, 'Code:', fullCode);
    // Redirect to authenticated dashboard
    navigate('/dashboard', { state: { email: userEmail } });
  };

  const handleResend = () => {
    setIsResending(true);
    setResendSuccess(false);
    setTimeout(() => {
      setIsResending(false);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    }, 1000);
  };

  const headerRight = (
    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
      <Shield className="w-4 h-4 text-primary" />
      <span className="text-xs font-bold tracking-wide">Secure Protocol v4.2</span>
    </div>
  );

  return (
    <AuthLayout headerRight={headerRight}>
      <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 md:p-10 border border-gray-100 flex flex-col items-center">
        
        <div className="w-13 h-13 bg-blue-50/80 rounded-2xl flex items-center justify-center mb-5 border border-blue-100 shadow-sm">
          <Shield className="text-primary w-7 h-7" />
        </div>

        <h2 className="text-2xl font-bold text-text-main tracking-tight mb-2 text-center">Two-Factor Authentication</h2>
        
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 w-full text-center mb-6">
          <p className="text-xs text-text-muted mb-1 font-medium">Verification code sent to your email:</p>
          <div className="flex items-center justify-center gap-1.5 font-bold text-gray-900 text-sm">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate max-w-[280px]">{userEmail}</span>
          </div>
        </div>

        {resendSuccess && (
          <div className="w-full mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg p-2.5 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>A new 6-digit code has been dispatched to <strong>{userEmail}</strong>!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="flex justify-between gap-2 w-full">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-bold text-dark-bg rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            <Button type="submit" className="py-3 text-sm font-bold tracking-wide">
              Verify Identity & Continue
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleResend}
              disabled={isResending}
              className="py-2.5 text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 flex items-center justify-center gap-1.5"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-500" />
                  Sending Code...
                </>
              ) : (
                'Resend Verification Code'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center border-t border-gray-100 w-full pt-4 flex justify-between items-center text-xs">
          <Link to="/login" className="font-bold text-gray-500 hover:text-gray-800 transition-colors">
            ← Change Account
          </Link>
          <Link to="/help" className="inline-flex items-center gap-1 font-bold text-primary hover:text-primary-hover transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
            Need help?
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default TwoFactorAuth;
