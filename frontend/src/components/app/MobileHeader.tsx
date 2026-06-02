import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { fmtMonthYear } from '@/lib/formatters';

export function MobileHeader() {
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  if (isDesktop) return null;

  const initials = (user?.display_name ?? user?.email ?? 'U')[0].toUpperCase();
  const name = user?.display_name ?? 'there';

  return (
    <header className="flex items-center justify-between px-1 pt-3 pb-1">
      <div>
        <p className="text-sm text-c-muted">Hey, {name} 👋</p>
        <p className="text-lg font-bold text-c-text tracking-tighter-1">{fmtMonthYear()}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-surface-2 border border-c-border flex items-center justify-center text-c-muted hover:text-c-text transition-colors"
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
              {resolvedTheme === 'dark' ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
            </motion.div>
          </AnimatePresence>
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-mid flex items-center justify-center shadow-sm shadow-brand/20">
          <span className="text-sm font-bold text-white">{initials}</span>
        </div>
      </div>
    </header>
  );
}
