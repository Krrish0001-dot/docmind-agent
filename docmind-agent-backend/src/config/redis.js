const Redis = require("ioredis");
const logger = require("../utils/logger");

let redisClient = null;

function getRedisConfig() {
    if (process.env.REDIS_URL) {
        const url = new URL(process.env.REDIS_URL);
        return {
            host: url.hostname,
            port: Number(url.port) || 6379,
            password: url.password || undefined,
            maxRetriesPerRequest: null,
        };
    }
    return {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
    };
}

async function connectRedis() {
    redisClient = new Redis(getRedisConfig());
    redisClient.on("connect", () => logger.info("Redis connected"));
    redisClient.on("error", (err) => logger.error("Redis error", err));
    return redisClient;
}

function getRedisClient() {
    if (!redisClient) {
        throw new Error("Redis client not initialized. Call connectRedis() first.");
    }
    return redisClient;
}

module.exports = { connectRedis, getRedisClient, getRedisConfig };