import { QuestionScope } from '@/types';

export const SCOPE_OPTIONS: { value: QuestionScope; label: string }[] = [
  { value: 'one-earth', label: 'One Earth' },
  { value: 'other-offices', label: 'Other Offices' },
  { value: 'project-sites', label: 'Project Sites' },
  { value: 'oms-sites', label: 'OMS Sites' },
  { value: 'manufacturing-plant', label: 'Manufacturing Plant' },
  { value: 'international', label: 'International' },
  { value: 'se-forge', label: 'SE FORGE' },
  { value: 'renom-energy', label: 'Renom Energy' },
];

export const scopeLabel = (scope?: string) =>
  SCOPE_OPTIONS.find((s) => s.value === scope)?.label ?? 'Other';

// Category is optional — blank means the submitter didn't pick one.
export const categoryLabel = (category?: string) => (category && category.trim() ? category : 'Uncategorised');
