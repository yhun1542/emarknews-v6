const axios = require('axios');
const logger = require('../utils/logger');

class CurrencyService {
  constructor() {
    this.defaultRates = {
      USD: { rate: 1250, change: 0, changePercent: '0.00', trend: 'neutral' },
      JPY: { rate: 920, change: 0, changePercent: '0.00', trend: 'neutral' },
      EUR: { rate: 1350, change: 0, changePercent: '0.00', trend: 'neutral' }
    };
  }

  async getRates() {
    try {
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;
      if (!apiKey) {
        return { rates: this.defaultRates, source: 'default' };
      }
      
      const response = await axios.get(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { timeout: 5000 }
      );
      
      if (response.data && response.data.rates) {
        const krw = response.data.rates.KRW || 1250;
        const jpy = response.data.rates.JPY || 100;
        const eur = response.data.rates.EUR || 0.85;
        
        return {
          rates: {
            USD: { rate: Math.round(krw), change: 0, changePercent: '0.00', trend: 'neutral' },
            JPY: { rate: Math.round(krw / jpy * 100), change: 0, changePercent: '0.00', trend: 'neutral' },
            EUR: { rate: Math.round(krw / eur), change: 0, changePercent: '0.00', trend: 'neutral' }
          },
          source: 'exchangerate-api',
          timestamp: new Date().toISOString()
        };
      }
      
      return { rates: this.defaultRates, source: 'fallback' };
    } catch (error) {
      logger.error('Currency service error:', error);
      return { rates: this.defaultRates, source: 'error' };
    }
  }
}

module.exports = new CurrencyService();
