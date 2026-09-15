import { useState, useCallback, useEffect } from 'react';
import queueService from '../api/queueService';

export const useQueueStore = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodayQueues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await queueService.getQueuesToday();
      setQueues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCallNext = async (counterId) => {
    try {
      await queueService.callNext(counterId);
      await fetchTodayQueues();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkip = async (queueId) => {
    try {
      await queueService.skip(queueId);
      await fetchTodayQueues();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (queueId) => {
    try {
      await queueService.complete(queueId);
      await fetchTodayQueues();
    } catch (err) {
      console.error(err);
    }
  };

  return {
    queues,
    loading,
    error,
    fetchTodayQueues,
    handleCallNext,
    handleSkip,
    handleComplete,
  };
};
