import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TakeQueue from './pages/dashboard/TakeQueue';
import Monitor from './pages/dashboard/Monitor';
import OperatorPanel from './pages/dashboard/OperatorPanel';
import History from './pages/dashboard/History';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Monitor />} />
          <Route path="/take-queue" element={<TakeQueue />} />
          <Route path="/operator" element={<OperatorPanel />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
