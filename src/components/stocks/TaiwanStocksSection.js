// src/components/stocks/TaiwanStocksSection.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { fetchTaiwanStocks } from '../../services/stockApi';

// 台股預設清單（API 掛掉時用）
const TAIWAN_STOCKS_DEFAULT = [
  { symbol: '0050', name: '元大台灣50', price: 150, change: -0.8 },
  { symbol: '2330', name: '台積電', price: 850, change: +5.5 },
  { symbol: '2317', name: '鴻海', price: 160.5, change: +0.3 },
  { symbol: '2412', name: '中華電', price: 120.2, change: -0.4 },
];

const TAIWAN_CODES = TAIWAN_STOCKS_DEFAULT.map((s) => s.symbol);

export default function TaiwanStocksSection({
  navigation,
  watchlist = [],
  onToggleWatchlist,
}) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 進來就抓一次台股
  useEffect(() => {
    const loadTw = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTaiwanStocks(TAIWAN_CODES);
        if (data && data.length > 0) {
          setStocks(data);
        }
      } catch (err) {
        console.warn('fetchTaiwanStocks error', err);
        setError('台股資料載入失敗，顯示預設資料');
      } finally {
        setLoading(false);
      }
    };

    loadTw();
  }, []);

  const data = stocks.length > 0 ? stocks : TAIWAN_STOCKS_DEFAULT;

  const renderItem = ({ item }) => {
    const isUp = item.change >= 0;
    const isFavorite = watchlist.includes(item.symbol);

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          navigation.navigate('StockDetail', {
            symbol: item.symbol,
            name: item.name,
            market: 'TW',
            price: item.price,
            change: item.change,
            changePercent:
              typeof item.changePercent === 'number'
                ? item.changePercent
                : 0,
          })
        }
      >
        <View style={styles.left}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>

        <View style={styles.right}>
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              onToggleWatchlist && onToggleWatchlist(item.symbol);
            }}
          >
            <Text style={[styles.star, isFavorite && styles.starActive]}>
              {isFavorite ? '★' : '☆'}
            </Text>
          </Pressable>

          <Text style={styles.price}>
            {typeof item.price === 'number'
              ? item.price.toFixed(2)
              : item.price}
          </Text>
          <Text style={[styles.change, isUp ? styles.up : styles.down]}>
            {isUp ? '+' : ''}
            {typeof item.change === 'number'
              ? item.change.toFixed(2)
              : item.change}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderHeader = () => (
    <>
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>  台股資料讀取中...</Text>
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.symbol + index}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    marginBottom: 4,
    paddingHorizontal: 2,
  },

  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 1,
  },
  left: {},
  symbol: { fontSize: 18, fontWeight: 'bold' },
  name: { fontSize: 14, color: '#666' },

  right: {
    alignItems: 'flex-end',
  },

  star: {
    fontSize: 20,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  starActive: {
    color: '#F59E0B',
  },

  price: { fontSize: 18, fontWeight: 'bold' },
  change: { fontSize: 14, marginTop: 4 },
  up: { color: '#d32f2f' },
  down: { color: '#1976d2' },
});