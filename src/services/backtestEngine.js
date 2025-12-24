// src/services/backtestEngine.js

function safeNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  }
  
  export function calcMaxDrawdown(closes) {
    if (!closes || closes.length < 2) return 0;
  
    let peak = closes[0];
    let maxDD = 0;
  
    for (const p of closes) {
      if (p > peak) peak = p;
      const dd = (p / peak - 1) * 100; // 負數
      if (dd < maxDD) maxDD = dd;
    }
    return maxDD; // 例如 -12.34
  }
  
  /**
   * 真實買進持有回測
   * input: closes: number[], tradingDaysPerYear=240
   */
  export function backtestBuyHold({ closes, tradingDaysPerYear = 240 }) {
    if (!closes || closes.length < 2) {
      return {
        totalReturn: NaN,
        annualReturn: NaN,
        maxDrawdown: NaN,
        winRate: NaN,
        trades: 0,
      };
    }
  
    const start = closes[0];
    const end = closes[closes.length - 1];
  
    const totalReturn = (end / start - 1) * 100;
  
    // 年化（用交易日估算）
    const days = closes.length - 1;
    const yearFactor = tradingDaysPerYear / Math.max(1, days);
    const annualReturn = ((end / start) ** yearFactor - 1) * 100;
  
    const maxDrawdown = calcMaxDrawdown(closes);
  
    // 買進持有：視為 1 次進出（示意）
    const trades = 1;
  
    // 勝率（示意）：賺就是 100%，虧就是 0%
    const winRate = end >= start ? 100 : 0;
  
    return {
      totalReturn: safeNum(totalReturn),
      annualReturn: safeNum(annualReturn),
      maxDrawdown: safeNum(maxDrawdown),
      winRate: safeNum(winRate),
      trades,
    };
  }