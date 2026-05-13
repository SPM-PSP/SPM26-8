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

// ==================== Todo 映射函数 ====================

/**
 * 前端 Todo → 后端 TodoTask
 * 注意：后端没有的字段（beginTime, endTime, category, isContinuous, summury）会被丢弃
 */
export function toBackendTodo(todo: Todo): BackendTodoTask {
  return {
    uuid: todo.id,
    title: todo.title,
    content: todo.desc,  // desc → content
    status: todo.completed ? 1 : 0,  // boolean → number
    priority: LEVEL_TO_PRIORITY[todo.level] || 1,  // 四象限 → 数字
    createdAt: todo.createdAt,
    planId: todo.planId,
    targetId: todo.targetId,
    userId: MOCK_USER_ID,
  };
}

/**
 * 后端 TodoTask → 前端 Todo
 * 注意：前端独有字段会被设置为默认值
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
    // 前端独有字段（后端没有，设置默认值）
    category: '',
    beginTime: undefined,
    endTime: undefined,
    isContinuous: false,
    summury: undefined,
  };
}

// ==================== Target 映射函数 ====================

/**
 * 前端 Target → 后端 Target
 * 注意：后端使用 progress，前端使用 completed + weight
 */
export function toBackendTarget(target: Target): BackendTarget {
  return {
    uuid: target.id,
    title: target.title,
    content: target.desc,  // desc → content
    progress: target.completed ? 100 : 0,  // 简化映射：完成=100，未完成=0
    createdAt: target.createdAt,
    userId: MOCK_USER_ID,
  };
}

/**
 * 后端 Target → 前端 Target
 */
export function fromBackendTarget(backendTarget: BackendTarget): Target {
  return {
    id: backendTarget.uuid,
    title: backendTarget.title,
    desc: backendTarget.content,  // content → desc
    completed: backendTarget.progress === 100,  // progress=100 视为已完成
    createdAt: backendTarget.createdAt,
    // 前端独有字段
    beginTime: '',
    endTime: '',
    weight: 3,  // 默认权重
  };
}

// ==================== Plan 映射函数 ====================

/**
 * 前端 Plan → 后端 Plan
 */
export function toBackendPlan(plan: Plan): BackendPlan {
  return {
    uuid: plan.id,
    title: plan.title,
    content: plan.desc,  // desc → content
    progress: plan.completed ? 100 : 0,
    targetId: plan.targetId,
    createdAt: plan.createdAt,
    userId: MOCK_USER_ID,
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
