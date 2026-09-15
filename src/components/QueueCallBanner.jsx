import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BellRing, ArrowRight, X } from 'lucide-react';

const QueueCallBanner = () => {
  const [activeTicket, setActiveTicket] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkActiveTicket = async () => {
      const saved = localStorage.getItem('queuego_active_ticket');
      if (!saved) {
        setShowBanner(false);
        return;
      }

      try {
        const parsed = JSON.parse(saved);
        if (!['waiting', 'calling', 'serving'].includes(parsed.status)) {
          setShowBanner(false);
          return;
        }

        // Fetch latest queues status
        const res = await api.get('/api/queues/today');
        const queues = res.data?.data || [];
        const updated = queues.find((q) => q.id === parsed.id);

        if (updated) {
          setActiveTicket(updated);

          // Show banner ONLY if status is 'calling' AND user is NOT on /take-queue
          if (updated.status === 'calling' && location.pathname !== '/take-queue') {
            setShowBanner(true);
          } else {
            setShowBanner(false);
          }
        }
      } catch (err) {
        console.error('Error checking queue call banner:', err);
      }
    };

    checkActiveTicket();
    const interval = setInterval(checkActiveTicket, 2000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  if (!showBanner || !activeTicket || location.pathname === '/take-queue') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl border-b border-amber-400/30 sticky top-16 z-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="bg-white/20 p-2 rounded-full animate-bounce shrink-0">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wide">
              Nomor Antrean Anda ({activeTicket.queue_number}) Sedang Dipanggil!
            </span>
            <span className="text-xs text-amber-100 block sm:inline sm:ml-2">
              Silakan menuju form Ambil Antrean untuk melihat detail loket.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/take-queue')}
            className="bg-white text-amber-900 hover:bg-amber-50 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Ke Form Ambil Antrean</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueCallBanner;
