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
    const response = await fetch(`/api/feed?section=${section}`);
    const data = await response.json();
    console.log('News loaded:', data);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('news-grid').innerHTML = '<p>뉴스를 표시할 준비가 되었습니다.</p>';
  } catch (error) {
    console.error('Failed to load news:', error);
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
