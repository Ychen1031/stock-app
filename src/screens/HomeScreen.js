// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { fetchLatestNews } from '../services/newsApi';

// 先保留指數假資料，之後有空可以再換成真的 API
const MOCK_INDICES = [
  { name: '台灣加權指數', symbol: 'TSE', value: 18750.32, change: +120.5 },
  { name: 'NASDAQ', symbol: 'IXIC', value: 15880.12, change: -45.3 },
  { name: 'S&P 500', symbol: 'GSPC', value: 5105.87, change: +8.9 },
];

export default function HomeScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 一進首頁就打 API 抓新聞
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchLatestNews();
        setNews(data);
      } catch (e) {
        console.warn('load news error', e);
        setError('新聞載入失敗，稍後再試一次');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const renderIndexCard = (item) => {
    const isUp = item.change >= 0;
    return (
      <View key={item.symbol} style={styles.indexCard}>
        <Text style={styles.indexName}>{item.name}</Text>
        <Text style={styles.indexValue}>{item.value.toFixed(2)}</Text>
        <Text style={[styles.indexChange, isUp ? styles.up : styles.down]}>
          {isUp ? '+' : ''}
          {item.change.toFixed(1)}
        </Text>
      </View>
    );
  };

  const renderNewsCard = (item) => {
    // Marketaux 的欄位：title / snippet / url / source / published_at ...  [oai_citation:2‡marketaux.com](https://www.marketaux.com/documentation)
    let timeLabel = '';
    if (item.published_at) {
      const d = new Date(item.published_at);
      if (!isNaN(d)) {
        timeLabel = d.toLocaleString();
      }
    }

    return (
      <Pressable
        key={item.uuid}
        style={styles.newsCard}
        onPress={() => {
          if (item.url) {
            Linking.openURL(item.url);
          }
        }}
      >
        <Text style={styles.newsSource}>
          {item.source}
          {timeLabel ? ` · ${timeLabel}` : ''}
        </Text>
        <Text style={styles.newsTitle}>{item.title}</Text>
        {item.snippet ? (
          <Text style={styles.newsSnippet} numberOfLines={2}>
            {item.snippet}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>今日市場概況</Text>

      {/* 指數概況區塊（先用假資料） */}
      <View style={styles.indicesRow}>
        {MOCK_INDICES.map(renderIndexCard)}
      </View>

      {/* 新聞標題 */}
      <Text style={styles.sectionTitle}>最新財經新聞</Text>

      {/* 讀取中 */}
      {loading && (
        <View style={styles.centerRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>  讀取中...</Text>
        </View>
      )}

      {/* 錯誤訊息 */}
      {!loading && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* 新聞列表 */}
      {!loading && !error && news.length > 0 && (
        <View>
          {news.map(renderNewsCard)}
        </View>
      )}

      {/* 沒資料又沒錯誤（例如 API 回空陣列） */}
      {!loading && !error && news.length === 0 && (
        <Text style={styles.emptyText}>目前沒有抓到新聞。</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // 指數區塊
  indicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  indexCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    elevation: 1,
  },
  indexName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  indexValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  indexChange: {
    marginTop: 4,
    fontSize: 13,
  },
  up: {
    color: '#d32f2f',
  },
  down: {
    color: '#1976d2',
  },

  // 新聞區塊
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  newsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    elevation: 1,
  },
  newsSource: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
  },
  newsSnippet: {
    fontSize: 13,
    color: '#555',
  },
});