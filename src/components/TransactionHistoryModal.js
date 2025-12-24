// src/components/TransactionHistoryModal.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function TransactionHistoryModal({ visible, onClose, holding, onDeleteTransaction }) {
  const { theme } = useTheme();

  if (!holding) return null;

  const handleDeleteTransaction = (transaction) => {
    Alert.alert(
      '刪除交易記錄',
      `確定要刪除此筆${transaction.type === 'buy' ? '買入' : '賣出'}記錄嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => {
            onDeleteTransaction(holding.symbol, transaction.id);
          },
        },
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  const sortedTransactions = [...holding.transactions].sort((a, b) => b.date - a.date);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                交易記錄
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {holding.name} ({holding.symbol})
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Summary */}
          <View style={[styles.summary, { backgroundColor: theme.colors.card }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                總交易筆數
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {holding.transactions.length}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                當前持有
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {holding.totalShares} 股
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                平均成本
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                ${holding.averageCost.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Transaction List */}
          <ScrollView style={styles.list}>
            {sortedTransactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  尚無交易記錄
                </Text>
              </View>
            ) : (
              sortedTransactions.map((transaction) => (
                <View
                  key={transaction.id}
                  style={[styles.transactionCard, { backgroundColor: theme.colors.card }]}
                >
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionLeft}>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor:
                              transaction.type === 'buy'
                                ? theme.colors.success + '20'
                                : theme.colors.error + '20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeText,
                            {
                              color:
                                transaction.type === 'buy'
                                  ? theme.colors.success
                                  : theme.colors.error,
                            },
                          ]}
                        >
                          {transaction.type === 'buy' ? '買入' : '賣出'}
                        </Text>
                      </View>
                      <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                        {formatDate(transaction.date)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteTransaction(transaction)}
                      style={styles.deleteIconButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={theme.colors.error}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.transactionDetails}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                        數量
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                        {transaction.quantity} 股
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                        價格
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                        ${transaction.price.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                        金額
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          styles.amountText,
                          { color: theme.colors.text },
                        ]}
                      >
                        ${(transaction.quantity * transaction.price).toFixed(2)}
                      </Text>
                    </View>
                    {transaction.note ? (
                      <View style={styles.noteRow}>
                        <Ionicons
                          name="document-text-outline"
                          size={16}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
                          {transaction.note}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
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
  container: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  summary: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
  transactionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
  },
  deleteIconButton: {
    padding: 4,
  },
  transactionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountText: {
    fontWeight: '700',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
