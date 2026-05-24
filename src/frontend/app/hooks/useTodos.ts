import { useState, useEffect, useCallback, useRef } from 'react';
import { Todo } from '../types';
import { useUserScopedStorage } from './useUserScopedStorage';
import { todoApi } from '../api/todo';
import { toBackendTodo, fromBackendTodo } from '../utils/typeMapper';
import { generateId } from '../utils/uuid';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function useTodos() {
  const { userId, switching } = useAuth();
  const [todos, setTodos] = useUserScopedStorage<Todo[]>('todos', userId, []);
  const todosRef = useRef<Todo[]>(todos);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  const persistTodos = useCallback(
    (updated: Todo[]) => {
      todosRef.current = updated;
      setTodos(updated);
    },
    [setTodos],
  );

  const syncFromBackend = useCallback(async () => {
    if (!userId || switching) return;
    try {
      setLoading(true);
      const backendTodos = await todoApi.list(userId);
      const fromServer = backendTodos.map(fromBackendTodo);
      setTodos((prev) => {
        const localById = new Map(prev.map((t) => [t.id, t]));
        const merged = fromServer.map((t) => {
          const local = localById.get(t.id);
          if (!local) return t;
          return {
            ...t,
            category: local.category || t.category,
            isContinuous: local.isContinuous ?? t.isContinuous,
            summury: local.summury ?? t.summury,
            beginTime: t.beginTime || local.beginTime,
            endTime: t.endTime || local.endTime,
          };
        });
        todosRef.current = merged;
        return merged;
      });
    } catch (error) {
      console.error('从后端同步待办失败:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, switching, setTodos]);

  useEffect(() => {
    syncFromBackend();
  }, [syncFromBackend]);

  const syncFullBackup = async (updatedTodos: Todo[], options?: { allowEmpty?: boolean }) => {
    if (!userId) return;
    if (updatedTodos.length === 0 && !options?.allowEmpty) {
      console.warn('跳过空列表全量备份，避免清空服务器任务');
      return;
    }
    try {
      setSyncing(true);
      const backendTodos = updatedTodos.map((t) => toBackendTodo(t, userId));
      await todoApi.backup(userId, backendTodos);
    } catch (error) {
      console.error('同步待办到后端失败:', error);
      toast.warning('已保存到本机，同步服务器失败，请检查网络或后端');
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const addTodo = async (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    if (!userId) throw new Error('请先登录');
    const newTodo: Todo = {
      ...todo,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...todosRef.current, newTodo];
    persistTodos(updated);
    try {
      await todoApi.append(userId, [toBackendTodo(newTodo, userId)]);
    } catch {
      await syncFullBackup(updated);
    }
    return newTodo;
  };

  const addTodos = async (items: Omit<Todo, 'id' | 'createdAt'>[]) => {
    if (!userId) throw new Error('请先登录');
    if (items.length === 0) return [];
    const newTodos: Todo[] = items.map((todo) => ({
      ...todo,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }));
    const updated = [...todosRef.current, ...newTodos];
    persistTodos(updated);
    try {
      await todoApi.append(userId, newTodos.map((t) => toBackendTodo(t, userId)));
    } catch {
      await syncFullBackup(updated);
    }
    return newTodos;
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const updated = todosRef.current.map((t) => (t.id === id ? { ...t, ...updates } : t));
    persistTodos(updated);
    await syncFullBackup(updated);
  };

  const deleteTodo = async (id: string) => {
    const updated = todosRef.current.filter((t) => t.id !== id);
    persistTodos(updated);
    await syncFullBackup(updated, { allowEmpty: true });
  };

  const deleteTodosByTargetId = async (targetId: string) => {
    const before = todosRef.current.length;
    const updated = todosRef.current.filter((t) => t.targetId !== targetId);
    if (updated.length === before) return 0;
    persistTodos(updated);
    await syncFullBackup(updated, { allowEmpty: true });
    return before - updated.length;
  };

  const getTodo = (id: string) => todos.find((t) => t.id === id);

  const getTodosByPlan = (planId: string) => todos.filter((t) => t.planId === planId);

  const getTodosByTarget = (targetId: string) => todos.filter((t) => t.targetId === targetId);

  return {
    todos,
    addTodo,
    addTodos,
    updateTodo,
    deleteTodo,
    deleteTodosByTargetId,
    getTodo,
    getTodosByPlan,
    getTodosByTarget,
    syncing,
    loading,
    syncFromBackend,
    userId,
  };
}
