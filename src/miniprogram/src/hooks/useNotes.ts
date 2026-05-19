import { useState, useEffect } from 'react';
import { Note } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { noteApi } from '../api/note';
import { toBackendNote, fromBackendNote, MOCK_USER_ID } from '../utils/typeMapper';
import { generateId } from '../utils/uuid';

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    syncFromBackend();
  }, []);

  const syncFromBackend = async () => {
    try {
      setLoading(true);
      const backendNotes = await noteApi.restore(MOCK_USER_ID);
      const fromServer = backendNotes.map(fromBackendNote);
      setNotes((prev) => {
        const serverIds = new Set(fromServer.map((n) => n.id));
        const localById = new Map(prev.map((n) => [n.id, n]));
        const merged = fromServer.map((n) => {
          const local = localById.get(n.id);
          if (!local) return n;
          return { ...n, ...local };
        });
        for (const item of prev) {
          if (!serverIds.has(item.id)) merged.push(item);
        }
        return merged;
      });
    } catch (error) {
      console.error('从后端同步笔记失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncToBackend = async (updatedNotes: Note[]) => {
    try {
      setSyncing(true);
      const backendNotes = updatedNotes.map(toBackendNote);
      await noteApi.backup(MOCK_USER_ID, backendNotes);
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
    const updated = notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n);
    setNotes(updated);
    await syncToBackend(updated);
  };

  const deleteNote = async (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    await syncToBackend(updated);
  };

  const getNote = (id: string) => notes.find(n => n.id === id);

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    getNote,
    syncing,
    loading,
    syncFromBackend,
  };
}
