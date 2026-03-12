export type Category =
  | 'QC的ものの見方・考え方'
  | 'QC七つ道具'
  | '新QC七つ道具'
  | '統計的方法の基礎'
  | '管理図'
  | '工程能力指数'
  | '抜取検査'
  | '実験計画法'
  | '相関分析・回帰分析';

export interface Question {
  id: number;
  category: Category;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  isFree: boolean;
}

export interface AnswerRecord {
  id: number;
  questionId: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface ExamResult {
  id: number;
  score: number;
  totalQuestions: number;
  timeSeconds: number;
  completedAt: string;
}

export interface UserSettings {
  isPremium: boolean;
}

export interface CategoryInfo {
  name: Category;
  icon: string;
  description: string;
}

export type QuizMode = 'random' | 'category' | 'exam' | 'review' | 'bookmark';
