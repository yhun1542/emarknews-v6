# EmarkNews v6.0

AI-Powered Real-time News Aggregator with Advanced Clustering

## 🚀 Features

- **Real-time News Aggregation**: Multiple news sources integration
- **AI-Powered Clustering**: Intelligent news categorization using OpenAI
- **Multi-language Support**: Google Translate integration
- **Social Media Integration**: Twitter/X API integration
- **Currency Exchange**: Real-time currency rates
- **Redis Caching**: High-performance data caching
- **Responsive Design**: Mobile-friendly interface

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Redis
- **AI/ML**: OpenAI GPT, Google Cloud Translate
- **APIs**: NewsAPI, Twitter API, YouTube API, Naver API
- **Deployment**: Railway

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd emarknews-v6
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Start the application:
```bash
npm start
```

## 🌐 Deployment to Railway

### Prerequisites
- GitHub account
- Railway account (https://railway.app)
- Required API keys (see .env.example)

### Deployment Steps

1. **Push to GitHub**:
   - Create a new repository on GitHub
   - Push your code to the repository

2. **Deploy on Railway**:
   - Connect your GitHub account to Railway
   - Create a new project from your GitHub repository
   - Set environment variables in Railway dashboard
   - Deploy automatically

### Environment Variables

Set these variables in Railway dashboard:

```
PORT=8080
NODE_ENV=production
LOG_LEVEL=info
REDIS_URL=<railway-redis-url>
NEWS_API_KEY=<your-newsapi-key>
NAVER_CLIENT_ID=<your-naver-client-id>
NAVER_CLIENT_SECRET=<your-naver-client-secret>
OPENAI_API_KEY=<your-openai-api-key>
GOOGLE_PROJECT_ID=<your-google-project-id>
GOOGLE_CREDENTIALS_JSON=<your-google-credentials-json>
X_BEARER_TOKEN=<your-x-api-bearer-token>
YOUTUBE_API_KEY=<your-youtube-api-key>
CACHE_TTL=600
PRELOAD_INTERVAL=590
```

## 🔧 API Endpoints

- `GET /health` - Health check
- `GET /api/feed` - Get news feed
- `GET /api/currency` - Get currency rates

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run preload` - Preload data once
- `npm run healthcheck` - Check application health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please create an issue in the GitHub repository.

