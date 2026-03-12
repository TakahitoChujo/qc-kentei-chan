import { AnswerRecord, Category, Question } from '../types';
import { CATEGORIES } from '../constants/categories';

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCategoryStats(
  records: AnswerRecord[],
  questions: Question[]
): Record<Category, { answered: number; correct: number; total: number }> {
  const stats = {} as Record<Category, { answered: number; correct: number; total: number }>;

  for (const cat of CATEGORIES) {
    const categoryQuestions = questions.filter((q) => q.category === cat.name);
    const categoryRecords = records.filter((r) =>
      categoryQuestions.some((q) => q.id === r.questionId)
    );
    const correctRecords = categoryRecords.filter((r) => r.isCorrect);

    stats[cat.name] = {
      answered: categoryRecords.length,
      correct: correctRecords.length,
      total: categoryQuestions.length,
    };
  }

  return stats;
}

export function getAccuracyRate(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getStudyDaysCount(records: AnswerRecord[]): number {
  const uniqueDays = new Set(
    records.map((r) => r.answeredAt.split('T')[0])
  );
  return uniqueDays.size;
}
