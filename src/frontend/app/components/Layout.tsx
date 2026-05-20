import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';
import { Toaster } from './ui/sonner';

export function Layout() {
  return (
    <div className="phone-shell">
      <div className="phone-frame">
        <div className="phone-frame__body">
          <Outlet />
        </div>
        <BottomNav />
        <Toaster />
      </div>
    </div>
  );
}
