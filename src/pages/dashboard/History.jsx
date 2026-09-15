import React, { useState, useEffect } from 'react';
import queueService from '../../api/queueService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import Modal from '../../components/ui/Modal';
import { 
  History as HistoryIcon, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  User, 
  Calendar, 
  FileText, 
  Printer, 
  Search, 
  BarChart3, 
  PieChart, 
  Layers, 
  CheckCheck, 
  Ban, 
  TrendingUp, 
  Info,
  ExternalLink
} from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [counters, setCounters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [counterFilter, setCounterFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQueue, setSelectedQueue] = useState(null);

  // Get current user role
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isOperatorOrAdmin = user?.role === 'operator' || user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [historyData, countersData] = await Promise.all([
        queueService.getHistory(),
        queueService.getCounters(),
      ]);

      setCounters(countersData || []);

      if (isOperatorOrAdmin) {
        setHistory(historyData || []);
      } else {
        // Filter history for normal user: ONLY show their own tickets
        const myTicketIds = JSON.parse(localStorage.getItem('queuego_my_ticket_ids') || '[]');
        const activeTicket = JSON.parse(localStorage.getItem('queuego_active_ticket') || 'null');
        if (activeTicket?.id && !myTicketIds.includes(activeTicket.id)) {
          myTicketIds.push(activeTicket.id);
        }

        const userTickets = (historyData || []).filter((q) => {
          if (myTicketIds.includes(q.id)) return true;
          if (user?.name && q.customer_name && q.customer_name.trim().toLowerCase() === user.name.trim().toLowerCase()) {
            return true;
          }
          return false;
        });

        setHistory(userTickets);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Selesai
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" /> Dilewati
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 mr-1 text-slate-500" /> Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" /> {status}
          </span>
        );
    }
  };

  // Helper for duration calculation
  const calculateDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return '-';
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end - start;
    if (diffMs <= 0 || isNaN(diffMs)) return '-';

    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMins > 0) {
      return `${diffMins} mnt ${diffSecs} dtk`;
    }
    return `${diffSecs} dtk`;
  };

  // Filter logic
  const filteredHistory = history.filter((q) => {
    // Status filter
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    // Counter filter
    if (counterFilter !== 'all' && q.counter_id !== parseInt(counterFilter)) return false;
    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchName = q.customer_name?.toLowerCase().includes(query);
      const matchNumber = q.queue_number?.toLowerCase().includes(query);
      if (!matchName && !matchNumber) return false;
    }
    return true;
  });

  // Stats calculations
  const totalTickets = history.length;
  const completedCount = history.filter((q) => q.status === 'completed').length;
  const skippedCount = history.filter((q) => q.status === 'skipped').length;
  const cancelledCount = history.filter((q) => q.status === 'cancelled').length;
  const successRate = totalTickets > 0 ? Math.round((completedCount / totalTickets) * 100) : 0;

  // Counter name mapping
  const getCounterName = (counterId) => {
    const c = counters.find((ct) => ct.id === counterId);
    return c?.name || `Loket ${counterId}`;
  };

  // PDF Export Function
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Print-Only Header Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
            <HistoryIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isOperatorOrAdmin ? 'Laporan & Analytics Antrean' : 'Histori Antrean Saya'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isOperatorOrAdmin
                ? 'Analisis performa layanan, rekapitulasi data, dan ekspor laporan antrean'
                : 'Catatan seluruh nomor antrean milik Anda'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={fetchData} disabled={isLoading} className="rounded-xl">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          {isOperatorOrAdmin && (
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md font-bold flex items-center gap-2"
              onClick={handleExportPDF}
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF / Cetak</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Printable Section */}
      <div id="printable-area" className="space-y-6">

        {/* PDF Document Print Header (Only visible in Print) */}
        <div className="hidden print:block border-b border-slate-300 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-900">QueueGo System</h1>
              <p className="text-xs text-slate-500">Laporan Rekapitulasi Layanan Antrean Harian</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Dicetak pada: {new Date().toLocaleString('id-ID')}</div>
              <div>Oleh: {user?.name || 'Operator'} ({user?.role || 'operator'})</div>
            </div>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 border border-slate-100 shadow-md rounded-2xl text-center relative overflow-hidden">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">{totalTickets}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Total Antrean
            </div>
          </Card>

          <Card className="p-5 border border-emerald-100 bg-emerald-50/50 shadow-md rounded-2xl text-center">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-1">{completedCount}</div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> Selesai
            </div>
          </Card>

          <Card className="p-5 border border-rose-100 bg-rose-50/50 shadow-md rounded-2xl text-center">
            <div className="text-3xl sm:text-4xl font-black text-rose-500 mb-1">{skippedCount}</div>
            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center justify-center gap-1">
              <Ban className="w-3.5 h-3.5" /> Dilewati
            </div>
          </Card>

          <Card className="p-5 border border-primary-100 bg-primary-50/50 shadow-md rounded-2xl text-center">
            <div className="text-3xl sm:text-4xl font-black text-primary-600 mb-1">{successRate}%</div>
            <div className="text-xs font-bold text-primary-700 uppercase tracking-wider flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Keberhasilan
            </div>
          </Card>
        </div>

        {/* Visual Analytics Charts Section (Operators & Admins) */}
        {isOperatorOrAdmin && counters.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Bar Chart: Counter Distribution */}
            <Card className="p-6 border border-slate-100 shadow-xl rounded-3xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  <h3 className="font-extrabold text-slate-800 text-base">Grafik Distribusi per Loket</h3>
                </div>
                <span className="text-xs font-bold text-slate-400">Total {totalTickets} Tiket</span>
              </div>

              <div className="space-y-4">
                {counters.map((counter) => {
                  const counterQueues = history.filter((q) => q.counter_id === counter.id);
                  const count = counterQueues.length;
                  const percentage = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
                  const completed = counterQueues.filter((q) => q.status === 'completed').length;

                  return (
                    <div key={counter.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{counter.name}</span>
                        <span>{count} antrean ({percentage}%) • {completed} selesai</span>
                      </div>
                      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="bg-primary-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Donut/Status Summary Chart */}
            <Card className="p-6 border border-slate-100 shadow-xl rounded-3xl flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-800 text-base">Rasio Status Pelayanan</h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {successRate}% Tingkat Sukses
                </span>
              </div>

              {/* Progress Distribution Bar */}
              <div className="space-y-4 my-auto">
                <div className="h-6 w-full bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${totalTickets > 0 ? (completedCount / totalTickets) * 100 : 0}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Selesai: ${completedCount}`}
                  />
                  <div
                    style={{ width: `${totalTickets > 0 ? (skippedCount / totalTickets) * 100 : 0}%` }}
                    className="bg-rose-500 h-full transition-all duration-500"
                    title={`Dilewati: ${skippedCount}`}
                  />
                  <div
                    style={{ width: `${totalTickets > 0 ? (cancelledCount / totalTickets) * 100 : 0}%` }}
                    className="bg-slate-400 h-full transition-all duration-500"
                    title={`Dibatalkan: ${cancelledCount}`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <span className="block font-black text-emerald-700 text-sm">{completedCount}</span>
                    <span className="text-emerald-800 font-semibold text-[11px]">🟢 Selesai</span>
                  </div>
                  <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                    <span className="block font-black text-rose-700 text-sm">{skippedCount}</span>
                    <span className="text-rose-800 font-semibold text-[11px]">🔴 Dilewati</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="block font-black text-slate-700 text-sm">{cancelledCount}</span>
                    <span className="text-slate-600 font-semibold text-[11px]">⚪ Dibatalkan</span>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* Search & Multi-Filter Controls (Hidden on Print) */}
        <div className="flex flex-col md:flex-row gap-3 no-print">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama pelanggan atau nomor antrean..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Selesai</option>
              <option value="skipped">Dilewati</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            {/* Counter Filter (Only if counters exist) */}
            {counters.length > 0 && (
              <select
                value={counterFilter}
                onChange={(e) => setCounterFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              >
                <option value="all">Semua Loket</option>
                {counters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Detailed History Table */}
        <Card className="overflow-hidden p-0 border border-slate-100 shadow-xl rounded-3xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    No. Antrean
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Loket Layanan
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Waktu Dipanggil / Selesai
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Durasi Layanan
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider no-print">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                      Memuat data histori & analytics...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">
                      Tidak ada data riwayat antrean yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((queue) => {
                    const duration = calculateDuration(queue.called_at, queue.completed_at);

                    return (
                      <tr
                        key={queue.id}
                        onClick={() => setSelectedQueue(queue)}
                        className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-black text-slate-900 group-hover:text-primary-600 transition-colors">
                            {queue.queue_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-semibold text-slate-800">
                            <User className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                            {queue.customer_name || 'Tanpa Nama'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-extrabold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                            {getCounterName(queue.counter_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-600">
                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                            {queue.completed_at
                              ? new Date(queue.completed_at).toLocaleString('id-ID')
                              : queue.called_at
                              ? new Date(queue.called_at).toLocaleString('id-ID')
                              : new Date(queue.created_at).toLocaleString('id-ID')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-700">
                          {duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(queue.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center no-print">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQueue(queue);
                            }}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Antrean"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Ticket Detail Drilldown Modal */}
      <Modal
        isOpen={!!selectedQueue}
        onClose={() => setSelectedQueue(null)}
        title={`Detail Antrean #${selectedQueue?.queue_number}`}
      >
        {selectedQueue && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3">
              <div className="text-6xl font-black text-slate-900 tracking-tight">
                {selectedQueue.queue_number}
              </div>
              <div className="text-lg font-bold text-primary-600">
                {getCounterName(selectedQueue.counter_id)}
              </div>
              <div>{getStatusBadge(selectedQueue.status)}</div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Nama Pelanggan</span>
                <span className="font-bold text-slate-900">{selectedQueue.customer_name || 'Tanpa Nama'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Waktu Diambil</span>
                <span className="font-bold text-slate-800">
                  {selectedQueue.created_at ? new Date(selectedQueue.created_at).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Waktu Pertama Dipanggil</span>
                <span className="font-bold text-slate-800">
                  {selectedQueue.called_at ? new Date(selectedQueue.called_at).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Waktu Selesai / Dilewati</span>
                <span className="font-bold text-slate-800">
                  {selectedQueue.completed_at ? new Date(selectedQueue.completed_at).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 bg-primary-50/50 p-2.5 rounded-xl">
                <span className="font-bold text-primary-900">Total Durasi Pelayanan</span>
                <span className="font-extrabold text-primary-700">
                  {calculateDuration(selectedQueue.called_at, selectedQueue.completed_at)}
                </span>
              </div>
            </div>

            <Button className="w-full py-3 rounded-xl font-bold" onClick={() => setSelectedQueue(null)}>
              Tutup Detail
            </Button>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default History;
