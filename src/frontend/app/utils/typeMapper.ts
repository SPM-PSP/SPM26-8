// 前后端类型映射工具

import { Todo, Target, Plan, Note } from '../types';
import { defaultTargetDateRange, parseDateSafe } from './formatDate';
import {
  BackendTodoTask,
  BackendTarget,
  BackendPlan,
  BackendNote,
} from '../types/backend';

// ==================== 常量配置 ====================

/** @deprecated 请使用 useAuth().userId 或 DEFAULT_USER_ID */
export const MOCK_USER_ID = 'wch13819780501';

export { DEFAULT_USER_ID } from './authStorage';

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
  const v = value.trim();
  // 仅日期：截止日当天 23:59:59（本地），便于 24h/2h 邮件提醒计算
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(`${v}T23:59:59`);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** 库中 ISO → 表单 datetime-local */
export function todoTimeForInput(stored?: string): string | undefined {
  if (!stored?.trim()) return undefined;
  const d = new Date(stored);
  if (Number.isNaN(d.getTime())) {
    // 已是 yyyy-MM-ddTHH:mm 格式则原样返回
    return stored.length >= 16 ? stored.slice(0, 16) : stored;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ==================== Todo 映射函数 ====================

/**
 * 前端 Todo → 后端 TodoTask
 * 注意：category、isContinuous、summury 仍仅存于本地
 */
export function toBackendTodo(todo: Todo, userId: string): BackendTodoTask {
  return {
    uuid: todo.id,
    title: todo.title,
    content: todo.desc ?? '',  // desc → content
    status: todo.completed ? 1 : 0,  // boolean → number
    priority: LEVEL_TO_PRIORITY[todo.level] || 1,  // 四象限 → 数字
    createdAt: todo.createdAt,
    beginTime: todoTimeForStorage(todo.beginTime),
    endTime: todoTimeForStorage(todo.endTime),
    planId: todo.planId,
    targetId: todo.targetId,
    userId,
  };
}

/**
 * 后端 TodoTask → 前端 Todo
 */
export function fromBackendTodo(task: BackendTodoTask): Todo {
  return {
    id: task.uuid,
    title: task.title,
    desc: task.content,  // content → desc
    completed: task.status === 1,  // number → boolean
    level: PRIORITY_TO_LEVEL[task.priority] || 'not-urgent-important',  // 数字 → 四象限
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

/**
 * 前端 Target → 后端 Target
 * 注意：后端使用 progress，前端使用 completed + weight
 */
export function toBackendTarget(target: Target, userId: string): BackendTarget {
  return {
    uuid: target.id,
    title: target.title,
    content: target.desc,  // desc → content
    progress: target.completed ? 100 : 0,  // 简化映射：完成=100，未完成=0
    createdAt: target.createdAt,
    userId,
  };
}

/**
 * 后端 Target → 前端 Target
 */
export function fromBackendTarget(backendTarget: BackendTarget): Target {
  const { beginTime, endTime } = defaultTargetDateRange(backendTarget.createdAt);
  return {
    id: backendTarget.uuid,
    title: backendTarget.title,
    desc: backendTarget.content,  // content → desc
    completed: backendTarget.progress === 100,  // progress=100 视为已完成
    createdAt: backendTarget.createdAt,
    beginTime,
    endTime,
    weight: 3,  // 默认权重
  };
}

export function mergeTargetFromBackend(backendTarget: BackendTarget, local?: Target): Target {
  const mapped = fromBackendTarget(backendTarget);
  if (!local) return mapped;
  return {
    ...mapped,
    beginTime: parseDateSafe(local.beginTime) ? local.beginTime : mapped.beginTime,
    endTime: parseDateSafe(local.endTime) ? local.endTime : mapped.endTime,
    weight: local.weight ?? mapped.weight,
    desc: local.desc?.trim() ? local.desc : mapped.desc,
  };
}

// ==================== Plan 映射函数 ====================

/**
 * 前端 Plan → 后端 Plan
 */
export function toBackendPlan(plan: Plan, userId: string): BackendPlan {
  return {
    uuid: plan.id,
    title: plan.title,
    content: plan.desc,  // desc → content
    progress: plan.completed ? 100 : 0,
    targetId: plan.targetId,
    createdAt: plan.createdAt,
    userId,
  };
}

/**
 * 后端 Plan → 前端 Plan
 */
export function fromBackendPlan(backendPlan: BackendPlan): Plan {
  return {
    id: backendPlan.uuid,
    title: backendPlan.title,
    desc: backendPlan.content,  // content → desc
    completed: backendPlan.progress === 100,
    targetId: backendPlan.targetId,
    createdAt: backendPlan.createdAt,
    // 前端独有字段
    beginTime: '',
    endTime: '',
    weight: 3,
    isRepeat: false,
  };
}

// ==================== Note 映射函数 ====================

/**
 * 前端 Note → 后端 Note
 */
export function toBackendNote(note: Note, userId: string): BackendNote {
  return {
    uuid: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    planId: note.planId,
    targetId: note.targetId,
    userId,
  };
}

/**
 * 后端 Note → 前端 Note
 * 注意：后端没有 updatedAt，使用 createdAt 代替
 */
export function fromBackendNote(backendNote: BackendNote): Note {
  return {
    id: backendNote.uuid,
    title: backendNote.title,
    content: backendNote.content,
    createdAt: backendNote.createdAt,
    updatedAt: backendNote.createdAt,  // 后端没有此字段，暂用 createdAt
    planId: backendNote.planId,
    targetId: backendNote.targetId,
  };
}
