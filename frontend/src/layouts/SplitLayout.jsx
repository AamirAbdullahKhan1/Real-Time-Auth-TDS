import React from 'react';
import { Link } from 'react-router-dom';

const SplitLayout = ({ children, bannerContent }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Form Section */}
      <div className="w-full md:w-1/2 flex flex-col min-h-screen relative z-10 bg-white md:bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none"></div>
        
        <main className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
          <div className="w-full max-w-[440px] bg-white rounded-none md:rounded-2xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-0 md:p-10 border-0 md:border border-gray-100">
            {children}
          </div>
        </main>

        <footer className="w-full border-t border-gray-200 py-6 px-8 mt-auto bg-background md:bg-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500">
            <div>© 2024 Ironclad Systems Inc.</div>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Right Banner Section */}
      <div className="hidden md:flex w-1/2 bg-dark-bg text-white flex-col relative overflow-hidden">
        {/* Abstract dot pattern background */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="flex-1 flex items-center p-16 lg:p-24 relative z-10">
          <div className="max-w-xl">
            {bannerContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitLayout;
