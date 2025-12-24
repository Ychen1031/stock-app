// src/services/usStockApi.js
import axios from 'axios';

const FINNHUB_URL = 'https://finnhub.io/api/v1/quote';

// TODO: 這裡貼上你自己的 Finnhub API Key
const API_KEY = 'd4le7v9r01qt7v1a8hf0d4le7v9r01qt7v1a8hfg';

/**
 * 取得多檔美股即時報價（使用 Finnhub quote）
 * @param {string[]} symbols - 例如 ['AAPL', 'MSFT', 'TSLA']
 * @returns Promise< { symbol, name, price, change, changePercent }[] >
 */
export async function fetchUsStockQuotes(symbols) {
  if (!symbols || symbols.length === 0) return [];

  // 簡單的代碼 → 公司名稱對照表（你可以之後再補更多）
  const NAME_MAP = {
    AAPL: 'Apple',
    MSFT: 'Microsoft',
    TSLA: 'Tesla',
    NVDA: 'NVIDIA',
    META: 'Meta',
    AMZN: 'Amazon',
    'BRK.B': 'Berkshire Hathaway',
    AVGO: 'Broadcom',
    LLY: 'Eli Lilly',
    JPM: 'JPMorgan Chase',
    UNH: 'UnitedHealth',
    V: 'Visa',
    MA: 'Mastercard',
  };

  const results = [];

  // Finnhub 一次一檔，我們就 for 迴圈逐檔查
  for (const symbol of symbols) {
    try {
      const params = {
        symbol,
        token: API_KEY,
      };

      const res = await axios.get(FINNHUB_URL, { params });
      const data = res.data;

      // Finnhub 回傳格式：
      // c: current price
      // d: change
      // dp: change percent
      if (!data || typeof data.c !== 'number') {
        console.log('No quote data for', symbol, data);
        continue;
      }

      const price = data.c;
      const change = data.d ?? 0;
      const changePercent = data.dp ?? 0;

      results.push({
        symbol,
        name: NAME_MAP[symbol] || symbol,
        price,
        change,
        changePercent,
      });
    } catch (error) {
      console.log('fetchUsStockQuotes error:', {
        symbol,
        message: error.message,
        status: error.response?.status,
      });
    }
  }

  return results;
}