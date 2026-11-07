import { Link } from 'react-router-dom';

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 sm:px-10">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">Ironclad</Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-5 sm:p-8">
        {children}
      </main>
    </div>
  );
}
