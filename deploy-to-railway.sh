#!/bin/bash

echo "🚀 EmarkNews v6.0 - Railway 자동 배포 스크립트"
echo "=============================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_step() {
    echo -e "${BLUE}📌 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. 환경 확인
print_step "환경 확인 중..."

if ! command -v git &> /dev/null; then
    print_error "Git이 설치되어 있지 않습니다."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js가 설치되어 있지 않습니다."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm이 설치되어 있지 않습니다."
    exit 1
fi

print_success "환경 확인 완료"

# 2. 의존성 설치
print_step "의존성 설치 중..."
npm install
if [ $? -eq 0 ]; then
    print_success "의존성 설치 완료"
else
    print_error "의존성 설치 실패"
    exit 1
fi

# 3. Git 저장소 확인
print_step "Git 저장소 확인 중..."

if [ ! -d ".git" ]; then
    print_warning "Git 저장소가 초기화되지 않았습니다. 초기화합니다..."
    git init
    git add .
    git commit -m "Initial commit - EmarkNews v6.0"
fi

# 4. GitHub 정보 입력
echo ""
print_step "GitHub 저장소 정보 입력"
echo ""

read -p "GitHub 사용자명: " GITHUB_USERNAME
read -p "저장소 이름 (기본: emarknews-v6): " REPO_NAME
REPO_NAME=${REPO_NAME:-emarknews-v6}

# 5. GitHub 저장소 생성 안내
echo ""
print_warning "다음 단계를 수행해주세요:"
echo ""
echo "1. GitHub에서 새 저장소를 생성하세요:"
echo "   https://github.com/new"
echo ""
echo "2. 저장소 이름: ${REPO_NAME}"
echo "3. Public 또는 Private 선택"
echo "4. README, .gitignore, license는 추가하지 마세요 (이미 있음)"
echo ""

read -p "GitHub 저장소를 생성했나요? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    print_error "GitHub 저장소를 먼저 생성해주세요."
    exit 1
fi

# 6. Git 원격 저장소 설정
print_step "Git 원격 저장소 설정 중..."

REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# 기존 origin이 있으면 제거
git remote remove origin 2>/dev/null

git remote add origin $REPO_URL
git branch -M main

print_success "원격 저장소 설정 완료"

# 7. 코드 푸시
print_step "GitHub에 코드 푸시 중..."

git push -u origin main
if [ $? -eq 0 ]; then
    print_success "코드 푸시 완료"
else
    print_error "코드 푸시 실패. GitHub 인증을 확인해주세요."
    exit 1
fi

# 8. Railway 배포 안내
echo ""
print_step "Railway 배포 안내"
echo ""
echo "이제 Railway에서 배포를 진행하세요:"
echo ""
echo "1. https://railway.app 접속"
echo "2. GitHub 계정으로 로그인"
echo "3. 'Deploy a new project' 클릭"
echo "4. 'Deploy from GitHub repo' 선택"
echo "5. '${GITHUB_USERNAME}/${REPO_NAME}' 저장소 선택"
echo "6. Redis 데이터베이스 추가:"
echo "   - 프로젝트에서 'Add Service' → 'Database' → 'Redis'"
echo ""
echo "7. 환경 변수 설정 (Variables 탭):"
echo "   PORT=8080"
echo "   NODE_ENV=production"
echo "   REDIS_URL=\${{Redis.REDIS_URL}}"
echo "   NEWS_API_KEY=your_api_key"
echo "   OPENAI_API_KEY=your_api_key"
echo "   (기타 필요한 API 키들...)"
echo ""

# 9. 환경 변수 템플릿 생성
print_step "환경 변수 템플릿 생성 중..."

cat > railway-env-template.txt << 'EOF'
# Railway 환경 변수 설정 템플릿
# 다음 변수들을 Railway 대시보드에서 설정하세요

PORT=8080
NODE_ENV=production
LOG_LEVEL=info
REDIS_URL=${{Redis.REDIS_URL}}

# API Keys (실제 값으로 교체하세요)
NEWS_API_KEY=your_newsapi_key_here
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
OPENAI_API_KEY=your_openai_api_key
GOOGLE_PROJECT_ID=your_google_project_id
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
X_BEARER_TOKEN=your_x_api_bearer_token
YOUTUBE_API_KEY=your_youtube_api_key

# Cache Settings
CACHE_TTL=600
PRELOAD_INTERVAL=590
EOF

print_success "환경 변수 템플릿 생성 완료 (railway-env-template.txt)"

# 10. 완료 메시지
echo ""
print_success "배포 준비 완료!"
echo ""
echo "📋 다음 파일들을 확인하세요:"
echo "   - DEPLOYMENT_GUIDE.md: 상세한 배포 가이드"
echo "   - railway-env-template.txt: 환경 변수 템플릿"
echo ""
echo "🔗 유용한 링크:"
echo "   - GitHub 저장소: ${REPO_URL}"
echo "   - Railway 대시보드: https://railway.app/dashboard"
echo "   - 배포 가이드: https://docs.railway.app/"
echo ""
print_success "배포를 완료하려면 Railway 웹사이트에서 위 단계를 따라하세요!"

