import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { useUserScopedStorage } from './useUserScopedStorage';
import { noteApi } from '../api/note';
import { toBackendNote, fromBackendNote } from '../utils/typeMapper';
import { generateId } from '../utils/uuid';
import { useAuth } from '../context/AuthContext';

export function useNotes() {
  const { userId, switching } = useAuth();
  const [notes, setNotes] = useUserScopedStorage<Note[]>('notes', userId, []);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  const syncFromBackend = useCallback(async () => {
    if (!userId || switching) return;
    try {
      setLoading(true);
      const backendNotes = await noteApi.restore(userId);
      setNotes(backendNotes.map(fromBackendNote));
    } catch (error) {
      console.error('从后端同步笔记失败:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, switching, setNotes]);

  useEffect(() => {
    syncFromBackend();
  }, [syncFromBackend]);

  const syncToBackend = async (updatedNotes: Note[]) => {
    if (!userId) return;
    try {
      setSyncing(true);
      await noteApi.backup(userId, updatedNotes.map((n) => toBackendNote(n, userId)));
    } catch (error) {
      console.error('同步笔记到后端失败:', error);
    } finally {
      setSyncing(false);
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    await syncToBackend(updated);
    return newNote;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n,
    );
    setNotes(updated);
    await syncToBackend(updated);
  };

  const deleteNote = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    await syncToBackend(updated);
  };

  const getNote = (id: string) => notes.find((n) => n.id === id);

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    getNote,
    syncing,
    loading,
    syncFromBackend,
    userId,
  };
}
