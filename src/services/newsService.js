const axios = require('axios');
const Parser = require('rss-parser');
const logger = require('../utils/logger');

class NewsService {
  constructor() {
    this.parser = new Parser({ timeout: 5000 });
    this.rssSources = {
      world: [
        { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
        { url: 'https://rss.cnn.com/rss/edition_world.rss', name: 'CNN World' }
      ],
      kr: [
        { url: 'https://fs.jtbc.co.kr/RSS/newsflash.xml', name: 'JTBC' }
      ],
      tech: [
        { url: 'https://feeds.feedburner.com/TechCrunch/', name: 'TechCrunch' }
      ]
    };
  }

  async getNewsData(section = 'world') {
    try {
      const articles = await this.fetchFromAllSources(section);
      return {
        section,
        articles: articles.slice(0, 20),
        total: articles.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get news:', error);
      return this.getSampleData(section);
    }
  }

  async fetchFromAllSources(section) {
    const sources = this.rssSources[section] || this.rssSources.world;
    const allArticles = [];
    
    const promises = sources.map(source => 
      this.fetchFromRSS(source).catch(() => [])
    );
    
    const results = await Promise.allSettled(promises);
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      }
    });
    
    return allArticles;
  }

  async fetchFromRSS(source) {
    try {
      const feed = await this.parser.parseURL(source.url);
      return feed.items.slice(0, 10).map(item => ({
        id: `${source.name}_${Date.now()}_${Math.random()}`,
        title: item.title || 'No title',
        description: item.content || item.description || '',
        url: item.link || '#',
        publishedAt: item.pubDate || new Date().toISOString(),
        source: source.name,
        tags: [],
        rating: 3.0
      }));
    } catch (error) {
      throw error;
    }
  }

  getSampleData(section) {
    return {
      section,
      articles: [{
        id: 'sample_1',
        title: 'Sample News Article',
        description: 'This is a sample article',
        url: '#',
        source: 'EmarkNews',
        publishedAt: new Date().toISOString(),
        rating: 3.0,
        tags: []
      }],
      total: 1,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new NewsService();
