// ai-features.js - 프론트엔드 AI 기능 (사용자 제공 코드)

class AIFeatures {
    constructor() {
        this.apiBaseUrl = window.location.origin; // 또는 백엔드 URL
        this.translatedArticles = new Map(); // 번역된 기사 캐시
        this.summarizedArticles = new Map(); // 요약된 기사 캐시
    }

    // 번역 기능
    async translateArticle(articleId) {
        try {
            // 캐시 확인
            if (this.translatedArticles.has(articleId)) {
                this.displayTranslation(articleId, this.translatedArticles.get(articleId));
                return;
            }

            // 로딩 표시
            this.showLoading(articleId, 'translate');

            // 기사 데이터 가져오기
            const articleElement = document.querySelector(`[data-article-id="${articleId}"]`);
            const title = articleElement.querySelector('.article-title').textContent;
            const content = articleElement.querySelector('.article-description').textContent;

            // API 호출
            const response = await fetch(`${this.apiBaseUrl}/api/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: `${title}\n\n${content}`,
                    targetLang: 'ko',
                    service: 'libre' // 'openai', 'google', 'deepl', 'libre'
                })
            });

            const data = await response.json();

            if (data.success) {
                // 캐시 저장
                this.translatedArticles.set(articleId, data.translated);
                // 번역 표시
                this.displayTranslation(articleId, data.translated);
            } else {
                throw new Error(data.error || '번역 실패');
            }

        } catch (error) {
            console.error('번역 오류:', error);
            this.showError(articleId, '번역 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading(articleId, 'translate');
        }
    }

    // 요약 기능
    async summarizeArticle(articleId) {
        try {
            // 캐시 확인
            if (this.summarizedArticles.has(articleId)) {
                this.displaySummary(articleId, this.summarizedArticles.get(articleId));
                return;
            }

            // 로딩 표시
            this.showLoading(articleId, 'summarize');

            // 기사 데이터 가져오기
            const articleElement = document.querySelector(`[data-article-id="${articleId}"]`);
            const content = articleElement.querySelector('.article-description').textContent;

            // API 호출
            const response = await fetch(`${this.apiBaseUrl}/api/summarize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: content,
                    maxLength: 200,
                    useAI: false // true면 OpenAI 사용
                })
            });

            const data = await response.json();

            if (data.success) {
                // 캐시 저장
                this.summarizedArticles.set(articleId, data.summary);
                // 요약 표시
                this.displaySummary(articleId, data.summary);
            } else {
                throw new Error(data.error || '요약 실패');
            }

        } catch (error) {
            console.error('요약 오류:', error);
            this.showError(articleId, '요약 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading(articleId, 'summarize');
        }
    }

    // 일괄 처리 기능
    async processAllArticles(action = 'both') {
        try {
            // 모든 기사 수집
            const articles = [];
            document.querySelectorAll('[data-article-id]').forEach(element => {
                articles.push({
                    id: element.dataset.articleId,
                    title: element.querySelector('.article-title')?.textContent || '',
                    description: element.querySelector('.article-description')?.textContent || '',
                    content: element.querySelector('.article-content')?.textContent || ''
                });
            });

            // 로딩 표시
            this.showGlobalLoading();

            // API 호출
            const response = await fetch(`${this.apiBaseUrl}/api/process-articles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    articles: articles,
                    action: action // 'translate', 'summarize', 'both'
                })
            });

            const data = await response.json();

            if (data.success) {
                // 결과 표시
                data.articles.forEach(article => {
                    if (article.translatedTitle || article.translatedContent) {
                        const translated = `${article.translatedTitle}\n\n${article.translatedContent}`;
                        this.translatedArticles.set(article.id, translated);
                        this.displayTranslation(article.id, translated);
                    }
                    if (article.summary) {
                        this.summarizedArticles.set(article.id, article.summary);
                        this.displaySummary(article.id, article.summary);
                    }
                });

                this.showSuccess('모든 기사 처리 완료!');
            } else {
                throw new Error(data.error || '처리 실패');
            }

        } catch (error) {
            console.error('일괄 처리 오류:', error);
            this.showError(null, '일괄 처리 중 오류가 발생했습니다.');
        } finally {
            this.hideGlobalLoading();
        }
    }

    // UI 헬퍼 함수들
    displayTranslation(articleId, translatedText) {
        const articleElement = document.querySelector(`[data-article-id="${articleId}"]`);
        
        // 번역 결과 컨테이너 생성 또는 업데이트
        let translationContainer = articleElement.querySelector('.translation-container');
        if (!translationContainer) {
            translationContainer = document.createElement('div');
            translationContainer.className = 'translation-container';
            articleElement.appendChild(translationContainer);
        }

        translationContainer.innerHTML = `
            <div class="translated-content">
                <div class="translation-header">
                    <span class="badge badge-translation">🌐 번역됨</span>
                    <button onclick="aiFeatures.toggleOriginal('${articleId}')" class="btn-toggle">
                        원문 보기
                    </button>
                </div>
                <div class="translated-text">${this.formatText(translatedText)}</div>
            </div>
        `;

        // 원본 숨기기
        const original = articleElement.querySelector('.article-original');
        if (original) {
            original.style.display = 'none';
        }
    }

    displaySummary(articleId, summaryText) {
        const articleElement = document.querySelector(`[data-article-id="${articleId}"]`);
        
        // 요약 결과 컨테이너 생성 또는 업데이트
        let summaryContainer = articleElement.querySelector('.summary-container');
        if (!summaryContainer) {
            summaryContainer = document.createElement('div');
            summaryContainer.className = 'summary-container';
            articleElement.appendChild(summaryContainer);
        }

        summaryContainer.innerHTML = `
            <div class="summary-content">
                <div class="summary-header">
                    <span class="badge badge-summary">📝 요약</span>
                </div>
                <div class="summary-text">${summaryText}</div>
            </div>
        `;
    }

    toggleOriginal(articleId) {
        const articleElement = document.querySelector(`[data-article-id="${articleId}"]`);
        const original = articleElement.querySelector('.article-original');
        const translated = articleElement.querySelector('.translated-content');
        
        if (original && translated) {
            if (original.style.display === 'none') {
                original.style.display = 'block';
                translated.style.display = 'none';
            } else {
                original.style.display = 'none';
                translated.style.display = 'block';
            }
        }
    }

    showLoading(articleId, action) {
        const btn = document.querySelector(`[data-article-id="${articleId}"] .btn-${action}`);
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> 처리 중...';
        }
    }

    hideLoading(articleId, action) {
        const btn = document.querySelector(`[data-article-id="${articleId}"] .btn-${action}`);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = action === 'translate' ? '🌐 번역' : '📝 요약';
        }
    }

    showGlobalLoading() {
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'global-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner-large"></div>
                <p>기사를 처리하고 있습니다...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideGlobalLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.remove();
        }
    }

    showError(articleId, message) {
        if (articleId) {
            const articleElement = document.querySelector(`[data-article-id="${articleId}"]`);
            if (articleElement) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                articleElement.appendChild(errorDiv);
                
                setTimeout(() => errorDiv.remove(), 3000);
            }
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => successDiv.remove(), 3000);
    }

    formatText(text) {
        return text.replace(/\n/g, '<br>');
    }
}

// 전역 인스턴스 생성
const aiFeatures = new AIFeatures();

// 기사 카드에 AI 버튼 추가하는 함수
function addAIButtons(articleElement, articleData) {
    const aiButtonsContainer = document.createElement('div');
    aiButtonsContainer.className = 'ai-buttons';
    aiButtonsContainer.innerHTML = `
        <button class="btn-ai btn-translate" onclick="aiFeatures.translateArticle('${articleData.id}')">
            🌐 번역
        </button>
        <button class="btn-ai btn-summarize" onclick="aiFeatures.summarizeArticle('${articleData.id}')">
            📝 요약
        </button>
    `;
    
    const footer = articleElement.querySelector('.article-footer');
    if (footer) {
        footer.appendChild(aiButtonsContainer);
    } else {
        articleElement.appendChild(aiButtonsContainer);
    }
}

// 전체 제어 버튼 추가
function addGlobalAIControls() {
    const controlPanel = document.createElement('div');
    controlPanel.className = 'ai-control-panel';
    controlPanel.innerHTML = `
        <div class="ai-controls">
            <h3>AI 기능</h3>
            <button onclick="aiFeatures.processAllArticles('translate')" class="btn-primary">
                🌐 모든 기사 번역
            </button>
            <button onclick="aiFeatures.processAllArticles('summarize')" class="btn-primary">
                📝 모든 기사 요약
            </button>
            <button onclick="aiFeatures.processAllArticles('both')" class="btn-primary">
                🚀 번역 + 요약
            </button>
        </div>
    `;
    
    const header = document.querySelector('.header');
    if (header) {
        header.appendChild(controlPanel);
    } else {
        document.body.appendChild(controlPanel);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 전역 컨트롤 추가
    addGlobalAIControls();
    
    // 각 기사에 AI 버튼 추가
    document.querySelectorAll('[data-article-id]').forEach(article => {
        const articleData = {
            id: article.dataset.articleId,
            // 기타 데이터...
        };
        addAIButtons(article, articleData);
    });
});

