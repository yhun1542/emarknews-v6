# EmarkNews v6.0 Railway 배포 가이드

## 📋 배포 전 체크리스트

### 1. 필수 API 키 준비
다음 API 키들을 미리 준비해주세요:

- **NewsAPI Key**: https://newsapi.org/
- **OpenAI API Key**: https://platform.openai.com/
- **Google Cloud Credentials**: https://cloud.google.com/
- **Naver API Keys**: https://developers.naver.com/
- **Twitter/X API Bearer Token**: https://developer.twitter.com/
- **YouTube API Key**: https://developers.google.com/youtube/

### 2. GitHub 저장소 생성
1. GitHub에서 새 저장소 생성 (예: `emarknews-v6`)
2. 로컬 프로젝트를 GitHub에 푸시:

```bash
git remote add origin https://github.com/YOUR_USERNAME/emarknews-v6.git
git branch -M main
git push -u origin main
```

## 🚀 Railway 배포 단계

### 1단계: Railway 계정 생성 및 로그인
1. https://railway.app 접속
2. GitHub 계정으로 로그인
3. "Deploy a new project" 클릭

### 2단계: GitHub 저장소 연결
1. "Deploy from GitHub repo" 선택
2. 생성한 저장소 선택 (emarknews-v6)
3. 자동으로 프로젝트가 생성됩니다

### 3단계: Redis 데이터베이스 추가
1. 프로젝트 대시보드에서 "Add Service" 클릭
2. "Database" → "Redis" 선택
3. Redis 인스턴스가 생성됩니다

### 4단계: 환경 변수 설정
프로젝트 설정에서 다음 환경 변수들을 추가:

```env
PORT=8080
NODE_ENV=production
LOG_LEVEL=info
REDIS_URL=${{Redis.REDIS_URL}}
NEWS_API_KEY=your_newsapi_key_here
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
OPENAI_API_KEY=your_openai_api_key
GOOGLE_PROJECT_ID=your_google_project_id
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
X_BEARER_TOKEN=your_x_api_bearer_token
YOUTUBE_API_KEY=your_youtube_api_key
CACHE_TTL=600
PRELOAD_INTERVAL=590
```

**중요**: `REDIS_URL`은 Railway에서 자동으로 생성된 Redis 연결 URL을 사용하세요.

### 5단계: 배포 확인
1. 배포가 완료되면 Railway에서 제공하는 URL로 접속
2. `/health` 엔드포인트로 헬스체크 확인
3. `/api/feed` 엔드포인트로 API 동작 확인

## 🔧 배포 후 설정

### 도메인 설정 (선택사항)
1. Railway 대시보드에서 "Settings" → "Domains"
2. 커스텀 도메인 추가 또는 Railway 제공 도메인 사용

### 모니터링 설정
1. Railway 대시보드에서 로그 모니터링
2. 메트릭스 확인 (CPU, 메모리, 네트워크)
3. 알림 설정 (선택사항)

## 🔄 자동 배포 설정

GitHub에 코드를 푸시하면 자동으로 Railway에 배포됩니다:

```bash
git add .
git commit -m "Update application"
git push origin main
```

## 🐛 문제 해결

### 일반적인 문제들

1. **Redis 연결 오류**
   - `REDIS_URL` 환경 변수가 올바르게 설정되었는지 확인
   - Redis 서비스가 실행 중인지 확인

2. **API 키 오류**
   - 모든 API 키가 올바르게 설정되었는지 확인
   - API 키의 권한과 할당량 확인

3. **빌드 실패**
   - `package.json`의 의존성 확인
   - Node.js 버전 호환성 확인 (>=18.0.0)

4. **포트 오류**
   - `PORT` 환경 변수가 8080으로 설정되었는지 확인
   - 애플리케이션이 `process.env.PORT`를 사용하는지 확인

### 로그 확인 방법
Railway 대시보드에서:
1. 프로젝트 선택
2. "Deployments" 탭
3. 최신 배포 클릭
4. "Logs" 확인

## 📞 지원

문제가 발생하면:
1. Railway 공식 문서: https://docs.railway.app/
2. Railway Discord: https://discord.gg/railway
3. GitHub Issues에 문제 보고

## 🎉 배포 완료!

축하합니다! EmarkNews v6.0이 성공적으로 Railway에 배포되었습니다.

이제 다음 URL들로 접속할 수 있습니다:
- 메인 페이지: `https://your-app.railway.app/`
- 헬스체크: `https://your-app.railway.app/health`
- API 엔드포인트: `https://your-app.railway.app/api/feed`

