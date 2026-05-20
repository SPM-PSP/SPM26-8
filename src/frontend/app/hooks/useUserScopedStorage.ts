import { useCallback, useEffect, useState } from 'react';

function readStorage<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

/** 按用户 openid 隔离的 localStorage */
export function useUserScopedStorage<T>(baseKey: string, userId: string, initialValue: T) {
  const storageKey = `${baseKey}:${userId}`;

  const [storedValue, setStoredValue] = useState<T>(() =>
    readStorage(storageKey, initialValue),
  );

  useEffect(() => {
    setStoredValue(readStorage(storageKey, initialValue));
  }, [storageKey]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
        } catch (e) {
          console.error(e);
        }
        return valueToStore;
      });
    },
    [storageKey],
  );

  return [storedValue, setValue] as const;
}
