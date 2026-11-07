import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authRequest, saveSession } from '../authApi';

export default function TwoFactorAuth() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (!state?.challengeId) return <Navigate to="/login" replace />;

  async function verify(event) {
    event.preventDefault();
    if (pending || code.length !== 6) return;
    setError('');
    setPending(true);
    try {
      const { token } = await authRequest('/verify-email-code', {
        method: 'POST',
        body: { challengeId: state.challengeId, code },
      });
      saveSession(token);
      navigate('/', { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout>
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <ShieldCheck aria-hidden="true" className="mb-4 h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-text-main">Check your email</h1>
        <p className="mt-2 break-words text-sm text-text-muted">
          Enter the six-digit code sent to <strong>{state.email}</strong>. It expires in 10 minutes.
        </p>
        <form onSubmit={verify} className="mt-6 space-y-4">
          <Input
            label="Verification code"
            name="verification-code"
            value={code}
            onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            required
            autoFocus
            error={error}
          />
          <Button type="submit" disabled={pending || code.length !== 6}>
            {pending ? 'Verifying...' : 'Verify and continue'}
          </Button>
        </form>
        <p className="mt-5 text-sm text-text-muted">
          Need another code? <Link to="/login" replace className="font-semibold text-primary">Sign in again</Link>.
        </p>
      </section>
    </AuthLayout>
  );
}
