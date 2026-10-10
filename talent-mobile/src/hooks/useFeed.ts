import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function useFeed(userId?: number) {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const url = userId ? `/feed?userId=${userId}` : '/feed';
      const res = await api.get(url);
      setVideos(res.data.videos);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [userId]);

  return { videos, isLoading, error, refetch: fetchVideos };
}
