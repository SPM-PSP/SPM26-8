import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { userApi } from '../api/user';
import { BackendUser } from '../types/backend';
import { DEFAULT_USER_ID, getStoredOpenid, setStoredOpenid } from '../utils/authStorage';
import { toast } from 'sonner';

type AuthContextValue = {
  user: BackendUser | null;
  userId: string;
  users: BackendUser[];
  loading: boolean;
  switching: boolean;
  switchUser: (openid: string) => Promise<void>;
  createUser: (openid: string, nickname: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  setUser: (user: BackendUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const userId = user?.openid ?? getStoredOpenid() ?? DEFAULT_USER_ID;

  const refreshUsers = useCallback(async () => {
    try {
      const list = await userApi.listUsers();
      setUsers(list);
    } catch {
      /* 后端未启动时忽略 */
    }
  }, []);

  const loadUser = useCallback(async (openid: string) => {
    await userApi.loginMock(openid);
    const profile = await userApi.getProfile(openid);
    setStoredOpenid(openid);
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const openid = getStoredOpenid();
        await loadUser(openid);
        await refreshUsers();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadUser, refreshUsers]);

  const switchUser = useCallback(
    async (openid: string) => {
      if (!openid.trim() || openid === userId) return;
      setSwitching(true);
      try {
        await loadUser(openid.trim());
        await refreshUsers();
        toast.success(`已切换到 ${openid.trim()}`);
      } catch {
        toast.error('切换用户失败');
      } finally {
        setSwitching(false);
      }
    },
    [loadUser, refreshUsers, userId],
  );

  const createUser = useCallback(
    async (openid: string, nickname: string) => {
      const id = openid.trim();
      if (!id) {
        toast.error('请输入用户 ID');
        return;
      }
      if (!/^[a-zA-Z0-9_-]{2,32}$/.test(id)) {
        toast.error('用户 ID 仅支持 2–32 位字母、数字、下划线、连字符');
        return;
      }
      setSwitching(true);
      try {
        await userApi.loginMock(id, nickname.trim() || undefined);
        await refreshUsers();
        await loadUser(id);
        toast.success('用户已创建并切换');
      } catch {
        toast.error('创建用户失败');
      } finally {
        setSwitching(false);
      }
    },
    [loadUser, refreshUsers],
  );

  const value = useMemo(
    () => ({
      user,
      userId,
      users,
      loading,
      switching,
      switchUser,
      createUser,
      refreshUsers,
      setUser,
    }),
    [user, userId, users, loading, switching, switchUser, createUser, refreshUsers],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
