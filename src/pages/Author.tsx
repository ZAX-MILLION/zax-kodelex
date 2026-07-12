import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthorRoute } from '@/components/auth/SecureRoute';
import { AuthorLayout } from '@/components/author/AuthorLayout';
import { AuthorDashboard } from '@/components/author/AuthorDashboard';
import { AuthorSeriesManager } from '@/components/author/AuthorSeriesManager';
import { AuthorChapterManager } from '@/components/author/AuthorChapterManager';
import { AuthorAnalytics } from '@/components/author/AuthorAnalytics';
import { AuthorComments } from '@/components/author/AuthorComments';
import { AuthorUpload } from '@/components/author/AuthorUpload';
import { AuthorNotifications } from '@/components/author/AuthorNotifications';
import { LoadingFallback } from '@/components/admin/LoadingFallback';

const Author = () => {
  return (
    <AuthorRoute>
      <AuthorLayout>
        <Suspense fallback={<LoadingFallback type="dashboard" />}>
          <Routes>
            <Route index element={<AuthorDashboard />} />
            <Route path="dashboard" element={<AuthorDashboard />} />
            <Route path="series" element={<AuthorSeriesManager />} />
            <Route path="chapters" element={<AuthorChapterManager />} />
            <Route path="analytics" element={<AuthorAnalytics />} />
            <Route path="comments" element={<AuthorComments />} />
            <Route path="upload" element={<AuthorUpload />} />
            <Route path="notifications" element={<AuthorNotifications />} />
            <Route path="*" element={<AuthorDashboard />} />
          </Routes>
        </Suspense>
      </AuthorLayout>
    </AuthorRoute>
  );
};

export default Author;