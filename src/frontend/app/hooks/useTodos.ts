import { useState, useEffect } from 'react';
import { Todo } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { todoApi } from '../api/todo';
import { toBackendTodo, fromBackendTodo, MOCK_USER_ID } from '../utils/typeMapper';

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 启动时从后端拉取数据
  useEffect(() => {
    syncFromBackend();
  }, []);

  // 从后端拉取数据
  const syncFromBackend = async () => {
    try {
      setLoading(true);
      const backendTodos = await todoApi.list(MOCK_USER_ID);
      const frontendTodos = backendTodos.map(fromBackendTodo);
      setTodos(frontendTodos);
    } catch (error) {
      console.error('从后端同步待办失败:', error);
      // 失败时使用本地数据，不显示错误提示（可能是后端未启动）
    } finally {
      setLoading(false);
    }
  };

  // 同步到后端
  const syncToBackend = async (updatedTodos: Todo[]) => {
    try {
      setSyncing(true);
      const backendTodos = updatedTodos.map(toBackendTodo);
      await todoApi.backup(MOCK_USER_ID, backendTodos);
    } catch (error) {
      console.error('同步待办到后端失败:', error);
      // 静默失败，数据已保存到 localStorage
    } finally {
      setSyncing(false);
    }
  };

  const addTodo = async (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo: Todo = {
      ...todo,
      id: crypto.randomUUID(), // 使用 UUID
      createdAt: new Date().toISOString(),
    };
    const updated = [...todos, newTodo];
    setTodos(updated);
    await syncToBackend(updated); // 自动同步到后端
    return newTodo;
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const updated = todos.map(t => t.id === id ? { ...t, ...updates } : t);
    setTodos(updated);
    await syncToBackend(updated); // 自动同步到后端
  };

  const deleteTodo = async (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    await syncToBackend(updated); // 自动同步到后端
  };

  const getTodo = (id: string) => {
    return todos.find(t => t.id === id);
  };

  const getTodosByPlan = (planId: string) => {
    return todos.filter(t => t.planId === planId);
  };

  const getTodosByTarget = (targetId: string) => {
    return todos.filter(t => t.targetId === targetId);
  };

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    getTodo,
    getTodosByPlan,
    getTodosByTarget,
    syncing,
    loading,
    syncFromBackend,
  };
}
