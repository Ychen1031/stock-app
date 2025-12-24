// src/components/backtest/SegmentedControl.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

/**
 * 通用 Segmented Control
 * props:
 * - options: [{ key, label }]
 * - value: 當前選中的 key
 * - onChange: (key) => void
 * - scrollable: 是否可以橫向捲動（選項很多時用）
 */
export default function SegmentedControl({
  options,
  value,
  onChange,
  scrollable = false,
}) {
  const content = (
    <View style={styles.segmentRow}>
      {options.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            style={[styles.segmentButton, active && styles.segmentButtonActive]}
            onPress={() => onChange(item.key)}
          >
            <Text
              style={[
                styles.segmentText,
                active && styles.segmentTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingRight: 8,
  },
  segmentRow: {
    flexDirection: 'row',
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  segmentButtonActive: {
    backgroundColor: '#111827',
  },
  segmentText: {
    fontSize: 13,
    color: '#4b5563',
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});