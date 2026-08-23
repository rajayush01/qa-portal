import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-600 bg-ink-900/40 px-6 py-16 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-800 text-ink-300">
      {icon}
    </div>
    <h3 className="font-display text-lg text-ink-100">{title}</h3>
    <p className="mt-1.5 max-w-sm text-sm text-ink-400">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const CardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-ink-700 bg-ink-900/60 p-5">
    <div className="mb-3 h-3 w-24 rounded bg-ink-700" />
    <div className="mb-2 h-4 w-3/4 rounded bg-ink-700" />
    <div className="mb-4 h-4 w-1/2 rounded bg-ink-700" />
    <div className="flex gap-2">
      <div className="h-6 w-20 rounded-full bg-ink-700" />
      <div className="h-6 w-20 rounded-full bg-ink-700" />
    </div>
  </div>
);

export const RowSkeleton = () => (
  <div className="animate-pulse grid grid-cols-6 gap-4 border-b border-ink-800 px-4 py-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-3.5 rounded bg-ink-700" />
    ))}
  </div>
);

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="w-full max-w-sm rounded-2xl border border-ink-600 bg-ink-800 p-6 shadow-popover"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-display text-lg text-ink-100">{title}</h3>
          <p className="mt-2 text-sm text-ink-300">{description}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
