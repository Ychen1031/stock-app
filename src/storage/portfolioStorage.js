// src/storage/portfolioStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const PORTFOLIO_KEY = '@stock_app_portfolio';

/**
 * 持倉資料結構
 * {
 *   id: string,
 *   symbol: string,
 *   name: string,
 *   market: 'TW' | 'US',
 *   transactions: [
 *     {
 *       id: string,
 *       type: 'buy' | 'sell',
 *       quantity: number,
 *       price: number,
 *       date: timestamp,
 *       note: string,
 *     }
 *   ],
 *   totalShares: number,
 *   averageCost: number,
 * }
 */

// 載入持倉資料
export async function loadPortfolio() {
  try {
    const data = await AsyncStorage.getItem(PORTFOLIO_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Load portfolio error:', error);
    return [];
  }
}

// 儲存持倉資料
export async function savePortfolio(portfolio) {
  try {
    await AsyncStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
    return true;
  } catch (error) {
    console.error('Save portfolio error:', error);
    return false;
  }
}

// 計算平均成本和總股數
function calculatePortfolioMetrics(transactions) {
  let totalShares = 0;
  let totalCost = 0;

  for (const tx of transactions) {
    if (tx.type === 'buy') {
      totalShares += tx.quantity;
      totalCost += tx.quantity * tx.price;
    } else if (tx.type === 'sell') {
      const sellRatio = totalShares > 0 ? tx.quantity / totalShares : 0;
      totalCost -= totalCost * sellRatio;
      totalShares -= tx.quantity;
    }
  }

  const averageCost = totalShares > 0 ? totalCost / totalShares : 0;

  return { totalShares, averageCost };
}

// 新增交易記錄
export async function addTransaction(symbol, name, market, transaction) {
  try {
    const portfolio = await loadPortfolio();
    let holding = portfolio.find((h) => h.symbol === symbol);

    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      date: transaction.date || Date.now(),
    };

    if (!holding) {
      // 新的持倉
      holding = {
        id: Date.now().toString(),
        symbol,
        name,
        market,
        transactions: [newTransaction],
        totalShares: 0,
        averageCost: 0,
      };
      portfolio.push(holding);
    } else {
      holding.transactions.push(newTransaction);
    }

    // 重新計算指標
    const metrics = calculatePortfolioMetrics(holding.transactions);
    holding.totalShares = metrics.totalShares;
    holding.averageCost = metrics.averageCost;

    // 如果股數為 0，可選擇保留或刪除記錄
    // 這裡選擇保留，方便查看歷史
    
    await savePortfolio(portfolio);
    return holding;
  } catch (error) {
    console.error('Add transaction error:', error);
    return null;
  }
}

// 刪除交易記錄
export async function deleteTransaction(symbol, transactionId) {
  try {
    const portfolio = await loadPortfolio();
    const holding = portfolio.find((h) => h.symbol === symbol);

    if (!holding) return false;

    holding.transactions = holding.transactions.filter(
      (tx) => tx.id !== transactionId
    );

    if (holding.transactions.length === 0) {
      // 如果沒有交易記錄了，刪除整個持倉
      const index = portfolio.findIndex((h) => h.symbol === symbol);
      portfolio.splice(index, 1);
    } else {
      // 重新計算指標
      const metrics = calculatePortfolioMetrics(holding.transactions);
      holding.totalShares = metrics.totalShares;
      holding.averageCost = metrics.averageCost;
    }

    await savePortfolio(portfolio);
    return true;
  } catch (error) {
    console.error('Delete transaction error:', error);
    return false;
  }
}

// 取得單一持倉
export async function getHolding(symbol) {
  try {
    const portfolio = await loadPortfolio();
    return portfolio.find((h) => h.symbol === symbol) || null;
  } catch (error) {
    console.error('Get holding error:', error);
    return null;
  }
}

// 計算持倉損益
export function calculateProfitLoss(holding, currentPrice) {
  if (!holding || holding.totalShares <= 0) {
    return {
      totalValue: 0,
      totalCost: 0,
      profitLoss: 0,
      profitLossPercent: 0,
    };
  }

  const totalCost = holding.averageCost * holding.totalShares;
  const totalValue = currentPrice * holding.totalShares;
  const profitLoss = totalValue - totalCost;
  const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    profitLoss,
    profitLossPercent,
  };
}

// 取得所有持倉的總覽（需要當前價格）
export async function getPortfolioSummary(currentPrices) {
  /**
   * currentPrices: { symbol: price }
   */
  try {
    const portfolio = await loadPortfolio();
    let totalValue = 0;
    let totalCost = 0;

    const holdings = portfolio.map((holding) => {
      const currentPrice = currentPrices[holding.symbol] || 0;
      const metrics = calculateProfitLoss(holding, currentPrice);
      
      totalValue += metrics.totalValue;
      totalCost += metrics.totalCost;

      return {
        ...holding,
        currentPrice,
        ...metrics,
      };
    });

    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent =
      totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    return {
      holdings,
      summary: {
        totalValue,
        totalCost,
        totalProfitLoss,
        totalProfitLossPercent,
      },
    };
  } catch (error) {
    console.error('Get portfolio summary error:', error);
    return {
      holdings: [],
      summary: {
        totalValue: 0,
        totalCost: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
      },
    };
  }
}
