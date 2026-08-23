import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export const StatCard = ({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'default' | 'amber' | 'green' | 'accent';
}) => {
  const toneClass = {
    default: 'text-ink-200 bg-ink-800',
    amber: 'text-signal-amber bg-signal-amber/10',
    green: 'text-signal-green bg-signal-green/10',
    accent: 'text-accent-400 bg-accent-500/10',
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-ink-700 bg-ink-900/60 p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl text-ink-100">{value.toLocaleString()}</p>
    </motion.div>
  );
};
