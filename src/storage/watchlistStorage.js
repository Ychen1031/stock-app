// src/storage/watchlistStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHLIST_KEY = '@watchlist_symbols';

/**
 * 讀取目前收藏的股票代碼陣列
 * 回傳例如：['2330', '0050']
 */
export async function loadWatchlistSymbols() {
  try {
    const jsonValue = await AsyncStorage.getItem(WATCHLIST_KEY);
    if (!jsonValue) return [];
    const parsed = JSON.parse(jsonValue);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.warn('[watchlist] load error:', e);
    return [];
  }
}

/**
 * 存入新的自選股代碼陣列
 */
export async function saveWatchlistSymbols(symbols) {
  try {
    const jsonValue = JSON.stringify(symbols);
    await AsyncStorage.setItem(WATCHLIST_KEY, jsonValue);
  } catch (e) {
    console.warn('[watchlist] save error:', e);
  }
}

/**
 * 切換收藏狀態：
 *  - 不在自選股 → 加入
 *  - 已在自選股 → 移除
 * 回傳最新的 symbols 陣列
 */
export async function toggleWatchlistSymbol(symbol) {
  const current = await loadWatchlistSymbols();
  let next;

  if (current.includes(symbol)) {
    next = current.filter((s) => s !== symbol);
  } else {
    next = [...current, symbol];
  }

  await saveWatchlistSymbols(next);
  return next;
}