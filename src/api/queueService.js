/**
 * queueService.js
 * Centralized API wrapper for OPERATOR queue actions.
 * All queue-related API calls go through this service.
 */
import api from './axios';

const queueService = {
  // ==========================================
  // READ
  // ==========================================

  /** Fetch daftar loket */
  getCounters: () => api.get('/api/counters').then(res => res.data?.data || res.data || []),

  /** Fetch antrean hari ini */
  getQueuesToday: () => api.get('/api/queues/today').then(res => res.data?.data || res.data || []),

  /** Fetch riwayat antrean */
  getHistory: () => api.get('/api/queues/history').then(res => res.data?.data || res.data || []),

  // ==========================================
  // OPERATOR ACTIONS
  // ==========================================

  /** Panggil antrean berikutnya untuk counter tertentu */
  callNext: (counterId) => api.post(`/api/queues/${counterId}/call`).then(res => res.data),

  /** Panggil ulang antrean */
  recall: (queueId) => api.post(`/api/queues/${queueId}/recall`).then(res => res.data),

  /** Mulai melayani antrean */
  serve: (queueId) => api.post(`/api/queues/${queueId}/serve`).then(res => res.data),

  /** Selesaikan antrean */
  complete: (queueId) => api.post(`/api/queues/${queueId}/complete`).then(res => res.data),

  /** Lewati antrean */
  skip: (queueId) => api.post(`/api/queues/${queueId}/skip`).then(res => res.data),
};

export default queueService;
