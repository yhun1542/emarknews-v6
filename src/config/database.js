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
    
    // 개선된 Redis 클라이언트 설정
    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('[Redis] Max reconnection attempts reached');
            return new Error('Max reconnection attempts');
          }
          const delay = Math.min(retries * 100, 3000);
          logger.info(`[Redis] Reconnecting in ${delay}ms (attempt ${retries})`);
          return delay;
        }
      }
    });

    // 에러 핸들링 - 앱이 죽지 않도록
    redisClient.on('error', (err) => {
      logger.error('[Redis] Client error:', err.message);
      // 에러가 나도 앱이 죽지 않도록 처리
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

    redisClient.on('reconnecting', () => {
      logger.info('[Redis] Reconnecting...');
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

// Redis 없이도 동작하는 안전한 래퍼
const redisWrapper = {
  get: async (key) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return null;
      }
      return await redisClient.get(key);
    } catch (err) {
      logger.warn(`[Redis] Get failed for key ${key}:`, err.message);
      return null;
    }
  },
  
  set: async (key, value, options) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return null;
      }
      return await redisClient.set(key, value, options);
    } catch (err) {
      logger.warn(`[Redis] Set failed for key ${key}:`, err.message);
      return null;
    }
  },
  
  del: async (key) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return null;
      }
      return await redisClient.del(key);
    } catch (err) {
      logger.warn(`[Redis] Delete failed for key ${key}:`, err.message);
      return null;
    }
  },
  
  exists: async (key) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return false;
      }
      return await redisClient.exists(key);
    } catch (err) {
      logger.warn(`[Redis] Exists check failed for key ${key}:`, err.message);
      return false;
    }
  },
  
  expire: async (key, seconds) => {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return null;
      }
      return await redisClient.expire(key, seconds);
    } catch (err) {
      logger.warn(`[Redis] Expire failed for key ${key}:`, err.message);
      return null;
    }
  }
};

const healthCheck = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      return { 
        redis: false, 
        status: 'no_url_provided',
        url: null
      };
    }
    
    if (!redisClient || !redisClient.isOpen) {
      return { 
        redis: false, 
        status: 'disconnected',
        url: redisUrl ? 'configured' : 'not_configured'
      };
    }
    
    await redisClient.ping();
    
    // URL 정보를 안전하게 표시 (비밀번호 마스킹)
    const urlInfo = redisUrl ? redisUrl.replace(/:([^@]+)@/, ':***@') : 'not_configured';
    
    return { 
      redis: true, 
      status: 'connected',
      url: urlInfo,
      host: redisUrl ? new URL(redisUrl).hostname : null,
      port: redisUrl ? new URL(redisUrl).port : null
    };
  } catch (error) {
    logger.error('[Redis] Health check failed:', error.message);
    return { 
      redis: false, 
      status: 'error', 
      error: error.message,
      url: process.env.REDIS_URL ? 'configured' : 'not_configured'
    };
  }
};

const getClient = () => redisClient;

module.exports = {
  connectRedis,
  healthCheck,
  getClient,
  redis: redisWrapper  // 안전한 Redis 래퍼 추가
};

