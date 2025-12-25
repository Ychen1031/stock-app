// src/storage/searchHistoryStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@search_history';
const MAX_HISTORY_SIZE = 10; // 最多保存 10 條搜尋記錄

/**
 * 獲取搜尋歷史記錄
 * @returns {Promise<Array>} 搜尋歷史陣列
 */
export const getSearchHistory = async () => {
  try {
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('獲取搜尋歷史失敗:', error);
    return [];
  }
};

/**
 * 添加搜尋記錄
 * @param {Object} item - 搜尋項目 { symbol, name, market }
 */
export const addSearchHistory = async (item) => {
  try {
    const history = await getSearchHistory();
    
    // 移除重複項目（如果已存在）
    const filteredHistory = history.filter(
      h => h.symbol !== item.symbol || h.market !== item.market
    );
    
    // 將新項目添加到最前面
    const newHistory = [
      {
        ...item,
        timestamp: Date.now(),
      },
      ...filteredHistory,
    ].slice(0, MAX_HISTORY_SIZE); // 限制數量
    
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (error) {
    console.error('添加搜尋歷史失敗:', error);
    return [];
  }
};

/**
 * 清除所有搜尋歷史
 */
export const clearSearchHistory = async () => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('清除搜尋歷史失敗:', error);
  }
};

/**
 * 刪除單一搜尋記錄
 * @param {string} symbol - 股票代碼
 * @param {string} market - 市場類型
 */
export const removeSearchHistoryItem = async (symbol, market) => {
  try {
    const history = await getSearchHistory();
    const newHistory = history.filter(
      h => h.symbol !== symbol || h.market !== market
    );
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (error) {
    console.error('刪除搜尋記錄失敗:', error);
    return [];
  }
};
