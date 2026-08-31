import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { UserLayout } from '@/layouts/UserLayout';
import { AskQuestionPage } from '@/pages/user/AskQuestionPage';
import { MyQuestionsPage } from '@/pages/user/MyQuestionsPage';

import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AllQuestionsPage } from '@/pages/admin/AllQuestionsPage';
import { LiveSessionPage } from '@/pages/admin/LiveSessionPage';
import { CategoriesPage } from '@/pages/admin/CategoriesPage';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute allow={['user']} />}>
      <Route element={<UserLayout />}>
        <Route path="/dashboard" element={<MyQuestionsPage status="all" />} />
        <Route path="/dashboard/ask" element={<AskQuestionPage />} />
        <Route path="/dashboard/answered" element={<MyQuestionsPage status="answered" />} />
        <Route path="/dashboard/unanswered" element={<MyQuestionsPage status="unanswered" />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allow={['admin']} />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminOverviewPage />} />
        <Route path="/admin/questions" element={<AllQuestionsPage title="All Questions" />} />
        <Route path="/admin/live-session" element={<LiveSessionPage />} />
        <Route
          path="/admin/unanswered"
          element={<AllQuestionsPage title="Unanswered Questions" lockedStatus="unanswered" />}
        />
        <Route
          path="/admin/answered"
          element={<AllQuestionsPage title="Answered Questions" lockedStatus="answered" />}
        />
        <Route path="/admin/categories" element={<CategoriesPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#FFFFFF',
                color: '#0A2224',
                border: '1px solid #E2D4AE',
                fontSize: '0.875rem',
              },
            }}
          />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
