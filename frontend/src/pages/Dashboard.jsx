import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authRequest, clearSession } from '../authApi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    authRequest('/me')
      .then(async ({ user }) => {
        const { events } = await authRequest(user.role === 'admin' ? '/admin/events' : '/events');
        if (active) setAudit({ user, events });
      })
      .catch(error => {
        if (!active) return;
        setAudit(null);
        if (error.status === 401) {
          clearSession();
          navigate('/login', { replace: true });
        } else {
          setError(error.message);
        }
      });
    return () => { active = false; };
  }, [navigate, revision]);

  async function logout() {
    setError('');
    setPending(true);
    try {
      await authRequest('/logout', { method: 'POST' });
    } catch (error) {
      if (error.status !== 401) {
        setError(error.message);
        setPending(false);
        return;
      }
    }
    clearSession();
    navigate('/login', { replace: true });
  }

  const isAdmin = audit?.user.role === 'admin';
  const roleTitle = { admin: 'Admin dashboard', employee: 'Employee workspace', customer: 'Customer account' };

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 sm:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">Ironclad</p>
            <h1 className="text-2xl font-bold">{roleTitle[audit?.user.role] ?? 'Your account'}</h1>
            {audit && <p className="mt-1 text-sm text-slate-600">{audit.user.email}</p>}
          </div>
          <div className="flex gap-3">
            <button className="rounded-lg border border-slate-300 bg-white px-3 py-2" onClick={() => {
              setError('');
              setRevision(value => value + 1);
            }}>Refresh</button>
            <button className="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-60" disabled={pending} onClick={logout}>
              {pending ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </header>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {!audit && !error && <p role="status">Loading authentication activity...</p>}
        {audit && audit.events.length === 0 && <p>No activity recorded yet.</p>}
        {audit && audit.events.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <caption className="p-3 text-left font-semibold">{isAdmin ? 'Recent authentication across accounts' : 'Your recent authentication activity'}</caption>
              <thead className="bg-slate-100">
                <tr>{['Event', ...(isAdmin ? ['Account ID', 'Role', 'Reason'] : []), 'Source IP', 'Country', 'Time (UTC)'].map(label => (
                  <th key={label} scope="col" className="p-3">{label}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {audit.events.map(event => (
                  <tr key={event.id}>
                    <td className="p-3">{event.event_type}</td>
                    {isAdmin && <>
                      <td className="p-3">{event.user_id ?? 'Unknown'}</td>
                      <td className="p-3">{event.account_role ?? 'Unknown'}</td>
                      <td className="p-3">{event.detected_rule ?? '—'}</td>
                    </>}
                    <td className="p-3">{event.ip_address || 'Unknown'}</td>
                    <td className="p-3">{event.country || 'Unknown'}</td>
                    <td className="p-3 whitespace-nowrap">{new Date(event.created_at).toISOString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
