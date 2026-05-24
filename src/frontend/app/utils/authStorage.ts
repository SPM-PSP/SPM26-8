/** 主账号：历史数据统一归属此 openid */
export const DEFAULT_USER_ID = 'wch13819780501';
const STORAGE_KEY = 'ddl-current-openid';
const LEGACY_MIGRATED_FLAG = 'ddl-legacy-migrated-v2';

export function getStoredOpenid(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_USER_ID;
  } catch {
    return DEFAULT_USER_ID;
  }
}

export function setStoredOpenid(openid: string): void {
  localStorage.setItem(STORAGE_KEY, openid);
}

/**
 * 仅执行一次：把未分用户的旧 localStorage 并入主账号，并清掉误复制到其他用户的缓存
 */
export function migrateLegacyDataToOwner(ownerId: string = DEFAULT_USER_ID) {
  try {
    if (localStorage.getItem(LEGACY_MIGRATED_FLAG)) return;

    const bases = ['todos', 'targets', 'plans', 'notes'] as const;
    for (const base of bases) {
      const legacy = localStorage.getItem(base);
      const ownerKey = `${base}:${ownerId}`;
      if (legacy) {
        const existing = localStorage.getItem(ownerKey);
        if (!existing) {
          localStorage.setItem(ownerKey, legacy);
        }
        localStorage.removeItem(base);
      }
    }

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k) continue;
      for (const base of bases) {
        if (k.startsWith(`${base}:`) && k !== `${base}:${ownerId}`) {
          localStorage.removeItem(k);
        }
      }
    }

    localStorage.setItem(LEGACY_MIGRATED_FLAG, '1');
    setStoredOpenid(ownerId);
  } catch (e) {
    console.error('migrateLegacyDataToOwner failed', e);
  }
}
