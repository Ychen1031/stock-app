// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView, Image, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { theme, isDark, toggleTheme, themeMode, setThemeMode } = useTheme();
  
  // 使用者資料狀態
  const [userName, setUserName] = useState('投資者');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const handleSaveName = () => {
    setIsEditingName(false);
    Alert.alert('成功', '使用者名稱已更新');
  };

  const handleSaveEmail = () => {
    setIsEditingEmail(false);
    Alert.alert('成功', '電子郵件已更新');
  };

  const handleLogout = async () => {
    Alert.alert(
      '登出確認',
      '確定要登出嗎？所有未儲存的數據將會遺失。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '登出', 
          style: 'destructive', 
          onPress: async () => {
            try {
              // 清除所有本地存儲數據
              await AsyncStorage.multiRemove([
                '@watchlist_symbols',
                '@portfolio_data',
                '@price_alerts',
                '@search_history',
              ]);
              
              // 導航回歡迎頁面
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
              
              Alert.alert('已登出', '您已成功登出');
            } catch (error) {
              console.error('登出錯誤:', error);
              Alert.alert('錯誤', '登出時發生錯誤，請重試');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 使用者資料卡片 */}
      <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
        </View>
        
        <View style={styles.userInfoSection}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>使用者名稱</Text>
            {isEditingName ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={userName}
                  onChangeText={setUserName}
                  autoFocus
                />
                <Pressable onPress={handleSaveName} style={styles.saveButton}>
                  <Text style={{ color: theme.colors.primary }}>儲存</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setIsEditingName(true)} style={styles.editableRow}>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{userName}</Text>
                <Text style={{ color: theme.colors.primary, fontSize: 14 }}>編輯</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>電子郵件</Text>
            {isEditingEmail ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={userEmail}
                  onChangeText={setUserEmail}
                  keyboardType="email-address"
                  autoFocus
                />
                <Pressable onPress={handleSaveEmail} style={styles.saveButton}>
                  <Text style={{ color: theme.colors.primary }}>儲存</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setIsEditingEmail(true)} style={styles.editableRow}>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{userEmail}</Text>
                <Text style={{ color: theme.colors.primary, fontSize: 14 }}>編輯</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>持倉</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>8</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>關注</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.up }]}>+15.6%</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>總報酬</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 外觀設定 */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>外觀設定</Text>
        
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>深色模式</Text>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.themeOptions}>
          <Pressable
            style={[
              styles.themeOption,
              themeMode === 'light' && { borderColor: theme.colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setThemeMode('light')}
          >
            <Text style={[styles.themeOptionText, { color: theme.colors.text }]}>☀️ 淺色</Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.themeOption,
              themeMode === 'dark' && { borderColor: theme.colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setThemeMode('dark')}
          >
            <Text style={[styles.themeOptionText, { color: theme.colors.text }]}>🌙 深色</Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.themeOption,
              themeMode === 'auto' && { borderColor: theme.colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setThemeMode('auto')}
          >
            <Text style={[styles.themeOptionText, { color: theme.colors.text }]}>🔄 自動</Text>
          </Pressable>
        </View>
      </View>

      {/* 功能說明 */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>功能說明</Text>
        <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
          ✨ 深色模式 - 護眼且省電{'\n'}
          📊 持倉管理 - 追蹤投資損益{'\n'}
          🔍 股票搜尋 - 快速找到想要的股票{'\n'}
          ⚡ 價格提醒 - 到價自動通知（開發中）{'\n'}
          📈 技術分析 - 多種技術指標
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>關於 App</Text>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          股票 App 專題版 v2.1
        </Text>
        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 8 }]}>
          新增功能：選股器、基本面分析、公司 Logo
        </Text>
      </View>

      {/* 登出按鈕 */}
      <Pressable 
        style={[styles.logoutButton, { backgroundColor: theme.colors.card, borderColor: '#ef4444' }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>🚪 登出帳號</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    paddingTop: 60,
  },
  profileCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfoSection: {
    gap: 16,
  },
  infoRow: {
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  editableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20,
    marginTop: 8,
  },
  section: { 
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 12,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: { 
    fontSize: 15,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featureText: {
    fontSize: 14,
    lineHeight: 24,
  },
  logoutButton: {
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});