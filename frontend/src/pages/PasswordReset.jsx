import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import CodeInput from '../components/ui/CodeInput';
import { authRequest, clearSession } from '../authApi';

export default function PasswordReset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setError('');
    if (challengeId && password !== confirm) {
      setError('Passwords must match.');
      return;
    }
    setPending(true);
    try {
      if (!challengeId) {
        const response = await authRequest('/password-reset/request', { method: 'POST', body: { email } });
        if (!response.challengeId) throw new Error('The server did not start password recovery.');
        setChallengeId(response.challengeId);
        return;
      }
      const response = await authRequest('/password-reset/confirm', {
        method: 'POST', body: { challengeId, code, password },
      });
      if (!response.success) throw new Error('The server did not confirm the password change.');
      clearSession();
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout>
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-600">
          {challengeId
            ? 'If an account can receive a code, check its inbox. Enter the code and choose a new password.'
            : 'Enter the email address associated with your account.'}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {challengeId ? (
            <>
              <CodeInput value={code} onChange={setCode} disabled={pending} />
              <Input label="New password" name="password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={event => setPassword(event.target.value)} />
              <p className="text-xs text-slate-600">Use at least 12 characters, including a number and a symbol.</p>
              <Input label="Confirm new password" name="confirm-password" type="password" autoComplete="new-password" required value={confirm} onChange={event => setConfirm(event.target.value)} />
            </>
          ) : (
            <Input label="Email address" name="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
          )}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={pending || Boolean(challengeId && code.length !== 6)}>
            {pending ? 'Please wait...' : challengeId ? 'Change password' : 'Send reset code'}
          </Button>
        </form>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-primary">
          <Link to="/login">Back to sign in</Link>
          {challengeId && <button type="button" disabled={pending} onClick={() => {
            setChallengeId('');
            setCode('');
            setPassword('');
            setConfirm('');
            setError('');
          }}>Request another code</button>}
        </div>
      </section>
    </AuthLayout>
  );
}
