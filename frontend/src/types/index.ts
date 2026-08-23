export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  location?: string;
}

export type QuestionStatus = 'unanswered' | 'answered' | 'archived';

export interface Attachment {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface Question {
  _id: string;
  questionId: string;
  userId: string;
  isAnonymous: boolean;
  name?: string | null;
  department: string;
  location: string;
  category: string;
  questionText: string;
  attachments: Attachment[];
  status: QuestionStatus;
  answer?: string;
  answeredBy?: string;
  answeredByName?: string;
  answeredAt?: string;
  sessionFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  total: number;
  unanswered: number;
  answered: number;
  today: number;
}

export interface TaxonomyEntry {
  _id: string;
  name: string;
  kind: 'category' | 'department';
  isActive: boolean;
}

export interface AdminFilters {
  search?: string;
  status?: string;
  department?: string;
  category?: string;
  location?: string;
  datePreset?: string;
  page?: number;
  limit?: number;
  sessionFlagged?: string;
}
