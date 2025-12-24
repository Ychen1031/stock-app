import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function toNumber(value) {
  if (value === undefined || value === null) return NaN;
  const n = Number(value);
  return Number.isNaN(n) ? NaN : n;
}

export default function PriceBlock({ price, change, changePercent }) {
  const numericPrice = toNumber(price);
  const numericChange = toNumber(change);
  const numericChangePercent = toNumber(changePercent);

  const hasPrice = !Number.isNaN(numericPrice);
  const hasChange = !Number.isNaN(numericChange);
  const hasChangePercent = !Number.isNaN(numericChangePercent);

  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceValue}>
        {hasPrice ? numericPrice.toFixed(2) : '--.--'}
      </Text>
      <View style={styles.changeGroup}>
        {hasChange && hasChangePercent ? (
          <Text
            style={[
              styles.changeText,
              numericChange >= 0 ? styles.changeUpText : styles.changeDownText,
            ]}
          >
            {numericChange >= 0 ? '+' : ''}
            {numericChange.toFixed(2)} ({numericChangePercent > 0 ? '+' : ''}
            {numericChangePercent.toFixed(2)}%)
          </Text>
        ) : (
          <Text style={[styles.changeText, styles.neutralText]}>
            無即時漲跌資料
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  changeGroup: {
    marginLeft: 12,
  },
  changeText: {
    fontSize: 16,
  },
  neutralText: {
    color: '#6b7280',
  },
  changeUpText: {
    color: '#dc2626',
  },
  changeDownText: {
    color: '#2563eb',
  },
});