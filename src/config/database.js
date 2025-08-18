const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      logger.warn('[Redis] Skipped - no URL provided');
      return null;
    }

    logger.info('[Redis] Connecting to Redis...');
    
    redisClient = redis.createClient({
      url: redisUrl,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('[Redis] Connection refused');
          return new Error('Redis connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('[Redis] Retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('[Redis] Max retry attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      logger.error('[Redis] Client error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('[Redis] Connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('[Redis] Ready to use');
    });

    redisClient.on('end', () => {
      logger.warn('[Redis] Connection ended');
    });

    await redisClient.connect();
    
    // Test connection
    await redisClient.ping();
    logger.info('[Redis] Connection test successful');
    
    return redisClient;
  } catch (error) {
    logger.error('[Redis] Connection failed:', error.message);
    return null;
  }
};

const healthCheck = async () => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return { redis: false, status: 'disconnected' };
    }
    
    await redisClient.ping();
    return { redis: true, status: 'connected' };
  } catch (error) {
    logger.error('[Redis] Health check failed:', error.message);
    return { redis: false, status: 'error', error: error.message };
  }
};

const getClient = () => redisClient;

module.exports = {
  connectRedis,
  healthCheck,
  getClient
};
