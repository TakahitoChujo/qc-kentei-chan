import { CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    name: 'QC的ものの見方・考え方',
    icon: '💡',
    description: '品質管理の基本的な考え方・原則',
  },
  {
    name: 'QC七つ道具',
    icon: '📊',
    description: 'パレート図、特性要因図、ヒストグラムなど',
  },
  {
    name: '新QC七つ道具',
    icon: '🗂',
    description: '親和図法、連関図法、系統図法など',
  },
  {
    name: '統計的方法の基礎',
    icon: '📐',
    description: '平均、標準偏差、正規分布、検定・推定',
  },
  {
    name: '管理図',
    icon: '📈',
    description: 'X-R管理図、p管理図、管理限界線',
  },
  {
    name: '工程能力指数',
    icon: '🏭',
    description: 'Cp、Cpk、工程能力の評価',
  },
  {
    name: '抜取検査',
    icon: '🔍',
    description: 'OC曲線、AQL、抜取検査の種類',
  },
  {
    name: '実験計画法',
    icon: '🧪',
    description: '一元配置実験、直交表、要因効果',
  },
  {
    name: '相関分析・回帰分析',
    icon: '📉',
    description: '相関係数、散布図、回帰直線',
  },
];

export const FREE_QUESTIONS_PER_CATEGORY = 6;
export const TOTAL_QUESTIONS_PER_CATEGORY = 28;
export const EXAM_QUESTION_COUNT = 50;
export const EXAM_TIME_MINUTES = 90;
