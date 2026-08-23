import { QuestionStatus } from '@/types';
import { CheckCircle2, Clock, Archive } from 'lucide-react';

const CONFIG: Record<QuestionStatus, { label: string; className: string; icon: JSX.Element }> = {
  answered: {
    label: 'Answered',
    className: 'bg-signal-green/10 text-signal-green border-signal-green/30',
    icon: <CheckCircle2 size={13} />,
  },
  unanswered: {
    label: 'Unanswered',
    className: 'bg-signal-amber/10 text-signal-amber border-signal-amber/30',
    icon: <Clock size={13} />,
  },
  archived: {
    label: 'Archived',
    className: 'bg-ink-400/10 text-ink-300 border-ink-500/30',
    icon: <Archive size={13} />,
  },
};

export const StatusBadge = ({ status }: { status: QuestionStatus }) => {
  const cfg = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.72rem] font-medium ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};
