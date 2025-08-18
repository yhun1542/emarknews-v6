console.log('🚀 EmarkNews v6.0 Starting...');

// Fetch news feed
async function loadNews(section = 'world') {
  try {
    const response = await fetch(`/feed?section=${section}`);
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
