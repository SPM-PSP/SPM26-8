import { useState, useEffect, useCallback } from 'react';
import { Target } from '../types';
import { useUserScopedStorage } from './useUserScopedStorage';
import { targetApi } from '../api/target';
import { toBackendTarget, mergeTargetFromBackend } from '../utils/typeMapper';
import { defaultTargetDateRange, parseDateSafe } from '../utils/formatDate';
import { generateId } from '../utils/uuid';
import { useAuth } from '../context/AuthContext';

export function useTargets() {
  const { userId, switching } = useAuth();
  const [targets, setTargets] = useUserScopedStorage<Target[]>('targets', userId, []);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  const syncFromBackend = useCallback(async () => {
    if (!userId || switching) return;
    try {
      setLoading(true);
      const backendTargets = await targetApi.restore(userId);
      setTargets((prev) => {
        const localById = new Map(prev.map((t) => [t.id, t]));
        return backendTargets.map((bt) =>
          mergeTargetFromBackend(bt, localById.get(bt.uuid)),
        );
      });
    } catch (error) {
      console.error('从后端同步目标失败:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, switching, setTargets]);

  useEffect(() => {
    syncFromBackend();
  }, [syncFromBackend]);

  useEffect(() => {
    if (!userId || switching) return;
    setTargets((prev) => {
      let changed = false;
      const next = prev.map((t) => {
        if (parseDateSafe(t.beginTime) && parseDateSafe(t.endTime)) return t;
        changed = true;
        const defaults = defaultTargetDateRange(t.createdAt);
        return {
          ...t,
          beginTime: parseDateSafe(t.beginTime) ? t.beginTime : defaults.beginTime,
          endTime: parseDateSafe(t.endTime) ? t.endTime : defaults.endTime,
        };
      });
      return changed ? next : prev;
    });
  }, [userId, switching, setTargets]);

  const syncToBackend = async (updatedTargets: Target[]) => {
    if (!userId) return;
    try {
      setSyncing(true);
      await targetApi.backup(
        userId,
        updatedTargets.map((t) => toBackendTarget(t, userId)),
      );
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
    const updated = targets.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTargets(updated);
    await syncToBackend(updated);
  };

  const deleteTarget = async (id: string) => {
    const updated = targets.filter((t) => t.id !== id);
    setTargets(updated);
    await syncToBackend(updated);
  };

  const getTarget = (id: string) => targets.find((t) => t.id === id);

  return {
    targets,
    addTarget,
    updateTarget,
    deleteTarget,
    getTarget,
    syncing,
    loading,
    syncFromBackend,
    userId,
  };
}
