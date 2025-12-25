// src/services/backtestApi.js
import axios from 'axios';

/**
 * 將時間戳轉換為 YYYY-MM-DD 格式
 */
function timestampToDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Yahoo Finance 需要的 symbol 格式
 * 台股：2330 -> 2330.TW
 * 美股：AAPL -> AAPL
 */
function toYahooSymbol({ market, symbol }) {
  const s = String(symbol || '').trim();
  
  if (market === 'TW') return `${s}.TW`;  // 2330 -> 2330.TW
  if (market === 'US') return s.toUpperCase();  // aapl -> AAPL
  return s;
}

/**
 * 取得歷史收盤價（使用 Yahoo Finance 免費 API）
 * @returns [{ date:'YYYY-MM-DD', close:number }]
 */
export async function fetchDailyClosesByStooq({ market, symbol }) {
  const yahooSymbol = toYahooSymbol({ market, symbol });

  // 計算時間範圍（取最近 2 年的資料）
  const now = Math.floor(Date.now() / 1000);
  const twoYearsAgo = now - (730 * 24 * 60 * 60);

  // Yahoo Finance API v8 (免費，無需 API key)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?period1=${twoYearsAgo}&period2=${now}&interval=1d`;

  console.log('[Yahoo Finance] 請求 URL:', url);
  console.log('[Yahoo Finance] symbol:', yahooSymbol);

  try {
    const res = await axios.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log('[Yahoo Finance] 回應狀態:', res.status);

    const result = res.data?.chart?.result?.[0];
    if (!result) {
      console.log('[Yahoo Finance] 無法取得資料');
      return [];
    }

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];

    console.log('[Yahoo Finance] 時間戳數量:', timestamps.length);
    console.log('[Yahoo Finance] 收盤價數量:', closes.length);

    const rows = [];
    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i];
      if (close != null && Number.isFinite(close)) {
        rows.push({
          date: timestampToDate(timestamps[i]),
          close: close
        });
      }
    }

    console.log('[Yahoo Finance] 解析後的資料筆數:', rows.length);
    if (rows.length > 0) {
      console.log('[Yahoo Finance] 第一筆:', rows[0]);
      console.log('[Yahoo Finance] 最後一筆:', rows[rows.length - 1]);
    }

    return rows;
  } catch (err) {
    const status = err?.response?.status;
    console.log('[Yahoo Finance] 請求失敗', { status, message: err.message, url });
    throw err;
  }
}