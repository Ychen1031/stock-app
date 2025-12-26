import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function BacktestScreen({ navigation }) {
  const { theme } = useTheme();
  
  // 模擬狀態
  const [symbol, setSymbol] = useState('2330');
  const [days, setDays] = useState('60');
  const [initialCapital, setInitialCapital] = useState('100000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 模擬執行回測
  const runBacktest = () => {
    if (!symbol || !days) return;
    setLoading(true);
    setResult(null);

    // 假裝計算 1.5 秒
    setTimeout(() => {
      setLoading(false);
      setResult({
        totalReturn: 15.4,
        netProfit: 15400,
        winRate: 62.5,
        maxDrawdown: -5.2,
        trades: 12,
        sharpeRatio: 1.8,
        finalCapital: 115400,
      });
    }, 1500);
  };

  const ResultCard = ({ label, value, color, isPercent }) => (
    <View style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[
        styles.resultValue, 
        { color: color || theme.colors.text }
      ]}>
        {value > 0 && isPercent ? '+' : ''}{value}{isPercent ? '%' : ''}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* 頂部標題 */}
          <View style={styles.header}>
            <Text style={[styles.pageTitle, { color: theme.colors.text }]}>策略回測</Text>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
               <Text style={[styles.badgeText, { color: theme.colors.primary }]}>BETA</Text>
            </View>
          </View>

          {/* 參數設定區塊 */}
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>參數設定</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>股票代號</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
                  value={symbol}
                  onChangeText={setSymbol}
                  placeholder="如: 2330"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>回測天數</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
                  value={days}
                  onChangeText={setDays}
                  keyboardType="numeric"
                  placeholder="60"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
            </View>

            <View style={[styles.inputWrapper, { marginTop: 12 }]}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>初始資金 (TWD)</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
                value={initialCapital}
                onChangeText={setInitialCapital}
                keyboardType="numeric"
                placeholder="100000"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <Pressable 
              style={({pressed}) => [
                styles.runBtn, 
                { backgroundColor: theme.colors.primary, opacity: pressed ? 0.9 : 1 }
              ]}
              onPress={runBacktest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="play" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.runBtnText}>開始回測</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* 回測結果顯示 */}
          {result && !loading && (
            <View style={styles.resultSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 16 }]}>回測結果報告</Text>
              
              {/* 總結大卡片 */}
              <View style={[styles.summaryCard, { backgroundColor: result.netProfit >= 0 ? '#10B981' : '#EF4444' }]}>
                 <Text style={styles.summaryLabel}>淨損益 (Net Profit)</Text>
                 <Text style={styles.summaryValue}>
                   {result.netProfit >= 0 ? '+' : ''}{result.netProfit.toLocaleString()}
                 </Text>
                 <Text style={styles.summarySub}>
                   期末資金: ${result.finalCapital.toLocaleString()}
                 </Text>
              </View>

              <View style={styles.gridContainer}>
                <ResultCard 
                  label="總報酬率" 
                  value={result.totalReturn} 
                  isPercent 
                  color={result.totalReturn >= 0 ? theme.colors.up : theme.colors.down} 
                />
                <ResultCard 
                  label="勝率" 
                  value={result.winRate} 
                  isPercent 
                  color={theme.colors.primary} 
                />
                <ResultCard 
                  label="最大回撤" 
                  value={result.maxDrawdown} 
                  isPercent 
                  color={theme.colors.down} 
                />
                <ResultCard 
                  label="夏普比率" 
                  value={result.sharpeRatio} 
                  color={theme.colors.text} 
                />
                <ResultCard 
                  label="交易次數" 
                  value={result.trades} 
                  color={theme.colors.text} 
                />
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ✨ 字體優化 Helper (與其他頁面保持一致)
const getFontFamily = (weight = 'normal') => {
  if (Platform.OS === 'ios') return 'PingFang TC';
  return weight === 'bold' ? 'sans-serif-medium' : 'sans-serif';
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16 },
  
  // 標題區
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 24, 
    marginTop: 18,
    gap: 12
  },
  // 🔥 [標題優化]
  pageTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    fontFamily: getFontFamily('bold'),
    letterSpacing: 0.8 
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '700', fontFamily: getFontFamily('bold') },

  // 卡片區塊
  card: { padding: 20, borderRadius: 16, marginBottom: 24 },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 16,
    fontFamily: getFontFamily('bold'),
    letterSpacing: 0.5 
  },
  
  inputGroup: { flexDirection: 'row', gap: 12 },
  inputWrapper: { flex: 1, gap: 8 },
  label: { fontSize: 14, fontWeight: '500', fontFamily: getFontFamily() },
  
  // 🔥 [輸入框優化]
  input: { 
    height: 48, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    fontFamily: getFontFamily(), // 輸入數字時會更漂亮
    fontVariant: ['tabular-nums']
  },

  runBtn: { 
    flexDirection: 'row',
    height: 50, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  runBtnText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '600',
    fontFamily: getFontFamily('bold'),
    letterSpacing: 1
  },

  // 結果區塊
  resultSection: { marginTop: 8 },
  summaryCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  summaryLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 8, fontFamily: getFontFamily() },
  
  // 🔥 [總損益數字優化]
  summaryValue: { 
    color: '#FFF', 
    fontSize: 32, 
    fontWeight: '700', 
    fontFamily: getFontFamily('bold'),
    fontVariant: ['tabular-nums'], // 數字等寬
    letterSpacing: 1,
    marginBottom: 4
  },
  summarySub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: getFontFamily() },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  resultCard: { 
    width: '48%', // 兩欄排列
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1,
    alignItems: 'center'
  },
  resultLabel: { fontSize: 12, marginBottom: 6, fontFamily: getFontFamily() },
  
  // 🔥 [詳細數據數字優化]
  resultValue: { 
    fontSize: 18, 
    fontWeight: '700', 
    fontFamily: getFontFamily('bold'),
    fontVariant: ['tabular-nums'] // 讓百分比數字對齊
  },
});