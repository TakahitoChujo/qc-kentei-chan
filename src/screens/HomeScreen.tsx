import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../constants/categories';
import { Colors } from '../constants/colors';
import { getAccuracyRate, getStudyDaysCount } from '../utils/helpers';

type RootStackParamList = {
  Main: undefined;
  Quiz: { category?: string; mode?: string };
  Exam: undefined;
  Result: undefined;
  BookmarkList: undefined;
};

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { answerRecords, isPremium, getCategoryStats: getStats, getOverallAccuracy, getTotalAnswered, getWrongQuestions, getBookmarkCount } = useStore();

  const accuracy = getOverallAccuracy();
  const totalAnswered = getTotalAnswered();
  const studyDays = getStudyDaysCount(answerRecords);
  const categoryStats = getStats();
  const wrongCount = getWrongQuestions().length;
  const bookmarkCount = getBookmarkCount();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.greeting}>QC検定ちゃん</Text>
        <Text style={styles.subtitle}>QC検定3級 一問一答</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>正答率</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalAnswered}</Text>
            <Text style={styles.statLabel}>解答数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{studyDays}</Text>
            <Text style={styles.statLabel}>学習日数</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Quiz', {})}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonIcon}>📝</Text>
        <View>
          <Text style={styles.primaryButtonText}>一問一答を始める</Text>
          <Text style={styles.primaryButtonSub}>ランダムに出題</Text>
        </View>
      </TouchableOpacity>

      {/* Review Button */}
      <TouchableOpacity
        style={[styles.reviewButton, wrongCount === 0 && styles.reviewButtonDisabled]}
        onPress={() => {
          if (wrongCount > 0) {
            navigation.navigate('Quiz', { mode: 'review' });
          }
        }}
        activeOpacity={wrongCount > 0 ? 0.8 : 1}
      >
        <Text style={styles.reviewButtonIcon}>🔄</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewButtonText}>間違えた問題を復習</Text>
          <Text style={styles.reviewButtonSub}>
            {wrongCount > 0 ? `${wrongCount}問` : '復習する問題はありません'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bookmark Review Button */}
      <TouchableOpacity
        style={[styles.bookmarkButton, bookmarkCount === 0 && styles.bookmarkButtonDisabled]}
        onPress={() => {
          if (bookmarkCount > 0) {
            navigation.navigate('Quiz', { mode: 'bookmark' });
          }
        }}
        activeOpacity={bookmarkCount > 0 ? 0.8 : 1}
      >
        <Text style={styles.bookmarkButtonIcon}>★</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bookmarkButtonText}>ブックマーク問題を復習</Text>
          <Text style={styles.bookmarkButtonSub}>
            {bookmarkCount > 0 ? `${bookmarkCount}問` : 'ブックマークした問題はありません'}
          </Text>
        </View>
        {bookmarkCount > 0 && (
          <TouchableOpacity
            style={styles.bookmarkListLink}
            onPress={() => navigation.navigate('BookmarkList')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.bookmarkListLinkText}>一覧</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Category Overview */}
      <Text style={styles.sectionTitle}>分野別の進捗</Text>
      {CATEGORIES.map((cat) => {
        const stats = categoryStats[cat.name];
        const rate = getAccuracyRate(stats.correct, stats.answered);

        return (
          <TouchableOpacity
            key={cat.name}
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Quiz', { category: cat.name })}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <View style={styles.categoryProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${stats.answered > 0 ? Math.min((stats.answered / stats.total) * 100, 100) : 0}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.categoryRate}>
                  {stats.answered > 0 ? `${rate}%` : '--'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Exam Button */}
      <TouchableOpacity
        style={[styles.examButton, !isPremium && styles.lockedButton]}
        onPress={() => {
          if (isPremium) {
            navigation.navigate('Exam');
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.examButtonIcon}>{isPremium ? '📋' : '🔒'}</Text>
        <View>
          <Text style={styles.examButtonText}>模擬試験</Text>
          <Text style={styles.examButtonSub}>
            {isPremium ? '本番形式で力試し' : 'プレミアムで解放'}
          </Text>
        </View>
      </TouchableOpacity>

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
  statsCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFFCC',
    marginTop: 4,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF20',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFFAA',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#FFFFFF40',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 16,
  },
  primaryButtonIcon: {
    fontSize: 32,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  primaryButtonSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  categoryRate: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.incorrect,
    gap: 16,
  },
  reviewButtonDisabled: {
    opacity: 0.5,
    borderColor: Colors.border,
  },
  reviewButtonIcon: {
    fontSize: 32,
  },
  reviewButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.incorrect,
  },
  reviewButtonSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.premium,
    gap: 16,
  },
  bookmarkButtonDisabled: {
    opacity: 0.5,
    borderColor: Colors.border,
  },
  bookmarkButtonIcon: {
    fontSize: 32,
    color: Colors.premium,
  },
  bookmarkButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.premiumDark,
  },
  bookmarkButtonSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  examButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.premium,
    gap: 16,
  },
  lockedButton: {
    opacity: 0.7,
  },
  examButtonIcon: {
    fontSize: 32,
  },
  examButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.premiumDark,
  },
  examButtonSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bookmarkListLink: {
    backgroundColor: Colors.premium + '20',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bookmarkListLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.premiumDark,
  },
});
