// src/components/SearchBar.js
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { searchAllStocks } from '../services/searchApi';
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  removeSearchHistoryItem,
} from '../storage/searchHistoryStorage';

export default function SearchBar({ onSelectStock }) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // 載入搜尋歷史
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  };

  const handleSearch = async (text) => {
    setQuery(text);
    
    if (text.trim() === '') {
      setResults([]);
      setShowResults(false);
      setShowHistory(true);
      return;
    }

    setShowHistory(false);
    setLoading(true);
    setShowResults(true);
    
    try {
      const searchResults = await searchAllStocks(text);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStock = async (stock) => {
    // 添加到搜尋歷史
    await addSearchHistory({
      symbol: stock.symbol,
      name: stock.name,
      market: stock.market,
    });
    await loadHistory();
    
    setQuery('');
    setResults([]);
    setShowResults(false);
    setShowHistory(false);
    onSelectStock(stock);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    await loadHistory();
  };

  const handleRemoveHistoryItem = async (symbol, market) => {
    await removeSearchHistoryItem(symbol, market);
    await loadHistory();
  };

  const handleFocus = () => {
    if (query.trim() === '' && searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  const handleBlur = () => {
    // 延遲關閉，讓點擊事件可以觸發
    setTimeout(() => {
      setShowResults(false);
      setShowHistory(false);
    }, 200);
  };

  const renderSearchResult = ({ item }) => (
    <Pressable
      style={[styles.resultItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleSelectStock(item)}
    >
      <View>
        <Text style={[styles.resultSymbol, { color: theme.colors.text }]}>
          {item.symbol}
        </Text>
        <Text style={[styles.resultName, { color: theme.colors.textSecondary }]}>
          {item.name}
        </Text>
      </View>
      <Text style={[styles.resultMarket, { color: theme.colors.primary }]}>
        {item.market === 'TW' ? '台股' : '美股'}
      </Text>
    </Pressable>
  );

  const renderHistoryItem = ({ item }) => (
    <Pressable
      style={[styles.resultItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleSelectStock(item)}
    >
      <View style={styles.historyItemContent}>
        <Ionicons 
          name="time-outline" 
          size={16} 
          color={theme.colors.textSecondary}
          style={styles.historyIcon}
        />
        <View>
          <Text style={[styles.resultSymbol, { color: theme.colors.text }]}>
            {item.symbol}
          </Text>
          <Text style={[styles.resultName, { color: theme.colors.textSecondary }]}>
            {item.name}
          </Text>
        </View>
      </View>
      <View style={styles.historyActions}>
        <Text style={[styles.resultMarket, { color: theme.colors.primary, marginRight: 8 }]}>
          {item.market === 'TW' ? '台股' : '美股'}
        </Text>
        <Pressable onPress={() => handleRemoveHistoryItem(item.symbol, item.market)}>
          <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="搜尋股票代碼或名稱..."
        placeholderTextColor={theme.colors.textSecondary}
        value={query}
        onChangeText={handleSearch}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="characters"
      />
      
      {/* 搜尋歷史 */}
      {showHistory && searchHistory.length > 0 && (
        <View
          style={[
            styles.resultsContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: theme.colors.text }]}>
              最近搜尋
            </Text>
            <Pressable onPress={handleClearHistory}>
              <Text style={[styles.clearButton, { color: theme.colors.primary }]}>
                清除全部
              </Text>
            </Pressable>
          </View>
          <FlatList
            data={searchHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `${item.symbol}-${index}`}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
      
      {/* 搜尋結果 */}
      {showResults && (
        <View
          style={[
            styles.resultsContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.symbol}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
                找不到相關股票
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  resultsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    maxHeight: 300,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultName: {
    fontSize: 13,
  },
  resultMarket: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    marginRight: 8,
  },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
