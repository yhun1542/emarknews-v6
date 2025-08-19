const axios = require('axios');

class NewsService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
  }

  async getNewsData(section = 'world') {
    try {
      // 옵션 1: NewsAPI 사용 (API 키가 있는 경우)
      if (this.newsApiKey) {
        return await this.getNewsFromAPI(section);
      }
      
      // 옵션 2: 하드코딩된 샘플 데이터 (테스트용)
      return this.getSampleNewsData(section);
      
    } catch (error) {
      console.error('뉴스 데이터 가져오기 실패:', error);
      return this.getSampleNewsData(section);
    }
  }

  async getNewsFromAPI(section) {
    try {
      let country = 'kr';
      let category = '';
      
      // 섹션에 따른 매핑
      switch (section) {
        case 'world':
          country = 'us';
          break;
        case 'kr':
          country = 'kr';
          break;
        case 'japan':
          country = 'jp';
          break;
        case 'tech':
          country = 'kr';
          category = '&category=technology';
          break;
      }

      const url = `https://newsapi.org/v2/top-headlines?country=${country}${category}&apiKey=${this.newsApiKey}`;
      const response = await axios.get(url);
      
      const data = response.data;
      
      return {
        section,
        clusters: this.formatNewsData(data.articles || []),
        source: 'newsapi.org',
        total: data.totalResults || 0,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('NewsAPI 호출 실패:', error);
      throw error;
    }
  }

  formatNewsData(articles) {
    return articles.slice(0, 10).map((article, index) => ({
      id: `news_${Date.now()}_${index}`,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source?.name || 'Unknown',
      category: 'general'
    }));
  }

  getSampleNewsData(section) {
    const sampleData = {
      world: [
        {
          id: 'sample_world_1',
          title: '글로벌 경제 동향: 새로운 변화의 바람',
          description: '세계 경제가 새로운 전환점을 맞고 있습니다. 전문가들은 향후 전망에 대해 다양한 의견을 제시하고 있습니다.',
          url: 'https://example.com/world-news-1',
          urlToImage: 'https://via.placeholder.com/400x200?text=World+News',
          publishedAt: new Date().toISOString(),
          source: 'EmarkNews',
          category: 'economy'
        },
        {
          id: 'sample_world_2',
          title: '국제 기후 변화 대응 회의 개최',
          description: '주요국 정상들이 기후 변화 대응을 위한 새로운 협약에 합의했습니다.',
          url: 'https://example.com/world-news-2',
          urlToImage: 'https://via.placeholder.com/400x200?text=Climate+News',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: 'EmarkNews',
          category: 'environment'
        }
      ],
      kr: [
        {
          id: 'sample_kr_1',
          title: '한국 경제 성장률 전망 상향 조정',
          description: '올해 한국 경제 성장률이 예상보다 높을 것으로 전망된다고 발표했습니다.',
          url: 'https://example.com/kr-news-1',
          urlToImage: 'https://via.placeholder.com/400x200?text=Korea+Economy',
          publishedAt: new Date().toISOString(),
          source: 'EmarkNews',
          category: 'economy'
        },
        {
          id: 'sample_kr_2',
          title: 'K-컬처 해외 진출 가속화',
          description: '한국 문화 콘텐츠의 해외 진출이 더욱 활발해지고 있습니다.',
          url: 'https://example.com/kr-news-2',
          urlToImage: 'https://via.placeholder.com/400x200?text=K-Culture',
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: 'EmarkNews',
          category: 'culture'
        }
      ],
      japan: [
        {
          id: 'sample_jp_1',
          title: '일본 기술 혁신 프로젝트 발표',
          description: '일본 정부가 새로운 기술 혁신을 위한 대규모 투자 계획을 발표했습니다.',
          url: 'https://example.com/jp-news-1',
          urlToImage: 'https://via.placeholder.com/400x200?text=Japan+Tech',
          publishedAt: new Date().toISOString(),
          source: 'EmarkNews',
          category: 'technology'
        }
      ],
      tech: [
        {
          id: 'sample_tech_1',
          title: 'AI 기술의 새로운 돌파구',
          description: '인공지능 기술이 새로운 단계로 진입하며 다양한 분야에서 혁신을 이끌고 있습니다.',
          url: 'https://example.com/tech-news-1',
          urlToImage: 'https://via.placeholder.com/400x200?text=AI+Technology',
          publishedAt: new Date().toISOString(),
          source: 'EmarkNews',
          category: 'technology'
        },
        {
          id: 'sample_tech_2',
          title: '블록체인 기술의 실용화 가속',
          description: '블록체인 기술이 금융을 넘어 다양한 산업 분야에서 실용화되고 있습니다.',
          url: 'https://example.com/tech-news-2',
          urlToImage: 'https://via.placeholder.com/400x200?text=Blockchain',
          publishedAt: new Date(Date.now() - 1800000).toISOString(),
          source: 'EmarkNews',
          category: 'technology'
        }
      ]
    };

    return {
      section,
      clusters: sampleData[section] || sampleData.world,
      source: 'sample-data',
      total: (sampleData[section] || sampleData.world).length,
      timestamp: new Date().toISOString(),
      message: this.newsApiKey ? 'NewsAPI 사용 가능하지만 샘플 데이터 사용 중' : 'NewsAPI 키가 없어 샘플 데이터 사용 중'
    };
  }
}

module.exports = new NewsService();

