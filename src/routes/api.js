const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const aiService = require('../services/aiService');

router.get('/health', async (req, res) => {
  try {
    // AI 서비스 상태도 포함
    const aiHealth = await aiService.healthCheck();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '6.0.0',
      ai: aiHealth
    });
  } catch (error) {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '6.0.0',
      ai: { status: 'error', message: 'AI 상태 확인 실패' }
    });
  }
});

// AI 번역 엔드포인트
router.post('/translate', async (req, res) => {
  try {
    const { title, description, targetLanguage = 'ko' } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: '제목과 내용이 필요합니다.'
      });
    }

    console.log(`[AI] 번역 요청: ${targetLanguage}`);
    const result = await aiService.translateArticle(title, description, targetLanguage);
    
    res.json(result);
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: '번역 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// AI 요약 엔드포인트
router.post('/summarize', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: '제목과 내용이 필요합니다.'
      });
    }

    console.log(`[AI] 요약 요청`);
    const result = await aiService.summarizeArticle(title, description);
    
    res.json(result);
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({
      success: false,
      error: '요약 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

// AI 감정 분석 엔드포인트
router.post('/analyze-sentiment', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: '제목과 내용이 필요합니다.'
      });
    }

    console.log(`[AI] 감정 분석 요청`);
    const result = await aiService.analyzeSentiment(title, description);
    
    res.json(result);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      error: '감정 분석 중 오류가 발생했습니다.',
      message: error.message
    });
  }
});

router.get('/feed', async (req, res) => {
  try {
    const section = req.query.section || 'world';
    console.log(`[API] 뉴스 피드 요청: section=${section}`);
    
    // 뉴스 데이터를 가져오는 로직
    const newsData = await newsService.getNewsData(section);
    
    // JSON으로 응답
    res.json({
      success: true,
      data: newsData
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      message: error.message
    });
  }
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
