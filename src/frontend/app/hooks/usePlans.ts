import { useState, useEffect, useCallback } from 'react';
import { Plan } from '../types';
import { useUserScopedStorage } from './useUserScopedStorage';
import { planApi } from '../api/plan';
import { toBackendPlan, fromBackendPlan } from '../utils/typeMapper';
import { generateId } from '../utils/uuid';
import { useAuth } from '../context/AuthContext';

export function usePlans() {
  const { userId, switching } = useAuth();
  const [plans, setPlans] = useUserScopedStorage<Plan[]>('plans', userId, []);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  const syncFromBackend = useCallback(async () => {
    if (!userId || switching) return;
    try {
      setLoading(true);
      const backendPlans = await planApi.restore(userId);
      setPlans(backendPlans.map(fromBackendPlan));
    } catch (error) {
      console.error('从后端同步计划失败:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, switching, setPlans]);

  useEffect(() => {
    syncFromBackend();
  }, [syncFromBackend]);

  const syncToBackend = async (updatedPlans: Plan[]) => {
    if (!userId) return;
    try {
      setSyncing(true);
      await planApi.backup(userId, updatedPlans.map((p) => toBackendPlan(p, userId)));
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
    const updated = plans.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPlans(updated);
    await syncToBackend(updated);
  };

  const deletePlan = async (id: string) => {
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    await syncToBackend(updated);
  };

  const deletePlansByTargetId = async (targetId: string) => {
    const updated = plans.filter((p) => p.targetId !== targetId);
    if (updated.length === plans.length) return 0;
    setPlans(updated);
    await syncToBackend(updated);
    return plans.length - updated.length;
  };

  const getPlan = (id: string) => plans.find((p) => p.id === id);

  const getPlansByTarget = (targetId: string) => plans.filter((p) => p.targetId === targetId);

  return {
    plans,
    addPlan,
    updatePlan,
    deletePlan,
    deletePlansByTargetId,
    getPlan,
    getPlansByTarget,
    syncing,
    loading,
    syncFromBackend,
    userId,
  };
}
