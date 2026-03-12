import * as SQLite from 'expo-sqlite';
import { AnswerRecord, ExamResult, UserSettings } from '../types';

let db: SQLite.SQLiteDatabase;

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('qc-kentei-chan.db');
  }
  return db;
}

export function initDB(): void {
  const database = getDB();

  database.execSync(`
    CREATE TABLE IF NOT EXISTS answer_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      answered_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exam_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      time_seconds INTEGER NOT NULL,
      completed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      is_premium INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
  `);

  const settings = database.getFirstSync<{ id: number }>('SELECT id FROM user_settings WHERE id = 1');
  if (!settings) {
    database.runSync('INSERT INTO user_settings (id, is_premium) VALUES (1, 0)');
  }
}

// Answer Records
export function saveAnswerRecord(questionId: number, isCorrect: boolean): void {
  const database = getDB();
  database.runSync(
    'INSERT INTO answer_records (question_id, is_correct, answered_at) VALUES (?, ?, ?)',
    questionId,
    isCorrect ? 1 : 0,
    new Date().toISOString()
  );
}

export function getAllAnswerRecords(): AnswerRecord[] {
  const database = getDB();
  const rows = database.getAllSync<{
    id: number;
    question_id: number;
    is_correct: number;
    answered_at: string;
  }>('SELECT * FROM answer_records ORDER BY answered_at DESC');

  return rows.map((row) => ({
    id: row.id,
    questionId: row.question_id,
    isCorrect: row.is_correct === 1,
    answeredAt: row.answered_at,
  }));
}

export function clearAnswerRecords(): void {
  const database = getDB();
  database.runSync('DELETE FROM answer_records');
}

// Exam Results
export function saveExamResult(score: number, totalQuestions: number, timeSeconds: number): ExamResult {
  const database = getDB();
  const completedAt = new Date().toISOString();
  const result = database.runSync(
    'INSERT INTO exam_results (score, total_questions, time_seconds, completed_at) VALUES (?, ?, ?, ?)',
    score,
    totalQuestions,
    timeSeconds,
    completedAt
  );

  return {
    id: Number(result.lastInsertRowId),
    score,
    totalQuestions,
    timeSeconds,
    completedAt,
  };
}

export function getAllExamResults(): ExamResult[] {
  const database = getDB();
  const rows = database.getAllSync<{
    id: number;
    score: number;
    total_questions: number;
    time_seconds: number;
    completed_at: string;
  }>('SELECT * FROM exam_results ORDER BY completed_at DESC');

  return rows.map((row) => ({
    id: row.id,
    score: row.score,
    totalQuestions: row.total_questions,
    timeSeconds: row.time_seconds,
    completedAt: row.completed_at,
  }));
}

export function clearExamResults(): void {
  const database = getDB();
  database.runSync('DELETE FROM exam_results');
}

// User Settings
export function getUserSettings(): UserSettings {
  const database = getDB();
  const row = database.getFirstSync<{ is_premium: number }>('SELECT * FROM user_settings WHERE id = 1');

  return {
    isPremium: row ? row.is_premium === 1 : false,
  };
}

export function setPremiumStatus(isPremium: boolean): void {
  const database = getDB();
  database.runSync('UPDATE user_settings SET is_premium = ? WHERE id = 1', isPremium ? 1 : 0);
}

// Bookmarks
export function addBookmark(questionId: number): void {
  const database = getDB();
  database.runSync(
    'INSERT OR IGNORE INTO bookmarks (question_id, created_at) VALUES (?, ?)',
    questionId,
    new Date().toISOString()
  );
}

export function removeBookmark(questionId: number): void {
  const database = getDB();
  database.runSync('DELETE FROM bookmarks WHERE question_id = ?', questionId);
}

export function getAllBookmarkIds(): number[] {
  const database = getDB();
  const rows = database.getAllSync<{ question_id: number }>(
    'SELECT question_id FROM bookmarks ORDER BY created_at DESC'
  );
  return rows.map((row) => row.question_id);
}

export function clearBookmarks(): void {
  const database = getDB();
  database.runSync('DELETE FROM bookmarks');
}
