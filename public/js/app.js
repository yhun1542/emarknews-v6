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
    const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';
    const publishedDate = new Date(article.publishedAt).toLocaleDateString('ko-KR');
    const description = article.description || '설명이 없습니다.';
    
    return `
      <article class="news-item">
        <div class="news-image">
          <img src="${imageUrl}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
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
