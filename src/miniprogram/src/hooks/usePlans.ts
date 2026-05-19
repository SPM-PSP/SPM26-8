import { useState, useEffect } from 'react';
import { Plan } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { planApi } from '../api/plan';
import { toBackendPlan, fromBackendPlan, MOCK_USER_ID } from '../utils/typeMapper';
import { generateId } from '../utils/uuid';

export function usePlans() {
  const [plans, setPlans] = useLocalStorage<Plan[]>('plans', []);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    syncFromBackend();
  }, []);

  const syncFromBackend = async () => {
    try {
      setLoading(true);
      const backendPlans = await planApi.restore(MOCK_USER_ID);
      const fromServer = backendPlans.map(fromBackendPlan);
      setPlans((prev) => {
        const serverIds = new Set(fromServer.map((p) => p.id));
        const localById = new Map(prev.map((p) => [p.id, p]));
        const merged = fromServer.map((p) => {
          const local = localById.get(p.id);
          if (!local) return p;
          return { ...p, ...local };
        });
        for (const item of prev) {
          if (!serverIds.has(item.id)) merged.push(item);
        }
        return merged;
      });
    } catch (error) {
      console.error('从后端同步计划失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncToBackend = async (updatedPlans: Plan[]) => {
    try {
      setSyncing(true);
      const backendPlans = updatedPlans.map(toBackendPlan);
      await planApi.backup(MOCK_USER_ID, backendPlans);
    } catch (error) {
      console.error('同步计划到后端失败:', error);
    } finally {
      setSyncing(false);
    }
  };

  const addPlan = async (plan: Omit<Plan, 'id' | 'createdAt'>) => {
    const newPlan: Plan = {
      ...plan,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...plans, newPlan];
    setPlans(updated);
    await syncToBackend(updated);
    return newPlan;
  };

  const updatePlan = async (id: string, updates: Partial<Plan>) => {
    const updated = plans.map(p => p.id === id ? { ...p, ...updates } : p);
    setPlans(updated);
    await syncToBackend(updated);
  };

  const deletePlan = async (id: string) => {
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    await syncToBackend(updated);
  };

  const getPlan = (id: string) => plans.find(p => p.id === id);
  const getPlansByTarget = (targetId: string) => plans.filter(p => p.targetId === targetId);

  return {
    plans,
    addPlan,
    updatePlan,
    deletePlan,
    getPlan,
    getPlansByTarget,
    syncing,
    loading,
    syncFromBackend,
  };
}
