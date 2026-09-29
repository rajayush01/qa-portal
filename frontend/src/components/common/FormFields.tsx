import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface FieldWrapProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const baseField =
  'w-full rounded-lg border bg-ink-900 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/40';

const FieldChrome = ({
  label,
  error,
  hint,
  required,
  children,
}: FieldWrapProps & { children: React.ReactNode }) => (
  <div className="w-full">
    {label && (
      <label className="mb-1.5 block text-sm font-medium text-ink-200">
        {label}
        {required && <span className="ml-0.5 text-signal-red">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="mt-1.5 text-xs text-signal-red">{error}</p>
    ) : hint ? (
      <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
    ) : null}
  </div>
);

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldWrapProps;
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className = '', ...rest }, ref) => (
    <FieldChrome label={label} error={error} hint={hint} required={required}>
      <input
        ref={ref}
        className={`${baseField} ${error ? 'border-signal-red' : 'border-ink-600 focus:border-accent-500'} ${className}`}
        {...rest}
      />
    </FieldChrome>
  )
);
Input.displayName = 'Input';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldWrapProps;
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, required, className = '', children, ...rest }, ref) => (
    <FieldChrome label={label} error={error} hint={hint} required={required}>
      <select
        ref={ref}
        className={`${baseField} ${error ? 'border-signal-red' : 'border-ink-600 focus:border-accent-500'} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FieldChrome>
  )
);
Select.displayName = 'Select';

interface RadioGroupProps<T extends string> extends FieldWrapProps {
  name: string;
  value: T | '';
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

export const RadioGroup = <T extends string>({
  name,
  label,
  error,
  hint,
  required,
  value,
  onChange,
  options,
}: RadioGroupProps<T>) => (
  <FieldChrome label={label} error={error} hint={hint} required={required}>
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2">
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <label
            key={o.value}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
              checked
                ? 'border-accent-500 bg-accent-500/10 text-ink-100'
                : error
                ? 'border-signal-red text-ink-300'
                : 'border-ink-600 bg-ink-900 text-ink-300 hover:border-ink-500'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              onChange={() => onChange(o.value)}
              className="h-4 w-4 shrink-0 accent-[#6366f1]"
            />
            {o.label}
          </label>
        );
      })}
    </div>
  </FieldChrome>
);

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrapProps;
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, className = '', ...rest }, ref) => (
    <FieldChrome label={label} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        className={`${baseField} resize-none ${error ? 'border-signal-red' : 'border-ink-600 focus:border-accent-500'} ${className}`}
        {...rest}
      />
    </FieldChrome>
  )
);
Textarea.displayName = 'Textarea';
