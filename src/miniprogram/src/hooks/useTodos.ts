import { useState, useEffect } from 'react';
import { Todo } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { todoApi } from '../api/todo';
import { toBackendTodo, fromBackendTodo, MOCK_USER_ID } from '../utils/typeMapper';
import { generateId } from '../utils/uuid';

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    syncFromBackend();
  }, []);

  const syncFromBackend = async () => {
    try {
      setLoading(true);
      const backendTodos = await todoApi.list(MOCK_USER_ID);
      const fromServer = backendTodos.map(fromBackendTodo);
      setTodos((prev) => {
        const localById = new Map(prev.map((t) => [t.id, t]));
        return fromServer.map((t) => {
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
      });
    } catch (error) {
      console.error('从后端同步待办失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncToBackend = async (updatedTodos: Todo[]) => {
    try {
      setSyncing(true);
      const backendTodos = updatedTodos.map(toBackendTodo);
      await todoApi.backup(MOCK_USER_ID, backendTodos);
    } catch (error) {
      console.error('同步待办到后端失败:', error);
    } finally {
      setSyncing(false);
    }
  };

  const addTodo = async (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo: Todo = {
      ...todo,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...todos, newTodo];
    setTodos(updated);
    await syncToBackend(updated);
    return newTodo;
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const updated = todos.map(t => t.id === id ? { ...t, ...updates } : t);
    setTodos(updated);
    await syncToBackend(updated);
  };

  const deleteTodo = async (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    await syncToBackend(updated);
  };

  const getTodo = (id: string) => todos.find(t => t.id === id);
  const getTodosByPlan = (planId: string) => todos.filter(t => t.planId === planId);
  const getTodosByTarget = (targetId: string) => todos.filter(t => t.targetId === targetId);

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
