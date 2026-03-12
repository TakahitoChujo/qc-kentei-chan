import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { QuestionCard } from '../components/QuestionCard';
import { Colors } from '../constants/colors';
import { formatTime } from '../utils/helpers';
import { EXAM_TIME_MINUTES } from '../constants/categories';

type RootStackParamList = {
  Result: { mode: string };
  Main: undefined;
};

export function ExamScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isPremium, quiz, startExam, answerQuestion, nextQuestion, finishExam, toggleBookmark, isBookmarked } = useStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_TIME_MINUTES * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isPremium) {
      navigation.replace('Main');
      return;
    }
    startExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTimeUp = useCallback(() => {
    Alert.alert('時間切れ', '制限時間に達しました。結果を確認しましょう。', [
      {
        text: '結果を見る',
        onPress: () => {
          finishExam();
          navigation.replace('Result', { mode: 'exam' });
        },
      },
    ]);
  }, [finishExam, navigation]);

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
      if (timerRef.current) clearInterval(timerRef.current);
      finishExam();
      navigation.replace('Result', { mode: 'exam' });
    }
  }, [nextQuestion, finishExam, navigation]);

  const handleQuit = useCallback(() => {
    Alert.alert('模擬試験を終了', '途中で終了しますか？解答済みの問題は記録されます。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '終了して結果を見る',
        onPress: () => {
          if (timerRef.current) clearInterval(timerRef.current);
          finishExam();
          navigation.replace('Result', { mode: 'exam' });
        },
      },
    ]);
  }, [finishExam, navigation]);

  if (!quiz || quiz.questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>模擬試験を準備できませんでした</Text>
      </View>
    );
  }

  const currentQuestion = quiz.questions[quiz.currentIndex];
  const isTimeWarning = remainingSeconds < 300;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit}>
          <Text style={styles.quitText}>途中終了</Text>
        </TouchableOpacity>
        <Text style={[styles.timer, isTimeWarning && styles.timerWarning]}>
          {formatTime(remainingSeconds)}
        </Text>
        <Text style={styles.progress}>
          {quiz.currentIndex + 1}/{quiz.questions.length}
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
    fontSize: 14,
    color: Colors.incorrect,
  },
  timer: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  timerWarning: {
    color: Colors.incorrect,
  },
  progress: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: Colors.border,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.premiumDark,
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
    backgroundColor: Colors.premiumDark,
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
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
