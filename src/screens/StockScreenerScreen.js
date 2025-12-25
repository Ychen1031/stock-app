// src/screens/StockScreenerScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fetchTaiwanFundamentals, fetchUsFundamentals } from '../services/fundamentalApi';
import StockLogo from '../components/StockLogo';

// 預設台股清單（熱門股）
const DEFAULT_TW_STOCKS = [
  '2330', '2317', '2454', '2412', '0050', 
  '2882', '2603', '2609', '2615', '1301',
  '1303', '2308', '2382', '2891', '2884'
];

// 預設美股清單（熱門股）
const DEFAULT_US_STOCKS = [
  'AAPL', 'MSFT', 'TSLA', 'NVDA', 'META', 'AMZN'
];

export default function StockScreenerScreen({ navigation }) {
  const { theme } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState('TW'); // 'TW' or 'US'

  // 篩選條件
  const [filters, setFilters] = useState({
    peMin: '',      // 本益比最小值
    peMax: '',      // 本益比最大值
    yieldMin: '',   // 殖利率最小值
    yieldMax: '',   // 殖利率最大值
    changeMin: '',  // 漲跌幅最小值
    changeMax: '',  // 漲跌幅最大值
  });

  // 載入股票數據
  useEffect(() => {
    loadStocks();
  }, [market]);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const stockList = market === 'TW' ? DEFAULT_TW_STOCKS : DEFAULT_US_STOCKS;
      const data = market === 'TW' 
        ? await fetchTaiwanFundamentals(stockList)
        : await fetchUsFundamentals(stockList);
      setStocks(data);
      setFilteredStocks(data);
    } catch (error) {
      console.error('Load stocks error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 套用篩選條件
  const applyFilters = () => {
    let filtered = [...stocks];

    // 本益比篩選
    if (filters.peMin !== '') {
      const min = parseFloat(filters.peMin);
      filtered = filtered.filter(s => s.pe >= min);
    }
    if (filters.peMax !== '') {
      const max = parseFloat(filters.peMax);
      filtered = filtered.filter(s => s.pe <= max);
    }

    // 殖利率篩選
    if (filters.yieldMin !== '') {
      const min = parseFloat(filters.yieldMin);
      filtered = filtered.filter(s => s.dividendYield >= min);
    }
    if (filters.yieldMax !== '') {
      const max = parseFloat(filters.yieldMax);
      filtered = filtered.filter(s => s.dividendYield <= max);
    }

    // 漲跌幅篩選
    if (filters.changeMin !== '') {
      const min = parseFloat(filters.changeMin);
      filtered = filtered.filter(s => s.changePercent >= min);
    }
    if (filters.changeMax !== '') {
      const max = parseFloat(filters.changeMax);
      filtered = filtered.filter(s => s.changePercent <= max);
    }

    setFilteredStocks(filtered);
  };

  // 重置篩選
  const resetFilters = () => {
    setFilters({
      peMin: '',
      peMax: '',
      yieldMin: '',
      yieldMax: '',
      changeMin: '',
      changeMax: '',
    });
    setFilteredStocks(stocks);
  };

  // 渲染股票項目
  const renderStockItem = ({ item }) => {
    const isUp = item.changePercent >= 0;

    return (
      <Pressable
        style={[styles.stockCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => navigation.navigate('StockDetail', {
          symbol: item.symbol,
          name: item.name,
          market: market,
        })}
      >
        <View style={styles.stockHeader}>
          <View style={styles.stockLeft}>
            <StockLogo symbol={item.symbol} name={item.name} market={market} size={40} />
            <View style={styles.stockInfo}>
              <Text style={[styles.symbol, { color: theme.colors.text }]}>{item.symbol}</Text>
              <Text style={[styles.stockName, { color: theme.colors.textSecondary }]}>{item.name}</Text>
              <Text style={[styles.price, { color: theme.colors.textSecondary }]}>
                ${item.price.toFixed(2)}
              </Text>
            </View>
          </View>
          <Text style={[styles.changePercent, { color: isUp ? theme.colors.up : theme.colors.down }]}>
            {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
          </Text>
        </View>

        <View style={styles.fundamentalsRow}>
          <View style={styles.fundamental}>
            <Text style={[styles.fundLabel, { color: theme.colors.textSecondary }]}>本益比</Text>
            <Text style={[styles.fundValue, { color: theme.colors.text }]}>
              {item.pe > 0 ? item.pe.toFixed(2) : 'N/A'}
            </Text>
          </View>

          <View style={styles.fundamental}>
            <Text style={[styles.fundLabel, { color: theme.colors.textSecondary }]}>殖利率</Text>
            <Text style={[styles.fundValue, { color: theme.colors.text }]}>
              {item.dividendYield > 0 ? item.dividendYield.toFixed(2) + '%' : 'N/A'}
            </Text>
          </View>

          <View style={styles.fundamental}>
            <Text style={[styles.fundLabel, { color: theme.colors.textSecondary }]}>EPS</Text>
            <Text style={[styles.fundValue, { color: theme.colors.text }]}>
              {item.eps > 0 ? item.eps.toFixed(2) : 'N/A'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 市場選擇器 */}
      <View style={[styles.marketSelector, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Pressable
          style={[
            styles.marketButton,
            market === 'TW' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setMarket('TW')}
        >
          <Text style={[
            styles.marketButtonText,
            { color: market === 'TW' ? '#FFFFFF' : theme.colors.textSecondary }
          ]}>
            🇹🇼 台股
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.marketButton,
            market === 'US' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setMarket('US')}
        >
          <Text style={[
            styles.marketButtonText,
            { color: market === 'US' ? '#FFFFFF' : theme.colors.textSecondary }
          ]}>
            🇺🇸 美股
          </Text>
        </Pressable>
      </View>

      {/* 篩選條件區 */}
      <ScrollView 
        style={[styles.filterSection, { backgroundColor: theme.colors.surface }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 選股條件</Text>

        {/* 本益比 */}
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>本益比 (P/E)</Text>
          <View style={styles.filterRow}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="最小值"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={filters.peMin}
              onChangeText={(text) => setFilters({ ...filters, peMin: text })}
            />
            <Text style={[styles.separator, { color: theme.colors.textSecondary }]}>~</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="最大值"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={filters.peMax}
              onChangeText={(text) => setFilters({ ...filters, peMax: text })}
            />
          </View>
        </View>

        {/* 殖利率 */}
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>殖利率 (%)</Text>
          <View style={styles.filterRow}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="最小值"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={filters.yieldMin}
              onChangeText={(text) => setFilters({ ...filters, yieldMin: text })}
            />
            <Text style={[styles.separator, { color: theme.colors.textSecondary }]}>~</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="最大值"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={filters.yieldMax}
              onChangeText={(text) => setFilters({ ...filters, yieldMax: text })}
            />
          </View>
        </View>

        {/* 漲跌幅 */}
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>漲跌幅 (%)</Text>
          <View style={styles.filterRow}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="最小值"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={filters.changeMin}
              onChangeText={(text) => setFilters({ ...filters, changeMin: text })}
            />
            <Text style={[styles.separator, { color: theme.colors.textSecondary }]}>~</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="最大值"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={filters.changeMax}
              onChangeText={(text) => setFilters({ ...filters, changeMax: text })}
            />
          </View>
        </View>

        {/* 按鈕區 */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.resetButton, { borderColor: theme.colors.border }]}
            onPress={resetFilters}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>重置</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.applyButton, { backgroundColor: theme.colors.primary }]}
            onPress={applyFilters}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>套用篩選</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 結果區 */}
      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>
            篩選結果 ({filteredStocks.length})
          </Text>
          <Pressable onPress={loadStocks}>
            <Text style={[styles.refreshButton, { color: theme.colors.primary }]}>🔄 刷新</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>載入中...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredStocks}
            keyExtractor={(item) => item.symbol}
            renderItem={renderStockItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  😔 沒有符合條件的股票
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  marketSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  marketButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  marketButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterSection: {
    maxHeight: 350,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  separator: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  applyButton: {
    // backgroundColor set by theme
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  stockCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockInfo: {
    marginLeft: 12,
    flex: 1,
  },  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  stockName: {
    fontSize: 13,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
  },
  changePercent: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fundamentalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  fundamental: {
    alignItems: 'center',
  },
  fundLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  fundValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
  },
});
