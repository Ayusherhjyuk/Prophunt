import { Redis } from '@upstash/redis';

const convertToUpstashUrl = (redisUrl: string): string => {
  try {
    if (redisUrl.startsWith('https://')) {
      return redisUrl;
    }
    
    if (redisUrl.startsWith('rediss://') || redisUrl.startsWith('redis://')) {
      const url = new URL(redisUrl);
      return `https://${url.hostname}`;
    }
    
    return redisUrl.startsWith('http') ? redisUrl : `https://${redisUrl}`;
  } catch (error) {
    console.error('Error parsing Redis URL:', error);
    throw new Error(`Invalid Redis URL format: ${redisUrl}`);
  }
};

const redis = new Redis({
  url: convertToUpstashUrl(process.env.REDIS_URL!),
  token: process.env.REDIS_TOKEN!,
});

export const connectRedis = async () => {
  try {
    console.log('🔴 Connecting to Redis...');
    console.log('📍 Redis URL:', convertToUpstashUrl(process.env.REDIS_URL!));
    const result = await redis.ping();
    console.log('✅ Redis ping result:', result);
    return redis;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

export default redis;

export const redisUtils = {
  setWithExpiry: async (key: string, value: any, seconds: number = 3600) => {
    return await redis.setex(key, seconds, JSON.stringify(value));
  },
  getJSON: async (key: string) => {
    const value = await redis.get(key);
    return value ? JSON.parse(value as string) : null;
  },
  delete: async (key: string) => {
    return await redis.del(key);
  },
  exists: async (key: string) => {
    return await redis.exists(key);
  },
  mset: async (keyValuePairs: Record<string, any>) => {
    const pairs: [string, string][] = [];
    Object.entries(keyValuePairs).forEach(([key, value]) => {
      pairs.push([key, JSON.stringify(value)]);
    });
    const keyValueObj = Object.fromEntries(pairs);
    return await redis.mset(keyValueObj);
  }
};
