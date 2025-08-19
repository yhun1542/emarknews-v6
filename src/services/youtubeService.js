const logger = require('../utils/logger');

class YouTubeService {
  constructor() {
    this.channels = {
      world: [
        { id: 'BBC', name: 'BBC News' },
        { id: 'CNN', name: 'CNN' }
      ],
      kr: [
        { id: 'KBS', name: 'KBS News' },
        { id: 'MBC', name: 'MBC News' }
      ]
    };
  }

  async getVideos(section = 'general') {
    try {
      const channels = this.channels[section] || this.channels.world;
      const videos = channels.map((channel, i) => ({
        id: `video_${section}_${i}`,
        title: `Latest from ${channel.name}`,
        channel: channel.name,
        thumbnail: 'https://via.placeholder.com/480x360',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        publishedAt: new Date().toISOString()
      }));
      
      return { section, videos, total: videos.length };
    } catch (error) {
      logger.error('YouTube service error:', error);
      return { section, videos: [], total: 0 };
    }
  }
}

module.exports = new YouTubeService();
