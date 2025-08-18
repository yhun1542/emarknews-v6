require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const database = require('./config/database');
const apiClients = require('./config/clients');
const { serverConfig, initializeServices } = require('./config/server');
const apiRoutes = require('./routes/api');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

class Application {
  constructor() {
    this.app = express();
    this.server = null;
  }

  async initialize() {
    try {
      logger.info('🚀 EmarkNews v6.0 Starting...');
      await database.connectRedis();
      await apiClients.initialize();
      this.setupMiddleware();
      this.setupRoutes();
      await initializeServices();
      logger.info('✅ Application initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize:', error);
      throw error;
    }
  }

  setupMiddleware() {
    this.app.set('trust proxy', 1);
    this.app.use(compression());
    this.app.use(cors(serverConfig.cors));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    const limiter = rateLimit(serverConfig.rateLimit);
    this.app.use('/api', limiter);
    this.app.use('/feed', limiter);
  }

  setupRoutes() {
    this.app.get('/healthz', async (req, res) => {
      const redisHealth = await database.healthCheck();
      res.json({
        status: 'healthy',
        version: '6.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        redis: redisHealth
      });
    });
    
    this.app.get('/health', async (req, res) => {
      const redisHealth = await database.healthCheck();
      res.json({
        status: 'healthy',
        version: '6.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        redis: redisHealth
      });
    });
    
    this.app.use('/', apiRoutes);
    
    const publicPath = path.join(__dirname, '..', 'public');
    this.app.use(express.static(publicPath));
    
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
    
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  async start() {
    const PORT = process.env.PORT || 8080;
    try {
      await this.initialize();
      this.server = this.app.listen(PORT, '0.0.0.0', () => {
        logger.info(`✨ Server running at http://0.0.0.0:${PORT}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const app = new Application();
  app.start();
}

module.exports = Application;
