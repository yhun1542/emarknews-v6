#!/bin/bash

# =====================================================
# EmarkNews v7 Frontend Deployment Script
# This script organizes and deploys frontend files
# =====================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "🎨 EmarkNews v7 Frontend Deployment"
echo "====================================="

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Step 2: Create public directory structure
echo -e "${BLUE}📁 Creating frontend directory structure...${NC}"

mkdir -p public/{css,js,images,fonts}
mkdir -p public/assets/{icons,videos}

echo -e "${GREEN}✓ Directory structure created${NC}"

# Step 3: Backup existing files
if [ -f "public/index.html" ]; then
    echo -e "${YELLOW}📦 Backing up existing frontend files...${NC}"
    mkdir -p backup_frontend_$(date +%Y%m%d_%H%M%S)
    cp -r public/* backup_frontend_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created${NC}"
fi

# Step 4: Process uploaded frontend file
echo -e "${BLUE}📥 Processing frontend files...${NC}"

# Check for uploaded HTML file
if [ -f "index_final_0819.html" ]; then
    echo "Found: index_final_0819.html"
    mv index_final_0819.html public/index.html
    echo -e "${GREEN}✓ Moved to public/index.html${NC}"
    
elif [ -f "index.html" ] && [ ! -f "public/index.html" ]; then
    echo "Found: index.html in root"
    mv index.html public/index.html
    echo -e "${GREEN}✓ Moved to public/index.html${NC}"
    
elif [ -f "frontend.html" ]; then
    echo "Found: frontend.html"
    mv frontend.html public/index.html
    echo -e "${GREEN}✓ Renamed and moved to public/index.html${NC}"
    
elif [ -f "emarknews.html" ]; then
    echo "Found: emarknews.html"
    mv emarknews.html public/index.html
    echo -e "${GREEN}✓ Renamed and moved to public/index.html${NC}"
fi

# Check for CSS files
for css in *.css; do
    if [ -f "$css" ]; then
        echo "Found CSS: $css"
        mv "$css" public/css/
        echo -e "${GREEN}✓ Moved to public/css/${NC}"
    fi
done

# Check for JS files (excluding node_modules and src)
for js in *.js; do
    if [ -f "$js" ] && [[ "$js" != "complete-v7-upgrade.sh" ]]; then
        echo "Found JS: $js"
        mv "$js" public/js/ 2>/dev/null || true
        echo -e "${GREEN}✓ Moved to public/js/${NC}"
    fi
done

# Step 5: Extract and organize embedded styles/scripts
echo -e "${BLUE}🔍 Analyzing index.html for embedded assets...${NC}"

if [ -f "public/index.html" ]; then
    # Extract embedded CSS to separate file
    if grep -q "<style>" public/index.html; then
        echo "Extracting embedded styles..."
        sed -n '/<style>/,/<\/style>/p' public/index.html > public/css/extracted-styles.css
        echo -e "${GREEN}✓ Embedded styles extracted to public/css/extracted-styles.css${NC}"
    fi
    
    # Extract embedded JavaScript to separate file
    if grep -q "<script>" public/index.html; then
        echo "Extracting embedded scripts..."
        sed -n '/<script>/,/<\/script>/p' public/index.html | grep -v "<script" | grep -v "</script" > public/js/extracted-scripts.js
        echo -e "${GREEN}✓ Embedded scripts extracted to public/js/extracted-scripts.js${NC}"
    fi
fi

# Step 6: Update HTML file paths
echo -e "${BLUE}🔧 Updating asset paths in HTML...${NC}"

if [ -f "public/index.html" ]; then
    # Update paths for local assets
    sed -i.bak 's|href="style\.css"|href="/css/style.css"|g' public/index.html
    sed -i.bak 's|src="script\.js"|src="/js/script.js"|g' public/index.html
    sed -i.bak 's|href="./|href="/|g' public/index.html
    sed -i.bak 's|src="./|src="/|g' public/index.html
    
    # Remove backup file
    rm -f public/index.html.bak
    
    echo -e "${GREEN}✓ Asset paths updated${NC}"
fi

# Step 7: Create placeholder files if missing
echo -e "${BLUE}📝 Creating placeholder files...${NC}"

# Create basic CSS if none exists
if [ ! -f "public/css/style.css" ] && [ ! -f "public/css/extracted-styles.css" ]; then
    cat > public/css/style.css << 'CSS_END'
/* EmarkNews v7 Styles */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}
CSS_END
    echo -e "${GREEN}✓ Created placeholder style.css${NC}"
