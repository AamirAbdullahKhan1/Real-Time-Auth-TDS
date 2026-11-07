import React from 'react';
import { Link } from 'react-router-dom';

const SplitLayout = ({ children, bannerContent }) => {
  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left Form Section */}
      <div className="w-full md:w-1/2 flex flex-col h-full relative z-10 bg-white md:bg-transparent overflow-y-auto md:overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent pointer-events-none"></div>
        
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative my-auto">
          <div className="w-full max-w-[440px] bg-white rounded-2xl md:shadow-[0_4px_25px_rgb(0,0,0,0.05)] p-6 sm:p-8 border border-gray-100/80">
            {children}
          </div>
        </main>

        <footer className="w-full border-t border-gray-100 py-3.5 px-6 shrink-0 bg-white md:bg-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-semibold text-gray-500">
            <div>© 2024 Ironclad Systems Inc.</div>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Right Banner Section */}
      <div className="hidden md:flex w-1/2 bg-dark-bg text-white flex-col relative overflow-hidden h-full">
        {/* Abstract dot pattern background */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '28px 28px' }}></div>
        
        <div className="flex-1 flex items-center p-10 lg:p-16 relative z-10 my-auto">
          <div className="max-w-xl">
            {bannerContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitLayout;
