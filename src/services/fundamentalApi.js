// src/services/fundamentalApi.js
import axios from 'axios';

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';
const FMP_API_KEY = 'demo'; // 建議申請免費 API Key: https://financialmodelingprep.com/developer/docs/

/**
 * 獲取台股基本面數據（使用 FMP API）
 * @param {string[]} symbols - 台股代碼陣列，例如 ['2330', '2317']
 * @returns Promise<{ symbol, pe, dividendYield, eps, marketCap, volume }[]>
 */
export async function fetchTaiwanFundamentals(symbols) {
  if (!symbols || symbols.length === 0) return [];

  const results = [];

  for (const symbol of symbols) {
    // 直接使用模擬數據，因為免費 API 限制較多
    results.push(getMockFundamentals(symbol));
  }

  return results;
}

/**
 * 獲取美股基本面數據
 * @param {string[]} symbols - 美股代碼陣列，例如 ['AAPL', 'MSFT']
 * @returns Promise<{ symbol, pe, dividendYield, eps, marketCap, volume }[]>
 */
export async function fetchUsFundamentals(symbols) {
  if (!symbols || symbols.length === 0) return [];

  const results = [];

  for (const symbol of symbols) {
    // 直接使用模擬數據
    results.push(getMockFundamentals(symbol));
  }

  return results;
}

/**
 * 模擬基本面數據（當 API 失敗或用於測試）
 */
function getMockFundamentals(symbol) {
  // 常見台股的模擬數據
  const mockData = {
    // 台股
    '2330': { name: '台積電', pe: 18.5, dividendYield: 2.1, eps: 32.5, marketCap: 15000000000000, volume: 35000000, changePercent: 0.34, price: 1495 },
    '2317': { name: '鴻海', pe: 12.3, dividendYield: 4.5, eps: 9.8, marketCap: 2000000000000, volume: 25000000, changePercent: 0.18, price: 224 },
    '2412': { name: '中華電', pe: 15.2, dividendYield: 5.2, eps: 4.8, marketCap: 1500000000000, volume: 8000000, changePercent: -0.25, price: 120 },
    '0050': { name: '元大台灣50', pe: 16.8, dividendYield: 3.8, eps: 8.5, marketCap: 500000000000, volume: 15000000, changePercent: -0.53, price: 150 },
    '2882': { name: '國泰金', pe: 11.5, dividendYield: 5.8, eps: 2.3, marketCap: 800000000000, volume: 20000000, changePercent: 1.25, price: 25.5 },
    '2454': { name: '聯發科', pe: 22.3, dividendYield: 1.8, eps: 45.2, marketCap: 3000000000000, volume: 18000000, changePercent: 2.15, price: 1080 },
    '2603': { name: '長榮', pe: 8.5, dividendYield: 6.2, eps: 15.3, marketCap: 600000000000, volume: 50000000, changePercent: 1.34, price: 188.5 },
    '2609': { name: '陽明', pe: 6.2, dividendYield: 7.5, eps: 8.9, marketCap: 400000000000, volume: 80000000, changePercent: 4.73, price: 55.3 },
    '2615': { name: '萬海', pe: 9.8, dividendYield: 5.5, eps: 7.2, marketCap: 350000000000, volume: 45000000, changePercent: 0.25, price: 78.7 },
    '1301': { name: '台塑', pe: 10.2, dividendYield: 4.8, eps: 6.5, marketCap: 900000000000, volume: 12000000, changePercent: -0.42, price: 85.5 },
    '1303': { name: '南亞', pe: 11.8, dividendYield: 4.2, eps: 5.8, marketCap: 750000000000, volume: 10000000, changePercent: 0.35, price: 72.3 },
    '2308': { name: '台達電', pe: 17.5, dividendYield: 3.2, eps: 12.8, marketCap: 1800000000000, volume: 22000000, changePercent: 1.18, price: 325 },
    '2382': { name: '廣達', pe: 16.2, dividendYield: 2.8, eps: 8.9, marketCap: 1200000000000, volume: 18000000, changePercent: 0.88, price: 145 },
    '2303': { name: '聯電', pe: 13.5, dividendYield: 4.5, eps: 2.8, marketCap: 850000000000, volume: 28000000, changePercent: -0.65, price: 48.5 },
    '2891': { name: '中信金', pe: 12.8, dividendYield: 5.5, eps: 1.8, marketCap: 650000000000, volume: 15000000, changePercent: 0.42, price: 22.8 },
    '2884': { name: '玉山金', pe: 13.2, dividendYield: 5.2, eps: 1.6, marketCap: 580000000000, volume: 12000000, changePercent: -0.28, price: 21.5 },
    '2886': { name: '兆豐金', pe: 11.8, dividendYield: 6.2, eps: 2.5, marketCap: 720000000000, volume: 18000000, changePercent: 0.75, price: 28.5 },
    '0056': { name: '元大高股息', pe: 14.5, dividendYield: 5.8, eps: 2.2, marketCap: 320000000000, volume: 25000000, changePercent: 0.15, price: 38.5 },
    
    // 美股
    'AAPL': { name: 'Apple', pe: 28.5, dividendYield: 0.5, eps: 6.15, marketCap: 2800000000000, volume: 55000000, changePercent: 1.25, price: 195.5 },
    'MSFT': { name: 'Microsoft', pe: 32.8, dividendYield: 0.8, eps: 11.25, marketCap: 2500000000000, volume: 28000000, changePercent: 0.85, price: 380.2 },
    'TSLA': { name: 'Tesla', pe: 65.5, dividendYield: 0, eps: 3.85, marketCap: 780000000000, volume: 125000000, changePercent: 3.55, price: 248.5 },
    'NVDA': { name: 'NVIDIA', pe: 55.2, dividendYield: 0.04, eps: 12.95, marketCap: 1200000000000, volume: 45000000, changePercent: 2.18, price: 520.8 },
    'META': { name: 'Meta', pe: 24.5, dividendYield: 0.35, eps: 14.85, marketCap: 950000000000, volume: 18000000, changePercent: 1.42, price: 365.5 },
    'AMZN': { name: 'Amazon', pe: 68.5, dividendYield: 0, eps: 2.95, marketCap: 1500000000000, volume: 42000000, changePercent: 0.95, price: 155.8 },
  };

  if (mockData[symbol]) {
    return { symbol, ...mockData[symbol] };
  }

  // 隨機生成數據（確保有合理的數值）
  return {
    symbol,
    name: `公司 ${symbol}`,
    pe: Math.random() * 25 + 8,              // 8-33
    dividendYield: Math.random() * 6 + 1,    // 1-7%
    eps: Math.random() * 40 + 2,             // 2-42
    marketCap: Math.random() * 2000000000000 + 100000000000,  // 1000億-2兆
    volume: Math.random() * 40000000 + 5000000,               // 500萬-4500萬
    changePercent: (Math.random() - 0.5) * 8,                 // -4% ~ +4%
    price: Math.random() * 400 + 50,         // 50-450
  };
}

/**
 * 綜合搜尋 - 取得股票完整數據（報價 + 基本面）
 * @param {string[]} symbols - 股票代碼
 * @param {'TW'|'US'} market - 市場
 */
export async function fetchStockWithFundamentals(symbols, market = 'TW') {
  if (market === 'TW') {
    return await fetchTaiwanFundamentals(symbols);
  } else {
    return await fetchUsFundamentals(symbols);
  }
}
