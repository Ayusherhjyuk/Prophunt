import { Redis } from '@upstash/redis';

// Function to convert Redis URL to Upstash HTTPS format
const convertToUpstashUrl = (redisUrl: string): string => {
  try {
    if (redisUrl.startsWith('https://')) {
      return redisUrl;
    }
    
    if (redisUrl.startsWith('rediss://') || redisUrl.startsWith('redis://')) {
      const url = new URL(redisUrl);
      // For Upstash, convert to HTTPS format
      return `https://${url.hostname}`;
    }
    
    // If it's just a hostname, assume HTTPS
    return redisUrl.startsWith('http') ? redisUrl : `https://${redisUrl}`;
  } catch (error) {
    console.error('Error parsing Redis URL:', error);
    throw new Error(`Invalid Redis URL format: ${redisUrl}`);
  }
};

// Create Redis instance with proper URL conversion
const redis = new Redis({
  url: convertToUpstashUrl(process.env.REDIS_URL!),
  token: process.env.REDIS_TOKEN!,
});

export const connectRedis = async () => {
  try {
    console.log('🔴 Connecting to Redis...');
    console.log('📍 Redis URL:', convertToUpstashUrl(process.env.REDIS_URL!));
    
    // Test connection with a simple ping
    const result = await redis.ping();
    console.log('✅ Redis ping result:', result);
    return redis;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

// Export the redis instance for use in other parts of your app
export default redis;

// Utility functions for common Redis operations
export const redisUtils = {
  // Set key with expiration
  setWithExpiry: async (key: string, value: any, seconds: number = 3600) => {
    return await redis.setex(key, seconds, JSON.stringify(value));
  },
  
  // Get and parse JSON
  getJSON: async (key: string) => {
    const value = await redis.get(key);
    return value ? JSON.parse(value as string) : null;
  },
  
  // Delete key
  delete: async (key: string) => {
    return await redis.del(key);
  },
  
  // Check if key exists
  exists: async (key: string) => {
    return await redis.exists(key);
  },
  
  // Set multiple keys
  mset: async (keyValuePairs: Record<string, any>) => {
    const pairs: [string, string][] = [];
    Object.entries(keyValuePairs).forEach(([key, value]) => {
      pairs.push([key, JSON.stringify(value)]);
    });
    // Use Object.fromEntries to create proper key-value object
    const keyValueObj = Object.fromEntries(pairs);
    return await redis.mset(keyValueObj);
  }
};