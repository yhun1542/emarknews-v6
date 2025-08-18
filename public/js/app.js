console.log('🚀 EmarkNews v6.0 Starting...');

// Fetch currency rates
async function loadCurrency() {
  try {
    const response = await fetch('/api/currency');
    const data = await response.json();
    console.log('Currency loaded:', data);
    document.getElementById('currency-display').textContent = data.display || '환율 로딩중...';
  } catch (error) {
    console.error('Failed to load currency:', error);
    document.getElementById('currency-display').textContent = '환율 정보 없음';
  }
}

// Fetch news feed
async function loadNews(section = 'world') {
  try {
    console.log(`Loading news for section: ${section}`);
    const response = await fetch(`/api/feed?section=${section}`);
    const result = await response.json();
    
    console.log('API 응답 전체:', result);
    
    // 새로운 API 응답 구조: {"success": true, "data": {"clusters": [...]}}
    if (result.success && result.data && result.data.clusters) {
      const newsData = result.data;
      const articles = newsData.clusters;
      
      console.log('뉴스 데이터:', newsData);
      console.log('기사 수:', articles.length);
      
      displayNews(articles, newsData);
    } else {
      console.error('예상하지 못한 API 응답 구조:', result);
      document.getElementById('news-grid').innerHTML = '<p>뉴스 데이터를 불러올 수 없습니다.</p>';
    }
    
    document.getElementById('loading').style.display = 'none';
  } catch (error) {
    console.error('Failed to load news:', error);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('news-grid').innerHTML = '<p>뉴스 로딩 중 오류가 발생했습니다.</p>';
  }
}

// Display news articles
function displayNews(articles, newsData) {
  const newsGrid = document.getElementById('news-grid');
  
  if (!articles || articles.length === 0) {
    newsGrid.innerHTML = '<p>표시할 뉴스가 없습니다.</p>';
    return;
  }
  
  const newsHtml = articles.map(article => {
    // 이미지 URL 처리 - 로컬 이미지를 기본값으로 사용
    const imageUrl = article.urlToImage || '/images/no-image.svg';
    const publishedDate = new Date(article.publishedAt).toLocaleDateString('ko-KR');
    const description = article.description || '설명이 없습니다.';
    
    return `
      <article class="news-item">
        <div class="news-image">
          <img 
            src="${imageUrl}" 
            alt="${article.title}"
            loading="lazy"
            onerror="handleImageError(this)"
            data-original-src="${imageUrl}"
          >
        </div>
        <div class="news-content">
          <h3 class="news-title">
            <a href="${article.url}" target="_blank" rel="noopener noreferrer">
              ${article.title}
            </a>
          </h3>
          <p class="news-description">${description}</p>
          <div class="news-meta">
            <span class="news-source">${article.source}</span>
            <span class="news-date">${publishedDate}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
  
  // 뉴스 메타 정보 추가
  const metaInfo = `
    <div class="news-meta-info">
      <p>📰 ${newsData.section} 뉴스 • 총 ${newsData.total || articles.length}개 기사 • 
      출처: ${newsData.source} • 업데이트: ${new Date(newsData.timestamp).toLocaleString('ko-KR')}</p>
    </div>
  `;
  
  newsGrid.innerHTML = metaInfo + '<div class="news-grid-container">' + newsHtml + '</div>';
}

// 개선된 이미지 에러 핸들링 함수
function handleImageError(img) {
  // 이미 재시도했다면 더 이상 시도하지 않음
  if (img.dataset.retried) {
    return;
  }
  
  // 재시도 플래그 설정
  img.dataset.retried = 'true';
  
  // 여러 fallback 옵션 시도
  const fallbackImages = [
    '/images/no-image.svg',                                           // 로컬 SVG
    'https://placehold.co/400x200/f8f9fa/6c757d?text=No+Image',     // placehold.co
    'https://dummyimage.com/400x200/f8f9fa/6c757d&text=No+Image',   // dummyimage.com
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIgc3Ryb2tlPSIjZGVlMmU2IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIyMDAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfk7A8L3RleHQ+CiAgPHRleHQgeD0iMjAwIiB5PSIxMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+7J207Jq47KeAIOyXhuydjDwvdGV4dD4KICA8dGV4dCB4PSIyMDAiIHk9IjEzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjYWRiNWJkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==' // Base64 인코딩된 SVG
  ];
  
  // 현재 시도 중인 fallback 인덱스
  const currentIndex = parseInt(img.dataset.fallbackIndex || '0');
  
  if (currentIndex < fallbackImages.length) {
    img.dataset.fallbackIndex = (currentIndex + 1).toString();
    img.src = fallbackImages[currentIndex];
    
    // 마지막 fallback도 실패하면 onerror 제거
    if (currentIndex === fallbackImages.length - 1) {
      img.onerror = null;
    }
  } else {
    // 모든 fallback 실패 시 onerror 제거
    img.onerror = null;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCurrency();
  loadNews();
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      loadNews(e.target.dataset.section);
    });
  });
});
