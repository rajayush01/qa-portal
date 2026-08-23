import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Radio,
  Clock,
  CheckCircle2,
  Tags,
  Shield,
  LogOut,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/questions', label: 'All Questions', icon: ListChecks },
  { to: '/admin/live-session', label: 'Live Session', icon: Radio },
  { to: '/admin/unanswered', label: 'Unanswered', icon: Clock },
  { to: '/admin/answered', label: 'Answered', icon: CheckCircle2 },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
];

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  return (
    <div className="flex min-h-screen bg-ink-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-900/40 px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Shield size={18} className="text-accent-400" />
          <div>
            <p className="font-display text-xl text-ink-100">Admin Console</p>
            <p className="mt-0.5 text-xs text-ink-400">Q&amp;A Portal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-500/15 text-accent-300'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-ink-100'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-3 border-t border-ink-800 pt-4">
          <div className="flex items-center gap-2 px-2 text-xs text-ink-400">
            {connected ? <Wifi size={13} className="text-signal-green" /> : <WifiOff size={13} />}
            {connected ? 'Live updates on' : 'Reconnecting…'}
          </div>
          <div className="px-2">
            <p className="truncate text-sm text-ink-100">{user?.name}</p>
            <p className="truncate text-xs text-ink-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-ink-800 hover:text-signal-red"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink-800 bg-ink-900/40 px-5 py-4 md:hidden">
          <p className="font-display text-lg text-ink-100">Admin Console</p>
          <button onClick={logout} className="text-ink-300">
            <LogOut size={18} />
          </button>
        </header>
        <main className="flex-1 px-5 py-6 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
