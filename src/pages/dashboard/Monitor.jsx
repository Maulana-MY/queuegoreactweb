import React, { useState, useEffect, useRef } from 'react';
import queueService from '../../api/queueService';
import Card from '../../components/ui/Card';
import { playQueueAnnouncement } from '../../utils/tts';
import { Volume2, Monitor as MonitorIcon } from 'lucide-react';

const AUTO_REFRESH_MS = 5000;

const Monitor = () => {
  const [counters, setCounters] = useState([]);
  const [queues, setQueues] = useState([]);
  const [lastCalled, setLastCalled] = useState(null);
  const intervalRef = useRef(null);
  const prevLastCalledIdRef = useRef(null);
  const prevCalledAtRef = useRef(null);

  const fetchData = async () => {
    try {
      const [countersData, queuesData] = await Promise.all([
        queueService.getCounters(),
        queueService.getQueuesToday(),
      ]);

      setCounters(countersData);
      setQueues(queuesData);

      // Find the most recently called/serving queue
      const activeQueues = queuesData.filter(
        (q) => q.status === 'serving' || q.status === 'calling'
      );
      if (activeQueues.length > 0) {
        // Sort by called_at descending
        activeQueues.sort(
          (a, b) => new Date(b.called_at || b.created_at) - new Date(a.called_at || a.created_at)
        );

        const latest = activeQueues[0];
        setLastCalled(latest);

        // Auto-play voice if a new queue is called OR if called_at changed (recall)
        const isNewQueue = prevLastCalledIdRef.current !== latest.id;
        const isRecall = prevCalledAtRef.current !== latest.called_at;

        if (isNewQueue || isRecall) {
          prevLastCalledIdRef.current = latest.id;
          prevCalledAtRef.current = latest.called_at;
          const counterObj = countersData.find((c) => c.id === latest.counter_id);
          playQueueAnnouncement(
            latest.queue_number,
            latest.customer_name,
            counterObj?.name || `Loket ${latest.counter_id}`
          );
        }
      }
    } catch (error) {
      console.error('Error fetching monitor data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, AUTO_REFRESH_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleSpeakCurrent = () => {
    if (!lastCalled) return;
    const counterObj = counters.find((c) => c.id === lastCalled.counter_id);
    playQueueAnnouncement(
      lastCalled.queue_number,
      lastCalled.customer_name,
      counterObj?.name || `Loket ${lastCalled.counter_id}`
    );
  };

  // Waiting stats
  const totalWaiting = queues.filter((q) => q.status === 'waiting').length;
  const totalServed = queues.filter((q) => q.status === 'completed').length;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Current Called Queue */}
      <Card className="text-center py-12 lg:py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <MonitorIcon size={200} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <button
            onClick={handleSpeakCurrent}
            className="flex items-center space-x-3 bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
          >
            <Volume2 className="animate-pulse" />
            <span className="text-xl font-medium tracking-wide uppercase">
              Sedang Dipanggil (Klik Suara)
            </span>
          </button>

          <h1 className="text-8xl lg:text-[10rem] font-black tracking-tighter leading-none drop-shadow-lg">
            {lastCalled ? lastCalled.queue_number : '---'}
          </h1>

          {lastCalled && (
            <>
              <div className="text-2xl font-medium text-primary-100">
                {lastCalled.customer_name ? `Atas Nama: ${lastCalled.customer_name}` : 'Tanpa Nama'}
              </div>
              <div className="mt-4 text-3xl font-light text-primary-100">
                Silakan Menuju{' '}
                <span className="font-bold text-white">
                  {counters.find((c) => c.id === lastCalled.counter_id)?.name ||
                    `Loket ${lastCalled.counter_id}`}
                </span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center py-6">
          <div className="text-4xl font-black text-orange-500">{totalWaiting}</div>
          <div className="text-sm font-medium text-gray-500 mt-1">Masih Menunggu</div>
        </Card>
        <Card className="text-center py-6">
          <div className="text-4xl font-black text-green-500">{totalServed}</div>
          <div className="text-sm font-medium text-gray-500 mt-1">Sudah Dilayani</div>
        </Card>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {counters.map((counter) => {
          const activeQueue = queues.find(
            (q) =>
              q.counter_id === counter.id &&
              (q.status === 'serving' || q.status === 'calling')
          );
          const counterWaiting = queues.filter(
            (q) => q.counter_id === counter.id && q.status === 'waiting'
          ).length;

          return (
            <Card
              key={counter.id}
              className="flex flex-col items-center justify-center py-10 transition-transform hover:scale-[1.02]"
            >
              <h2 className="text-2xl font-bold text-gray-500 mb-4">
                {counter.name}
              </h2>
              <div
                className={`text-6xl font-black ${
                  activeQueue ? 'text-primary-600' : 'text-gray-300'
                }`}
              >
                {activeQueue ? activeQueue.queue_number : '---'}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
                {activeQueue
                  ? activeQueue.status === 'calling'
                    ? '📢 Dipanggil'
                    : '🟢 Dilayani'
                  : 'Kosong'}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {counterWaiting} antrean menunggu
              </div>
            </Card>
          );
        })}
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-4">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Live Monitor • Auto-refresh setiap 5 detik
      </div>
    </div>
  );
};

export default Monitor;
