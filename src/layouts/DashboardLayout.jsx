import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Monitor, Ticket, Users, History, LogOut, Menu, X } from 'lucide-react';
import QueueCallBanner from '../components/QueueCallBanner';
import api from '../api/axios';
import { playQueueAnnouncement } from '../utils/tts';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Centralized Global Voice Announcement for User Sessions (Single Audio Controller)
  useEffect(() => {
    // 100% SILENT for operator role
    if (user?.role === 'operator') return;

    const checkGlobalQueueAnnouncement = async () => {
      const saved = localStorage.getItem('queuego_active_ticket');
      if (!saved) return;

      try {
        const parsed = JSON.parse(saved);
        if (!['waiting', 'calling', 'serving'].includes(parsed.status)) return;

        const res = await api.get('/api/queues/today');
        const queues = res.data?.data || [];
        const updated = queues.find((q) => q.id === parsed.id);

        if (updated) {
          // Sync active ticket state in localStorage
          localStorage.setItem('queuego_active_ticket', JSON.stringify(updated));

          // Announce voice ONLY ONCE per operator call/recall action
          if (updated.status === 'calling' && updated.called_at) {
            const announcementKey = `queuego_announced_${updated.id}`;
            const lastAnnounced = localStorage.getItem(announcementKey);

            if (lastAnnounced !== updated.called_at) {
              // Mark as announced so tab switching or waiting never repeats the voice
              localStorage.setItem(announcementKey, updated.called_at);

              const countersRes = await api.get('/api/counters');
              const counters = countersRes.data?.data || [];
              const counterObj = counters.find((c) => c.id === updated.counter_id);
              const counterName = counterObj?.name || `Loket ${updated.counter_id}`;

              console.log('📢 Single Central Voice Controller Announcing:', updated.queue_number, counterName);
              playQueueAnnouncement(updated.queue_number, updated.customer_name, counterName);
            }
          }
        }
      } catch (err) {
        console.error('Error in central queue voice controller:', err);
      }
    };

    checkGlobalQueueAnnouncement();
    const interval = setInterval(checkGlobalQueueAnnouncement, 2000);
    return () => clearInterval(interval);
  }, [user?.role]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Monitor', path: '/', icon: Monitor },
  ];

  if (user?.role === 'operator') {
    navItems.push({ name: 'Panel Operator', path: '/operator', icon: Users });
  } else {
    navItems.push({ name: 'Ambil Antrean', path: '/take-queue', icon: Ticket });
  }

  navItems.push({ name: 'Riwayat', path: '/history', icon: History });

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary-600">QueueGo</span>
              </div>
              <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* User Profile & Logout */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{user?.name}</span>
                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-700'
                      : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Global Queue Call Banner Notification */}
      <QueueCallBanner />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
