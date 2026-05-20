// 后端数据类型定义（与 Java 实体类对应）

// ==================== 统一返回格式 ====================
export interface Result<T = any> {
  code: number;  // 200 成功, 500 失败
  msg: string;
  data: T;
}

// ==================== 后端实体类型 ====================

// User.java → 表 user
export interface BackendUser {
  uuid: string;
  openid: string;
  nickname: string;
  avatarUrl: string;
  isReminderOn: number;  // 1 开启, 0 关闭
  defaultAdvanceMinutes: number;
  email?: string;
  remindBefore24h?: number;
  remindBefore2h?: number;
}

export interface ReminderSettingsDTO {
  openid: string;
  email?: string;
  isReminderOn?: number;
  remindBefore24h?: number;
  remindBefore2h?: number;
}

// TodoTask.java → 表 todo_task
export interface BackendTodoTask {
  uuid: string;
  title: string;
  content: string;
  status: number;  // 0 未完成, 1 已完成
  priority: number;  // 1-4 对应四象限
  createdAt: string;
  beginTime?: string;
  endTime?: string;
  planId?: string;
  targetId?: string;
  userId: string;
}

// Target.java → 表 target
export interface BackendTarget {
  uuid: string;
  title: string;
  content: string;
  progress: number;  // 0-100
  createdAt: string;
  userId: string;
}

// Plan.java → 表 plan
export interface BackendPlan {
  uuid: string;
  title: string;
  content: string;
  progress: number;  // 0-100
  targetId?: string;
  createdAt: string;
  userId: string;
}

// Note.java → 表 note
export interface BackendNote {
  uuid: string;
  title: string;
  content: string;
  createdAt: string;
  planId?: string;
  targetId?: string;
  userId: string;
}

// ==================== DTO 类型 ====================

export interface LoginDTO {
  code?: string;
  mockId: string;
  nickname?: string;
}
