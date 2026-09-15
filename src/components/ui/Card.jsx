import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  // If a custom bg is passed via className, don't force bg-white
  const hasBg = /\bbg-/.test(className);
  const baseClasses = `${hasBg ? '' : 'bg-white'} rounded-2xl shadow-sm border border-gray-100 p-6`;

  return (
    <div 
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
