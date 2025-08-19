        console.log('🚀 EmarkNews v7.1 Starting...');

        class EmarkNews {
            constructor() {
                this.currentSection = 'world';
                this.currentFilter = 'all';
                this.allArticles = new Map();
                this.newsCache = new Map();
                this.updateInterval = null;
                this.nextUpdateCountdown = 600;
                this.init();
            }

            init() {
                this.loadCurrency();
                this.loadNews();
                this.setupNavigation();
                this.startAutoUpdate();
            }

            async loadCurrency() {
                try {
                    const prevRates = this.prevRates || {};
                    const mockRates = {
                        USD: (1200 + Math.random() * 100).toFixed(0),
                        JPY: (921 + Math.random() * 20).toFixed(0),
                        EUR: (1300 + Math.random() * 50).toFixed(0)
                    };
                    
                    let display = '';
                    Object.entries(mockRates).forEach(([currency, rate]) => {
                        const prevRate = prevRates[currency];
                        let colorClass = 'currency-neutral';
                        
                        if (prevRate) {
                            if (rate > prevRate) colorClass = 'currency-up';
                            else if (rate < prevRate) colorClass = 'currency-down';
                        }
                        
                        display += `<div class="currency-item ${colorClass}">${currency} ${rate}원</div>`;
                    });
                    
                    document.getElementById('currency-display').innerHTML = display;
                    this.prevRates = mockRates;
                    
                    setTimeout(() => this.loadCurrency(), 30000);
                } catch (error) {
                    console.error('Failed to load currency:', error);
                    document.getElementById('currency-display').innerHTML = '<div class="currency-neutral">환율 정보 없음</div>';
                }
            }

            getTimeAgo(publishedAt) {
                const now = new Date();
                const published = new Date(publishedAt);
                const diffMs = now - published;
                
                const diffSeconds = Math.floor(diffMs / 1000);
                const diffMinutes = Math.floor(diffSeconds / 60);
                const diffHours = Math.floor(diffMinutes / 60);
                const diffDays = Math.floor(diffHours / 24);
                
                if (diffDays > 0) return `${diffDays}일 전`;
                if (diffHours > 0) return `${diffHours}시간 전`;
                if (diffMinutes > 0) return `${diffMinutes}분 전`;
                return `${diffSeconds}초 전`;
            }

            generateTags(tags) {
                if (!tags || tags.length === 0) return '';
                
                return tags.map(tag => {
                    let className = 'tag';
                    if (tag === '긴급') className += ' urgent';
                    else if (tag === '중요') className += ' important';
                    else if (tag === 'Hot') className += ' hot';
                    else if (tag === 'Buzz') className += ' buzz';
                    else if (tag === '테크') className += ' tech';
                    else if (tag === '경제') className += ' economy';
                    else if (tag === '바이럴') className += ' viral';
                    
                    return `<span class="${className}">${tag}</span>`;
                }).join('');
            }

            formatSummaryPoints(summaryPoints) {
                if (!summaryPoints || summaryPoints.length === 0) {
                    return '<div class="summary-point">AI 요약 정보가 없습니다.</div>';
                }
                
                return summaryPoints.slice(0, 3).map(point => 
                    `<div class="summary-point">${point}</div>`
                ).join('');
            }

            async loadNews(section = null) {
                try {
                    if (section === null) section = this.currentSection;
                    
                    console.log('Loading news for section:', section);
                    this.currentSection = section;
                    
                    if (section === 'youtube') {
                        this.showYouTubeSection();
                        document.getElementById('loading').style.display = 'none';
                        return;
                    } else {
                        this.hideYouTubeSection();
                    }
                    
                    document.getElementById('loading').style.display = 'block';
                    document.getElementById('news-grid').style.display = 'none';
                    
                    // 데이터 생성 또는 캐시에서 가져오기
                    let articles;
                    if (this.allArticles.has(section)) {
                        articles = this.allArticles.get(section);
                    } else {
                        articles = await this.generateMockNews(section);
                        this.allArticles.set(section, articles);
                    }
                    
                    console.log('Articles loaded:', articles.length);
                    
                    // 뉴스 표시
                    this.displayNews(articles);
                    
                    // 로딩 숨기고 그리드 표시
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('news-grid').style.display = 'grid';
                    
                } catch (error) {
                    console.error('Failed to load news:', error);
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('news-grid').style.display = 'block';
                    document.getElementById('news-grid').innerHTML = '<p style="text-align: center; color: white; padding: 2rem;">뉴스 로딩 중 오류가 발생했습니다.</p>';
                }
            }

            async generateMockNews(section) {
                // 각 섹션별 mock 데이터 생성
                const now = new Date();
                const baseArticles = {
                    world: [
                        {
                            title: "Global Climate Summit Reaches Historic Agreement on Carbon Reduction",
                            titleKo: "세계 기후 정상회의, 탄소 감축에 관한 역사적 합의 도달",
                            source: "Reuters",
                            publishedAt: new Date(now - 3600000).toISOString(),
                            rating: 4.5,
                            tags: ["중요", "긴급"],
                            summaryPoints: [
                                "전 세계 195개국이 2030년까지 탄소 배출량 50% 감축 목표에 합의",
                                "개발도상국 지원을 위한 1000억 달러 규모의 청정에너지 전환 기금 조성",
                                "환경 전문가들은 이를 기후변화 대응의 '역사적 전환점'으로 평가"
                            ],
                            aiDetailedSummary: "파리에서 개최된 세계 기후 정상회의에서 195개국 대표들이 탄소 감축에 관한 획기적인 합의에 도달했습니다.",
                            originalTextKo: "파리에서 개최된 세계 기후 정상회의에 참석한 195개국 대표들이 탄소 감축 목표에 관한 획기적인 합의에 도달했습니다.",
                            url: "https://reuters.com/climate",
                            urlToImage: "https://images.unsplash.com/photo-1569163139394-de44cb5894d4?w=600&h=300&fit=crop"
                        },
                        {
                            title: "Major Tech Companies Announce Joint AI Safety Initiative",
                            titleKo: "주요 테크 기업들, 공동 AI 안전 이니셔티브 발표",
                            source: "TechCrunch",
                            publishedAt: new Date(now - 7200000).toISOString(),
                            rating: 4.2,
                            tags: ["테크", "중요"],
                            summaryPoints: [
                                "구글, 마이크로소프트, 오픈AI 등 주요 기업들이 AI 안전 표준 수립",
                                "AI 개발 과정에서의 윤리적 가이드라인 공동 제정",
                                "각 기업별 5억 달러씩 총 25억 달러 규모의 AI 안전 연구 기금 조성"
                            ],
                            aiDetailedSummary: "글로벌 테크 기업들이 AI 기술의 안전한 개발을 위한 공동 이니셔티브를 발표했습니다.",
                            originalTextKo: "구글, 마이크로소프트, 오픈AI 등 주요 기술 기업들이 AI 안전을 위한 공동 이니셔티브를 발표했습니다.",
                            url: "https://techcrunch.com/ai-safety",
                            urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop"
                        }
                    ],
                    kr: [
                        {
                            title: "정부, 중소기업 디지털 전환 지원 정책 발표",
                            titleKo: "정부, 중소기업 디지털 전환 지원 정책 발표",
                            source: "연합뉴스",
                            publishedAt: new Date(now - 5400000).toISOString(),
                            rating: 3.8,
                            tags: ["경제", "중요"],
                            summaryPoints: [
                                "중소벤처기업부, 중소기업 디지털 전환 가속화를 위한 종합 정책 발표",
                                "5년간 10조원 규모의 정책금융 공급 및 기술 지원 프로그램 도입",
                                "글로벌 진출 지원과 온라인 플랫폼 구축을 통한 경쟁력 강화 추진"
                            ],
                            aiDetailedSummary: "중소벤처기업부는 중소기업의 디지털 전환 가속화와 글로벌 경쟁력 강화를 목표로 하는 종합 지원 정책을 발표했습니다.",
                            originalTextKo: "중소벤처기업부는 중소기업의 디지털 전환 가속화와 글로벌 경쟁력 강화를 목표로 하는 종합 지원 정책을 발표했습니다.",
                            url: "https://yna.co.kr/sme",
                            urlToImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=300&fit=crop"
                        },
                        {
                            title: "서울시, 2030년까지 탄소중립 도시 전환 로드맵 발표",
                            titleKo: "서울시, 2030년까지 탄소중립 도시 전환 로드맵 발표",
                            source: "KBS",
                            publishedAt: new Date(now - 3600000).toISOString(),
                            rating: 4.0,
                            tags: ["환경", "중요"],
                            summaryPoints: [
                                "서울시, 2030년까지 탄소배출량 70% 감축 목표 설정",
                                "대중교통 전면 전기화 및 그린 빌딩 전환 사업 추진",
                                "시민 참여형 탄소중립 실천 캠페인 전개"
                            ],
                            aiDetailedSummary: "서울시가 2030년까지 탄소중립 도시로 전환하기 위한 구체적인 로드맵을 발표했습니다.",
                            originalTextKo: "서울시가 2030년까지 탄소중립 도시로 전환하기 위한 구체적인 로드맵을 발표했습니다.",
                            url: "https://kbs.co.kr/seoul",
                            urlToImage: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&h=300&fit=crop"
                        }
                    ],
                    japan: [
                        {
                            title: "日本政府、少子化対策に過去最大規模の予算編成",
                            titleKo: "일본 정부, 저출산 대책에 역대 최대 규모 예산 편성",
                            source: "NHK",
                            publishedAt: new Date(now - 10800000).toISOString(),
                            rating: 4.3,
                            tags: ["중요", "경제"],
                            summaryPoints: [
                                "일본 정부, 저출산 대책에 50조엔 규모의 예산 편성",
                                "육아 수당 대폭 인상 및 무상 보육 확대",
                                "청년층 주거 지원 정책 강화"
                            ],
                            aiDetailedSummary: "일본 정부가 심각한 저출산 문제 해결을 위해 역대 최대 규모의 예산을 편성했습니다.",
                            originalTextKo: "일본 정부가 심각한 저출산 문제 해결을 위해 역대 최대 규모의 예산을 편성했습니다.",
                            url: "https://nhk.or.jp/news",
                            urlToImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=300&fit=crop"
                        }
                    ],
                    tech: [
                        {
                            title: "Apple Unveils Revolutionary AR Glasses at Special Event",
                            titleKo: "애플, 혁신적인 AR 글래스 공개",
                            source: "The Verge",
                            publishedAt: new Date(now - 1800000).toISOString(),
                            rating: 4.7,
                            tags: ["Hot", "테크"],
                            summaryPoints: [
                                "애플, 차세대 AR 글래스 'Vision Pro 2' 공개",
                                "초경량 디자인과 하루 종일 사용 가능한 배터리 탑재",
                                "가격은 $1,999로 기존 대비 50% 인하"
                            ],
                            aiDetailedSummary: "애플이 특별 이벤트에서 혁신적인 AR 글래스를 공개하며 증강현실 시장에 새로운 바람을 일으켰습니다.",
                            originalTextKo: "애플이 특별 이벤트에서 혁신적인 AR 글래스를 공개하며 증강현실 시장에 새로운 바람을 일으켰습니다.",
                            url: "https://theverge.com/apple",
                            urlToImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&h=300&fit=crop"
                        }
                    ],
                    business: [
                        {
                            title: "Global Stock Markets Hit Record Highs on Economic Recovery",
                            titleKo: "글로벌 증시, 경제 회복세에 사상 최고치 경신",
                            source: "Bloomberg",
                            publishedAt: new Date(now - 4000000).toISOString(),
                            rating: 4.1,
                            tags: ["경제", "중요"],
                            summaryPoints: [
                                "S&P 500, 나스닥 동시 사상 최고치 경신",
                                "아시아 증시도 동반 상승세 기록",
                                "전문가들, 하반기 추가 상승 전망"
                            ],
                            aiDetailedSummary: "글로벌 증시가 경제 회복 기대감에 힘입어 사상 최고치를 경신했습니다.",
                            originalTextKo: "글로벌 증시가 경제 회복 기대감에 힘입어 사상 최고치를 경신했습니다.",
                            url: "https://bloomberg.com/markets",
                            urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=300&fit=crop"
                        }
                    ],
                    buzz: [
                        {
                            title: "K-pop Group Breaks YouTube Record with New Music Video",
                            titleKo: "K-pop 그룹, 신곡 MV로 유튜브 기록 경신",
                            source: "Billboard",
                            publishedAt: new Date(now - 600000).toISOString(),
                            rating: 4.9,
                            tags: ["Buzz", "바이럴", "Hot"],
                            summaryPoints: [
                                "신곡 MV 공개 24시간 만에 조회수 1억뷰 돌파",
                                "유튜브 역사상 최단 시간 기록 달성",
                                "전 세계 73개국 음원 차트 1위 석권"
                            ],
                            aiDetailedSummary: "K-pop 그룹이 새 뮤직비디오로 유튜브 역사를 새로 썼습니다.",
                            originalTextKo: "K-pop 그룹이 새 뮤직비디오로 유튜브 역사를 새로 썼습니다.",
                            url: "https://billboard.com/kpop",
                            urlToImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop"
                        }
                    ]
                };

                // 요청된 섹션의 기사를 반환, 없으면 빈 배열
                const articles = baseArticles[section] || [];
                console.log(`Generated ${articles.length} articles for section: ${section}`);
                return articles;
            }

            displayNews(articles) {
                const newsGrid = document.getElementById('news-grid');
                
                if (!articles || articles.length === 0) {
                    newsGrid.innerHTML = '<p style="text-align: center; color: white; padding: 2rem;">표시할 뉴스가 없습니다.</p>';
                    return;
                }

                const newsHtml = articles.map((article, index) => {
                    const articleId = `article_${Date.now()}_${index}`;
                    const timeAgo = this.getTimeAgo(article.publishedAt);
                    const rating = article.rating || 0;
                    const tags = this.generateTags(article.tags || []);
                    const displayTitle = article.titleKo || article.title || '제목 없음';
                    const summaryHtml = this.formatSummaryPoints(article.summaryPoints || []);
                    
                    return `
                        <article class="news-item" data-article-id="${articleId}">
                            <div class="news-header">
                                <div class="news-source-time">
                                    <span class="news-source">${article.source || 'Unknown'}</span>
                                    <span class="time-ago">${timeAgo}</span>
                                </div>
                                <div class="rating-tag-group">
                                    <div class="news-tags">
                                        ${tags}
                                    </div>
                                    <div class="rating-badge">
                                        ${rating.toFixed(1)} ⭐
                                    </div>
                                </div>
                            </div>
                            
                            <div class="news-content">
                                <div class="news-title">
                                    ${this.currentSection === 'world' && article.title ? `<div class="news-title-original">${article.title}</div>` : ''}
                                    <div class="news-title-translated">${displayTitle}</div>
                                </div>
                                
                                <div class="ai-summary-main">
                                    ${summaryHtml}
                                </div>
                                
                                <div class="news-actions" id="actions-${articleId}">
                                    <div class="sub-actions">
                                        <button class="sub-action" onclick="newsApp.toggleSection('${articleId}', 'summary')">
                                            🔍 AI상세요약 보기
                                        </button>
                                        <button class="sub-action" onclick="newsApp.toggleSection('${articleId}', 'translation')">
                                            🌐 원문 번역 보기
                                        </button>
                                        <button class="sub-action" onclick="window.open('${article.url || '#'}', '_blank')">
                                            🔗 원문 바로가기
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="content-section" id="summary-${articleId}">
                                    <div class="ai-detailed-summary">
                                        <h4>🔍 AI 상세요약</h4>
                                        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${displayTitle}" class="expanded-image" onerror="this.style.display='none'">` : ''}
                                        <div class="summary-text">${article.aiDetailedSummary || '상세 요약 정보가 없습니다.'}</div>
                                    </div>
                                    
                                    <div class="section-actions">
                                        <button class="section-btn" onclick="newsApp.toggleSection('${articleId}', 'translation')">
                                            🌐 원문 번역 보기
                                        </button>
                                        <button class="section-btn" onclick="window.open('${article.url || '#'}', '_blank')">
                                            🔗 원문 바로가기
                                        </button>
                                        <button class="section-btn primary" onclick="newsApp.toggleSection('${articleId}', 'summary')">
                                            닫기
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="content-section" id="translation-${articleId}">
                                    <div class="original-translation">
                                        <h4>🌐 원문 번역보기</h4>
                                        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${displayTitle}" class="expanded-image" onerror="this.style.display='none'">` : ''}
                                        <div class="translation-text">${article.originalTextKo || article.originalText || '번역 정보가 없습니다.'}</div>
                                    </div>
                                    
                                    <div class="section-actions">
                                        <button class="section-btn" onclick="newsApp.toggleSection('${articleId}', 'summary')">
                                            🔍 AI상세요약 보기
                                        </button>
                                        <button class="section-btn" onclick="window.open('${article.url || '#'}', '_blank')">
                                            🔗 원문 바로가기
                                        </button>
                                        <button class="section-btn primary" onclick="newsApp.toggleSection('${articleId}', 'translation')">
                                            닫기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    `;
                }).join('');

                newsGrid.innerHTML = newsHtml;
                console.log('News displayed successfully');
            }

            toggleSection(articleId, sectionType) {
                const sectionId = `${sectionType}-${articleId}`;
                const section = document.getElementById(sectionId);
                const actionsDiv = document.getElementById(`actions-${articleId}`);
                
                const allSections = document.querySelectorAll(`[data-article-id="${articleId}"] .content-section`);
                allSections.forEach(s => {
                    if (s.id !== sectionId) {
                        s.classList.remove('expanded');
                    }
                });
                
                if (section) {
                    const isExpanded = section.classList.contains('expanded');
                    section.classList.toggle('expanded');
                    
                    if (actionsDiv) {
                        if (!isExpanded) {
                            actionsDiv.classList.add('actions-hidden');
                        } else {
                            actionsDiv.classList.remove('actions-hidden');
                        }
                    }
                }
            }

            showYouTubeSection() {
                const newsGrid = document.getElementById('news-grid');
                const youtubeSection = document.getElementById('youtube-section');
                
                newsGrid.style.display = 'none';
                youtubeSection.style.display = 'block';
                
                this.loadYouTubeVideos();
            }

            hideYouTubeSection() {
                const newsGrid = document.getElementById('news-grid');
                const youtubeSection = document.getElementById('youtube-section');
                
                newsGrid.style.display = 'grid';
                youtubeSection.style.display = 'none';
            }

            loadYouTubeVideos() {
                const youtubeGrid = document.getElementById('youtube-grid');
                
                const videos = [
                    { id: 'tgbNymZ7vqY', title: 'BBC News - Global Headlines', channel: 'BBC News' },
                    { id: 'hFZFjoX2cGg', title: 'CNN International - Breaking News', channel: 'CNN' },
                    { id: 'C_VheAwZBuQ', title: 'Reuters - World Update', channel: 'Reuters' },
                    { id: 'aiHOLIAqBLs', title: 'KBS 뉴스 - 오늘의 주요 뉴스', channel: 'KBS News' }
                ];
                
                youtubeGrid.innerHTML = videos.map(video => `
                    <div class="youtube-embed">
                        <iframe 
                            src="https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1" 
                            title="${video.title}"
                            frameborder="0" 
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                        <div style="padding: 0.5rem; font-size: 0.8rem; color: #666;">
                            <strong>${video.channel}</strong><br>
                            ${video.title}
                        </div>
                    </div>
                `).join('');
            }

            setupNavigation() {
                document.querySelectorAll('.nav-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        this.loadNews(e.target.dataset.section);
                    });
                });
            }

            startAutoUpdate() {
                this.updateInterval = setInterval(() => {
                    console.log('Auto-updating news...');
                    this.loadNews(this.currentSection);
                }, 600000); // 10분마다 업데이트
            }
        }

        // 전역 변수로 설정
        const newsApp = new EmarkNews();

        // PWA Service Worker 등록
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => console.log('SW registered:', registration))
                    .catch(error => console.log('SW registration failed:', error));
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            console.log('EmarkNews v7.1 initialized successfully! 🚀');
        });
