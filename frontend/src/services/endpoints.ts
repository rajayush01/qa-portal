import { api } from './api';
import { AdminFilters, AuthUser, Question, DashboardStats, Pagination, TaxonomyEntry } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; user: AuthUser }>('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ success: boolean; user: AuthUser }>('/auth/me'),
};

export const taxonomyApi = {
  list: () =>
    api.get<{ success: boolean; categories: TaxonomyEntry[]; departments: TaxonomyEntry[] }>(
      '/categories'
    ),
  create: (name: string, kind: 'category' | 'department') =>
    api.post('/categories', { name, kind }),
  update: (id: string, patch: Partial<{ name: string; isActive: boolean }>) =>
    api.put(`/categories/${id}`, patch),
  remove: (id: string) => api.delete(`/categories/${id}`),
};

export const questionApi = {
  create: (formData: FormData) =>
    api.post<{ success: boolean; question: Question }>('/questions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  my: (status?: string, page = 1, limit = 20) =>
    api.get<{ success: boolean; questions: Question[]; pagination: Pagination }>('/questions/my', {
      params: { status, page, limit },
    }),
  byId: (questionId: string) =>
    api.get<{ success: boolean; question: Question }>(`/questions/${questionId}`),
};

const buildParams = (filters: AdminFilters) => ({
  search: filters.search || undefined,
  status: filters.status && filters.status !== 'all' ? filters.status : undefined,
  department: filters.department && filters.department !== 'all' ? filters.department : undefined,
  category: filters.category && filters.category !== 'all' ? filters.category : undefined,
  location: filters.location && filters.location !== 'all' ? filters.location : undefined,
  datePreset: filters.datePreset && filters.datePreset !== 'all' ? filters.datePreset : undefined,
  sessionFlagged: filters.sessionFlagged || undefined,
  page: filters.page ?? 1,
  limit: filters.limit ?? 25,
});

export const adminApi = {
  stats: () => api.get<{ success: boolean; stats: DashboardStats }>('/admin/stats'),
  facets: () =>
    api.get<{
      success: boolean;
      facets: { departments: string[]; categories: string[]; locations: string[] };
    }>('/admin/facets'),
  list: (filters: AdminFilters) =>
    api.get<{ success: boolean; questions: Question[]; pagination: Pagination }>(
      '/admin/questions',
      { params: buildParams(filters) }
    ),
  byId: (questionId: string) =>
    api.get<{ success: boolean; question: Question }>(`/admin/questions/${questionId}`),
  answer: (questionId: string, answer: string) =>
    api.post<{ success: boolean; question: Question }>(`/admin/questions/${questionId}/answer`, {
      answer,
    }),
  answerInPerson: (questionId: string) =>
    api.post<{ success: boolean; question: Question }>(
      `/admin/questions/${questionId}/answer-in-person`
    ),
  flag: (questionId: string) =>
    api.post<{ success: boolean; question: Question }>(`/admin/questions/${questionId}/flag`),
  exportUrl: (filters: AdminFilters, all: boolean) => {
    const params = new URLSearchParams();
    if (all) {
      params.set('all', 'true');
    } else {
      Object.entries(buildParams(filters)).forEach(([k, v]) => {
        if (v !== undefined) params.set(k, String(v));
      });
    }
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/admin/questions/export?${params.toString()}`;
  },
};

export const attachmentUrl = (questionId: string, fileName: string) => {
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}/attachments/${questionId}/${fileName}`;
};
