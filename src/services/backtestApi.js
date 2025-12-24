// src/services/backtestApi.js
import axios from 'axios';

// 解析 CSV（不靠套件）
function parseCsvToCloses(csvText) {
  const lines = String(csvText || '').trim().split('\n');
  if (lines.length <= 1) return [];

  // header: Date,Open,High,Low,Close,Volume
  const out = [];
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',');
    const date = cols[0];
    const close = Number(cols[4]);

    if (date && Number.isFinite(close)) out.push({ date, close });
  }
  return out;
}

// Stooq 需要的 symbol 格式：
// 台股：2330.TW -> stooq 用 2330.tw（小寫）
// 美股：AAPL -> aapl.us
function toStooqSymbol({ market, symbol }) {
  const s = String(symbol || '').trim().toLowerCase();

  if (market === 'TW') return `${s}.tw`;  // 2330 -> 2330.tw
  if (market === 'US') return `${s}.us`;  // aapl -> aapl.us
  return s;
}

/**
 * 取得歷史收盤價（免 token）
 * @returns [{ date:'YYYY-MM-DD', close:number }]
 */
export async function fetchDailyClosesByStooq({ market, symbol }) {
  const stooqSymbol = toStooqSymbol({ market, symbol });

  // 免 key 的日線 CSV
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&i=d`;

  try {
    const res = await axios.get(url, { timeout: 15000 });
    const rows = parseCsvToCloses(res.data);
    return rows;
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.log('[Stooq] fetchDailyClosesByStooq failed', { status, data, url });
    throw err;
  }
}