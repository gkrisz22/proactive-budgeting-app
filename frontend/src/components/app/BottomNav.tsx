import { NavLink, useLocation } from 'react-router';
import { LayoutDashboard, CalendarDays, Plus, SlidersHorizontal, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onAddTransaction: () => void;
}

export function BottomNav({ onAddTransaction }: BottomNavProps) {
  const location = useLocation();

  const tabClass = (path: string) =>
    cn(
      'flex flex-col items-center justify-center gap-0.5 flex-1 pt-2 pb-1 text-xs font-medium transition-colors',
      location.pathname === path ? 'text-brand' : 'text-c-muted',
    );

  return (
    <div className="fixed bottom-4 inset-x-4 z-40 pb-safe">
      <nav className="h-16 glass-panel rounded-2xl flex items-center shadow-lg mx-auto max-w-md relative">
        <NavLink to="/dashboard" className={tabClass('/dashboard')}>
        <LayoutDashboard size={22} strokeWidth={1.8} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/events" className={tabClass('/events')}>
        <CalendarDays size={22} strokeWidth={1.8} />
        <span>Events</span>
      </NavLink>

      {/* FAB */}
      <div className="flex-1 flex items-center justify-center relative -top-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAddTransaction}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand to-brand-mid flex items-center justify-center shadow-md shadow-brand/30"
          aria-label="Add transaction"
        >
          <Plus size={26} strokeWidth={2.5} className="text-white" />
        </motion.button>
      </div>

      <NavLink to="/budget" className={tabClass('/budget')}>
        <SlidersHorizontal size={22} strokeWidth={1.8} />
        <span>Budget</span>
      </NavLink>

      <NavLink to="/profile" className={tabClass('/profile')}>
        <UserCircle size={22} strokeWidth={1.8} />
        <span>Profile</span>
      </NavLink>
      </nav>
    </div>
  );
}
