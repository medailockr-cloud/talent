import { useState, useEffect } from 'react';

export function useFeed(userId?: number) {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const url = userId ? `http://localhost:3000/api/feed?userId=${userId}` : 'http://localhost:3000/api/feed';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      setVideos(data.videos);
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
