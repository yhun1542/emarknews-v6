module.exports = {
  serverConfig: {
    cors: { origin: '*' },
    rateLimit: { windowMs: 60000, max: 100 }
  },
  initializeServices: async () => {
    console.log('[Services] Initialized');
  }
};
