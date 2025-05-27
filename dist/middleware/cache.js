"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheStats = exports.clearCacheByUrl = exports.clearCacheByKey = exports.clearCache = exports.cache = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const cache = (duration = 300) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const key = `cache:${req.method}:${req.originalUrl}`;
            const cached = yield redis_1.default.get(key);
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
    });
};
exports.cache = cache;
const clearCache = (pattern = '*') => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (pattern === '*') {
                const cachePattern = 'cache:*';
                try {
                    const keys = (yield redis_1.default.keys) ? yield redis_1.default.keys(cachePattern) : [];
                    if (keys.length > 0) {
                        yield redis_1.default.del(...keys);
                    }
                }
                catch (_a) {
                    // fallback for KEYS unavailability
                }
            }
            else {
                try {
                    const keys = (yield redis_1.default.keys) ? yield redis_1.default.keys(pattern) : [];
                    if (keys.length > 0) {
                        yield redis_1.default.del(...keys);
                    }
                }
                catch (_b) { }
            }
        }
        catch (error) {
            console.error('Cache clear error:', error);
        }
        next();
    });
};
exports.clearCache = clearCache;
const clearCacheByKey = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fullKey = key.startsWith('cache:') ? key : `cache:${key}`;
        const result = yield redis_1.default.del(fullKey);
        return result > 0;
    }
    catch (error) {
        console.error('Error clearing cache key:', error);
        return false;
    }
});
exports.clearCacheByKey = clearCacheByKey;
const clearCacheByUrl = (urlPattern) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pattern = `cache:*:${urlPattern}*`;
        const keys = (yield redis_1.default.keys) ? yield redis_1.default.keys(pattern) : [];
        if (keys.length > 0) {
            yield redis_1.default.del(...keys);
            return keys.length;
        }
        return 0;
    }
    catch (error) {
        console.error('Error clearing cache by URL pattern:', error);
        return 0;
    }
});
exports.clearCacheByUrl = clearCacheByUrl;
const getCacheStats = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allKeys = (yield redis_1.default.keys) ? yield redis_1.default.keys('*') : [];
        const cacheKeys = (yield redis_1.default.keys) ? yield redis_1.default.keys('cache:*') : [];
        return {
            totalKeys: allKeys.length,
            cacheKeys: cacheKeys.length
        };
    }
    catch (error) {
        console.error('Error getting cache stats:', error);
        return { totalKeys: 0, cacheKeys: 0 };
    }
});
exports.getCacheStats = getCacheStats;
