import React, { useState, useEffect, useCallback, useRef } from 'react';
import queueService from '../../api/queueService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  Play, 
  RotateCw, 
  CheckCircle2, 
  SkipForward, 
  PlayCircle, 
  RefreshCw, 
  Users, 
  Monitor, 
  UserCheck, 
  Clock, 
  CheckCheck,
  Ban,
  Activity
} from 'lucide-react';

const AUTO_REFRESH_MS = 5000;

const OperatorPanel = () => {
  const [counters, setCounters] = useState([]);
  const [selectedCounterId, setSelectedCounterId] = useState('');
  const [currentQueue, setCurrentQueue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queues, setQueues] = useState([]);
  const intervalRef = useRef(null);

  // ==========================================
  // DATA FETCHING
  // ==========================================

  const fetchInitialData = useCallback(async () => {
    try {
      const [countersData, queuesData] = await Promise.all([
        queueService.getCounters(),
        queueService.getQueuesToday(),
      ]);
      setCounters(countersData);
      setQueues(queuesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const refreshQueues = useCallback(async () => {
    try {
      const queuesData = await queueService.getQueuesToday();
      setQueues(queuesData);
      return queuesData;
    } catch (error) {
      console.error('Error refreshing queues:', error);
      return [];
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    fetchInitialData();
    intervalRef.current = setInterval(refreshQueues, AUTO_REFRESH_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchInitialData, refreshQueues]);

  // Sync currentQueue when queues or selectedCounterId changes
  useEffect(() => {
    if (selectedCounterId) {
      const active = queues.find(
        (q) =>
          q.counter_id === parseInt(selectedCounterId) &&
          (q.status === 'calling' || q.status === 'serving')
      );
      setCurrentQueue(active || null);
    } else {
      setCurrentQueue(null);
    }
  }, [selectedCounterId, queues]);

  // ==========================================
  // OPERATOR ACTIONS (SILENT - NO AUDIO SPEECH FOR OPERATOR)
  // ==========================================

  const handleAction = async (action, paramId) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'call':
          await queueService.callNext(paramId);
          break;
        case 'recall':
          await queueService.recall(paramId);
          break;
        case 'serve':
          await queueService.serve(paramId);
          break;
        case 'complete':
          await queueService.complete(paramId);
          break;
        case 'skip':
          await queueService.skip(paramId);
          break;
        default:
          break;
      }
      await refreshQueues();
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      alert(error.response?.data?.message || `Gagal melakukan aksi: ${action}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // DERIVED STATE
  // ==========================================

  const waitingQueues = queues.filter(
    (q) => q.counter_id === parseInt(selectedCounterId) && q.status === 'waiting'
  );

  const todayCounterQueues = queues.filter(
    (q) => q.counter_id === parseInt(selectedCounterId)
  );

  const completedCount = todayCounterQueues.filter(
    (q) => q.status === 'completed'
  ).length;

  const skippedCount = todayCounterQueues.filter(
    (q) => q.status === 'skipped'
  ).length;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Counter Selection Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-blue-200 border border-white/15">
            <Monitor className="w-3.5 h-3.5" />
            <span>Terminal Petugas Loket</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5 text-white tracking-tight">
            Panel Operator
          </h2>
          <p className="text-blue-200 text-xs sm:text-sm">Pilih loket aktif tempat Anda bertugas melayani pelanggan.</p>
        </div>

        <div className="w-full sm:w-auto min-w-[260px] relative z-10">
          <select
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold outline-none focus:ring-2 focus:ring-white/50 transition-all"
            value={selectedCounterId}
            onChange={(e) => setSelectedCounterId(e.target.value)}
            style={{ colorScheme: 'dark' }}
          >
            <option value="" style={{ color: '#0f172a' }}>-- Pilih Loket Tugas --</option>
            {counters.map((c) => (
              <option key={c.id} value={c.id} style={{ color: '#0f172a' }}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCounterId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Action Panel */}
          <Card className="lg:col-span-2 flex flex-col items-center py-10 px-6 sm:px-8 border border-slate-100 shadow-xl rounded-3xl relative overflow-hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full mb-6">
              Antrean Aktif Saat Ini
            </span>

            <div
              className={`text-8xl md:text-9xl font-black mb-4 tracking-tighter transition-all duration-300 ${
                currentQueue ? 'text-primary-600 scale-105' : 'text-slate-200'
              }`}
            >
              {currentQueue ? currentQueue.queue_number : '---'}
            </div>

            <div className="text-base sm:text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
              {currentQueue?.customer_name ? (
                <>
                  <UserCheck className="w-5 h-5 text-primary-500" />
                  <span>Pelanggan: <strong className="text-slate-900">{currentQueue.customer_name}</strong></span>
                </>
              ) : (
                <span className="text-slate-400 font-medium text-sm">Belum ada antrean yang dipanggil</span>
              )}
            </div>

            {currentQueue && (
              <div className="mb-8">
                <StatusBadge status={currentQueue.status} className="text-xs px-4 py-1.5 font-bold" />
              </div>
            )}

            {/* Action Buttons Container */}
            <div className="flex flex-wrap justify-center gap-3 w-full pt-4 border-t border-slate-100">
              {!currentQueue ? (
                <Button
                  size="lg"
                  onClick={() => handleAction('call', selectedCounterId)}
                  disabled={isLoading || waitingQueues.length === 0}
                  className="w-full sm:w-auto px-10 py-4 text-base font-bold shadow-xl shadow-primary-500/25 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Panggil Antrean Selanjutnya</span>
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleAction('recall', currentQueue.id)}
                    disabled={isLoading}
                    className="flex-1 min-w-[140px] py-3.5 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
                  >
                    <RotateCw className="w-4 h-4 mr-2" /> Panggil Ulang
                  </Button>

                  {currentQueue.status === 'calling' && (
                    <Button
                      variant="primary"
                      onClick={() => handleAction('serve', currentQueue.id)}
                      disabled={isLoading}
                      className="flex-1 min-w-[140px] py-3.5 rounded-2xl font-bold shadow-lg shadow-primary-500/20"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" /> Mulai Layani
                    </Button>
                  )}

                  {currentQueue.status === 'serving' && (
                    <Button
                      variant="primary"
                      className="flex-1 min-w-[140px] py-3.5 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 border-emerald-600 shadow-lg shadow-emerald-600/25"
                      onClick={() => handleAction('complete', currentQueue.id)}
                      disabled={isLoading}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Selesai
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    onClick={() => handleAction('skip', currentQueue.id)}
                    disabled={isLoading}
                    className="flex-1 min-w-[140px] py-3.5 rounded-2xl font-bold shadow-lg shadow-rose-500/20"
                  >
                    <SkipForward className="w-4 h-4 mr-2" /> Lewati
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Side Info Panel */}
          <Card className="flex flex-col border border-slate-100 shadow-xl rounded-3xl p-6">
            <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Statistik Loket Harian</h3>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {/* Waiting */}
              <div className="text-center p-5 bg-primary-50/70 rounded-2xl border border-primary-100">
                <div className="text-4xl font-black text-primary-600 mb-0.5">
                  {waitingQueues.length}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary-800 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Sisa Antrean Tunggu
                </div>
              </div>

              {/* Stats Dual Box */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                  <div className="text-2xl font-black text-emerald-600">{completedCount}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center justify-center gap-1 mt-0.5">
                    <CheckCheck className="w-3 h-3" /> Selesai
                  </div>
                </div>

                <div className="text-center p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100">
                  <div className="text-2xl font-black text-rose-500">{skippedCount}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center justify-center gap-1 mt-0.5">
                    <Ban className="w-3 h-3" /> Dilewati
                  </div>
                </div>
              </div>

              {/* Waiting List */}
              {waitingQueues.length > 0 && (
                <div className="mt-1">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    Urutan Antrean Berikutnya
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {waitingQueues.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium"
                      >
                        <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {q.queue_number}
                        </span>
                        <span className="text-slate-600 font-semibold truncate ml-2">
                          {q.customer_name || 'Tanpa Nama'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="secondary"
                className="w-full mt-auto py-3 rounded-xl font-bold"
                onClick={refreshQueues}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
              </Button>
            </div>

            {/* Live Indicator */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Live Monitor • Auto-sync 5s</span>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 border-dashed border-2 border-slate-200 rounded-3xl">
          <RotateCw className="w-14 h-14 mb-3 opacity-20" />
          <p className="text-base font-semibold text-slate-600">
            Silakan pilih loket terlebih dahulu untuk mulai mengoperasikan antrean.
          </p>
        </Card>
      )}
    </div>
  );
};

export default OperatorPanel;
