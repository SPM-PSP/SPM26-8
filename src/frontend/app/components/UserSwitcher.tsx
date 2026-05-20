import { useState } from 'react';
import { ChevronDown, Loader2, UserCircle2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';
import { cn } from './ui/utils';

export function UserSwitcher() {
  const { user, userId, users, loading, switching, switchUser, createUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newNick, setNewNick] = useState('');

  const handleCreate = async () => {
    await createUser(newId, newNick);
    setNewId('');
    setNewNick('');
    setOpen(false);
  };

  const label = user?.nickname || userId;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="flex w-full items-center gap-2 border-b border-[#ebe6e0] bg-white/95 px-4 py-2.5 text-left backdrop-blur-md"
      >
        <UserCircle2 className="h-5 w-5 shrink-0 text-[#88a096]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-[#8b8680]">当前用户</p>
          <p className="truncate text-sm font-medium text-[#4a4a4a]">
            {loading ? '加载中…' : label}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#f5f1ed] px-2 py-0.5 text-[10px] text-[#8b8680]">
          {userId}
        </span>
        {switching ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#8b8680]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#8b8680]" />
        )}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="datetime-picker-drawer max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="text-center">切换用户</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-2 overflow-y-auto px-5 pb-2 max-h-[40vh]">
            {users.length === 0 && !loading && (
              <p className="text-center text-sm text-[#8b8680] py-4">暂无用户，请新建</p>
            )}
            {users.map((u) => (
              <button
                key={u.openid}
                type="button"
                disabled={switching}
                onClick={async () => {
                  await switchUser(u.openid);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left transition-colors',
                  u.openid === userId
                    ? 'border-[#d4726f]/40 bg-[#fef0ef]'
                    : 'border-transparent bg-[#f5f1ed] hover:bg-[#ebe6e0]',
                )}
              >
                <UserCircle2
                  className={cn(
                    'h-8 w-8 shrink-0',
                    u.openid === userId ? 'text-[#d4726f]' : 'text-[#8b8680]',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#4a4a4a] truncate">{u.nickname || u.openid}</p>
                  <p className="text-xs text-[#8b8680] truncate">{u.openid}</p>
                  {u.email && (
                    <p className="text-xs text-[#88a096] truncate mt-0.5">{u.email}</p>
                  )}
                </div>
                {u.openid === userId && (
                  <span className="text-xs text-[#d4726f] font-medium shrink-0">当前</span>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <p className="text-sm font-medium text-[#4a4a4a] flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              新建用户
            </p>
            <Input
              placeholder="用户 ID，如 user-alice"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              disabled={switching}
            />
            <Input
              placeholder="昵称（可选）"
              value={newNick}
              onChange={(e) => setNewNick(e.target.value)}
              disabled={switching}
            />
            <Button
              type="button"
              className="w-full rounded-full bg-[#d4726f] hover:bg-[#c46562] text-white"
              disabled={switching || !newId.trim()}
              onClick={handleCreate}
            >
              创建并切换
            </Button>
            <p className="text-xs text-[#8b8680] leading-relaxed">
              任务、目标、计划、笔记按用户 ID 分别存库（user_id / openid）。切换后将加载该用户在数据库中的数据。
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
