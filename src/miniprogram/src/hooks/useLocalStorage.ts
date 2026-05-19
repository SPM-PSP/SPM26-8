import { useState, useCallback } from 'react';
import { getItem, setItem } from '../utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = getItem<T>(key);
    return item !== null ? item : initialValue;
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      setItem(key, valueToStore);
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue] as const;
}
