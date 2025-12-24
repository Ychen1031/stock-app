import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function StockHeader({
  symbol,
  name,
  displayMarket,
  inWatchlist,
  watchlistLoading,
  onToggleWatchlist,
}) {
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.symbol}>{symbol || '--'}</Text>
        <Text style={styles.name}>{name || ''}</Text>
        <Text style={styles.marketTag}>{displayMarket}</Text>
      </View>

      <Pressable
        style={[styles.watchButton, inWatchlist && styles.watchButtonActive]}
        onPress={onToggleWatchlist}
        disabled={watchlistLoading}
      >
        <Text
          style={[
            styles.watchButtonText,
            inWatchlist && styles.watchButtonTextActive,
          ]}
        >
          {inWatchlist ? '★ 已加入自選' : '☆ 加入自選股'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  symbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  name: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  marketTag: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    fontSize: 12,
    color: '#374151',
  },
  watchButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  watchButtonActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  watchButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  watchButtonTextActive: {
    color: '#ffffff',
  },
});