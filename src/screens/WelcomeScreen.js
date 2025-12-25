import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <LinearGradient
      colors={['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
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

          {/* 主圖標 */}
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
              <Ionicons name="trending-up" size={90} color="#3b82f6" />
            </LinearGradient>
          </Animated.View>
          
          <Text style={styles.title}>黃李智股票app</Text>
          
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
            專業的股票投資助手
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="globe-outline" size={24} color="#60a5fa" />
              </View>
              <Text style={styles.featureText}>台股、美股即時資訊</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="pie-chart-outline" size={24} color="#60a5fa" />
              </View>
              <Text style={styles.featureText}>投資組合管理</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="speedometer-outline" size={24} color="#60a5fa" />
              </View>
              <Text style={styles.featureText}>策略回測分析</Text>
            </View>
          </View>
          
          <Pressable
            style={styles.button}
            onPress={() => navigation.replace('MainApp')}
          >
            <LinearGradient
              colors={['#ffffff', '#f0f9ff']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>進入應用</Text>
              <Ionicons name="arrow-forward" size={22} color="#3b82f6" style={styles.buttonIcon} />
            </LinearGradient>
          </Pressable>

          <Text style={styles.footer}>智能投資，從這裡開始 ✨</Text>
        </Animated.View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
  },
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
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  button: {
    marginBottom: 24,
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
    paddingHorizontal: 48,
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
  footer: {
    color: '#e0f2fe',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
});
