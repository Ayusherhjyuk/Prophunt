import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

export const cache = (duration: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = `cache:${req.method}:${req.originalUrl}`;
      const cached = await redisClient.get(key);

      if (cached) {
        res.json(typeof cached === 'string' ? JSON.parse(cached) : cached);
        return; 
      }

      const originalJson = res.json.bind(res);

      res.json = (data: any) => {
        redisClient.setex(key, duration, JSON.stringify(data)).catch((error) => {
          console.error('Cache set error:', error);
        });
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); 
    }
  };
};

export const clearCache = (pattern: string = '*') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (pattern === '*') {
        const cachePattern = 'cache:*';
        try {
          const keys = await redisClient.keys ? await redisClient.keys(cachePattern) : [];
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        } catch {
          // fallback for KEYS unavailability
        }
      } else {
        try {
          const keys = await redisClient.keys ? await redisClient.keys(pattern) : [];
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        } catch {}
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
    next();
  };
};

export const clearCacheByKey = async (key: string): Promise<boolean> => {
  try {
    const fullKey = key.startsWith('cache:') ? key : `cache:${key}`;
    const result = await redisClient.del(fullKey);
    return result > 0;
  } catch (error) {
    console.error('Error clearing cache key:', error);
    return false;
  }
};

export const clearCacheByUrl = async (urlPattern: string): Promise<number> => {
  try {
    const pattern = `cache:*:${urlPattern}*`;
    const keys = await redisClient.keys ? await redisClient.keys(pattern) : [];
    if (keys.length > 0) {
      await redisClient.del(...keys);
      return keys.length;
    }
    return 0;
  } catch (error) {
    console.error('Error clearing cache by URL pattern:', error);
    return 0;
  }
};

export const getCacheStats = async (): Promise<{ totalKeys: number; cacheKeys: number }> => {
  try {
    const allKeys = await redisClient.keys ? await redisClient.keys('*') : [];
    const cacheKeys = await redisClient.keys ? await redisClient.keys('cache:*') : [];
    return {
      totalKeys: allKeys.length,
      cacheKeys: cacheKeys.length
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalKeys: 0, cacheKeys: 0 };
  }
};
