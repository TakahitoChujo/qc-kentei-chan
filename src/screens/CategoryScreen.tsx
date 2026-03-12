import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../constants/categories';
import { Colors } from '../constants/colors';
import { getAccuracyRate } from '../utils/helpers';

type RootStackParamList = {
  Quiz: { category: string };
};

export function CategoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { getCategoryStats: getStats, isPremium } = useStore();
  const categoryStats = getStats();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>分野別学習</Text>
      <Text style={styles.subtitle}>苦手な分野を集中的に学習しましょう</Text>

      {CATEGORIES.map((cat) => {
        const stats = categoryStats[cat.name];
        const rate = getAccuracyRate(stats.correct, stats.answered);
        const hasAnswered = stats.answered > 0;

        return (
          <TouchableOpacity
            key={cat.name}
            style={styles.card}
            onPress={() => navigation.navigate('Quiz', { category: cat.name })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{cat.icon}</Text>
              <View style={styles.cardTitleArea}>
                <Text style={styles.cardTitle}>{cat.name}</Text>
                <Text style={styles.cardDescription}>{cat.description}</Text>
              </View>
            </View>

            <View style={styles.cardStats}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {hasAnswered ? `${rate}%` : '--'}
                </Text>
                <Text style={styles.statLabel}>正答率</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.answered}</Text>
                <Text style={styles.statLabel}>解答数</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>
                  問題数{!isPremium && ' (無料)'}
                </Text>
              </View>
            </View>

            {/* Accuracy Bar */}
            {hasAnswered && (
              <View style={styles.accuracyBar}>
                <View
                  style={[
                    styles.accuracyFill,
                    {
                      width: `${rate}%`,
                      backgroundColor:
                        rate >= 80
                          ? Colors.correct
                          : rate >= 60
                          ? Colors.premium
                          : Colors.incorrect,
                    },
                  ]}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}

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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 28,
    marginTop: 2,
  },
  cardTitleArea: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.textLight,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  accuracyBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 12,
  },
  accuracyFill: {
    height: '100%',
    borderRadius: 2,
  },
});
