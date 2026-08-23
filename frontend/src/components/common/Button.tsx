import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const VARIANT: Record<string, string> = {
  primary: 'bg-accent-500 text-white hover:bg-accent-400 shadow-card',
  secondary: 'bg-ink-800 text-ink-100 border border-ink-600 hover:bg-ink-700',
  ghost: 'bg-transparent text-ink-200 hover:bg-ink-800',
  danger: 'bg-signal-red text-white hover:brightness-110',
};

const SIZE: Record<string, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-lg',
  lg: 'text-base px-5 py-3 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${className}`}
        {...rest}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
