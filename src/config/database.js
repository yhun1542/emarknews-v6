module.exports = {
  connectRedis: async () => console.log('[Redis] Skipped - no URL provided'),
  healthCheck: async () => ({ redis: false })
};
