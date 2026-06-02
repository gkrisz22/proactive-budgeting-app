import { useState } from 'react';
import { Outlet } from 'react-router';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { AddTransactionSheet } from '@/features/transactions/AddTransactionSheet';

export default function AppLayout() {
  const isDesktop = useIsDesktop();
  const [addTxOpen, setAddTxOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {isDesktop && <Sidebar />}

      <main
        className={[
          'flex-1 overflow-y-auto',
          isDesktop ? 'ml-60' : 'pb-36 pt-2',
        ].join(' ')}
      >
        <div className={isDesktop ? 'max-w-[560px] mx-auto px-6 py-8' : 'px-4 py-2'}>
          <Outlet />
        </div>
      </main>

      {!isDesktop && (
        <BottomNav onAddTransaction={() => setAddTxOpen(true)} />
      )}

      {isDesktop && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAddTxOpen(true)}
          className="fixed right-6 bottom-6 z-30 h-14 rounded-full bg-gradient-to-r from-brand to-brand-mid px-6 text-white shadow-lg shadow-brand/25 transition-colors"
          aria-label="Add transaction"
        >
          <span className="flex items-center gap-2 text-sm font-semibold tracking-tighter-1">
            <Plus size={20} strokeWidth={2.5} />
            Add transaction
          </span>
        </motion.button>
      )}

      <AddTransactionSheet open={addTxOpen} onOpenChange={setAddTxOpen} />
    </div>
  );
}
