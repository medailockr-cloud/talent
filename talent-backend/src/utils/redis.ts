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
 * Gracefully falls back to standalone in-memory Socket.IO if Redis is unreachable or absent.
 */
export const setupSocketRedisAdapter = (io: Server) => {
  if (!process.env.REDIS_URL) {
    return;
  }

  try {
    const pubClient = new Redis(redisUrl, {
      lazyConnect: true,
      connectTimeout: 3000,
      maxRetriesPerRequest: null,
      retryStrategy: () => null, // Do not hang retrying on server boot if Redis is down
    });
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) => {
      // Suppress connection errors if Redis is restarting or offline
    });
    subClient.on('error', (err) => {
      // Suppress connection errors if Redis is restarting or offline
    });

    Promise.all([pubClient.connect(), subClient.connect()])
      .then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log('Socket.IO Redis adapter enabled for multi-instance clustering.');
      })
      .catch((err) => {
        console.warn('Redis unavailable for Socket.IO adapter. Operating in standalone in-memory mode:', err.message);
      });
  } catch (err: any) {
    console.warn('Failed to configure Socket.IO Redis adapter, continuing in standalone mode:', err?.message || err);
  }
};
