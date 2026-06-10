import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "w-full py-3 px-4 rounded-md font-medium transition-all duration-200 flex justify-center items-center gap-2";
  
  const variants = {
    primary: "bg-dark-bg text-white hover:bg-dark-surface",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
