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
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisUtils = exports.connectRedis = void 0;
const redis_1 = require("@upstash/redis");
// Function to convert Redis URL to Upstash HTTPS format
const convertToUpstashUrl = (redisUrl) => {
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
    }
    catch (error) {
        console.error('Error parsing Redis URL:', error);
        throw new Error(`Invalid Redis URL format: ${redisUrl}`);
    }
};
// Create Redis instance with proper URL conversion
const redis = new redis_1.Redis({
    url: convertToUpstashUrl(process.env.REDIS_URL),
    token: process.env.REDIS_TOKEN,
});
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔴 Connecting to Redis...');
        console.log('📍 Redis URL:', convertToUpstashUrl(process.env.REDIS_URL));
        // Test connection with a simple ping
        const result = yield redis.ping();
        console.log('✅ Redis ping result:', result);
        return redis;
    }
    catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
        throw error;
    }
});
exports.connectRedis = connectRedis;
// Export the redis instance for use in other parts of your app
exports.default = redis;
// Utility functions for common Redis operations
exports.redisUtils = {
    // Set key with expiration
    setWithExpiry: (key_1, value_1, ...args_1) => __awaiter(void 0, [key_1, value_1, ...args_1], void 0, function* (key, value, seconds = 3600) {
        return yield redis.setex(key, seconds, JSON.stringify(value));
    }),
    // Get and parse JSON
    getJSON: (key) => __awaiter(void 0, void 0, void 0, function* () {
        const value = yield redis.get(key);
        return value ? JSON.parse(value) : null;
    }),
    // Delete key
    delete: (key) => __awaiter(void 0, void 0, void 0, function* () {
        return yield redis.del(key);
    }),
    // Check if key exists
    exists: (key) => __awaiter(void 0, void 0, void 0, function* () {
        return yield redis.exists(key);
    }),
    // Set multiple keys
    mset: (keyValuePairs) => __awaiter(void 0, void 0, void 0, function* () {
        const pairs = [];
        Object.entries(keyValuePairs).forEach(([key, value]) => {
            pairs.push([key, JSON.stringify(value)]);
        });
        // Use Object.fromEntries to create proper key-value object
        const keyValueObj = Object.fromEntries(pairs);
        return yield redis.mset(keyValueObj);
    })
};
