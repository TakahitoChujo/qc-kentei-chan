import { create } from 'zustand';
import {
  AnswerRecord,
  Category,
  ExamResult,
  Question,
  QuizMode,
} from '../types';
import { questions as allQuestions } from '../data/questions';
import {
  initDB,
  getAllAnswerRecords,
  saveAnswerRecord,
  getAllExamResults,
  saveExamResult as dbSaveExamResult,
  getUserSettings,
  setPremiumStatus,
  clearAnswerRecords,
  clearExamResults,
  addBookmark,
  removeBookmark,
  getAllBookmarkIds,
  clearBookmarks,
} from '../database/db';
import { getCategoryStats, getAccuracyRate, shuffleArray } from '../utils/helpers';
import {
  initRevenueCat,
  checkPremiumStatus as checkPremiumStatusRC,
  getOffering,
  purchasePremium as purchasePremiumRC,
  restorePurchases as restorePurchasesRC,
} from '../services/revenueCat';

interface QuizState {
  mode: QuizMode;
  questions: Question[];
  currentIndex: number;
  answers: { questionId: number; selectedIndex: number; isCorrect: boolean }[];
  startTime: number;
}

interface StoreState {
  // Data
  answerRecords: AnswerRecord[];
  examResults: ExamResult[];
  isPremium: boolean;
  isLoaded: boolean;
  bookmarkedIds: Set<number>;
  isPurchasing: boolean;

  // Quiz session
  quiz: QuizState | null;

  // Actions
  loadAll: () => void;
  startQuiz: (mode: QuizMode, category?: Category) => void;
  answerQuestion: (selectedIndex: number) => void;
  nextQuestion: () => boolean;
  finishQuiz: () => void;
  startExam: () => void;
  finishExam: () => ExamResult | null;
  purchasePremiumAction: () => Promise<boolean>;
  restorePurchase: () => Promise<boolean>;
  resetAllData: () => void;
  toggleBookmark: (questionId: number) => void;

  // Selectors
  getAvailableQuestions: (category?: Category) => Question[];
  getWrongQuestions: () => Question[];
  getBookmarkedQuestions: () => Question[];
  getBookmarkCount: () => number;
  isBookmarked: (questionId: number) => boolean;
  getCategoryStats: () => Record<Category, { answered: number; correct: number; total: number }>;
  getOverallAccuracy: () => number;
  getTotalAnswered: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  answerRecords: [],
  examResults: [],
  isPremium: false,
  isLoaded: false,
  bookmarkedIds: new Set<number>(),
  isPurchasing: false,
  quiz: null,

  loadAll: () => {
    initDB();
    const records = getAllAnswerRecords();
    const results = getAllExamResults();
    const settings = getUserSettings();
    const bookmarkIds = getAllBookmarkIds();
    set({
      answerRecords: records,
      examResults: results,
      isPremium: settings.isPremium,
      bookmarkedIds: new Set(bookmarkIds),
      isLoaded: true,
    });

    // RevenueCat非同期初期化＆premium状態同期
    initRevenueCat()
      .then(() => checkPremiumStatusRC())
      .then((rcPremium) => {
        if (rcPremium !== settings.isPremium) {
          setPremiumStatus(rcPremium);
          set({ isPremium: rcPremium });
        }
      })
      .catch(console.error);
  },

  getAvailableQuestions: (category?: Category) => {
    const { isPremium } = get();
    let filtered = allQuestions;
    if (category) {
      filtered = filtered.filter((q) => q.category === category);
    }
    if (!isPremium) {
      filtered = filtered.filter((q) => q.isFree);
    }
    return filtered;
  },

  getWrongQuestions: () => {
    const { answerRecords, isPremium } = get();
    // 各問題の直近の回答を取得し、不正解だったものを抽出
    const latestByQuestion = new Map<number, boolean>();
    // answerRecords は新しい順なので最初に見つかったものが直近
    for (const record of answerRecords) {
      if (!latestByQuestion.has(record.questionId)) {
        latestByQuestion.set(record.questionId, record.isCorrect);
      }
    }
    const wrongIds = new Set<number>();
    for (const [qId, isCorrect] of latestByQuestion) {
      if (!isCorrect) wrongIds.add(qId);
    }
    let available = allQuestions.filter((q) => wrongIds.has(q.id));
    if (!isPremium) {
      available = available.filter((q) => q.isFree);
    }
    return available;
  },

  startQuiz: (mode: QuizMode, category?: Category) => {
    let questions: Question[];
    if (mode === 'review') {
      questions = get().getWrongQuestions();
    } else if (mode === 'bookmark') {
      questions = get().getBookmarkedQuestions();
    } else {
      questions = get().getAvailableQuestions(category);
    }
    const shuffled = shuffleArray(questions);
    set({
      quiz: {
        mode,
        questions: shuffled,
        currentIndex: 0,
        answers: [],
        startTime: Date.now(),
      },
    });
  },

