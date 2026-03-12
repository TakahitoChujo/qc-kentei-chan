import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { Colors } from '../constants/colors';
import { getAccuracyRate } from '../utils/helpers';

type RootStackParamList = {
  Main: undefined;
  Result: { mode: string };
};

export function ResultScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const isExam = route.params?.mode === 'exam';

  const { examResults, answerRecords } = useStore();

  // Get recent session answers (last batch)
  const latestExam = isExam ? examResults[0] : null;

  // For quiz mode, approximate last session from recent records
  const recentRecords = answerRecords.slice(0, 50);
  const correctCount = isExam
    ? (latestExam?.score ?? 0)
    : recentRecords.filter((r) => r.isCorrect).length;
  const totalCount = isExam
    ? (latestExam?.totalQuestions ?? 0)
    : recentRecords.length;
  const accuracy = getAccuracyRate(correctCount, totalCount);

  const passed = isExam && accuracy >= 70;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `QC検定ちゃんで${isExam ? '模擬試験' : '一問一答'}に挑戦!\n正答率: ${accuracy}% (${correctCount}/${totalCount})\n#QC検定 #QC検定ちゃん`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Result Header */}
      <View style={styles.resultCard}>
        <Text style={styles.resultEmoji}>
          {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
        </Text>
        <Text style={styles.resultTitle}>
          {isExam
            ? passed
              ? '合格ライン到達!'
              : 'もう少し!'
            : '学習完了!'}
        </Text>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{accuracy}%</Text>
          <Text style={styles.scoreLabel}>正答率</Text>
        </View>

        <View style={styles.scoreDetail}>
          <View style={styles.detailItem}>
            <Text style={styles.detailValue}>{correctCount}</Text>
            <Text style={styles.detailLabel}>正解</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailValue}>{totalCount - correctCount}</Text>
            <Text style={styles.detailLabel}>不正解</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailValue}>{totalCount}</Text>
            <Text style={styles.detailLabel}>問題数</Text>
          </View>
        </View>

        {isExam && latestExam && (
          <Text style={styles.timeText}>
            所要時間: {Math.floor(latestExam.timeSeconds / 60)}分
            {latestExam.timeSeconds % 60}秒
          </Text>
        )}
      </View>

      {/* Encouragement */}
      <View style={styles.messageCard}>
        <Text style={styles.messageText}>
          {accuracy >= 80
            ? 'すばらしい成績です！この調子で本番も頑張りましょう！'
            : accuracy >= 60
            ? 'いい調子です！苦手な分野を重点的に復習しましょう。'
            : '基礎をしっかり固めましょう。分野別学習で苦手を克服！'}
        </Text>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
        <Text style={styles.shareButtonText}>結果をシェア</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.popToTop()}
        activeOpacity={0.8}
      >
        <Text style={styles.homeButtonText}>ホームに戻る</Text>
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
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '15',
    borderWidth: 4,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scoreDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  detailDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  messageCard: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
