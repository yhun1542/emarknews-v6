const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const aiService = require('../services/aiService');
const currencyService = require('../services/currencyService');
const youtubeService = require('../services/youtubeService');
const ratingService = require('../services/ratingService');
const logger = require('../utils/logger');

router.get('/health', async (req, res) => {
  res.json({ status: 'healthy', version: '7.0.0' });
});

router.get('/news/:section', async (req, res) => {
  try {
    const section = req.params.section;
    const validSections = ['world', 'kr', 'japan', 'tech', 'business', 'buzz'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({ success: false, error: 'Invalid section' });
    }
    
    const newsData = await newsService.getNewsData(section);
    
    if (newsData.articles) {
      aiService.processArticles(newsData.articles, section).catch(err => {
        logger.error('AI processing failed:', err);
      });
      newsData.articles = await ratingService.calculateRatings(newsData.articles);
    }
    
    res.json({ success: true, section, data: newsData });
  } catch (error) {
    logger.error('News endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/currency', async (req, res) => {
  try {
    const rates = await currencyService.getRates();
    res.json({ success: true, data: rates });
  } catch (error) {
    res.json({
      success: false,
      data: { USD: 1250, JPY: 920, EUR: 1350 },
      error: error.message
    });
  }
});

router.get('/youtube/:section?', async (req, res) => {
  try {
    const section = req.params.section || 'general';
    const videos = await youtubeService.getVideos(section);
    res.json({ success: true, section, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/translate', async (req, res) => {
  try {
    const { title, description, targetLanguage = 'ko' } = req.body;
    const result = await aiService.translateArticle(title, description, targetLanguage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/summarize', async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await aiService.summarizeArticle(title, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/feed', async (req, res) => {
  const section = req.query.section || 'world';
  res.redirect(\`/api/news/\${section}\`);
});

module.exports = router;
