// src/components/AddTransactionModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { searchAllStocks } from '../services/searchApi';
import { fetchTaiwanStocks } from '../services/stockApi';
import { fetchUsStockQuotes } from '../services/usStockApi';
import { getHolding } from '../storage/portfolioStorage';

export default function AddTransactionModal({ visible, onClose, onSubmit }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1); // 1: 選擇股票, 2: 填寫交易資訊
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [currentHolding, setCurrentHolding] = useState(null);
  
  const [transactionData, setTransactionData] = useState({
    type: 'buy',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchAllStocks(text);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSelectStock = async (stock) => {
    setSelectedStock(stock);
    setStep(2);
    setSearchQuery('');
    setSearchResults([]);
    
    // 獲取即時價格
    await fetchCurrentPrice(stock);
    
    // 獲取當前持倉信息（用於驗證賣出數量）
    const holding = await getHolding(stock.symbol);
    setCurrentHolding(holding);
  };

  const fetchCurrentPrice = async (stock) => {
    setLoadingPrice(true);
    try {
      let price = null;
      
      if (stock.market === 'TW') {
        // 台股：移除 .TW 後綴
        const code = stock.symbol.replace('.TW', '');
        const results = await fetchTaiwanStocks([code]);
        if (results && results.length > 0) {
          price = results[0].price;
        }
      } else if (stock.market === 'US') {
        // 美股
        const results = await fetchUsStockQuotes([stock.symbol]);
        if (results && results.length > 0) {
          price = results[0].price;
        }
      }
      
      if (price && price > 0) {
        setCurrentPrice(price);
        setTransactionData(prev => ({
          ...prev,
          price: price.toString(),
        }));
      } else {
        // 無法獲取價格時的提示
        Alert.alert('提示', '無法獲取即時價格，請稍後再試');
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
      Alert.alert('錯誤', '獲取價格失敗');
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedStock) {
      Alert.alert('錯誤', '請選擇股票');
      return;
    }

    if (!transactionData.quantity || !transactionData.price) {
      Alert.alert('錯誤', '請填寫股數和價格');
      return;
    }

    const quantity = parseFloat(transactionData.quantity);
    const price = parseFloat(transactionData.price);

    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('錯誤', '請輸入有效的股數');
      return;
    }

    if (isNaN(price) || price <= 0) {
      Alert.alert('錯誤', '請輸入有效的價格');
      return;
    }

    // 驗證賣出數量
    if (transactionData.type === 'sell') {
      const availableShares = currentHolding ? currentHolding.totalShares : 0;
      if (quantity > availableShares) {
        Alert.alert(
          '賣出數量錯誤',
          `您當前持有 ${availableShares} 股，無法賣出 ${quantity} 股。\n請調整賣出數量。`
        );
        return;
      }
      if (availableShares === 0) {
        Alert.alert(
          '無持倉',
          `您尚未持有 ${selectedStock.name} (${selectedStock.symbol})，無法進行賣出操作。`
        );
        return;
      }
    }

    onSubmit({
      symbol: selectedStock.symbol,
      name: selectedStock.name,
      market: selectedStock.market,
      transaction: {
        type: transactionData.type,
        quantity,
        price,
        date: new Date(transactionData.date).getTime(),
        note: transactionData.note,
      },
    });

    // 重置表單
    setStep(1);
    setSelectedStock(null);
    setCurrentPrice(null);
    setCurrentHolding(null);
    setTransactionData({
      type: 'buy',
      quantity: '',
      price: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
  };

  const handleClose = () => {
    setStep(1);
    setSelectedStock(null);
    setSearchQuery('');
    setSearchResults([]);
    setTransactionData({
      type: 'buy',
      quantity: '',
      price: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {step === 1 ? '選擇股票' : '新增交易'}
            </Text>
            <Pressable onPress={handleClose}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </Pressable>
          </View>

          {step === 1 ? (
            // 步驟 1: 搜尋並選擇股票
            <ScrollView style={styles.content}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="搜尋股票代碼或名稱..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="characters"
              />

              {searchResults.length > 0 ? (
                <View style={styles.resultsContainer}>
                  {searchResults.map((stock) => (
                    <Pressable
                      key={stock.symbol}
                      style={[
                        styles.resultItem,
                        { borderBottomColor: theme.colors.border },
                      ]}
                      onPress={() => handleSelectStock(stock)}
                    >
                      <View style={styles.stockInfo}>
                        <Text style={[styles.stockSymbol, { color: theme.colors.text }]}>
                          {stock.symbol}
                        </Text>
                        <Text style={[styles.stockName, { color: theme.colors.textSecondary }]}>
                          {stock.name}
                        </Text>
                      </View>
                      <Text style={[styles.marketTag, { color: theme.colors.primary }]}>
                        {stock.market === 'TW' ? '台股' : '美股'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : searchQuery ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    找不到相關股票
                  </Text>
                </View>
              ) : (
                <View style={styles.hintContainer}>
                  <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
                    搜尋您想要交易的股票
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : (
            // 步驟 2: 填寫交易資訊
            <ScrollView style={styles.content}>
              <View style={[styles.selectedStock, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.selectedSymbol, { color: theme.colors.text }]}>
                  {selectedStock.symbol}
                </Text>
                <Text style={[styles.selectedName, { color: theme.colors.textSecondary }]}>
                  {selectedStock.name}
                </Text>
              </View>

              <Text style={[styles.label, { color: theme.colors.text }]}>交易類型</Text>
              <View style={styles.typeButtons}>
                <Pressable
                  style={[
                    styles.typeButton,
                    transactionData.type === 'buy' && { backgroundColor: theme.colors.success },
                    transactionData.type !== 'buy' && {
                      borderColor: theme.colors.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setTransactionData({ ...transactionData, type: 'buy' })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: transactionData.type === 'buy' ? '#FFF' : theme.colors.text },
                    ]}
                  >
                    買入
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.typeButton,
                    transactionData.type === 'sell' && { backgroundColor: theme.colors.error },
                    transactionData.type !== 'sell' && {
                      borderColor: theme.colors.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setTransactionData({ ...transactionData, type: 'sell' })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: transactionData.type === 'sell' ? '#FFF' : theme.colors.text },
                    ]}
                  >
                    賣出
                  </Text>
                </Pressable>
              </View>
              
              {/* 顯示當前持倉信息（當選擇賣出時） */}
              {transactionData.type === 'sell' && (
                <View style={[styles.holdingInfo, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.holdingInfoText, { color: theme.colors.textSecondary }]}>
                    當前持有：{currentHolding ? `${Math.max(0, currentHolding.totalShares)} 股` : '0 股'}
                  </Text>
                </View>
              )}

              <Text style={[styles.label, { color: theme.colors.text }]}>股數</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="請輸入股數"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
                value={transactionData.quantity}
                onChangeText={(text) =>
                  setTransactionData({ ...transactionData, quantity: text })
                }
              />

              <Text style={[styles.label, { color: theme.colors.text }]}>價格</Text>
              {loadingPrice ? (
                <View style={[styles.priceLoadingContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.priceLoadingText, { color: theme.colors.textSecondary }]}>
                    獲取即時價格中...
                  </Text>
                </View>
              ) : currentPrice ? (
                <View style={[styles.priceDisplayContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Text style={[styles.priceDisplayText, { color: theme.colors.text }]}>
                    ${currentPrice.toFixed(2)}
                  </Text>
                  <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                    當前市價
                  </Text>
                </View>
              ) : (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="無法獲取價格，請手動輸入"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={transactionData.price}
                  onChangeText={(text) =>
                    setTransactionData({ ...transactionData, price: text })
                  }
                />
              )}

              <Text style={[styles.label, { color: theme.colors.text }]}>備註（選填）</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="交易備註"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
                value={transactionData.note}
                onChangeText={(text) =>
                  setTransactionData({ ...transactionData, note: text })
                }
              />

              <View style={styles.summary}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  交易總額
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  ${(parseFloat(transactionData.quantity || 0) * parseFloat(transactionData.price || 0)).toFixed(2)}
                </Text>
              </View>

              <View style={styles.buttonGroup}>
                <Pressable
                  style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.border }]}
                  onPress={() => setStep(1)}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                    返回
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSubmit}
                >
                  <Text style={[styles.buttonText, { color: '#FFF' }]}>
                    確認新增
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  stockName: {
    fontSize: 13,
  },
  marketTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
  hintContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  hintText: {
    fontSize: 14,
    marginTop: 12,
  },
  selectedStock: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  selectedSymbol: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedName: {
    fontSize: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  holdingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  holdingInfoText: {
    fontSize: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  priceLoadingContainer: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceLoadingText: {
    fontSize: 14,
  },
  priceDisplayContainer: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceDisplayText: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceLabel: {
    fontSize: 13,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButton: {
    // backgroundColor 在組件中動態設置
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
