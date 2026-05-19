// 前后端类型映射工具

import { Todo, Target, Plan, Note } from '../types';
import {
  BackendTodoTask,
  BackendTarget,
  BackendPlan,
  BackendNote,
} from '../types/backend';

// ==================== 常量配置 ====================

// 固定的模拟用户ID（后续可从登录状态获取）
export const MOCK_USER_ID = 'mock-user';

// ==================== 四象限优先级映射 ====================

const LEVEL_TO_PRIORITY: Record<Todo['level'], number> = {
  'urgent-important': 4,
  'urgent-not-important': 3,
  'not-urgent-important': 2,
  'not-urgent-not-important': 1,
};

const PRIORITY_TO_LEVEL: Record<number, Todo['level']> = {
  4: 'urgent-important',
  3: 'urgent-not-important',
  2: 'not-urgent-important',
  1: 'not-urgent-not-important',
};

// ==================== Todo 时间字段 ====================

/** datetime-local / ISO → 存库用 ISO8601 */
export function todoTimeForStorage(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** 库中 ISO → 表单 datetime-local */
export function todoTimeForInput(stored?: string): string | undefined {
  if (!stored?.trim()) return undefined;
  const d = new Date(stored);
  if (Number.isNaN(d.getTime())) {
    return stored.length >= 16 ? stored.slice(0, 16) : stored;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ==================== Todo 映射函数 ====================

export function toBackendTodo(todo: Todo): BackendTodoTask {
  return {
    uuid: todo.id,
    title: todo.title,
    content: todo.desc,
    status: todo.completed ? 1 : 0,
    priority: LEVEL_TO_PRIORITY[todo.level] || 1,
    createdAt: todo.createdAt,
    beginTime: todoTimeForStorage(todo.beginTime),
    endTime: todoTimeForStorage(todo.endTime),
    planId: todo.planId,
    targetId: todo.targetId,
    userId: MOCK_USER_ID,
  };
}

export function fromBackendTodo(task: BackendTodoTask): Todo {
  return {
    id: task.uuid,
    title: task.title,
    desc: task.content,
    completed: task.status === 1,
    level: PRIORITY_TO_LEVEL[task.priority] || 'not-urgent-important',
    createdAt: task.createdAt,
    planId: task.planId,
    targetId: task.targetId,
    beginTime: todoTimeForInput(task.beginTime),
    endTime: todoTimeForInput(task.endTime),
    category: '',
    isContinuous: false,
    summury: undefined,
  };
}

// ==================== Target 映射函数 ====================

export function toBackendTarget(target: Target): BackendTarget {
  return {
    uuid: target.id,
    title: target.title,
    content: target.desc,
    progress: target.completed ? 100 : 0,
    createdAt: target.createdAt,
    userId: MOCK_USER_ID,
  };
}

export function fromBackendTarget(backendTarget: BackendTarget): Target {
  return {
    id: backendTarget.uuid,
    title: backendTarget.title,
    desc: backendTarget.content,
    completed: backendTarget.progress === 100,
    createdAt: backendTarget.createdAt,
    beginTime: '',
    endTime: '',
    weight: 3,
  };
}

// ==================== Plan 映射函数 ====================

export function toBackendPlan(plan: Plan): BackendPlan {
  return {
    uuid: plan.id,
    title: plan.title,
    content: plan.desc,
    progress: plan.completed ? 100 : 0,
    targetId: plan.targetId,
    beginTime: plan.beginTime || undefined,
    endTime: plan.endTime || undefined,
    weight: plan.weight,
    isRepeat: plan.isRepeat ? 1 : 0,
    createdAt: plan.createdAt,
    userId: MOCK_USER_ID,
  };
}

export function fromBackendPlan(backendPlan: BackendPlan): Plan {
  return {
    id: backendPlan.uuid,
    title: backendPlan.title,
    desc: backendPlan.content,
    completed: backendPlan.progress === 100,
    targetId: backendPlan.targetId,
    beginTime: backendPlan.beginTime || '',
    endTime: backendPlan.endTime || '',
    weight: backendPlan.weight ?? 3,
    isRepeat: backendPlan.isRepeat === 1,
    createdAt: backendPlan.createdAt,
  };
}

// ==================== Note 映射函数 ====================

export function toBackendNote(note: Note): BackendNote {
  return {
    uuid: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    planId: note.planId,
    targetId: note.targetId,
    userId: MOCK_USER_ID,
  };
}

export function fromBackendNote(backendNote: BackendNote): Note {
  return {
    id: backendNote.uuid,
    title: backendNote.title,
    content: backendNote.content,
    createdAt: backendNote.createdAt,
    updatedAt: backendNote.createdAt,
    planId: backendNote.planId,
    targetId: backendNote.targetId,
  };
}
