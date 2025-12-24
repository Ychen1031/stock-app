// src/services/searchApi.js
import axios from 'axios';

/**
 * 搜尋台股股票
 * @param {string} query - 搜尋關鍵字（股票代碼或名稱）
 * @returns {Array} 搜尋結果
 */
export async function searchTaiwanStocks(query) {
  if (!query || query.trim() === '') return [];
  
  try {
    // 模擬搜尋結果 - 實際使用時可以串接真實 API
    // 可以使用 Fugle API, Yahoo Finance 等
    const mockData = [
      { symbol: '0050.TW', name: '元大台灣50', market: 'TW' },
      { symbol: '2330.TW', name: '台積電', market: 'TW' },
      { symbol: '2317.TW', name: '鴻海', market: 'TW' },
      { symbol: '2454.TW', name: '聯發科', market: 'TW' },
      { symbol: '2308.TW', name: '台達電', market: 'TW' },
      { symbol: '2382.TW', name: '廣達', market: 'TW' },
      { symbol: '2412.TW', name: '中華電', market: 'TW' },
      { symbol: '2881.TW', name: '富邦金', market: 'TW' },
      { symbol: '2882.TW', name: '國泰金', market: 'TW' },
      { symbol: '2303.TW', name: '聯電', market: 'TW' },
      { symbol: '3008.TW', name: '大立光', market: 'TW' },
      { symbol: '2603.TW', name: '長榮', market: 'TW' },
      { symbol: '2609.TW', name: '陽明', market: 'TW' },
      { symbol: '2615.TW', name: '萬海', market: 'TW' },
      { symbol: '2618.TW', name: '長榮航', market: 'TW' },
      { symbol: '2880.TW', name: '華南金', market: 'TW' },
      { symbol: '2884.TW', name: '玉山金', market: 'TW' },
      { symbol: '2886.TW', name: '兆豐金', market: 'TW' },
      { symbol: '2891.TW', name: '中信金', market: 'TW' },
      { symbol: '2892.TW', name: '第一金', market: 'TW' },
      { symbol: '2912.TW', name: '統一超', market: 'TW' },
      { symbol: '1101.TW', name: '台泥', market: 'TW' },
      { symbol: '1216.TW', name: '統一', market: 'TW' },
      { symbol: '1301.TW', name: '台塑', market: 'TW' },
      { symbol: '1303.TW', name: '南亞', market: 'TW' },
      { symbol: '1326.TW', name: '台化', market: 'TW' },
      { symbol: '3711.TW', name: '日月光投控', market: 'TW' },
      { symbol: '6505.TW', name: '台塑化', market: 'TW' },
    ];

    const lowerQuery = query.toLowerCase();
    const results = mockData.filter(
      (item) =>
        item.symbol.toLowerCase().includes(lowerQuery) ||
        item.name.toLowerCase().includes(lowerQuery)
    );

    return results.slice(0, 10); // 最多返回 10 筆
  } catch (error) {
    console.error('Search Taiwan stocks error:', error);
    return [];
  }
}

/**
 * 搜尋美股股票
 * @param {string} query - 搜尋關鍵字（股票代碼或名稱）
 * @returns {Array} 搜尋結果
 */
export async function searchUSStocks(query) {
  if (!query || query.trim() === '') return [];
  
  try {
    // 模擬搜尋結果
    const mockData = [
      { symbol: 'AAPL', name: 'Apple Inc.', market: 'US' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'US' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'US' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'US' },
      { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'US' },
      { symbol: 'META', name: 'Meta Platforms Inc.', market: 'US' },
      { symbol: 'NFLX', name: 'Netflix Inc.', market: 'US' },
      { symbol: 'AMD', name: 'Advanced Micro Devices', market: 'US' },
      { symbol: 'INTC', name: 'Intel Corporation', market: 'US' },
    ];

    const lowerQuery = query.toLowerCase();
    const results = mockData.filter(
      (item) =>
        item.symbol.toLowerCase().includes(lowerQuery) ||
        item.name.toLowerCase().includes(lowerQuery)
    );

    return results.slice(0, 10);
  } catch (error) {
    console.error('Search US stocks error:', error);
    return [];
  }
}

/**
 * 綜合搜尋（台股 + 美股）
 * @param {string} query - 搜尋關鍵字
 * @returns {Array} 搜尋結果
 */
export async function searchAllStocks(query) {
  if (!query || query.trim() === '') return [];
  
  try {
    const [twResults, usResults] = await Promise.all([
      searchTaiwanStocks(query),
      searchUSStocks(query),
    ]);

    return [...twResults, ...usResults];
  } catch (error) {
    console.error('Search all stocks error:', error);
    return [];
  }
}
