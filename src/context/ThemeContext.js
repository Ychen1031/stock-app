// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@stock_app_theme';

export const lightTheme = {
  mode: 'light',
  colors: {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    primary: '#2196F3',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    up: '#10B981',
    down: '#EF4444',
    chartLine: '#2196F3',
    chartGrid: '#E0E0E0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333',
    primary: '#64B5F6',
    success: '#81C784',
    error: '#E57373',
    warning: '#FFB74D',
    up: '#10B981',
    down: '#EF4444',
    chartLine: '#64B5F6',
    chartGrid: '#333333',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
};

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('auto'); // 'light', 'dark', 'auto'
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // 載入儲存的主題設定
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
          setThemeMode(saved);
          if (saved === 'light') setIsDark(false);
          else if (saved === 'dark') setIsDark(true);
          else setIsDark(systemColorScheme === 'dark');
        }
      } catch (e) {
        console.warn('Failed to load theme:', e);
      }
    };
    loadTheme();
  }, []);

  // 當系統主題改變時，如果是 auto 模式則跟隨
  useEffect(() => {
    if (themeMode === 'auto') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  const toggleTheme = async () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
    setIsDark(!isDark);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  };

  const setThemeModeValue = async (mode) => {
    setThemeMode(mode);
    if (mode === 'light') setIsDark(false);
    else if (mode === 'dark') setIsDark(true);
    else setIsDark(systemColorScheme === 'dark');
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        themeMode,
        toggleTheme,
        setThemeMode: setThemeModeValue,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
