// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme, themeMode, setThemeMode } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          股票 App 專題版 v2.0
        </Text>
        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 8 }]}>
          新增功能：深色模式、持倉管理、搜尋功能
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    paddingTop: 60,
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
});