// src/components/SearchBar.js
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { searchAllStocks } from '../services/searchApi';

export default function SearchBar({ onSelectStock }) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (text) => {
    setQuery(text);
    
    if (text.trim() === '') {
      setResults([]);
      setShowResults(false);
      return;
    }

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

  const handleSelectStock = (stock) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    onSelectStock(stock);
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
        autoCapitalize="characters"
      />
      
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
});
