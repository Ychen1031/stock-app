import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const TIMEFRAMES = ['1D', '5D', '1M', '3M', '1Y'];

function toNumber(value) {
  if (value === undefined || value === null) return NaN;
  const n = Number(value);
  return Number.isNaN(n) ? NaN : n;
}

function fmt(value, digits = 2) {
  return Number.isNaN(value) ? '--' : value.toFixed(digits);
}

export default function TechnicalSection({
  timeframe,
  onChangeTimeframe,
  price,
  changePercent,
}) {
  const numericPrice = toNumber(price);
  const numericChangePercent = toNumber(changePercent);
  const hasPrice = !Number.isNaN(numericPrice);

  // 假的技術指標，之後可以換成 API 資料
  const ma5 = hasPrice ? numericPrice * 0.99 : NaN;
  const ma20 = hasPrice ? numericPrice * 0.97 : NaN;
  const ma60 = hasPrice ? numericPrice * 0.95 : NaN;
  const rsi = hasPrice ? 40 + (numericChangePercent || 0) : NaN;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>走勢 & 技術分析</Text>

      {/* 時間區間切換 */}
      <View style={styles.timeframeRow}>
        {TIMEFRAMES.map((tf) => {
          const active = timeframe === tf;
          return (
            <Pressable
              key={tf}
              style={[
                styles.timeframeButton,
                active && styles.timeframeButtonActive,
              ]}
              onPress={() => onChangeTimeframe(tf)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  active && styles.timeframeTextActive,
                ]}
              >
                {tf}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 假圖表區塊 */}
      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartText}>
          目前顯示：{timeframe} 走勢（示意）{'\n'}
          之後可以改用真實 K 線 / 折線圖。
        </Text>
      </View>

      {/* 技術指標 */}
      <View style={styles.techRow}>
        <Text style={styles.techLabel}>MA5</Text>
        <Text style={styles.techValue}>{fmt(ma5)}</Text>
      </View>
      <View style={styles.techRow}>
        <Text style={styles.techLabel}>MA20</Text>
        <Text style={styles.techValue}>{fmt(ma20)}</Text>
      </View>
      <View style={styles.techRow}>
        <Text style={styles.techLabel}>MA60</Text>
        <Text style={styles.techValue}>{fmt(ma60)}</Text>
      </View>
      <View style={styles.techRow}>
        <Text style={styles.techLabel}>RSI</Text>
        <Text style={styles.techValue}>{fmt(rsi, 1)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  timeframeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timeframeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  timeframeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  timeframeText: {
    fontSize: 12,
    color: '#4b5563',
  },
  timeframeTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  chartText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  techLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  techValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
});