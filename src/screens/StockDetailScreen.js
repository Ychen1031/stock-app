// src/screens/StockDetailScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

import {
  loadWatchlistSymbols,
  toggleWatchlistSymbol,
} from '../storage/watchlistStorage';
import { fetchTaiwanStocks } from '../services/stockApi';
import { fetchUsStockQuotes } from '../services/usStockApi';
import { fetchStockWithFundamentals } from '../services/fundamentalApi';

import StockHeader from '../components/stockDetail/StockHeader';
import PriceBlock from '../components/stockDetail/PriceBlock';
import HistoricalChart from '../components/stockDetail/HistoricalChart';
import CompanyInfoSection from '../components/stockDetail/CompanyInfoSection';
import PriceAlertModal from '../components/PriceAlertModal';

export default function StockDetailScreen() {
  const route = useRoute();
  const { theme } = useTheme();
  const { symbol, name, market, price: initialPrice, change: initialChange, changePercent: initialChangePercent } =
    route.params || {};

  console.log('StockDetail params:', route.params);

  // 處理 symbol 格式 - 從 symbol 中提取純代號和市場
  let pureSymbol = symbol;
  let detectedMarket = market;
  
  if (symbol) {
    if (symbol.endsWith('.TW')) {
      pureSymbol = symbol.replace('.TW', '');
      detectedMarket = 'TW';
    } else if (symbol.endsWith('.US')) {
      pureSymbol = symbol.replace('.US', '');
      detectedMarket = 'US';
    } else if (!market) {
      // 如果沒有 .TW 或 .US 後綴，且沒有 market 參數，根據 symbol 格式判斷
      // 台股代號通常是 4 位數字，美股是字母
      detectedMarket = /^\d+$/.test(symbol) ? 'TW' : 'US';
    }
  }

  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  // 股價相關狀態
  const [price, setPrice] = useState(initialPrice);
  const [change, setChange] = useState(initialChange);
  const [changePercent, setChangePercent] = useState(initialChangePercent);
  const [priceLoading, setPriceLoading] = useState(!initialPrice);

  // 基本面數據狀態
  const [fundamentals, setFundamentals] = useState(null);
  const [fundamentalsLoading, setFundamentalsLoading] = useState(true);

  const displayMarket = (() => {
    if (detectedMarket === 'US') return '美股';
    if (detectedMarket === 'TW') return '台股';
    return '股票';
  })();

  useEffect(() => {
    const checkWatchlist = async () => {
      try {
        const list = await loadWatchlistSymbols();
        setInWatchlist(list.includes(symbol));
      } catch (e) {
        console.log('check watchlist error:', e);
      } finally {
        setWatchlistLoading(false);
      }
    };

    if (symbol) {
      checkWatchlist();
    }
  }, [symbol]);

  // 獲取即時股價（如果沒有傳入 price 參數）
  useEffect(() => {
    const fetchPrice = async () => {
      if (!pureSymbol || !detectedMarket || initialPrice !== undefined) {
        return;
      }

      setPriceLoading(true);
      try {
        if (detectedMarket === 'TW') {
          const data = await fetchTaiwanStocks([pureSymbol]);
          if (data && data.length > 0) {
            const stock = data[0];
            setPrice(stock.price);
            setChange(stock.change);
            setChangePercent(stock.changePercent);
          }
        } else if (detectedMarket === 'US') {
          const data = await fetchUsStockQuotes([pureSymbol]);
          if (data && data.length > 0) {
            const stock = data[0];
            setPrice(stock.price);
            setChange(stock.change);
            setChangePercent(stock.changePercent);
          }
        }
      } catch (e) {
        console.error('Fetch price error:', e);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
  }, [pureSymbol, detectedMarket, initialPrice]);

  // 獲取基本面數據
  useEffect(() => {
    const fetchFundamentals = async () => {
      if (!pureSymbol || !detectedMarket) {
        setFundamentalsLoading(false);
        return;
      }

      try {
        setFundamentalsLoading(true);
        const data = await fetchStockWithFundamentals([pureSymbol], detectedMarket);
        if (data && data.length > 0) {
          setFundamentals(data[0]);
        }
      } catch (error) {
        console.error('Fetch fundamentals error:', error);
      } finally {
        setFundamentalsLoading(false);
      }
    };

    fetchFundamentals();
  }, [pureSymbol, detectedMarket]);

  const handleToggleWatchlist = async () => {
    if (!symbol) return;
    try {
      const next = await toggleWatchlistSymbol(symbol);
      setInWatchlist(next.includes(symbol));
    } catch (e) {
      console.log('toggle watchlist error:', e);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      <StockHeader
        symbol={symbol}
        name={name}
        displayMarket={displayMarket}
        inWatchlist={inWatchlist}
        watchlistLoading={watchlistLoading}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {priceLoading ? (
        <View style={styles.priceLoadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            載入股價中...
          </Text>
        </View>
      ) : (
        <PriceBlock
          price={price}
          change={change}
          changePercent={changePercent}
        />
      )}

      {/* 歷史價格圖表 */}
      <HistoricalChart
        symbol={pureSymbol}
        market={detectedMarket}
        currentPrice={price}
      />

      {/* 基本面指標 */}
      {!fundamentalsLoading && fundamentals && (
        <View style={[styles.fundamentalsSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📊 重要指標
          </Text>
          
          <View style={styles.fundamentalsGrid}>
            <View style={styles.fundamentalItem}>
              <Text style={[styles.fundamentalLabel, { color: theme.colors.textSecondary }]}>本益比 (P/E)</Text>
              <Text style={[styles.fundamentalValue, { color: theme.colors.text }]}>
                {fundamentals.pe > 0 ? fundamentals.pe.toFixed(2) : 'N/A'}
              </Text>
            </View>

            <View style={styles.fundamentalItem}>
              <Text style={[styles.fundamentalLabel, { color: theme.colors.textSecondary }]}>殖利率</Text>
              <Text style={[styles.fundamentalValue, { color: theme.colors.text }]}>
                {fundamentals.dividendYield > 0 ? fundamentals.dividendYield.toFixed(2) + '%' : 'N/A'}
              </Text>
            </View>

            <View style={styles.fundamentalItem}>
              <Text style={[styles.fundamentalLabel, { color: theme.colors.textSecondary }]}>每股盈餘 (EPS)</Text>
              <Text style={[styles.fundamentalValue, { color: theme.colors.text }]}>
                {fundamentals.eps > 0 ? fundamentals.eps.toFixed(2) : 'N/A'}
              </Text>
            </View>

            <View style={styles.fundamentalItem}>
              <Text style={[styles.fundamentalLabel, { color: theme.colors.textSecondary }]}>市值</Text>
              <Text style={[styles.fundamentalValue, { color: theme.colors.text }]}>
                {fundamentals.marketCap > 0 
                  ? (fundamentals.marketCap / 1000000000).toFixed(0) + 'B' 
                  : 'N/A'}
              </Text>
            </View>

            <View style={styles.fundamentalItem}>
              <Text style={[styles.fundamentalLabel, { color: theme.colors.textSecondary }]}>成交量</Text>
              <Text style={[styles.fundamentalValue, { color: theme.colors.text }]}>
                {fundamentals.volume > 0 
                  ? (fundamentals.volume / 1000000).toFixed(1) + 'M' 
                  : 'N/A'}
              </Text>
            </View>

            <View style={styles.fundamentalItem}>
              <Text style={[styles.fundamentalLabel, { color: theme.colors.textSecondary }]}>漲跌幅</Text>
              <Text style={[styles.fundamentalValue, { 
                color: fundamentals.changePercent >= 0 ? theme.colors.up : theme.colors.down 
              }]}>
                {fundamentals.changePercent >= 0 ? '+' : ''}{fundamentals.changePercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {fundamentalsLoading && (
        <View style={[styles.fundamentalsSection, { backgroundColor: theme.colors.surface }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            載入指標數據...
          </Text>
        </View>
      )}

      {/* 價格提醒按鈕 */}
      <Pressable
        style={[styles.alertButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={() => setShowAlertModal(true)}
      >
        <Text style={[styles.alertButtonText, { color: theme.colors.primary }]}>
          🔔 設定價格提醒
        </Text>
      </Pressable>

      <CompanyInfoSection
        symbol={symbol}
        displayMarket={displayMarket}
        name={name}
      />

      {/* 價格提醒 Modal */}
      <PriceAlertModal
        visible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        symbol={symbol}
        name={name}
        currentPrice={price}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  alertButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 12,
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceLoadingContainer: {
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  fundamentalsSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fundamentalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fundamentalItem: {
    width: '31%',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
    alignItems: 'center',
  },
  fundamentalLabel: {
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  fundamentalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});