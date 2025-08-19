const logger = require('../utils/logger');

const serverConfig = {
  port: process.env.PORT || 8080,
  host: '0.0.0.0',
  cors: {
    origin: true,
    credentials: true
  },
  rateLimit: {
    windowMs: 60000,
    max: 100
  }
};

async function initializeServices() {
  logger.info('Initializing services...');
  return true;
}

module.exports = { serverConfig, initializeServices };
