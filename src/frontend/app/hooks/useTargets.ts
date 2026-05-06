import { useState, useEffect } from 'react';
import { Target } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { targetApi } from '../api/target';
import { toBackendTarget, fromBackendTarget, MOCK_USER_ID } from '../utils/typeMapper';

export function useTargets() {
  const [targets, setTargets] = useLocalStorage<Target[]>('targets', []);
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
      const backendTargets = await targetApi.restore(MOCK_USER_ID);
      const frontendTargets = backendTargets.map(fromBackendTarget);
      setTargets(frontendTargets);
    } catch (error) {
      console.error('从后端同步目标失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 同步到后端
  const syncToBackend = async (updatedTargets: Target[]) => {
    try {
      setSyncing(true);
      const backendTargets = updatedTargets.map(toBackendTarget);
      await targetApi.backup(MOCK_USER_ID, backendTargets);
    } catch (error) {
      console.error('同步目标到后端失败:', error);
    } finally {
      setSyncing(false);
    }
  };

  const addTarget = async (target: Omit<Target, 'id' | 'createdAt'>) => {
    const newTarget: Target = {
      ...target,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...targets, newTarget];
    setTargets(updated);
    await syncToBackend(updated);
    return newTarget;
  };

  const updateTarget = async (id: string, updates: Partial<Target>) => {
    const updated = targets.map(t => t.id === id ? { ...t, ...updates } : t);
    setTargets(updated);
    await syncToBackend(updated);
  };

  const deleteTarget = async (id: string) => {
    const updated = targets.filter(t => t.id !== id);
    setTargets(updated);
    await syncToBackend(updated);
  };

  const getTarget = (id: string) => {
    return targets.find(t => t.id === id);
  };

  return {
    targets,
    addTarget,
    updateTarget,
    deleteTarget,
    getTarget,
    syncing,
    loading,
    syncFromBackend,
  };
}
