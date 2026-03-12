import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../constants/categories';
import { Colors } from '../constants/colors';
import type { Question } from '../types';

type RootStackParamList = {
  Main: undefined;
  Quiz: { category?: string; mode?: string };
};

function BookmarkItem({
  question,
  onRemove,
}: {
  question: Question;
  onRemove: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.name === question.category);

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemIcon}>{cat?.icon ?? '📝'}</Text>
      <View style={styles.itemContent}>
        <Text style={styles.itemCategory}>{question.category}</Text>
        <Text style={styles.itemQuestion} numberOfLines={2}>
          {question.question}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.removeIcon}>★</Text>
      </TouchableOpacity>
    </View>
  );
}

export function BookmarkListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { getBookmarkedQuestions, toggleBookmark, getBookmarkCount } =
    useStore();

  const bookmarked = getBookmarkedQuestions();
  const count = getBookmarkCount();

  const handleRemove = (question: Question) => {
    Alert.alert(
      'ブックマーク解除',
      'この問題のブックマークを解除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '解除',
          style: 'destructive',
          onPress: () => toggleBookmark(question.id),
        },
      ],
    );
  };

  const handleStartReview = () => {
    if (count > 0) {
      navigation.navigate('Quiz', { mode: 'bookmark' });
    }
  };

  return (
    <View style={styles.container}>
      {bookmarked.length > 0 ? (
        <>
          <TouchableOpacity
            style={styles.reviewAllButton}
            onPress={handleStartReview}
            activeOpacity={0.8}
          >
            <Text style={styles.reviewAllIcon}>★</Text>
            <Text style={styles.reviewAllText}>
              {count}問をまとめて復習
            </Text>
          </TouchableOpacity>

          <FlatList
            data={bookmarked}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <BookmarkItem
                question={item}
                onRemove={() => handleRemove(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>☆</Text>
          <Text style={styles.emptyText}>
            ブックマークした問題はありません。{'\n'}
            問題画面で★をタップして追加しましょう！
          </Text>
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
  reviewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.premiumDark,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  reviewAllIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  reviewAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  itemQuestion: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 20,
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 24,
    color: Colors.premium,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    color: Colors.textLight,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
