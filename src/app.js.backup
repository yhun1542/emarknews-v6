require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const helmet = require('helmet');

const database = require('./config/database');
const { serverConfig, initializeServices } = require('./config/server');
const apiRoutes = require('./routes/api');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

class Application {
  constructor() {
    this.app = express();
    this.server = null;
    this.isShuttingDown = false;
  }

  async initialize() {
    try {
      logger.info('🚀 EmarkNews v7.0 Starting...');
      await this.initializeDatabase();
      await this.initializeServices();
      this.setupMiddleware();
      this.setupRoutes();
      this.setupErrorHandlers();
      logger.info('✅ Application initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      this.setupBasicApp();
      return false;
    }
  }

  async initializeDatabase() {
    try {
      await database.connectRedis();
      logger.info('✅ Redis connected');
    } catch (error) {
      logger.warn('⚠️ Redis connection failed, running without cache:', error.message);
    }
  }

  async initializeServices() {
    try {
      await initializeServices();
      logger.info('✅ Services initialized');
    } catch (error) {
      logger.warn('⚠️ Some services failed to initialize:', error.message);
    }
  }

  setupMiddleware() {
    this.app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
    this.app.set('trust proxy', true);
    this.app.use(compression());
    this.app.use(cors({ origin: true, credentials: true }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    const apiLimiter = rateLimit({
      windowMs: 60000,
      max: 100,
      skip: (req) => req.path.includes('.') || req.path === '/health'
    });
    
    this.app.use('/api', apiLimiter);
  }

  setupRoutes() {
    this.app.get('/health', async (req, res) => {
      const redisHealth = await database.healthCheck();
      res.json({
        status: 'healthy',
        version: '7.0.0',
        timestamp: new Date().toISOString(),
        redis: redisHealth
      });
    });
    
    this.app.use('/api', apiRoutes);
    
    const publicPath = path.join(__dirname, '..', 'public');
    this.app.use(express.static(publicPath));
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  setupErrorHandlers() {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  setupBasicApp() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.get('/health', (req, res) => {
      res.json({ status: 'degraded' });
    });
  }

  async start() {
    const PORT = process.env.PORT || 8080;
    const HOST = '0.0.0.0';
    
    try {
      await this.initialize();
      this.server = this.app.listen(PORT, HOST, () => {
        logger.info(`✨ Server running at http://${HOST}:${PORT}`);
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
