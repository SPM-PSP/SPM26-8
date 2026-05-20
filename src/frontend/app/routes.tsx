import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { TodoList } from './pages/TodoList';
import { AddTodo } from './pages/AddTodo';
import { TargetList } from './pages/TargetList';
import { AddTarget } from './pages/AddTarget';
import { TargetDetail } from './pages/TargetDetail';
import { PlanList } from './pages/PlanList';
import { AddPlan } from './pages/AddPlan';
import { PlanDetail } from './pages/PlanDetail';
import { NoteList } from './pages/NoteList';
import { AddNote } from './pages/AddNote';
import { Calendar } from './pages/Calendar';
import { DayView } from './pages/DayView';
import { Statistics } from './pages/Statistics';
import { Me } from './pages/Me';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      // 任务
      { index: true, Component: TodoList },
      { path: 'todos/new', Component: AddTodo },
      { path: 'todos/:id', Component: AddTodo },
      
      // 目标
      { path: 'targets', Component: TargetList },
      { path: 'targets/new', Component: AddTarget },
      { path: 'targets/:id/edit', Component: AddTarget },
      { path: 'targets/:id', Component: TargetDetail },
      
      // 计划
      { path: 'plans', Component: PlanList },
      { path: 'plans/new', Component: AddPlan },
      { path: 'plans/:id/edit', Component: AddPlan },
      { path: 'plans/:id', Component: PlanDetail },
      
      // 笔记
      { path: 'notes', Component: NoteList },
      { path: 'notes/new', Component: AddNote },
      { path: 'notes/:id', Component: AddNote },
      
      // 日历和统计
      { path: 'calendar', Component: Calendar },
      { path: 'day', Component: DayView },
      { path: 'statistics', Component: Statistics },
      
      // 个人中心
      { path: 'me', Component: Me },
    ],
  },
]);