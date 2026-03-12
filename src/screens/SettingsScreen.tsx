import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../store/useStore';
import { Colors } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SettingsScreen() {
  const { isPremium, isPurchasing, purchasePremiumAction, restorePurchase, resetAllData } = useStore();
  const insets = useSafeAreaInsets();

  const handlePurchase = async () => {
    try {
      const success = await purchasePremiumAction();
      if (success) {
        Alert.alert('購入完了', 'プレミアムプランが有効になりました！ありがとうございます。');
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message || '購入処理中にエラーが発生しました。しばらくしてからお試しください。');
    }
  };

  const handleRestore = async () => {
    try {
      const success = await restorePurchase();
      if (success) {
        Alert.alert('復元完了', 'プレミアムプランが復元されました！');
      } else {
        Alert.alert('復元', '復元可能な購入が見つかりませんでした。');
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message || '復元中にエラーが発生しました。');
    }
  };

  const handleReset = () => {
    Alert.alert(
      '学習記録をリセット',
      'すべての解答記録と模擬試験の結果が削除されます。この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            Alert.alert('完了', '学習記録をリセットしました。');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>設定</Text>

      {/* Premium Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>プレミアム</Text>

        {isPremium ? (
          <View style={styles.premiumActiveCard}>
            <Text style={styles.premiumActiveEmoji}>⭐</Text>
            <Text style={styles.premiumActiveText}>プレミアム有効</Text>
            <Text style={styles.premiumActiveDetail}>
              全問題・模擬試験・広告非表示が有効です
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.premiumCard, isPurchasing && { opacity: 0.6 }]}
            onPress={handlePurchase}
            activeOpacity={0.8}
            disabled={isPurchasing}
          >
            <Text style={styles.premiumEmoji}>👑</Text>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>プレミアムにアップグレード</Text>
              <Text style={styles.premiumDescription}>
                全250問を解放 / 模擬試験モード / 広告非表示
              </Text>
              <Text style={styles.premiumPrice}>¥480（買い切り）</Text>
              {isPurchasing && <ActivityIndicator color={Colors.premiumDark} style={{ marginTop: 4 }} />}
            </View>
          </TouchableOpacity>
        )}

        {!isPremium && (
          <TouchableOpacity
            style={[styles.menuItem, isPurchasing && { opacity: 0.6 }]}
            onPress={handleRestore}
            disabled={isPurchasing}
          >
            <Text style={styles.menuItemText}>
              {isPurchasing ? '処理中...' : '購入を復元'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>データ</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleReset}>
          <Text style={[styles.menuItemText, { color: Colors.incorrect }]}>
            学習記録をリセット
          </Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アプリについて</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>バージョン</Text>
          <Text style={styles.menuItemValue}>1.0.0</Text>
        </View>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Linking.openURL('mailto:support@example.com')}
        >
          <Text style={styles.menuItemText}>お問い合わせ</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        ※ このアプリはQC検定の公式アプリではありません。
        {'\n'}学習支援を目的として制作されています。
      </Text>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: Colors.premium,
    marginBottom: 8,
  },
  premiumEmoji: {
    fontSize: 36,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  premiumPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.premiumDark,
  },
  premiumActiveCard: {
    backgroundColor: Colors.premium + '15',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.premium,
  },
  premiumActiveEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  premiumActiveText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.premiumDark,
    marginBottom: 4,
  },
  premiumActiveDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  menuItem: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  menuItemText: {
    fontSize: 15,
    color: Colors.text,
  },
  menuItemValue: {
    fontSize: 15,
    color: Colors.textLight,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
  },
});
