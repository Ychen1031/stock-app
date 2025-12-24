// src/storage/priceAlertStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRICE_ALERTS_KEY = '@stock_app_price_alerts';

/**
 * 價格提醒資料結構
 * {
 *   id: string,
 *   symbol: string,
 *   name: string,
 *   targetPrice: number,
 *   condition: 'above' | 'below', // 高於或低於目標價
 *   isActive: boolean,
 *   createdAt: timestamp,
 *   triggeredAt: timestamp | null,
 * }
 */

// 載入所有價格提醒
export async function loadPriceAlerts() {
  try {
    const data = await AsyncStorage.getItem(PRICE_ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Load price alerts error:', error);
    return [];
  }
}

// 儲存價格提醒
export async function savePriceAlerts(alerts) {
  try {
    await AsyncStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
    return true;
  } catch (error) {
    console.error('Save price alerts error:', error);
    return false;
  }
}

// 新增價格提醒
export async function addPriceAlert(alert) {
  try {
    const alerts = await loadPriceAlerts();
    const newAlert = {
      id: Date.now().toString(),
      ...alert,
      isActive: true,
      createdAt: Date.now(),
      triggeredAt: null,
    };
    alerts.push(newAlert);
    await savePriceAlerts(alerts);
    return newAlert;
  } catch (error) {
    console.error('Add price alert error:', error);
    return null;
  }
}

// 刪除價格提醒
export async function deletePriceAlert(alertId) {
  try {
    const alerts = await loadPriceAlerts();
    const filtered = alerts.filter((a) => a.id !== alertId);
    await savePriceAlerts(filtered);
    return true;
  } catch (error) {
    console.error('Delete price alert error:', error);
    return false;
  }
}

// 更新價格提醒狀態
export async function updatePriceAlertStatus(alertId, isActive) {
  try {
    const alerts = await loadPriceAlerts();
    const updated = alerts.map((a) =>
      a.id === alertId ? { ...a, isActive } : a
    );
    await savePriceAlerts(updated);
    return true;
  } catch (error) {
    console.error('Update price alert status error:', error);
    return false;
  }
}

// 標記提醒已觸發
export async function markAlertTriggered(alertId) {
  try {
    const alerts = await loadPriceAlerts();
    const updated = alerts.map((a) =>
      a.id === alertId
        ? { ...a, triggeredAt: Date.now(), isActive: false }
        : a
    );
    await savePriceAlerts(updated);
    return true;
  } catch (error) {
    console.error('Mark alert triggered error:', error);
    return false;
  }
}

// 檢查價格提醒（用於背景檢查）
export async function checkPriceAlerts(currentPrices) {
  /**
   * currentPrices: { symbol: price }
   * 例如: { '2330.TW': 580, 'AAPL': 175 }
   */
  try {
    const alerts = await loadPriceAlerts();
    const triggered = [];

    for (const alert of alerts) {
      if (!alert.isActive) continue;

      const currentPrice = currentPrices[alert.symbol];
      if (!currentPrice) continue;

      const shouldTrigger =
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        triggered.push(alert);
        await markAlertTriggered(alert.id);
      }
    }

    return triggered;
  } catch (error) {
    console.error('Check price alerts error:', error);
    return [];
  }
}

// 取得特定股票的提醒
export async function getAlertsBySymbol(symbol) {
  try {
    const alerts = await loadPriceAlerts();
    return alerts.filter((a) => a.symbol === symbol);
  } catch (error) {
    console.error('Get alerts by symbol error:', error);
    return [];
  }
}
