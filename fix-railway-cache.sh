#!/bin/bash

# =====================================================
# Railway 캐시 및 배포 문제 해결 스크립트
# =====================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔄 Railway 캐시 및 배포 문제 해결"
echo "===================================="
echo ""

# Step 1: 현재 버전 확인
echo -e "${BLUE}📌 Step 1: 현재 버전 정보 확인${NC}"
echo "-----------------------------------"

# package.json 버전 확인
CURRENT_VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
echo "Current package.json version: $CURRENT_VERSION"

# 버전 업데이트 강제
NEW_VERSION="7.0.$(date +%s)"
echo -e "${YELLOW}New version will be: $NEW_VERSION${NC}"

# Step 2: 버전 강제 업데이트
echo ""
echo -e "${BLUE}📌 Step 2: 버전 강제 업데이트${NC}"
echo "-----------------------------------"

# package.json 버전 변경
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
echo -e "${GREEN}✓ package.json updated to $NEW_VERSION${NC}"

# Step 3: 캐시 버스팅을 위한 더미 파일 생성
echo ""
echo -e "${BLUE}📌 Step 3: 캐시 버스팅${NC}"
echo "-----------------------------------"

# 타임스탬프 파일 생성
echo "Deploy timestamp: $(date)" > .deploy-timestamp
echo "Version: $NEW_VERSION" >> .deploy-timestamp
echo -e "${GREEN}✓ Deploy timestamp created${NC}"

# Railway 빌드 캐시 무효화를 위한 환경 변수 파일
cat > .railway-cache-bust << EOF
# Railway Cache Bust
DEPLOY_VERSION=$NEW_VERSION
DEPLOY_TIME=$(date +%s)
BUILD_CACHE_BUSTER=$(uuidgen || date +%s)
EOF
echo -e "${GREEN}✓ Cache bust file created${NC}"

# Step 4: 브랜치 정리 및 강제 푸시
echo ""
echo -e "${BLUE}📌 Step 4: Git 강제 푸시 준비${NC}"
echo "-----------------------------------"

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# 모든 변경사항 커밋
git add -A
git commit -m "🔄 Force deploy v$NEW_VERSION - Cache bust

- Updated version to $NEW_VERSION
- Added deploy timestamp
- Force Railway rebuild
- Cache invalidation
" || echo "No changes to commit"

# Step 5: Railway 재배포 전략 선택
echo ""
echo -e "${BLUE}📌 Step 5: Railway 재배포 전략${NC}"
echo "-----------------------------------"
echo ""
echo "Choose deployment strategy:"
echo "1) Force push to current branch (권장)"
echo "2) Create new branch and deploy"
echo "3) Delete and recreate deployment"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo -e "${YELLOW}Force pushing to $CURRENT_BRANCH...${NC}"
        git push origin $CURRENT_BRANCH --force-with-lease
        echo -e "${GREEN}✓ Force pushed successfully${NC}"
        ;;
    2)
        NEW_BRANCH="deploy-v7-$(date +%Y%m%d-%H%M%S)"
        echo -e "${YELLOW}Creating new branch: $NEW_BRANCH${NC}"
        git checkout -b $NEW_BRANCH
        git push origin $NEW_BRANCH
        echo -e "${GREEN}✓ New branch pushed: $NEW_BRANCH${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Remember to change branch in Railway:${NC}"
        echo "   Settings → Deploy → Branch → $NEW_BRANCH"
        ;;
    3)
        echo -e "${RED}⚠️  Manual steps required:${NC}"
        echo "1. Go to Railway Dashboard"
        echo "2. Settings → Danger Zone → Delete Deployment"
        echo "3. Redeploy from GitHub"
        ;;
esac

# Step 6: Railway 설정 파일 업데이트
echo ""
echo -e "${BLUE}📌 Step 6: Railway 설정 업데이트${NC}"
echo "-----------------------------------"

