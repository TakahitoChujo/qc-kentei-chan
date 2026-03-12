import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Question } from '../types';
import { Colors } from '../constants/colors';

interface Props {
  question: Question;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function QuestionCard({ question, selectedIndex, onSelect, isBookmarked, onToggleBookmark }: Props) {
  const answered = selectedIndex !== null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{question.category}</Text>
        </View>
        {onToggleBookmark && (
          <TouchableOpacity onPress={onToggleBookmark} style={styles.bookmarkButton}>
            <Text style={styles.bookmarkIcon}>{isBookmarked ? '★' : '☆'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.questionText}>{question.question}</Text>

      <View style={styles.choicesContainer}>
        {question.choices.map((choice, index) => {
          let buttonStyle = styles.choiceButton;
          let textStyle = styles.choiceText;

          if (answered) {
            if (index === question.correctIndex) {
              buttonStyle = { ...styles.choiceButton, ...styles.correctChoice };
              textStyle = { ...styles.choiceText, ...styles.correctText };
            } else if (index === selectedIndex) {
              buttonStyle = { ...styles.choiceButton, ...styles.incorrectChoice };
              textStyle = { ...styles.choiceText, ...styles.incorrectText };
            } else {
              buttonStyle = { ...styles.choiceButton, ...styles.disabledChoice };
            }
          }

          return (
            <TouchableOpacity
              key={index}
              style={buttonStyle}
              onPress={() => !answered && onSelect(index)}
              disabled={answered}
              activeOpacity={0.7}
            >
              <Text style={styles.choiceLabel}>
                {String.fromCharCode(65 + index)}.
              </Text>
              <Text style={textStyle}>{choice}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>
            {selectedIndex === question.correctIndex ? '正解!' : '不正解'}
          </Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryLight + '30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookmarkButton: {
    padding: 8,
  },
  bookmarkIcon: {
    fontSize: 24,
    color: Colors.premium,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 24,
  },
  choicesContainer: {
    gap: 10,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  choiceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 12,
    width: 24,
  },
  choiceText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  correctChoice: {
    backgroundColor: Colors.correctLight,
    borderColor: Colors.correct,
  },
  correctText: {
    color: Colors.correct,
    fontWeight: '600',
  },
  incorrectChoice: {
    backgroundColor: Colors.incorrectLight,
    borderColor: Colors.incorrect,
  },
  incorrectText: {
    color: Colors.incorrect,
    fontWeight: '600',
  },
  disabledChoice: {
    opacity: 0.5,
  },
  explanationContainer: {
    marginTop: 20,
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors.primary,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
