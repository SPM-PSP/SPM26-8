import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';
import { Toaster } from './ui/sonner';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <Outlet />
      <BottomNav />
      <Toaster />
    </div>
  );
}
