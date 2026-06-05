import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sun, Moon, Monitor, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ME_QUERY_KEY } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { authApi } from '@/features/auth/api';
import { MobileHeader } from '@/components/app/MobileHeader';
import { cn } from '@/lib/utils';

type ThemeOption = 'light' | 'dark' | 'system';

const THEMES: { value: ThemeOption; icon: typeof Sun; label: string }[] = [
  { value: 'light',  icon: Sun,     label: 'Light' },
  { value: 'dark',   icon: Moon,    label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();

  const [name, setName] = useState(user?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const avatarLetter = (user?.display_name ?? user?.email ?? '?').charAt(0).toUpperCase();

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await authApi.updateMe(name.trim());
      await qc.invalidateQueries({ queryKey: ME_QUERY_KEY });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="space-y-6">
      <MobileHeader />

      {/* Avatar hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-c-border shadow-sm p-5 flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand-mid flex items-center justify-center shrink-0 shadow-md shadow-brand/20">
          <span className="text-xl font-bold text-white">{avatarLetter}</span>
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-c-text truncate">
            {user?.display_name ?? '—'}
          </p>
          <p className="text-sm text-c-muted truncate">{user?.email}</p>
        </div>
      </motion.div>

      {/* Edit display name */}
      <div className="bg-surface rounded-2xl border border-c-border shadow-sm p-4 space-y-3">
        <p className="text-sm font-semibold text-c-text">Display name</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Your name"
          className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-c-border text-base text-c-text placeholder:text-muted-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
        />
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full h-11 rounded-xl bg-brand text-white font-semibold text-sm tracking-tighter-1 disabled:opacity-45 hover:bg-brand-mid active:scale-[0.98] transition-all shadow-sm shadow-brand/20"
        >
          {saving ? 'Saving…' : 'Update name'}
        </button>
      </div>

      {/* Theme selector */}
      <div className="bg-surface rounded-2xl border border-c-border shadow-sm p-4 space-y-3">
        <p className="text-sm font-semibold text-c-text">Appearance</p>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'relative flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-all',
                theme === value
                  ? 'border-brand bg-brand/10 text-brand dark:bg-brand/20'
                  : 'border-c-border bg-surface-2 text-c-muted hover:border-c-muted hover:text-c-text',
              )}
            >
              <Icon size={20} strokeWidth={1.8} />
              {label}
              {theme === value && (
                <motion.div
                  layoutId="theme-active"
                  className="absolute inset-0 rounded-xl border-2 border-brand pointer-events-none"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full h-13 rounded-xl border border-danger/30 bg-danger/5 text-danger font-semibold text-base tracking-tighter-1 disabled:opacity-45 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <LogOut size={18} strokeWidth={2} />
        {loggingOut ? 'Logging out…' : 'Log out'}
      </button>
    </div>
  );
}
