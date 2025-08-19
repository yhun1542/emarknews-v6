const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  async processArticles(articles, section) {
    return articles.map(article => ({
      ...article,
      titleKo: article.title,
      summaryPoints: ['AI 요약 준비 중', '분석 진행 중', '곧 완료됩니다'],
      aiDetailedSummary: 'AI 상세 요약이 준비 중입니다.',
      originalTextKo: article.description || '번역 준비 중'
    }));
  }

  async translateArticle(title, description, targetLanguage = 'ko') {
    if (!this.openaiApiKey) {
      return {
        success: true,
        translatedTitle: title,
        translatedDescription: description,
        message: 'API key not configured'
      };
    }
    
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: '번역해주세요' },
            { role: 'user', content: \`제목: \${title}\\n내용: \${description}\` }
          ],
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': \`Bearer \${this.openaiApiKey}\`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        success: true,
        translatedTitle: title,
        translatedDescription: response.data.choices[0].message.content
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async summarizeArticle(title, description) {
    return {
      success: true,
      summary: 'AI 요약 기능',
      keyPoints: ['포인트 1', '포인트 2', '포인트 3']
    };
  }

  async healthCheck() {
    return {
      status: this.openaiApiKey ? 'healthy' : 'degraded',
      model: 'gpt-4o-mini'
    };
  }
}

module.exports = new AIService();
