import { Link, useLocation } from 'react-router';
import { CheckSquare, Target, Calendar, BarChart3, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: CheckSquare, label: '任务' },
  { path: '/targets', icon: Target, label: '目标' },
  { path: '/calendar', icon: Calendar, label: '日历' },
  { path: '/statistics', icon: BarChart3, label: '统计' },
  { path: '/me', icon: User, label: '我的' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50" style={{boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.04)'}}>
      <div className="max-w-screen-xl mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all"
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#d4726f]/10' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#d4726f]' : 'text-[#8b8680]'}`} />
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'text-[#d4726f] font-medium' : 'text-[#8b8680]'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}