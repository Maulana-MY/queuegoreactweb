import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 shadow-sm',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const sizeClass = props.size ? sizes[props.size] : sizes.md;

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
