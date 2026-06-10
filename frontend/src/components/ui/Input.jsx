import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, icon: Icon, rightIcon: RightIcon, error, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-main">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            block w-full rounded-md border py-2.5 sm:text-sm transition-colors duration-200
            ${Icon ? 'pl-10' : 'pl-3'} 
            ${RightIcon ? 'pr-10' : 'pr-3'}
            ${error 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-primary focus:border-primary text-text-main'}
          `}
          {...props}
        />
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {RightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
