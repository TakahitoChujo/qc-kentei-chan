import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../constants/categories';
import { Colors } from '../constants/colors';
import { getAccuracyRate, getStudyDaysCount, formatTime } from '../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function StatsScreen() {
  const {
    answerRecords,
    examResults,
    getCategoryStats: getStats,
    getOverallAccuracy,
    getTotalAnswered,
    getBookmarkCount,
  } = useStore();

  const accuracy = getOverallAccuracy();
  const totalAnswered = getTotalAnswered();
  const studyDays = getStudyDaysCount(answerRecords);
  const bookmarkCount = getBookmarkCount();
  const categoryStats = getStats();
  const insets = useSafeAreaInsets();

  // Find weakest category
  const categoryEntries = Object.entries(categoryStats).filter(
    ([, s]) => s.answered > 0
  );
  const weakest = categoryEntries.length > 0
    ? categoryEntries.reduce((min, curr) =>
        getAccuracyRate(curr[1].correct, curr[1].answered) <
        getAccuracyRate(min[1].correct, min[1].answered)
          ? curr
          : min
      )
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>学習記録</Text>

      {/* Overall Stats */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{accuracy}%</Text>
            <Text style={styles.overviewLabel}>総合正答率</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{totalAnswered}</Text>
            <Text style={styles.overviewLabel}>総解答数</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{studyDays}</Text>
            <Text style={styles.overviewLabel}>学習日数</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, { color: Colors.premiumDark }]}>
              {bookmarkCount}
            </Text>
            <Text style={styles.overviewLabel}>ブックマーク</Text>
          </View>
        </View>
      </View>

      {/* Weak Category */}
      {weakest && (
        <View style={styles.weakCard}>
          <Text style={styles.weakTitle}>苦手分野</Text>
          <Text style={styles.weakCategory}>{weakest[0]}</Text>
          <Text style={styles.weakRate}>
            正答率: {getAccuracyRate(weakest[1].correct, weakest[1].answered)}%
          </Text>
        </View>
      )}

      {/* Category Breakdown */}
      <Text style={styles.sectionTitle}>分野別正答率</Text>
      {CATEGORIES.map((cat) => {
        const stats = categoryStats[cat.name];
        const rate = getAccuracyRate(stats.correct, stats.answered);
        const hasData = stats.answered > 0;

        return (
          <View key={cat.name} style={styles.categoryRow}>
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: hasData ? `${rate}%` : '0%',
                      backgroundColor: hasData
                        ? rate >= 80
                          ? Colors.correct
                          : rate >= 60
                          ? Colors.premium
                          : Colors.incorrect
                        : Colors.border,
                    },
                  ]}
                />
              </View>
            </View>
            <Text
              style={[
                styles.categoryRate,
                {
                  color: hasData
                    ? rate >= 80
                      ? Colors.correct
                      : rate >= 60
                      ? Colors.premiumDark
                      : Colors.incorrect
                    : Colors.textLight,
                },
              ]}
            >
              {hasData ? `${rate}%` : '--'}
            </Text>
          </View>
        );
      })}

      {/* Exam History */}
      {examResults.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            模擬試験の履歴
          </Text>
          {examResults.slice(0, 10).map((result) => {
            const examRate = getAccuracyRate(result.score, result.totalQuestions);
            const date = new Date(result.completedAt);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

            return (
              <View key={result.id} style={styles.examRow}>
                <Text style={styles.examDate}>{dateStr}</Text>
                <View style={styles.examScoreContainer}>
                  <Text style={styles.examScore}>
                    {result.score}/{result.totalQuestions}
                  </Text>
                  <Text
                    style={[
                      styles.examRate,
                      { color: examRate >= 70 ? Colors.correct : Colors.incorrect },
                    ]}
                  >
                    {examRate}%
                  </Text>
                </View>
                <Text style={styles.examTime}>{formatTime(result.timeSeconds)}</Text>
              </View>
            );
          })}
        </>
      )}

      {totalAnswered === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>
            まだ学習記録がありません。{'\n'}問題を解いて記録を積み上げましょう！
          </Text>
        </View>
      )}

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
    marginBottom: 16,
  },
  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  weakCard: {
    backgroundColor: Colors.incorrectLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.incorrect,
  },
  weakTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.incorrect,
    marginBottom: 4,
  },
  weakCategory: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  weakRate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    gap: 10,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  barContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryRate: {
    fontSize: 14,
    fontWeight: '700',
    width: 40,
    textAlign: 'right',
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 6,
  },
  examDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 40,
  },
  examScoreContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examScore: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  examRate: {
    fontSize: 14,
    fontWeight: '700',
  },
  examTime: {
    fontSize: 13,
    color: Colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
