#!/bin/bash

echo "🔧 Fixing Railway Trust Proxy Issue..."
echo "======================================"

# Backup original app.js
cp src/app.js src/app.js.backup

# Fix trust proxy in app.js
cat > /tmp/trust-proxy-fix.js << 'FIX'
  setupMiddleware() {
    // Railway Trust Proxy Fix
    if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL) {
      this.app.set('trust proxy', true);
      console.log('✅ Trust proxy enabled for Railway');
    } else {
      this.app.set('trust proxy', process.env.TRUST_PROXY || 1);
    }
FIX

# Apply fix to app.js
if grep -q "trust proxy" src/app.js; then
  # Replace existing trust proxy setting
  sed -i.bak "s/this\.app\.set('trust proxy'.*/this.app.set('trust proxy', true);/g" src/app.js
else
  # Add trust proxy setting after express app creation
  sed -i.bak "/this\.app = express()/a\\
    this.app.set('trust proxy', true);" src/app.js
fi

# Fix rate limiter
sed -i.bak 's/skip: (req) => {/trustProxy: true,\n      skip: (req) => {/g' src/app.js

# Update package.json start script
sed -i.bak 's/"start": "node src\/app.js"/"start": "TRUST_PROXY=true node src\/app.js"/g' package.json

# Create .env if not exists
if [ ! -f .env ]; then
  echo "TRUST_PROXY=true" > .env
else
  grep -q "TRUST_PROXY" .env || echo "TRUST_PROXY=true" >> .env
fi

echo "✅ Trust proxy issue fixed!"
echo ""
echo "Next steps:"
echo "1. Commit changes: git add -A && git commit -m 'Fix trust proxy for Railway'"
echo "2. Push to GitHub: git push origin upgrade-v7"
echo "3. Railway will auto-deploy"
echo ""
echo "If issue persists, add these in Railway Variables:"
echo "  TRUST_PROXY=true"
echo "  NODE_ENV=production"