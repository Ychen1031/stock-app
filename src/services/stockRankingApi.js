// src/services/stockRankingApi.js
import { fetchTaiwanStocks } from './stockApi';

// 台股前 15 大市值（最新權值股成分）
const TW_TOP15 = [
  '2330', // 台積電
  '2317', // 鴻海
  '2454', // 聯發科
  '6505', // 台塑化
  '2412', // 中華電
  '2303', // 聯電
  '1303', // 南亞
  '2882', // 國泰金
  '2881', // 富邦金
  '1326', // 台化
  '3711', // 日月光
  '2891', // 中信金
  '2603', // 長榮
  '2609', // 陽明
  '2615', // 萬海
];

/**
 * 取得台股熱門排行（前 15 大成分股）
 * 依漲跌幅排序（change）
 */
export async function fetchTwHotRanksTop15() {
  try {
    // 使用你的 TWSE API 取得即時報價
    const data = await fetchTaiwanStocks(TW_TOP15);

    if (!data || data.length === 0) return [];

    // 排序邏輯：漲幅大的排前面
    const sorted = [...data].sort((a, b) => b.change - a.change);

    return sorted;
  } catch (e) {
    console.log('fetchTwHotRanksTop15 error:', e);
    return [];
  }
}