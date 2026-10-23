import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

/** Scrollable pill nav shown under the header on screens below `md`. */
export const MobileNav = ({ items }: { items: NavItem[] }) => (
  <nav
    aria-label="Primary"
    className="sticky top-0 z-30 flex gap-1.5 overflow-x-auto border-b border-ink-800 bg-ink-950/95 px-3 py-2 backdrop-blur md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    {items.map(({ to, label, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          `flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
            isActive ? 'bg-accent-500/15 text-accent-300' : 'text-ink-300 hover:bg-ink-800'
          }`
        }
      >
        <Icon size={14} />
        {label}
      </NavLink>
    ))}
  </nav>
);