# railway.json 업데이트 (빌드 캐시 무효화)
cat > railway.json << 'RAILWAY_CONFIG'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm cache clean --force && npm ci --production",
    "watchPatterns": ["**/*"]
  },
  "deploy": {
    "startCommand": "node src/app.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 3
  },
  "environments": {
    "production": {
      "NODE_ENV": "production",
      "FORCE_REBUILD": "true"
    }
  }
}
RAILWAY_CONFIG

echo -e "${GREEN}✓ railway.json updated with cache-busting config${NC}"

# Step 7: 빌드 스크립트 추가
echo ""
echo -e "${BLUE}📌 Step 7: 빌드 스크립트 추가${NC}"
echo "-----------------------------------"

# package.json에 prebuild 스크립트 추가
node -e "
const pkg = require('./package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts.prebuild = 'echo \"Build started at: \" && date';
pkg.scripts.postbuild = 'echo \"Build completed at: \" && date';
pkg.scripts.clean = 'rm -rf node_modules package-lock.json';
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo -e "${GREEN}✓ Build scripts added to package.json${NC}"

# Step 8: 프론트엔드 캐시 버스팅
echo ""
echo -e "${BLUE}📌 Step 8: 프론트엔드 캐시 버스팅${NC}"
echo "-----------------------------------"

if [ -f "public/index.html" ]; then
    # HTML 파일에 버전 쿼리 스트링 추가
    sed -i.bak "s/\.js\"/\.js?v=$NEW_VERSION\"/g" public/index.html
    sed -i.bak "s/\.css\"/\.css?v=$NEW_VERSION\"/g" public/index.html
    
    # Meta 태그 추가/업데이트
    if ! grep -q "deploy-version" public/index.html; then
        sed -i.bak "/<head>/a\\
        <meta name=\"deploy-version\" content=\"$NEW_VERSION\">\\
        <meta name=\"deploy-time\" content=\"$(date)\">\\
        <meta http-equiv=\"Cache-Control\" content=\"no-cache, no-store, must-revalidate\">\\
        <meta http-equiv=\"Pragma\" content=\"no-cache\">\\
        <meta http-equiv=\"Expires\" content=\"0\">" public/index.html
    fi
    
    echo -e "${GREEN}✓ Frontend cache busting applied${NC}"
fi

# Step 9: 최종 커밋 및 푸시
echo ""
echo -e "${BLUE}📌 Step 9: 최종 커밋 및 푸시${NC}"
echo "-----------------------------------"

git add -A
git commit -m "🚀 Force rebuild v$NEW_VERSION - Complete cache invalidation

- Railway config updated
- Build scripts added  
- Frontend cache busting
- Force clean build
"

git push origin $CURRENT_BRANCH

echo ""
echo "===================================="
echo -e "${GREEN}✅ 캐시 문제 해결 완료!${NC}"
echo "===================================="
echo ""
echo -e "${YELLOW}📋 Railway Dashboard에서 할 일:${NC}"
echo ""
echo "1. Deployments 탭 확인"
echo "   - 새 배포가 시작되었는지 확인"
echo "   - Build Logs에서 새 버전 번호 확인"
echo ""
echo "2. 배포가 안 되면:"
echo "   a) Settings → Deploy → Redeploy 클릭"
echo "   b) 또는 Settings → Danger Zone → Restart"
echo ""
echo "3. 환경 변수 추가 (Variables 탭):"
echo "   FORCE_REBUILD=true"
echo "   DEPLOY_VERSION=$NEW_VERSION"
echo ""
echo "4. 여전히 안 되면:"
echo "   a) Deployments → 이전 배포 → Rollback 클릭"
echo "   b) 다시 최신 배포 실행"
echo ""
echo -e "${BLUE}🔍 배포 확인 명령어:${NC}"
echo "curl https://[your-app].railway.app/health | jq '.version'"
echo ""
echo "현재 버전: $NEW_VERSION"