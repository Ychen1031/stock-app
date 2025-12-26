import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  SafeAreaView,
  Animated,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// 引入 API 和儲存功能
import { login, register } from '../services/authApi';
import { saveUserProfile } from '../storage/userStorage';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  // --- 動畫相關 Ref ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // --- 登入註冊功能狀態 ---
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- 啟動動畫 ---
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // --- 處理表單送出 ---
  const handleSubmit = async () => {
    // 基本驗證
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('提示', '請填寫完整資訊');
      return;
    }

    setLoading(true);
    try {
      let userData;
      if (isLogin) {
        // 執行登入
        userData = await login(email, password);
      } else {
        // 執行註冊
        userData = await register(name, email, password);
      }

      // 儲存使用者資料到手機
      await saveUserProfile({
        name: userData.name,
        email: userData.email,
        bio: '一般會員',
        // 簡單產生一個暱稱首字
        avatarInitials: userData.name.charAt(0).toUpperCase()
      });

      // 成功後跳轉到主頁面
      navigation.replace('MainApp');

    } catch (error) {
      Alert.alert('錯誤', typeof error === 'string' ? error : '連線失敗，請檢查網路或伺服器');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* 背景裝飾圓圈 */}
              <View style={styles.circlesContainer}>
                <Animated.View 
                  style={[
                    styles.circle, 
                    styles.circle1,
                    { transform: [{ rotate: rotation }] }
                  ]} 
                />
                <View style={[styles.circle, styles.circle2]} />
                <View style={[styles.circle, styles.circle3]} />
              </View>

              {/* 主圖標動畫區 (改用本地圖片 assets/icon.png) */}
              <Animated.View 
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: scaleAnim }] }
                ]}
              >
                <LinearGradient
                  colors={['#ffffff', '#f0f9ff']}
                  style={styles.iconGradient}
                >
                  {/* 使用本地 icon 檔案（請將您傳的圖片放到 ./assets/icon.png） */}
                  <Image
                    source={require('../../assets/app-logo.png')}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </LinearGradient>
              </Animated.View>
              
              <Text style={styles.title}>黃李智股票app</Text>
              
              {/* 特色標籤 */}
              <View style={styles.tagContainer}>
                <View style={styles.tag}>
                  <Ionicons name="flash" size={14} color="#fbbf24" />
                  <Text style={styles.tagText}>即時</Text>
                </View>
                <View style={styles.tag}>
                  <Ionicons name="shield-checkmark" size={14} color="#34d399" />
                  <Text style={styles.tagText}>專業</Text>
                </View>
                <View style={styles.tag}>
                  <Ionicons name="analytics" size={14} color="#a78bfa" />
                  <Text style={styles.tagText}>智能</Text>
                </View>
              </View>

              <Text style={styles.subtitle}>
                {isLogin ? '歡迎回來，請登入您的帳戶' : '建立新帳戶，開始智能投資'}
              </Text>
              
              {/* --- 表單區域 --- */}
              <View style={styles.formContainer}>
                {!isLogin && (
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#e0f2fe" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="您的暱稱"
                      placeholderTextColor="#93c5fd"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                )}

                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#e0f2fe" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="電子郵件"
                    placeholderTextColor="#93c5fd"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#e0f2fe" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="密碼"
                    placeholderTextColor="#93c5fd"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>
              
              {/* 登入/註冊按鈕 */}
              <Pressable
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#ffffff', '#f0f9ff']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#3b82f6" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>{isLogin ? '登入' : '註冊'}</Text>
                      <Ionicons name={isLogin ? "log-in-outline" : "person-add-outline"} size={22} color="#3b82f6" style={styles.buttonIcon} />
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              {/* 切換模式文字按鈕 */}
              <Pressable 
                style={styles.switchButton} 
                onPress={() => {
                  setIsLogin(!isLogin);
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
              >
                <Text style={styles.switchText}>
                  {isLogin ? '還沒有帳號？ 點此註冊' : '已經有帳號了？ 點此登入'}
                </Text>
              </Pressable>

              <Text style={styles.footer}>智能投資，從這裡開始 ✨</Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40, 
  },
  circlesContainer: {
    position: 'absolute',
    width: width,
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.1,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: '#ffffff',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    backgroundColor: '#ffffff',
    top: '40%',
    left: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    // 移除 overflow: 'hidden' 讓 icon 陰影更自然
  },
  logoImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  // 移除原本的 profileImage 樣式，因為不需要了
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0f2fe',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    marginBottom: 32,
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    paddingHorizontal: 20,
    height: 56, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#ffffff', 
    fontWeight: '500',
  },
  button: {
    width: '100%', 
    marginBottom: 20,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 999,
    gap: 8,
  },
  buttonText: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginTop: 2,
  },
  switchButton: {
    padding: 8,
    marginBottom: 24,
  },
  switchText: {
    color: '#e0f2fe',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    color: '#e0f2fe',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
});