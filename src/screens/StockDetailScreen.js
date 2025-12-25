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

import StockHeader from '../components/stockDetail/StockHeader';
import PriceBlock from '../components/stockDetail/PriceBlock';
import HistoricalChart from '../components/stockDetail/HistoricalChart';
import TechnicalSection from '../components/stockDetail/TechnicalSection';
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
  const [timeframe, setTimeframe] = useState('1D');
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  // 股價相關狀態
  const [price, setPrice] = useState(initialPrice);
  const [change, setChange] = useState(initialChange);
  const [changePercent, setChangePercent] = useState(initialChangePercent);
  const [priceLoading, setPriceLoading] = useState(!initialPrice);

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

      {/* 價格提醒按鈕 */}
      <Pressable
        style={[styles.alertButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={() => setShowAlertModal(true)}
      >
        <Text style={[styles.alertButtonText, { color: theme.colors.primary }]}>
          🔔 設定價格提醒
        </Text>
      </Pressable>

      <TechnicalSection
        timeframe={timeframe}
        onChangeTimeframe={setTimeframe}
        price={price}
        changePercent={changePercent}
      />

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
});