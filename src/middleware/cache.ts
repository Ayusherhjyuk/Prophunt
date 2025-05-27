
import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

export const cache = (duration: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.originalUrl;
      const cached = await redisClient.get(key);

      if (cached) {
        res.json(JSON.parse(cached));
        return; 
      }

      
      const originalJson = res.json.bind(res);

      res.json = (data: any) => {
        redisClient.setEx(key, duration, JSON.stringify(data)).catch(() => {
         
        });
        return originalJson(data);
      };

      next();
    } catch (error) {
      next(); 
    }
  };
};

export const clearCache = (pattern: string = '*') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(` Cleared cache keys: ${keys}`);
      }
    } catch (error) {
      console.error(' Cache clear error:', error);
    }
    next();
  };
};

