import { Target, Plan, Todo, Note } from '../types';
import { getItem, setItem } from './storage';

export const sampleTargets: Target[] = [
  {
    id: '1',
    title: '提升专业技能',
    desc: '通过系统学习和实践，提升核心技能水平，为职业发展打下基础',
    beginTime: '2026-01-01',
    endTime: '2026-12-31',
    completed: false,
    weight: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: '健康生活方式',
    desc: '培养健康的生活习惯，保持身心健康',
    beginTime: '2026-01-01',
    endTime: '2026-06-30',
    completed: false,
    weight: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const samplePlans: Plan[] = [
  {
    id: '1',
    title: '学习 React 高级特性',
    desc: '深入学习 React Hooks、性能优化等高级特性',
    targetId: '1',
    beginTime: '2026-04-01',
    endTime: '2026-06-30',
    completed: false,
    weight: 5,
    isRepeat: false,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: '每日运动计划',
    desc: '每天至少运动30分钟，保持身体健康',
    targetId: '2',
    beginTime: '2026-04-01',
    endTime: '2026-06-30',
    completed: false,
    weight: 4,
    isRepeat: true,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
];

export const sampleTodos: Todo[] = [
  {
    id: '1',
    title: '完成 React Hooks 章节学习',
    desc: '学习 useState、useEffect、useContext 等核心 Hooks',
    level: 'urgent-important',
    category: '学习',
    completed: false,
    beginTime: '2026-04-08T09:00:00.000Z',
    endTime: '2026-04-08T18:00:00.000Z',
    planId: '1',
    targetId: '1',
    isContinuous: false,
    createdAt: '2026-04-08T00:00:00.000Z',
  },
  {
    id: '2',
    title: '晨跑 5 公里',
    desc: '早上在公园跑步，保持心率在有氧区间',
    level: 'not-urgent-important',
    category: '健康',
    completed: true,
    beginTime: '2026-04-08T06:00:00.000Z',
    endTime: '2026-04-08T07:00:00.000Z',
    planId: '2',
    targetId: '2',
    isContinuous: true,
    createdAt: '2026-04-08T00:00:00.000Z',
  },
  {
    id: '3',
    title: '阅读技术文章',
    desc: '阅读 3 篇关于性能优化的文章',
    level: 'not-urgent-important',
    category: '学习',
    completed: false,
    endTime: '2026-04-09T22:00:00.000Z',
    planId: '1',
    targetId: '1',
    isContinuous: false,
    createdAt: '2026-04-08T00:00:00.000Z',
  },
  {
    id: '4',
    title: '整理学习笔记',
    desc: '整理这周的学习笔记，归类知识点',
    level: 'urgent-not-important',
    category: '学习',
    completed: false,
    endTime: '2026-04-08T20:00:00.000Z',
    isContinuous: false,
    createdAt: '2026-04-08T00:00:00.000Z',
  },
];

export const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'React Hooks 学习笔记',
    content: `# React Hooks 核心概念

## useState
- 用于在函数组件中添加状态
- 返回当前状态值和更新函数
- 可以接受初始值或初始化函数

## useEffect
- 处理副作用操作
- 可以模拟生命周期方法
- 支持依赖项数组来控制执行时机

## useContext
- 访问 React Context
- 避免 prop drilling
- 简化组件间状态共享`,
    targetId: '1',
    planId: '1',
    createdAt: '2026-04-07T00:00:00.000Z',
    updatedAt: '2026-04-08T10:00:00.000Z',
  },
  {
    id: '2',
    title: '健康生活要点',
    content: `# 健康生活习惯

1. **规律运动**
   - 每天至少30分钟中等强度运动
   - 结合有氧和力量训练
   - 注意运动前后拉伸

2. **均衡饮食**
   - 多吃蔬菜水果
   - 控制糖分和盐分摄入
   - 保持水分充足

3. **充足睡眠**
   - 每天7-8小时睡眠
   - 保持规律作息
   - 睡前避免电子设备`,
    targetId: '2',
    createdAt: '2026-04-05T00:00:00.000Z',
    updatedAt: '2026-04-05T00:00:00.000Z',
  },
];

export function initializeSampleData() {
  const hasTargets = getItem('targets');
  const hasPlans = getItem('plans');
  const hasTodos = getItem('todos');
  const hasNotes = getItem('notes');

  if (!hasTargets && !hasPlans && !hasTodos && !hasNotes) {
    setItem('targets', sampleTargets);
    setItem('plans', samplePlans);
    setItem('todos', sampleTodos);
    setItem('notes', sampleNotes);
    return true;
  }
  return false;
}
