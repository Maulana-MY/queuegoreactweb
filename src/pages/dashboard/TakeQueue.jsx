import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { playQueueAnnouncement } from '../../utils/tts';
import { 
  Ticket, 
  Clock, 
  Users, 
  XCircle, 
  RefreshCw, 
  AlertCircle, 
  Volume2, 
  BellRing, 
  CheckCircle2, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  UserCheck
} from 'lucide-react';

const AUTO_REFRESH_MS = 4000;

const TakeQueue = () => {
  const [counters, setCounters] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [queues, setQueues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const intervalRef = useRef(null);
  const announcedStatusRef = useRef(null);

  // Check if user currently holds an active queue ticket
  const hasActiveTicket = activeTicket && ['waiting', 'calling', 'serving'].includes(activeTicket.status);

  // ==========================================
  // Init: load saved ticket + fetch data
  // ==========================================
  useEffect(() => {
    const saved = localStorage.getItem('queuego_active_ticket');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveTicket(parsed);
      } catch {
        localStorage.removeItem('queuego_active_ticket');
      }
    }
    fetchCounters();
    fetchQueues();

    intervalRef.current = setInterval(fetchQueues, AUTO_REFRESH_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Sync active ticket status from polled data
  useEffect(() => {
    if (!activeTicket) return;
    const updated = queues.find((q) => q.id === activeTicket.id);
    if (updated) {
      if (updated.status !== activeTicket.status) {
        setActiveTicket(updated);
        localStorage.setItem('queuego_active_ticket', JSON.stringify(updated));
      }

      // Voice notification ONLY on User screen when status becomes calling
      if (updated.status === 'calling' && announcedStatusRef.current !== 'calling') {
        announcedStatusRef.current = 'calling';
        const counterName = counters.find((c) => c.id === updated.counter_id)?.name || `Loket ${updated.counter_id}`;
        playQueueAnnouncement(updated.queue_number, updated.customer_name, counterName);
      }
    }
  }, [queues, activeTicket, counters]);

  const fetchCounters = async () => {
    try {
      const res = await api.get('/api/counters');
      setCounters(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching counters:', error);
    }
  };

  const fetchQueues = async () => {
    try {
      const res = await api.get('/api/queues/today');
      setQueues(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching queues:', error);
    }
  };

  const clearActiveTicket = () => {
    setActiveTicket(null);
    localStorage.removeItem('queuego_active_ticket');
    announcedStatusRef.current = null;
  };

  // ==========================================
  // Take queue
  // ==========================================
  const handleTakeQueue = async (e) => {
    e.preventDefault();

    if (hasActiveTicket) {
      alert(`Anda masih memiliki antrean aktif (${activeTicket.queue_number}). Selesaikan atau batalkan antrean terlebih dahulu!`);
      return;
    }

    if (!selectedCounter) {
      alert('Silakan pilih loket terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        counter_id: selectedCounter.id,
        customer_name: customerName || 'Pelanggan',
      };
      const res = await api.post('/api/queues', payload);
      const newQueue = res.data?.data || res.data;

      const ticketWithCounter = {
        ...newQueue,
        counter_name: selectedCounter.name,
      };
      setActiveTicket(ticketWithCounter);
      localStorage.setItem('queuego_active_ticket', JSON.stringify(ticketWithCounter));
      announcedStatusRef.current = newQueue.status;

      setIsModalOpen(true);
      setCustomerName('');
      setSelectedCounter(null);
      await fetchQueues();
    } catch (error) {
      console.error('Error taking queue:', error);
      alert(error.response?.data?.message || 'Gagal mengambil antrean.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Cancel queue
  // ==========================================
  const handleCancelQueue = async (queueId) => {
    try {
      await api.post(`/api/queues/${queueId}/skip`);
      clearActiveTicket();
      setCancelConfirmId(null);
      await fetchQueues();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membatalkan antrean.');
    }
  };

  // ==========================================
  // Derived state
  // ==========================================
  const aheadCount = activeTicket
    ? queues.filter(
        (q) =>
          q.counter_id === activeTicket.counter_id &&
          q.status === 'waiting' &&
          q.id < activeTicket.id
      ).length
    : 0;

  const currentServing = activeTicket
    ? queues.find(
        (q) =>
          q.counter_id === activeTicket.counter_id &&
          (q.status === 'calling' || q.status === 'serving')
      )
    : null;

  const counterName = (counterId) => {
    const c = counters.find((ct) => ct.id === counterId);
    return c?.name || `Loket ${counterId}`;
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Active Ticket Card Display */}
      {activeTicket && (
        <Card className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white border-none shadow-2xl relative overflow-hidden p-8 rounded-3xl">
          {/* Subtle Ambient Background Decorative Circles */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Header Pill */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15">
                <Ticket className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                  Tiket Antrean Aktif
                </span>
              </div>
              <StatusBadge status={activeTicket.status} className="!bg-white/15 !text-white !border-white/20 px-3.5 py-1 text-xs font-semibold" />
            </div>

            {/* Queue Number Showcase */}
            <div className="text-center py-4">
              <div className="inline-block relative">
                <span className="text-7xl md:text-8xl font-black tracking-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300">
                  {activeTicket.queue_number}
                </span>
              </div>
              <div className="text-xl font-bold text-blue-200 mt-2 flex items-center justify-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                {activeTicket.counter_name || counterName(activeTicket.counter_id)}
              </div>
              {activeTicket.customer_name && (
                <div className="text-sm text-slate-300 mt-1 flex items-center justify-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>{activeTicket.customer_name}</span>
                </div>
              )}
            </div>

            {/* Real-time Counter Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 shadow-inner">
                <div className="text-3xl font-black text-white">{aheadCount}</div>
                <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider mt-1">Antrean di Depan</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 shadow-inner">
                <div className="text-2xl font-black text-emerald-300">
                  {currentServing ? currentServing.queue_number : '---'}
                </div>
                <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider mt-1">Sedang Dilayani</div>
              </div>
            </div>

            {/* Dynamic Status Notification Banners (NO EMOJIS - LUXURY LUCIDE ICONS) */}
            {activeTicket.status === 'calling' && (
              <div className="bg-amber-500/90 backdrop-blur-md text-amber-950 px-5 py-4 rounded-2xl font-bold text-center animate-pulse flex items-center justify-center gap-3 border border-amber-300/40 shadow-lg">
                <BellRing className="w-6 h-6 shrink-0 text-amber-950 animate-bounce" />
                <span>Giliran Anda Dipanggil! Silakan menuju {activeTicket.counter_name || counterName(activeTicket.counter_id)}</span>
              </div>
            )}
            {activeTicket.status === 'serving' && (
              <div className="bg-emerald-500/90 backdrop-blur-md text-emerald-950 px-5 py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-3 border border-emerald-300/40 shadow-lg">
                <Activity className="w-6 h-6 shrink-0 text-emerald-950" />
                <span>Anda sedang dalam proses pelayanan di loket</span>
              </div>
            )}
            {activeTicket.status === 'completed' && (
              <div className="bg-teal-500/90 backdrop-blur-md text-teal-950 px-5 py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-3 border border-teal-300/40 shadow-lg">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-teal-950" />
                <span>Layanan telah selesai. Terima kasih atas kunjungan Anda!</span>
              </div>
            )}
            {activeTicket.status === 'skipped' && (
              <div className="bg-rose-500/90 backdrop-blur-md text-rose-950 px-5 py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-3 border border-rose-300/40 shadow-lg">
                <XCircle className="w-6 h-6 shrink-0 text-rose-950" />
                <span>Antrean Anda telah dilewati. Silakan ambil nomor antrean baru jika diperlukan.</span>
              </div>
            )}

            {/* Lock Guard Notice */}
            {hasActiveTicket && (
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-xs text-center text-blue-200 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Form pendaftaran dikunci karena Anda masih memiliki tiket antrean aktif.</span>
              </div>
            )}

            {/* Action Bar */}
            {(activeTicket.status === 'waiting' || activeTicket.status === 'calling') && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1 !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 rounded-xl"
                  onClick={fetchQueues}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh Status
                </Button>

                {cancelConfirmId === activeTicket.id ? (
                  <div className="flex-1 flex gap-2">
                    <Button
                      variant="danger"
                      className="flex-1 rounded-xl"
                      onClick={() => handleCancelQueue(activeTicket.id)}
                    >
                      Ya, Batalkan
                    </Button>
                    <Button
                      variant="secondary"
                      className="!bg-white/10 !text-white !border-white/20 rounded-xl"
                      onClick={() => setCancelConfirmId(null)}
                    >
                      Batal
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="flex-1 !bg-rose-500/20 !text-rose-200 !border-rose-400/30 hover:!bg-rose-500/40 rounded-xl"
                    onClick={() => setCancelConfirmId(activeTicket.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Batalkan Antrean
                  </Button>
                )}
              </div>
            )}

            {/* Clear ticket when completed or skipped */}
            {(activeTicket.status === 'completed' || activeTicket.status === 'skipped') && (
              <Button
                className="w-full !bg-white/20 !text-white !border-white/30 hover:!bg-white/30 py-3.5 rounded-xl text-base font-bold shadow-lg"
                onClick={clearActiveTicket}
              >
                Ambil Antrean Baru
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Take Queue Form — ONLY AVAILABLE WHEN NO ACTIVE TICKET */}
      {!hasActiveTicket && (
        <>
          <div className="text-center space-y-2 py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Layanan Pendaftaran Antrean
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Ambil Nomor Antrean</h1>
            <p className="text-slate-500 max-w-md mx-auto text-sm md:text-base">
              Pilih jenis loket layanan yang dituju dan masukkan nama Anda.
            </p>
          </div>

          <Card className="p-8 border border-slate-100 shadow-xl rounded-3xl">
            <form onSubmit={handleTakeQueue} className="space-y-8">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Pilih Loket Layanan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {counters.map((counter) => {
                    const waitingCount = queues.filter(
                      (q) => q.counter_id === counter.id && q.status === 'waiting'
                    ).length;
                    const isSelected = selectedCounter?.id === counter.id;

                    return (
                      <div
                        key={counter.id}
                        onClick={() => setSelectedCounter(counter)}
                        className={`
                          group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 text-center relative overflow-hidden
                          ${isSelected
                            ? 'border-primary-600 bg-gradient-to-b from-primary-50 to-primary-100/50 text-primary-900 shadow-lg scale-[1.02]'
                            : 'border-slate-200/80 bg-white hover:border-primary-300 hover:bg-slate-50 hover:shadow-md'}
                        `}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-primary-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                        <Ticket className={`w-9 h-9 mx-auto mb-3 transition-transform group-hover:scale-110 ${isSelected ? 'text-primary-600' : 'text-slate-400'}`} />
                        <h3 className="font-extrabold text-lg text-slate-800 group-hover:text-primary-700">{counter.name}</h3>
                        <div className="text-xs font-semibold text-slate-500 mt-2 flex items-center justify-center gap-1.5 bg-slate-100/80 py-1 px-3 rounded-full w-fit mx-auto">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{waitingCount} Antrean Menunggu</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-6 pt-6 border-t border-slate-100">
                <TextInput
                  label="Nama Pelanggan (Opsional)"
                  id="customer_name"
                  placeholder="Masukkan nama Anda (contoh: Fachri)..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base py-4 font-bold shadow-xl shadow-primary-500/25 rounded-2xl flex items-center justify-center gap-2 group"
                  disabled={!selectedCounter || isLoading}
                >
                  <span>{isLoading ? 'Memproses Tiket...' : 'AMBIL NOMOR ANTREAN'}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}

      {/* Ticket Created Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tiket Antrean Berhasil Dibuat"
      >
        {activeTicket && (
          <div className="text-center space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 border-dashed">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">QueueGo System</div>
              <div className="text-7xl font-black text-slate-900 my-4 tracking-tight drop-shadow-sm">
                {activeTicket.queue_number}
              </div>
              <div className="text-xl font-bold text-primary-600 mb-1">
                {activeTicket.counter_name || counterName(activeTicket.counter_id)}
              </div>
              {activeTicket.customer_name && (
                <div className="text-sm font-semibold text-slate-600 mb-4">
                  Atas Nama: {activeTicket.customer_name}
                </div>
              )}
              <div className="flex justify-center items-center text-xs text-slate-400 space-x-1.5 border-t border-slate-200/50 pt-3">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date().toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-primary-50 text-primary-900 p-4 rounded-2xl text-xs font-semibold leading-relaxed border border-primary-100 flex items-center gap-2 text-left">
              <Sparkles className="w-5 h-5 text-primary-600 shrink-0" />
              <span>Status antrean Anda diperbarui secara otomatis secara real-time. Panggilan suara akan berbunyi saat giliran Anda tiba.</span>
            </div>

            <Button
              className="w-full py-3.5 rounded-xl font-bold"
              onClick={() => setIsModalOpen(false)}
            >
              Lihat Tiket Antrean
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TakeQueue;
