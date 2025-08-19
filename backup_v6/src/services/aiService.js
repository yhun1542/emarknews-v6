const axios = require('axios');

class AIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openaiBaseUrl = 'https://api.openai.com/v1';
  }

  // OpenAI API 호출 헬퍼
  async callOpenAI(messages, maxTokens = 1000) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('[AI] OpenAI API 호출 오류:', error.response?.data || error.message);
      throw new Error('AI 서비스 호출에 실패했습니다.');
    }
  }

  // 뉴스 기사 번역
  async translateArticle(title, description, targetLanguage = 'ko') {
    const languageMap = {
      'ko': '한국어',
      'en': '영어',
      'ja': '일본어',
      'zh': '중국어',
      'es': '스페인어',
      'fr': '프랑스어'
    };

    const targetLangName = languageMap[targetLanguage] || '한국어';

    const messages = [
      {
        role: 'system',
        content: `당신은 전문 번역가입니다. 뉴스 기사의 제목과 내용을 정확하고 자연스럽게 ${targetLangName}로 번역해주세요. 뉴스의 맥락과 뉘앙스를 유지하면서 번역하세요.`
      },
      {
        role: 'user',
        content: `다음 뉴스 기사를 ${targetLangName}로 번역해주세요:

제목: ${title}

내용: ${description}

번역 결과를 JSON 형식으로 반환해주세요:
{
  "translatedTitle": "번역된 제목",
  "translatedDescription": "번역된 내용"
}`
      }
    ];

    try {
      const result = await this.callOpenAI(messages, 1500);
      
      // JSON 파싱 시도
      try {
        const parsed = JSON.parse(result);
        return {
          success: true,
          translatedTitle: parsed.translatedTitle || title,
          translatedDescription: parsed.translatedDescription || description,
          targetLanguage: targetLanguage,
          originalTitle: title,
          originalDescription: description
        };
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트 그대로 반환
        return {
          success: true,
          translatedTitle: result.split('\n')[0] || title,
          translatedDescription: result,
          targetLanguage: targetLanguage,
          originalTitle: title,
          originalDescription: description
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalTitle: title,
        originalDescription: description
      };
    }
  }

  // 뉴스 기사 요약
  async summarizeArticle(title, description) {
    const messages = [
      {
        role: 'system',
        content: '당신은 뉴스 요약 전문가입니다. 뉴스 기사의 핵심 내용을 간결하고 명확하게 요약해주세요. 중요한 정보는 빠뜨리지 말고, 객관적인 톤을 유지하세요.'
      },
      {
        role: 'user',
        content: `다음 뉴스 기사를 3-4문장으로 요약해주세요:

제목: ${title}

내용: ${description}

요약 결과를 JSON 형식으로 반환해주세요:
{
  "summary": "요약된 내용",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"]
}`
      }
    ];

    try {
      const result = await this.callOpenAI(messages, 800);
      
      // JSON 파싱 시도
      try {
        const parsed = JSON.parse(result);
        return {
          success: true,
          summary: parsed.summary || result,
          keyPoints: parsed.keyPoints || [],
          originalTitle: title,
          originalDescription: description
        };
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트 그대로 반환
        return {
          success: true,
          summary: result,
          keyPoints: [],
          originalTitle: title,
          originalDescription: description
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalTitle: title,
        originalDescription: description
      };
    }
  }

  // 뉴스 감정 분석
  async analyzeSentiment(title, description) {
    const messages = [
      {
        role: 'system',
        content: '당신은 뉴스 감정 분석 전문가입니다. 뉴스 기사의 전반적인 감정과 톤을 분석해주세요.'
      },
      {
        role: 'user',
        content: `다음 뉴스 기사의 감정을 분석해주세요:

제목: ${title}

내용: ${description}

분석 결과를 JSON 형식으로 반환해주세요:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.85,
  "emotions": ["기쁨", "우려", "놀라움"],
  "tone": "객관적|주관적|비판적|긍정적"
}`
      }
    ];

    try {
      const result = await this.callOpenAI(messages, 500);
      
      try {
        const parsed = JSON.parse(result);
        return {
          success: true,
          sentiment: parsed.sentiment || 'neutral',
          confidence: parsed.confidence || 0.5,
          emotions: parsed.emotions || [],
          tone: parsed.tone || '객관적',
          originalTitle: title,
          originalDescription: description
        };
      } catch (parseError) {
        return {
          success: true,
          sentiment: 'neutral',
          confidence: 0.5,
          emotions: [],
          tone: '객관적',
          analysis: result,
          originalTitle: title,
          originalDescription: description
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalTitle: title,
        originalDescription: description
      };
    }
  }

  // AI 서비스 상태 확인
  async healthCheck() {
    try {
      if (!this.openaiApiKey) {
        return {
          status: 'error',
          message: 'OpenAI API 키가 설정되지 않음'
        };
      }

      // 간단한 테스트 호출
      const testMessages = [
        {
          role: 'user',
          content: 'Hello, this is a test. Please respond with "OK".'
        }
      ];

      await this.callOpenAI(testMessages, 10);
      
      return {
        status: 'healthy',
        message: 'AI 서비스 정상 작동',
        features: ['번역', '요약', '감정분석']
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}

module.exports = new AIService();

