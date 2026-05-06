// 数据类型定义

export interface Target {
  id: string;
  title: string;
  desc: string;
  beginTime: string;
  endTime: string;
  completed: boolean;
  weight: number; // 1-5
  createdAt: string;
}

export interface Plan {
  id: string;
  title: string;
  desc: string;
  targetId?: string;
  beginTime: string;
  endTime: string;
  completed: boolean;
  weight: number; // 1-5
  isRepeat: boolean;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  desc: string;
  level: 'urgent-important' | 'urgent-not-important' | 'not-urgent-important' | 'not-urgent-not-important';
  category: string;
  completed: boolean;
  beginTime?: string;
  endTime?: string;
  planId?: string;
  targetId?: string;
  isContinuous: boolean;
  summury?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  targetId?: string;
  planId?: string;
  createdAt: string;
  updatedAt: string;
}

export type FilterStatus = 'all' | 'active' | 'completed' | 'urgent';
