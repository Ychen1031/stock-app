import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { fetchCompanyInfo } from '../../services/companyInfoApi';

export default function CompanyInfoSection({ symbol, displayMarket, name }) {
  const { theme } = useTheme();
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyInfo();
  }, [symbol]);

  const loadCompanyInfo = async () => {
    if (!symbol) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const info = await fetchCompanyInfo(symbol);
      setCompanyDetails(info);
    } catch (error) {
      console.error('Load company info error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>公司資訊</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            載入公司資訊中...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>股票代號</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{symbol || '--'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>市場</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{displayMarket}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>公司名稱</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {companyDetails?.fullName || name || '--'}
            </Text>
          </View>

          {companyDetails && (
            <>
              {companyDetails.industry && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>產業</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{companyDetails.industry}</Text>
                </View>
              )}
              {companyDetails.founded && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>成立</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{companyDetails.founded}</Text>
                </View>
              )}
              {companyDetails.ceo && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>執行長</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{companyDetails.ceo}</Text>
                </View>
              )}
              {companyDetails.employees && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>員工數</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{companyDetails.employees}</Text>
                </View>
              )}
              {companyDetails.headquarters && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>總部</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{companyDetails.headquarters}</Text>
                </View>
              )}
              {companyDetails.marketCap && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>市值</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{companyDetails.marketCap}</Text>
                </View>
              )}

              {companyDetails.description && (
                <View style={[styles.descriptionContainer, { borderTopColor: theme.colors.border }]}>
                  <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>公司簡介</Text>
                  <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
                    {companyDetails.description}
                  </Text>
                </View>
              )}
            </>
          )}

          {!loading && !companyDetails && (
            <Text style={[styles.sectionText, { marginTop: 12, color: theme.colors.textSecondary }]}>
              暫無詳細資料
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
});