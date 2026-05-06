import { useState, useEffect } from 'react';
import { Note } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { noteApi } from '../api/note';
import { toBackendNote, fromBackendNote, MOCK_USER_ID } from '../utils/typeMapper';

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
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
      const backendNotes = await noteApi.restore(MOCK_USER_ID);
      const frontendNotes = backendNotes.map(fromBackendNote);
      setNotes(frontendNotes);
    } catch (error) {
      console.error('从后端同步笔记失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 同步到后端
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
      id: crypto.randomUUID(),
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

  const getNote = (id: string) => {
    return notes.find(n => n.id === id);
  };

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