  answerQuestion: (selectedIndex: number) => {
    const { quiz } = get();
    if (!quiz || quiz.currentIndex >= quiz.questions.length) return;

    const question = quiz.questions[quiz.currentIndex];
    const isCorrect = selectedIndex === question.correctIndex;

    saveAnswerRecord(question.id, isCorrect);

    const newRecord: AnswerRecord = {
      id: Date.now(),
      questionId: question.id,
      isCorrect,
      answeredAt: new Date().toISOString(),
    };

    set((state) => ({
      answerRecords: [newRecord, ...state.answerRecords],
      quiz: state.quiz
        ? {
            ...state.quiz,
            answers: [
              ...state.quiz.answers,
              { questionId: question.id, selectedIndex, isCorrect },
            ],
          }
        : null,
    }));
  },

  nextQuestion: (): boolean => {
    const { quiz } = get();
    if (!quiz) return false;
    const nextIndex = quiz.currentIndex + 1;
    if (nextIndex >= quiz.questions.length) return false;
    set({
      quiz: { ...quiz, currentIndex: nextIndex },
    });
    return true;
  },

  finishQuiz: () => {
    set({ quiz: null });
  },

  startExam: () => {
    const { isPremium } = get();
    if (!isPremium) return;

    const shuffled = shuffleArray([...allQuestions]);
    const examQuestions = shuffled.slice(0, 50);
    set({
      quiz: {
        mode: 'exam',
        questions: examQuestions,
        currentIndex: 0,
        answers: [],
        startTime: Date.now(),
      },
    });
  },

  finishExam: (): ExamResult | null => {
    const { quiz } = get();
    if (!quiz || quiz.mode !== 'exam') return null;

    const score = quiz.answers.filter((a) => a.isCorrect).length;
    const timeSeconds = Math.floor((Date.now() - quiz.startTime) / 1000);
    const result = dbSaveExamResult(score, quiz.questions.length, timeSeconds);

    set((state) => ({
      examResults: [result, ...state.examResults],
      quiz: null,
    }));

    return result;
  },

  purchasePremiumAction: async (): Promise<boolean> => {
    set({ isPurchasing: true });
    try {
      const offering = await getOffering();
      if (!offering || !offering.availablePackages.length) {
        throw new Error('利用可能なプランが見つかりません。');
      }
      const pkg = offering.availablePackages[0];
      const success = await purchasePremiumRC(pkg);
      if (success) {
        setPremiumStatus(true);
        set({ isPremium: true });
      }
      return success;
    } finally {
      set({ isPurchasing: false });
    }
  },

  restorePurchase: async (): Promise<boolean> => {
    set({ isPurchasing: true });
    try {
      const isPremium = await restorePurchasesRC();
      if (isPremium) {
        setPremiumStatus(true);
        set({ isPremium: true });
      }
      return isPremium;
    } finally {
      set({ isPurchasing: false });
    }
  },

  resetAllData: () => {
    clearAnswerRecords();
    clearExamResults();
    clearBookmarks();
    set({ answerRecords: [], examResults: [], bookmarkedIds: new Set() });
  },

  toggleBookmark: (questionId: number) => {
    const { bookmarkedIds } = get();
    const newSet = new Set(bookmarkedIds);
    if (newSet.has(questionId)) {
      newSet.delete(questionId);
      removeBookmark(questionId);
    } else {
      newSet.add(questionId);
      addBookmark(questionId);
    }
    set({ bookmarkedIds: newSet });
  },

  getBookmarkedQuestions: () => {
    const { bookmarkedIds, isPremium } = get();
    let available = allQuestions.filter((q) => bookmarkedIds.has(q.id));
    if (!isPremium) {
      available = available.filter((q) => q.isFree);
    }
    return available;
  },

  getBookmarkCount: () => {
    return get().getBookmarkedQuestions().length;
  },

  isBookmarked: (questionId: number) => {
    return get().bookmarkedIds.has(questionId);
  },

  getCategoryStats: () => {
    const { answerRecords, isPremium } = get();
    const available = isPremium ? allQuestions : allQuestions.filter((q) => q.isFree);
    return getCategoryStats(answerRecords, available);
  },

  getOverallAccuracy: () => {
    const { answerRecords } = get();
    const correct = answerRecords.filter((r) => r.isCorrect).length;
    return getAccuracyRate(correct, answerRecords.length);
  },

  getTotalAnswered: () => {
    return get().answerRecords.length;
  },
}));
