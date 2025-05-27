"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheStats = exports.clearCacheByUrl = exports.clearCacheByKey = exports.clearCache = exports.cache = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const cache = (duration = 300) => {
    return async (req, res, next) => {
        try {
            const key = `cache:${req.method}:${req.originalUrl}`;
            const cached = await redis_1.default.get(key);
            if (cached) {
                res.json(typeof cached === 'string' ? JSON.parse(cached) : cached);
                return;
            }
            const originalJson = res.json.bind(res);
            res.json = (data) => {
                redis_1.default.setex(key, duration, JSON.stringify(data)).catch((error) => {
                    console.error('Cache set error:', error);
                });
                return originalJson(data);
            };
            next();
        }
        catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};
exports.cache = cache;
const clearCache = (pattern = '*') => {
    return async (req, res, next) => {
        try {
            if (pattern === '*') {
                const cachePattern = 'cache:*';
                try {
                    const keys = await redis_1.default.keys ? await redis_1.default.keys(cachePattern) : [];
                    if (keys.length > 0) {
                        await redis_1.default.del(...keys);
                    }
                }
                catch {
                    // fallback for KEYS unavailability
                }
            }
            else {
                try {
                    const keys = await redis_1.default.keys ? await redis_1.default.keys(pattern) : [];
                    if (keys.length > 0) {
                        await redis_1.default.del(...keys);
                    }
                }
                catch { }
            }
        }
        catch (error) {
            console.error('Cache clear error:', error);
        }
        next();
    };
};
exports.clearCache = clearCache;
const clearCacheByKey = async (key) => {
    try {
        const fullKey = key.startsWith('cache:') ? key : `cache:${key}`;
        const result = await redis_1.default.del(fullKey);
        return result > 0;
    }
    catch (error) {
        console.error('Error clearing cache key:', error);
        return false;
    }
};
exports.clearCacheByKey = clearCacheByKey;
const clearCacheByUrl = async (urlPattern) => {
    try {
        const pattern = `cache:*:${urlPattern}*`;
        const keys = await redis_1.default.keys ? await redis_1.default.keys(pattern) : [];
        if (keys.length > 0) {
            await redis_1.default.del(...keys);
            return keys.length;
        }
        return 0;
    }
    catch (error) {
        console.error('Error clearing cache by URL pattern:', error);
        return 0;
    }
};
exports.clearCacheByUrl = clearCacheByUrl;
const getCacheStats = async () => {
    try {
        const allKeys = await redis_1.default.keys ? await redis_1.default.keys('*') : [];
        const cacheKeys = await redis_1.default.keys ? await redis_1.default.keys('cache:*') : [];
        return {
            totalKeys: allKeys.length,
            cacheKeys: cacheKeys.length
        };
    }
    catch (error) {
        console.error('Error getting cache stats:', error);
        return { totalKeys: 0, cacheKeys: 0 };
    }
};
exports.getCacheStats = getCacheStats;
