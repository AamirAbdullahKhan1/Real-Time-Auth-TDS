import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, headerRight }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative blurred background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="w-full flex justify-between items-center py-6 px-8 relative z-10">
        <Link to="/" className="text-xl font-bold tracking-tight text-text-main">
          Ironclad Dash
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          {headerRight ? headerRight : (
            <>
              <Link to="/help" className="hover:text-primary transition-colors">Help</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 py-6 px-8 relative z-10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-500">
          <div>© 2024 Ironclad Systems Inc.</div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link to="/architecture" className="hover:text-gray-900 transition-colors">Security Architecture</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
