import React, { useState, useEffect } from 'react';
import queueService from '../../api/queueService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { History as HistoryIcon, Clock, CheckCircle, XCircle, RefreshCw, User, Calendar } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Get current user role
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isOperatorOrAdmin = user?.role === 'operator' || user?.role === 'admin';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await queueService.getHistory();
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Selesai
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Dilewati
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 mr-1" /> {status}
          </span>
        );
    }
  };

  // Filter logic
  const filteredHistory =
    filter === 'all'
      ? history
      : history.filter((q) => q.status === filter);

  // Stats
  const completedCount = history.filter((q) => q.status === 'completed').length;
  const skippedCount = history.filter((q) => q.status === 'skipped').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isOperatorOrAdmin ? 'Histori Layanan Antrean' : 'Histori Antrean Saya'}
            </h1>
            <p className="text-sm text-gray-500">
              {isOperatorOrAdmin
                ? 'Daftar seluruh antrean yang telah diproses hari ini'
                : 'Catatan pengambilan nomor antrean Anda'}
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={fetchHistory} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center py-4">
          <div className="text-3xl font-black text-gray-800">{history.length}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">Total Tiket</div>
        </Card>
        <Card className="text-center py-4 bg-green-50/50 border-green-100">
          <div className="text-3xl font-black text-green-600">{completedCount}</div>
          <div className="text-xs font-medium text-green-700 mt-1">Selesai</div>
        </Card>
        <Card className="text-center py-4 bg-red-50/50 border-red-100">
          <div className="text-3xl font-black text-red-500">{skippedCount}</div>
          <div className="text-xs font-medium text-red-600 mt-1">Dilewati</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Semua Status' },
          { key: 'completed', label: 'Selesai' },
          { key: 'skipped', label: 'Dilewati' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0 border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  No. Antrean
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Loket
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                    Memuat data histori...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    Belum ada riwayat antrean untuk ditampilkan.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((queue) => (
                  <tr key={queue.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-black text-gray-900">
                        {queue.queue_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-800">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {queue.customer_name || 'Tanpa Nama'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
                        Loket {queue.counter_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {queue.completed_at
                          ? new Date(queue.completed_at).toLocaleString('id-ID')
                          : queue.called_at
                          ? new Date(queue.called_at).toLocaleString('id-ID')
                          : new Date(queue.created_at).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(queue.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default History;
