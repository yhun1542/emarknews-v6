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
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    
    if (!apiKey) {
      // API 키가 없으면 기본값 반환
      return res.json({
        rates: { USD: { KRW: 1300 } },
        display: 'USD/KRW: 1300.00 (기본값)',
        source: 'default'
      });
    }

    // ExchangeRate-API 호출
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
    
    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result === 'success' && data.conversion_rates && data.conversion_rates.KRW) {
      const krwRate = data.conversion_rates.KRW;
      return res.json({
        rates: { USD: { KRW: krwRate } },
        display: `USD/KRW: ${krwRate.toFixed(2)}`,
        source: 'exchangerate-api.com',
        last_updated: data.time_last_update_utc
      });
    } else {
      throw new Error('환율 데이터를 찾을 수 없습니다');
    }
    
  } catch (error) {
    console.error('환율 API 오류:', error.message);
    
    // 오류 발생 시 기본값 반환
    res.json({
      rates: { USD: { KRW: 1300 } },
      display: 'USD/KRW: 1300.00 (오류로 인한 기본값)',
      source: 'fallback',
      error: error.message
    });
  }
});

module.exports = router;