fi

# Create basic JS if none exists
if [ ! -f "public/js/app.js" ] && [ ! -f "public/js/extracted-scripts.js" ]; then
    cat > public/js/app.js << 'JS_END'
// EmarkNews v7 Frontend
console.log('EmarkNews v7 Frontend Loaded');
JS_END
    echo -e "${GREEN}✓ Created placeholder app.js${NC}"
fi

# Step 8: Verify frontend integration
echo -e "${BLUE}🔍 Verifying frontend integration...${NC}"

# Check if index.html exists and has content
if [ -f "public/index.html" ]; then
    FILE_SIZE=$(stat -f%z "public/index.html" 2>/dev/null || stat -c%s "public/index.html" 2>/dev/null || echo "0")
    
    if [ "$FILE_SIZE" -gt 1000 ]; then
        echo -e "${GREEN}✓ index.html is valid (${FILE_SIZE} bytes)${NC}"
        
        # Check for API endpoint references
        if grep -q "/api/" public/index.html; then
            echo -e "${GREEN}✓ API endpoints found in HTML${NC}"
        else
            echo -e "${YELLOW}⚠ No API endpoints found - updating...${NC}"
            
            # Add API configuration to HTML
            cat >> public/index.html << 'API_CONFIG'
<script>
// EmarkNews API Configuration
const API_BASE = window.location.origin;
const API_ENDPOINTS = {
    news: `${API_BASE}/api/news`,
    currency: `${API_BASE}/api/currency`,
    youtube: `${API_BASE}/api/youtube`
};
</script>
API_CONFIG
        fi
    else
        echo -e "${RED}✗ index.html is too small or empty${NC}"
    fi
else
    echo -e "${RED}✗ index.html not found!${NC}"
    echo "Creating basic index.html..."
    
    cat > public/index.html << 'HTML_END'
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EmarkNews v7</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <h1>EmarkNews v7</h1>
    <p>Frontend files need to be uploaded.</p>
    <script src="/js/app.js"></script>
</body>
</html>
HTML_END
fi

# Step 9: Create frontend test file
echo -e "${BLUE}🧪 Creating frontend test file...${NC}"

cat > public/test.html << 'TEST_END'
<!DOCTYPE html>
<html>
<head>
    <title>EmarkNews v7 - API Test</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        .test { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .success { background: #d4edda; }
        .error { background: #f8d7da; }
    </style>
</head>
<body>
    <h1>EmarkNews v7 - API Test</h1>
    <div id="results"></div>
    
    <script>
        const tests = [
            { name: 'Health Check', url: '/health' },
            { name: 'News API', url: '/api/news/world' },
            { name: 'Currency API', url: '/api/currency' },
            { name: 'YouTube API', url: '/api/youtube/kr' }
        ];
        
        const results = document.getElementById('results');
        
        tests.forEach(async test => {
            try {
                const response = await fetch(test.url);
                const data = await response.json();
                results.innerHTML += `
                    <div class="test success">
                        ✅ ${test.name}: ${response.status} OK
                    </div>
                `;
            } catch (error) {
                results.innerHTML += `
                    <div class="test error">
                        ❌ ${test.name}: ${error.message}
                    </div>
                `;
            }
        });
    </script>
</body>
</html>
TEST_END

echo -e "${GREEN}✓ Test file created at public/test.html${NC}"

# Step 10: Summary
echo ""
echo "====================================="
echo -e "${GREEN}🎉 Frontend Deployment Complete!${NC}"
echo "====================================="
echo ""
echo "📁 File Structure:"
echo "  public/"
echo "  ├── index.html (main frontend)"
echo "  ├── test.html (API tester)"
echo "  ├── css/"
echo "  │   └── *.css files"
echo "  ├── js/"
echo "  │   └── *.js files"
echo "  └── assets/"
echo ""
echo "🔍 Next Steps:"
echo "  1. Test locally: npm start"
echo "  2. Open: http://localhost:8080"
echo "  3. Test APIs: http://localhost:8080/test.html"
echo "  4. Deploy to Railway"
echo ""

# Step 11: Git commit
read -p "Do you want to commit frontend changes? (y/n): " commit_frontend

if [ "$commit_frontend" = "y" ]; then
    git add public/
    git commit -m "🎨 Add v7 frontend files

- Updated index.html with new design
- Organized assets in proper directories
- Added API integration
- Created test page
"
    echo -e "${GREEN}✓ Frontend changes committed${NC}"
fi

echo ""
echo "Frontend deployment script completed!"