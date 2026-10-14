import Redis from 'ioredis';

// Create a robust Redis client that doesn't crash if Redis isn't running locally
// In production, configure process.env.REDIS_URL
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    // Stop retrying if there's no redis server available after 3 tries (useful for local dev)
    if (times > 3) {
      console.log('Redis server not found, caching will be disabled gracefully.');
      return null;
    }
    return Math.min(times * 50, 2000);
  },
});

// Suppress uncaught connection error spam when Redis is offline
redis.on('error', (err) => {
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
