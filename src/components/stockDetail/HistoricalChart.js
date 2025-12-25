// src/components/stockDetail/HistoricalChart.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { fetchDailyClosesByStooq } from '../../services/backtestApi';

const TIMEFRAMES = [
  { key: '1W', label: '1週', days: 7 },
  { key: '1M', label: '1個月', days: 30 },
  { key: '3M', label: '3個月', days: 90 },
  { key: '6M', label: '6個月', days: 180 },
  { key: '1Y', label: '1年', days: 365 },
  { key: 'YTD', label: '本年迄今', days: null },
];

// 簡單的線圖組件
function SimpleLineChart({ data, width, height, isPositive }) {
  if (!data || data.length === 0) return null;

  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));
  const rangeY = maxY - minY || 1;

  const chartWidth = width - 40;
  const chartHeight = height - 40;

  // 計算每個點的位置
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth + 20;
    const y = chartHeight - ((point.y - minY) / rangeY) * chartHeight + 20;
    return { x, y };
  });

  // 創建 SVG path 字串
  const pathData = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `L ${point.x} ${point.y}`;
  }).join(' ');

  return (
    <View style={[styles.chartContainer, { width, height }]}>
      {/* 背景網格線 */}
      <View style={styles.gridLines}>
        {[0, 1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[
              styles.gridLine,
              { top: (i * chartHeight) / 4 + 20 }
            ]}
          />
        ))}
      </View>

      {/* 使用 View 繪製簡單的折線 */}
      {points.map((point, index) => {
        if (index === points.length - 1) return null;
        const nextPoint = points[index + 1];
        
        const lineLength = Math.sqrt(
          Math.pow(nextPoint.x - point.x, 2) + 
          Math.pow(nextPoint.y - point.y, 2)
        );
        
        const angle = Math.atan2(
          nextPoint.y - point.y,
          nextPoint.x - point.x
        ) * (180 / Math.PI);

        return (
          <View
            key={index}
            style={[
              styles.lineSegment,
              {
                position: 'absolute',
                left: point.x,
                top: point.y,
                width: lineLength,
                backgroundColor: isPositive ? '#ef4444' : '#10b981',
                transform: [{ rotate: `${angle}deg` }],
              }
            ]}
          />
        );
      })}

      {/* 繪製數據點 */}
      {points.map((point, index) => (
        <View
          key={`dot-${index}`}
          style={[
            styles.dataDot,
            {
              position: 'absolute',
              left: point.x - 2,
              top: point.y - 2,
              backgroundColor: isPositive ? '#ef4444' : '#10b981',
            }
          ]}
        />
      ))}
    </View>
  );
}

export default function HistoricalChart({ symbol, market, currentPrice }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (symbol && market) {
      fetchHistoricalData();
    }
  }, [symbol, market, selectedTimeframe]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const allData = await fetchDailyClosesByStooq({ market, symbol });

      if (!allData || allData.length === 0) {
        setChartData([]);
        setStats(null);
        setLoading(false);
        return;
      }

      // 根據時間範圍過濾資料
      const timeframe = TIMEFRAMES.find(t => t.key === selectedTimeframe);
      let filteredData = [...allData];

      // 計算起始日期
      const today = new Date();
      let startDate = null;

      if (timeframe.key === 'YTD') {
        // 本年迄今
        const currentYear = today.getFullYear();
        startDate = `${currentYear}-01-01`;
      } else if (timeframe.days) {
        // 往前推算 N 天（日曆天數）
        const start = new Date(today);
        start.setDate(start.getDate() - timeframe.days);
        const yyyy = start.getFullYear();
        const mm = String(start.getMonth() + 1).padStart(2, '0');
        const dd = String(start.getDate()).padStart(2, '0');
        startDate = `${yyyy}-${mm}-${dd}`;
      }

      // 過濾出指定日期範圍的資料
      if (startDate) {
        filteredData = allData.filter(d => d.date >= startDate);
      }

      console.log('[HistoricalChart] 時間範圍:', timeframe.label, '起始日期:', startDate);
      console.log('[HistoricalChart] 過濾前資料:', allData.length, '過濾後:', filteredData.length);

      // 排序並格式化資料
      const sorted = filteredData.sort((a, b) => a.date.localeCompare(b.date));
      
      if (sorted.length === 0) {
        setChartData([]);
        setStats(null);
        setLoading(false);
        return;
      }

      console.log('[HistoricalChart] 第一筆日期:', sorted[0].date, '價格:', sorted[0].close);
      console.log('[HistoricalChart] 最後一筆日期:', sorted[sorted.length - 1].date, '價格:', sorted[sorted.length - 1].close);

      // 轉換為圖表格式
      const formatted = sorted.map((item, index) => ({
        x: index,
        y: item.close,
        date: item.date,
      }));

      setChartData(formatted);

      // 計算統計數據
      const firstPrice = sorted[0].close;
      const lastPrice = sorted[sorted.length - 1].close;
      const change = lastPrice - firstPrice;
      const changePercent = (change / firstPrice) * 100;

      const prices = sorted.map(d => d.close);
      const high = Math.max(...prices);
      const low = Math.min(...prices);

      console.log('[HistoricalChart] 區間漲跌:', {
        first: firstPrice,
        last: lastPrice,
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2) + '%'
      });

      setStats({
        change,
        changePercent,
        high,
        low,
        period: timeframe.label,
      });

      setLoading(false);
    } catch (error) {
      console.log('Failed to fetch historical data:', error);
      setChartData([]);
      setStats(null);
      setLoading(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;
  const chartHeight = 200;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>歷史走勢</Text>

      {/* 時間範圍選擇器 */}
      <View style={styles.timeframeRow}>
        {TIMEFRAMES.map(tf => (
          <Pressable
            key={tf.key}
            style={[
              styles.timeframeButton,
              selectedTimeframe === tf.key && styles.timeframeButtonActive,
            ]}
            onPress={() => setSelectedTimeframe(tf.key)}
          >
            <Text
              style={[
                styles.timeframeText,
                selectedTimeframe === tf.key && styles.timeframeTextActive,
              ]}
            >
              {tf.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      ) : chartData.length > 0 ? (
        <>
          {/* 統計資訊 */}
          {stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>區間漲跌</Text>
                <Text style={[
                  styles.statValue,
                  stats.change >= 0 ? styles.statPositive : styles.statNegative
                ]}>
                  {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)} ({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%)
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>最高</Text>
                <Text style={styles.statValue}>{stats.high.toFixed(2)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>最低</Text>
                <Text style={styles.statValue}>{stats.low.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {/* 圖表 */}
          <SimpleLineChart
            data={chartData}
            width={chartWidth}
            height={chartHeight}
            isPositive={stats && stats.change >= 0}
          />
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>無歷史資料</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  timeframeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  timeframeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  timeframeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  timeframeTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statPositive: {
    color: '#ef4444',
  },
  statNegative: {
    color: '#10b981',
  },
  chartContainer: {
    position: 'relative',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  lineSegment: {
    height: 2,
    transformOrigin: 'left center',
  },
  dataDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

