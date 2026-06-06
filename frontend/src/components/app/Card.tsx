import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  padding?: string;
  className?: string;
}

import { motion } from 'framer-motion';

export function Card({ children, onClick, padding = 'p-4', className }: CardProps) {
  const Tag = onClick ? motion.button : motion.div;
  return (
    <Tag
      onClick={onClick}
      whileHover={onClick ? { y: -2, scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        'bg-surface dark:bg-surface-2 rounded-[16px] border border-c-border shadow-sm w-full text-left',
        'transition-colors duration-300',
        padding,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
