// src/screens/StocksScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import SearchBar from '../components/SearchBar';
import HotStocksSection from '../components/stocks/HotStocksSection';
import TaiwanStocksSection from '../components/stocks/TaiwanStocksSection';
import USStocksSection from '../components/stocks/USStocksSection';
import WatchlistSection from '../components/stocks/WatchlistSection';
import { useTheme } from '../context/ThemeContext';

import {
  loadWatchlistSymbols,
  toggleWatchlistSymbol,
} from '../storage/watchlistStorage';

const TABS = [
  { key: 'hot', label: '熱門' },
  { key: 'tw', label: '台股' },
  { key: 'us', label: '美股' },
  { key: 'watchlist', label: '自選股' },
];

export default function StocksScreen({ navigation }) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('hot');
  const [watchlistSymbols, setWatchlistSymbols] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  // 搜尋選中股票後導航
  const handleSelectStock = (stock) => {
    navigation.navigate('StockDetail', {
      symbol: stock.symbol,
      name: stock.name,
      market: stock.market,
    });
  };

  // App 第一次啟動時讀一次自選股
  useEffect(() => {
    const init = async () => {
      try {
        const symbols = await loadWatchlistSymbols();
        setWatchlistSymbols(symbols);
      } catch (e) {
        console.warn('[watchlist] init error:', e);
      } finally {
        setWatchlistLoading(false);
      }
    };
    init();
  }, []);

  // 每次回到「股票」這個畫面時，同步一次自選股（讓詳細頁變動會反映回來）
  useFocusEffect(
    useCallback(() => {
      const syncWatchlist = async () => {
        try {
          const symbols = await loadWatchlistSymbols();
          setWatchlistSymbols(symbols);
        } catch (e) {
          console.log('sync watchlist error:', e);
        }
      };

      syncWatchlist();
    }, [])
  );

  // 切換某檔股票的自選狀態（星星 & 詳細頁會共用）
  const handleToggleWatchlist = async (symbol) => {
    try {
      const next = await toggleWatchlistSymbol(symbol);
      setWatchlistSymbols(next);
    } catch (e) {
      console.warn('[watchlist] toggle error:', e);
    }
  };

  const renderTab = (tab) => {
    const isActive = tab.key === activeTab;
    return (
      <Pressable
        key={tab.key}
        onPress={() => setActiveTab(tab.key)}
        style={[styles.tabButton, isActive && [styles.tabButtonActive, { backgroundColor: theme.colors.surface }]]}
      >
        <Text style={[styles.tabText, { color: theme.colors.textSecondary }, isActive && [styles.tabTextActive, { color: theme.colors.text }]]}>
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  const renderContent = () => {
    if (watchlistLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: '#666' }}>載入自選股中...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'hot':
        return (
          <HotStocksSection
            navigation={navigation}
            watchlist={watchlistSymbols}
            onToggleWatchlist={handleToggleWatchlist}
          />
        );
      case 'tw':
        return (
          <TaiwanStocksSection
            navigation={navigation}
            watchlist={watchlistSymbols}
            onToggleWatchlist={handleToggleWatchlist}
          />
        );
      case 'us':
        return (
          <USStocksSection
            navigation={navigation}
            watchlist={watchlistSymbols}
            onToggleWatchlist={handleToggleWatchlist}
          />
        );
      case 'watchlist':
        return (
          <WatchlistSection
            navigation={navigation}
            watchlist={watchlistSymbols}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 搜尋欄 */}
      <View style={styles.searchContainer}>
        <SearchBar onSelectStock={handleSelectStock} />
      </View>

      {/* 上方 Segmented Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: theme.colors.border }]}>
        {TABS.map(renderTab)}
      </View>

      {/* 下方內容區 */}
      <View style={styles.contentContainer}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  searchContainer: {
    marginBottom: 12,
  },

  tabsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 999,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: 'bold',
  },

  contentContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});