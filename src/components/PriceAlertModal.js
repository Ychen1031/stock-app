// src/components/PriceAlertModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
  getAlertsBySymbol,
  addPriceAlert,
  deletePriceAlert,
  updatePriceAlertStatus,
} from '../storage/priceAlertStorage';

export default function PriceAlertModal({ visible, onClose, symbol, name, currentPrice }) {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above'); // 'above' or 'below'

  useEffect(() => {
    if (visible && symbol) {
      loadAlerts();
    }
  }, [visible, symbol]);

  const loadAlerts = async () => {
    try {
      const data = await getAlertsBySymbol(symbol);
      setAlerts(data);
    } catch (error) {
      console.error('Load alerts error:', error);
    }
  };

  const handleAddAlert = async () => {
    if (!targetPrice || isNaN(parseFloat(targetPrice))) {
      Alert.alert('錯誤', '請輸入有效的價格');
      return;
    }

    const price = parseFloat(targetPrice);
    if (price <= 0) {
      Alert.alert('錯誤', '價格必須大於 0');
      return;
    }

    try {
      await addPriceAlert({
        symbol,
        name,
        targetPrice: price,
        condition,
      });

      setTargetPrice('');
      setShowAddForm(false);
      loadAlerts();
    } catch (error) {
      console.error('Add alert error:', error);
      Alert.alert('錯誤', '新增提醒失敗');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    Alert.alert('確認刪除', '確定要刪除這個價格提醒嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePriceAlert(alertId);
            loadAlerts();
          } catch (error) {
            console.error('Delete alert error:', error);
          }
        },
      },
    ]);
  };

  const handleToggleAlert = async (alertId, isActive) => {
    try {
      await updatePriceAlertStatus(alertId, !isActive);
      loadAlerts();
    } catch (error) {
      console.error('Toggle alert error:', error);
    }
  };

  const renderAlert = ({ item }) => {
    const conditionText = item.condition === 'above' ? '突破' : '跌破';
    const statusColor = item.isActive ? theme.colors.success : theme.colors.textSecondary;

    return (
      <View style={[styles.alertItem, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.alertInfo}>
          <Text style={[styles.alertPrice, { color: theme.colors.text }]}>
            ${item.targetPrice.toFixed(2)}
          </Text>
          <Text style={[styles.alertCondition, { color: theme.colors.textSecondary }]}>
            {conditionText}提醒
          </Text>
          <Text style={[styles.alertStatus, { color: statusColor }]}>
            {item.isActive ? '● 啟用中' : '○ 已停用'}
          </Text>
        </View>
        <View style={styles.alertActions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.colors.border }]}
            onPress={() => handleToggleAlert(item.id, item.isActive)}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              {item.isActive ? '停用' : '啟用'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={() => handleDeleteAlert(item.id)}
          >
            <Text style={[styles.actionButtonText, { color: '#FFF' }]}>刪除</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              價格提醒
            </Text>
            <Pressable onPress={onClose}>
              <Text style={[styles.closeButton, { color: theme.colors.primary }]}>
                關閉
              </Text>
            </Pressable>
          </View>

          <View style={styles.stockInfo}>
            <Text style={[styles.stockName, { color: theme.colors.text }]}>
              {name} ({symbol})
            </Text>
            {currentPrice && (
              <Text style={[styles.currentPrice, { color: theme.colors.textSecondary }]}>
                目前價格：${currentPrice.toFixed(2)}
              </Text>
            )}
          </View>

          {!showAddForm && (
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowAddForm(true)}
            >
              <Text style={styles.addButtonText}>+ 新增價格提醒</Text>
            </Pressable>
          )}

          {showAddForm && (
            <View style={[styles.addForm, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                目標價格
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="輸入目標價格"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
                value={targetPrice}
                onChangeText={setTargetPrice}
              />

              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                提醒條件
              </Text>
              <View style={styles.conditionButtons}>
                <Pressable
                  style={[
                    styles.conditionButton,
                    condition === 'above' && { backgroundColor: theme.colors.primary },
                    condition !== 'above' && { borderColor: theme.colors.border, borderWidth: 1 },
                  ]}
                  onPress={() => setCondition('above')}
                >
                  <Text
                    style={[
                      styles.conditionButtonText,
                      { color: condition === 'above' ? '#FFF' : theme.colors.text },
                    ]}
                  >
                    價格突破（≥）
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.conditionButton,
                    condition === 'below' && { backgroundColor: theme.colors.primary },
                    condition !== 'below' && { borderColor: theme.colors.border, borderWidth: 1 },
                  ]}
                  onPress={() => setCondition('below')}
                >
                  <Text
                    style={[
                      styles.conditionButtonText,
                      { color: condition === 'below' ? '#FFF' : theme.colors.text },
                    ]}
                  >
                    價格跌破（≤）
                  </Text>
                </Pressable>
              </View>

              <View style={styles.formActions}>
                <Pressable
                  style={[styles.formButton, { backgroundColor: theme.colors.border }]}
                  onPress={() => {
                    setShowAddForm(false);
                    setTargetPrice('');
                  }}
                >
                  <Text style={[styles.formButtonText, { color: theme.colors.text }]}>
                    取消
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.formButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddAlert}
                >
                  <Text style={[styles.formButtonText, { color: '#FFF' }]}>確認</Text>
                </Pressable>
              </View>
            </View>
          )}

          <FlatList
            data={alerts}
            renderItem={renderAlert}
            keyExtractor={(item) => item.id}
            style={styles.alertsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  尚無價格提醒
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  stockInfo: {
    marginBottom: 16,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 14,
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  addForm: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  conditionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  formButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  formButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  alertsList: {
    flex: 1,
  },
  alertItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertInfo: {
    marginBottom: 8,
  },
  alertPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertCondition: {
    fontSize: 13,
    marginBottom: 4,
  },
  alertStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
