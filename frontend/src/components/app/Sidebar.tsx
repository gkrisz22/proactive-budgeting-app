import { NavLink } from 'react-router';
import { LayoutDashboard, CalendarDays, SlidersHorizontal, UserCircle, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/events',    icon: CalendarDays,     label: 'Events' },
  { to: '/budget',    icon: SlidersHorizontal, label: 'Budget' },
  { to: '/profile',   icon: UserCircle,        label: 'Profile' },
];

export function Sidebar() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-surface border-r border-c-border flex flex-col z-20">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-c-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-mid flex items-center justify-center shrink-0 shadow-sm shadow-brand/20">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none" className="text-white">
            <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
            <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-base font-bold text-c-text tracking-tighter-1 leading-tight font-heading">
          Proactive<br />Budgeting
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors overflow-hidden',
                isActive
                  ? 'bg-brand/10 text-brand dark:bg-brand/20 font-semibold'
                  : 'text-c-muted hover:bg-surface-2 hover:text-c-text',
              )
            }
          >
            {({ isActive }) => (
              <>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 inset-y-2 w-[3px] bg-brand rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 pb-4">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-c-muted hover:bg-surface-2 hover:text-c-text transition-colors"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={resolvedTheme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {resolvedTheme === 'dark' ? (
                <Sun size={18} strokeWidth={1.8} />
              ) : (
                <Moon size={18} strokeWidth={1.8} />
              )}
            </motion.div>
          </AnimatePresence>
          {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  );
}
