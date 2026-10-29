import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Server } from 'socket.io';

// Create a robust Redis client that doesn't crash if Redis isn't running locally
// In production, configure process.env.REDIS_URL
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redis = new Redis(redisUrl, {
  enableOfflineQueue: false,
  connectTimeout: 1500,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    // Stop retrying quickly if there's no redis server available locally
    if (times > 2) {
      return null;
    }
    return Math.min(times * 50, 500);
  },
});

// Suppress uncaught connection error spam when Redis is offline
redis.on('error', (_err) => {
  // Silent fallback: caching functions already check if redis.status === 'ready'
});

export const cacheFeed = async (key: string, data: any) => {
  try {
    if (redis.status === 'ready') {
      await redis.setex(key, 60 * 5, JSON.stringify(data)); // Cache for 5 mins
    }
  } catch (err) {
    console.error('Redis cache error:', err);
  }
};

export const getCachedFeed = async (key: string) => {
  try {
    if (redis.status === 'ready') {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    }
  } catch (err) {
    console.error('Redis fetch error:', err);
  }
  return null;
};

export const invalidateFeedCache = async () => {
  try {
    if (redis.status === 'ready') {
      const keys = await redis.keys('feed_*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch (err) {
    console.error('Redis cache invalidation error:', err);
  }
};

/**
 * Attaches the Redis adapter to Socket.IO for multi-instance scaling in production (e.g. Cloud Run).
 */
export const setupSocketRedisAdapter = (io: Server) => {
  // Check if REDIS_URL is explicitly configured for production
  if (process.env.REDIS_URL) {
    try {
      const pubClient = new Redis(redisUrl, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: null,
      });
      const subClient = pubClient.duplicate();

      pubClient.on('error', () => {
        // Catch connection errors if Redis is restarting
      });
      subClient.on('error', () => {
        // Catch connection errors if Redis is restarting
      });

      io.adapter(createAdapter(pubClient, subClient));
      console.log('Socket.IO Redis adapter enabled for multi-instance clustering.');
    } catch (err) {
      console.warn('Failed to configure Socket.IO Redis adapter, continuing in standalone mode:', err);
    }
  }
};
