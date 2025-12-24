// src/services/stockApi.js
import axios from 'axios';

const TWSE_URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp';

/**
 * 取得多檔台股即時報價
 * @param {string[]} codes - 例如 ['2330', '0050', '2317']
 * @returns Promise< { symbol, name, price, change }[] >
 */
export async function fetchTaiwanStocks(codes) {
  if (!codes || codes.length === 0) return [];

  // 組 ex_ch 參數：tse_2330.tw|tse_0050.tw|...
  const ex_ch = codes.map((code) => `tse_${code}.tw`).join('|');

  const params = {
    ex_ch,
    json: 1,
    delay: 0,
  };

  const res = await axios.get(TWSE_URL, { params });

  const data = res.data;

  if (!data || !Array.isArray(data.msgArray)) {
    return [];
  }

  // 轉成前端好用的格式
  return data.msgArray.map((item) => {
    const symbol = item.c;      // 2330
    const name = item.n;        // 台積電
    const last = parseFloat(item.z); // 當盤成交價
    const prev = parseFloat(item.y); // 昨收

    const price = isNaN(last) ? 0 : last;
    const prevClose = isNaN(prev) ? price : prev;
    const change = price - prevClose;

    return {
      symbol,
      name,
      price,
      change,
    };
  });
}