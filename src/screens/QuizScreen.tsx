import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { QuestionCard } from '../components/QuestionCard';
import { Colors } from '../constants/colors';
import { Category } from '../types';

type RootStackParamList = {
  Main: undefined;
  Quiz: { category?: string; mode?: string };
  Result: { mode: string };
};

export function QuizScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Quiz'>>();
  const category = route.params?.category as Category | undefined;
  const routeMode = route.params?.mode;

  const { quiz, startQuiz, answerQuestion, nextQuestion, finishQuiz, toggleBookmark, isBookmarked } = useStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (routeMode === 'review') {
      startQuiz('review');
    } else if (routeMode === 'bookmark') {
      startQuiz('bookmark');
    } else {
      startQuiz(category ? 'category' : 'random', category);
    }
  }, []);

  const handleSelect = useCallback(
    (index: number) => {
      if (selectedIndex !== null) return;
      setSelectedIndex(index);
      answerQuestion(index);
    },
    [selectedIndex, answerQuestion]
  );

  const handleNext = useCallback(() => {
    const hasNext = nextQuestion();
    if (hasNext) {
      setSelectedIndex(null);
    } else {
      navigation.replace('Result', { mode: routeMode === 'review' ? 'review' : routeMode === 'bookmark' ? 'bookmark' : 'quiz' });
    }
  }, [nextQuestion, navigation]);

  const handleQuit = useCallback(() => {
    Alert.alert('学習を終了', '現在の進捗は保存されています。終了しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '終了する',
        onPress: () => {
          finishQuiz();
          navigation.goBack();
        },
      },
    ]);
  }, [finishQuiz, navigation]);

  if (!quiz || quiz.questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {routeMode === 'bookmark'
            ? 'ブックマークした問題がありません。\n問題の★マークをタップしてブックマークしましょう！'
            : routeMode === 'review'
            ? '復習する問題がありません。\nまずは問題を解いてみましょう！'
            : 'この分野の問題がありません'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = quiz.questions[quiz.currentIndex];
  const progress = `${quiz.currentIndex + 1} / ${quiz.questions.length}`;
  const correctCount = quiz.answers.filter((a) => a.isCorrect).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit}>
          <Text style={styles.quitText}>終了</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>{progress}</Text>
        <Text style={styles.score}>
          {correctCount}/{quiz.answers.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${((quiz.currentIndex + 1) / quiz.questions.length) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Question */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <QuestionCard
          question={currentQuestion}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          isBookmarked={isBookmarked(currentQuestion.id)}
          onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
        />
      </ScrollView>

      {/* Next Button */}
      {selectedIndex !== null && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>
              {quiz.currentIndex + 1 >= quiz.questions.length ? '結果を見る' : '次の問題'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  quitText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  progress: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  score: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: Colors.border,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.background,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
