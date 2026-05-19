import { useState, useEffect } from 'react';
import { Target } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { targetApi } from '../api/target';
import { toBackendTarget, fromBackendTarget, MOCK_USER_ID } from '../utils/typeMapper';
import { generateId } from '../utils/uuid';

export function useTargets() {
  const [targets, setTargets] = useLocalStorage<Target[]>('targets', []);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    syncFromBackend();
  }, []);

  const syncFromBackend = async () => {
    try {
      setLoading(true);
      const backendTargets = await targetApi.restore(MOCK_USER_ID);
      const fromServer = backendTargets.map(fromBackendTarget);
      setTargets((prev) => {
        const serverIds = new Set(fromServer.map((t) => t.id));
        const localById = new Map(prev.map((t) => [t.id, t]));
        const merged = fromServer.map((t) => {
          const local = localById.get(t.id);
          if (!local) return t;
          return { ...t, ...local };
        });
        for (const item of prev) {
          if (!serverIds.has(item.id)) merged.push(item);
        }
        return merged;
      });
    } catch (error) {
      console.error('从后端同步目标失败:', error);
    } finally {
      setLoading(false);
    }
  };

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
      id: generateId(),
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

  const getTarget = (id: string) => targets.find(t => t.id === id);

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
