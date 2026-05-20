import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';
import { Toaster } from './ui/sonner';
import { UserSwitcher } from './UserSwitcher';

export function Layout() {
  return (
    <div className="phone-shell">
      <div className="phone-frame">
        <div className="phone-frame__body">
          <UserSwitcher />
          <Outlet />
        </div>
        <BottomNav />
        <Toaster />
      </div>
    </div>
  );
}
