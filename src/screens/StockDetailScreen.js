// src/screens/StockDetailScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

import {
  loadWatchlistSymbols,
  toggleWatchlistSymbol,
} from '../storage/watchlistStorage';

import StockHeader from '../components/stockDetail/StockHeader';
import PriceBlock from '../components/stockDetail/PriceBlock';
import TechnicalSection from '../components/stockDetail/TechnicalSection';
import CompanyInfoSection from '../components/stockDetail/CompanyInfoSection';
import PriceAlertModal from '../components/PriceAlertModal';

export default function StockDetailScreen() {
  const route = useRoute();
  const { theme } = useTheme();
  const { symbol, name, market, price, change, changePercent } =
    route.params || {};

  console.log('StockDetail params:', route.params);

  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1D');
  const [showAlertModal, setShowAlertModal] = useState(false);

  const displayMarket = (() => {
    if (symbol?.endsWith('.TW')) return '台股';
    if (symbol?.endsWith('.US')) return '美股';
    if (market === 'US') return '美股';
    if (market === 'TW') return '台股';
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

      <PriceBlock
        price={price}
        change={change}
        changePercent={changePercent}
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
});