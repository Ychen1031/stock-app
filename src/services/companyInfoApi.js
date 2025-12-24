// src/services/companyInfoApi.js
// 直接從 JSON 檔案讀取公司資料
import companyData from '../data/companyData.json';


/**
 * 標準化股票代號格式（用於查詢 JSON）
 * 移除所有後綴，統一格式
 */
function normalizeSymbol(symbol) {
  if (!symbol) return '';
  const upperSymbol = symbol.toUpperCase().trim();
  // 移除 .TW, .US, .TWO 等後綴
  return upperSymbol.replace(/\.(TW|US|TWO)$/i, '');
}

/**
 * 從本地 JSON 檔案獲取公司資訊
 * @param {string} symbol - 股票代號
 * @returns {Promise<Object|null>} 公司資訊
 */
export async function fetchCompanyInfo(symbol) {
  try {
    console.log('=== 正在查詢公司資料:', symbol);
    
    // 標準化代號
    const normalizedSymbol = normalizeSymbol(symbol);
    console.log('標準化代號:', normalizedSymbol);
    
    // 從 JSON 檔案查詢
    const companyInfo = companyData[normalizedSymbol];
    
    if (companyInfo) {
      console.log('✓ 找到公司資料:', normalizedSymbol, companyInfo.fullName);
      return {
        symbol: normalizedSymbol,
        ...companyInfo
      };
    } else {
      console.log('✗ 找不到公司資料:', normalizedSymbol);
      return null;
    }
  } catch (error) {
    console.error('讀取公司資料時發生錯誤:', error);
    return null;
  }
}

/**
 * 取得所有公司資料
 * @returns {Object} 所有公司資料
 */
export function getAllCompanyData() {
  return companyData;
}

/**
 * 取得公司列表
 * @returns {Array} 公司代號陣列
 */
export function getCompanySymbols() {
  return Object.keys(companyData);
}
