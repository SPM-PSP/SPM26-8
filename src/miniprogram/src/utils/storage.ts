import Taro from '@tarojs/taro';

export function getItem<T>(key: string): T | null {
  try {
    const raw = Taro.getStorageSync(key);
    if (raw === '' || raw === undefined || raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem(key: string, value: unknown): void {
  try {
    Taro.setStorageSync(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to set storage key "${key}":`, e);
  }
}

export function removeItem(key: string): void {
  try {
    Taro.removeStorageSync(key);
  } catch (e) {
    console.error(`Failed to remove storage key "${key}":`, e);
  }
}
