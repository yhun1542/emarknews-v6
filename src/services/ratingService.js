const logger = require('../utils/logger');

class RatingService {
  async calculateRatings(articles) {
    if (!articles) return articles;
    
    return articles.map(article => ({
      ...article,
      rating: article.rating || this.calculateRating(article)
    }));
  }

  calculateRating(article) {
    let rating = 3.0;
    
    if (article.source && ['BBC', 'CNN', 'Reuters'].includes(article.source)) {
      rating += 0.5;
    }
    
    if (article.description && article.description.length > 200) {
      rating += 0.3;
    }
    
    const hoursAgo = (Date.now() - new Date(article.publishedAt)) / 3600000;
    if (hoursAgo < 6) rating += 0.5;
    
    return Math.min(5, Math.max(1, rating));
  }
}

module.exports = new RatingService();
