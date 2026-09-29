import { QuestionScope } from '@/types';

export const SCOPE_OPTIONS: { value: QuestionScope; label: string }[] = [
  { value: 'one-earth', label: 'One Earth' },
  { value: 'sites', label: 'Sites' },
  { value: 'other', label: 'Other' },
];

export const scopeLabel = (scope?: string) =>
  SCOPE_OPTIONS.find((s) => s.value === scope)?.label ?? 'Other';
