import React from 'react';

const TextInput = ({ label, id, error, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TextInput;
