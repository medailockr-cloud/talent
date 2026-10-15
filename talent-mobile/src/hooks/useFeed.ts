import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';

export function useFeed(userId?: number) {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isFetchingRef = useRef(false);

  const fetchVideos = useCallback(async (isRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const url = userId ? `/feed?userId=${userId}&limit=10` : '/feed?limit=10';
      const res = await api.get(url);
      const incoming = Array.isArray(res.data?.videos) ? res.data.videos : [];
      setVideos(incoming);
      setHasMore(incoming.length >= 10);
    } catch (err) {
      console.error('Failed to load feed videos:', err);
      setError(err instanceof Error ? err : new Error('Failed to load feed'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore || isLoadingMore || videos.length === 0) return;
    isFetchingRef.current = true;
    setIsLoadingMore(true);

    try {
      const lastVideo = videos[videos.length - 1];
      const cursor = lastVideo?.id;
      const url = userId 
        ? `/feed?userId=${userId}&limit=10&cursor=${cursor}` 
        : `/feed?limit=10&cursor=${cursor}`;

      const res = await api.get(url);
      const incoming = Array.isArray(res.data?.videos) ? res.data.videos : [];

      if (incoming.length === 0) {
        setHasMore(false);
      } else {
        // Filter out any duplicates
        setVideos((prev) => {
          const existingIds = new Set(prev.map((v) => v.id));
          const fresh = incoming.filter((v: any) => !existingIds.has(v.id));
          if (fresh.length === 0) setHasMore(false);
          return [...prev, ...fresh];
        });
        setHasMore(incoming.length >= 10);
      }
    } catch (err) {
      console.warn('Failed to load more feed videos:', err);
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [userId, hasMore, isLoadingMore, videos]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refetch: () => fetchVideos(true),
    loadMore,
  };
}
