import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-4 text-center">
    <CompassIcon className="mb-4 text-ink-500" size={32} />
    <h1 className="font-display text-3xl text-ink-100">Page not found</h1>
    <p className="mt-2 text-sm text-ink-400">The page you're looking for doesn't exist.</p>
    <Link to="/" className="mt-6">
      <Button>Back to home</Button>
    </Link>
  </div>
);
