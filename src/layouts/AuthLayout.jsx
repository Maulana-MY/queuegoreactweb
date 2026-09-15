import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AuthLayout = () => {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          QueueGo
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Smart Queue Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
