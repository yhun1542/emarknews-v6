const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '6.0.0'
  });
});

router.get('/feed', async (req, res) => {
  res.json({
    section: req.query.section || 'world',
    clusters: [],
    message: 'API endpoint ready - implement news fetching'
  });
});

router.get('/currency', async (req, res) => {
  res.json({
    rates: { USD: { KRW: 1300 } },
    display: 'USD/KRW: 1300.00'
  });
});

module.exports = router;
