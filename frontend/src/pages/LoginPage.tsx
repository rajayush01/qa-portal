import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircleQuestion, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/common/FormFields';
import { Button } from '@/components/common/Button';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
            <MessageCircleQuestion size={22} />
          </div>
          <h1 className="font-display text-2xl text-ink-100">Q&amp;A Portal</h1>
          <p className="mt-1.5 text-sm text-ink-400">Sign in to submit or manage questions.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-ink-700 bg-ink-900/60 p-6 shadow-card"
        >
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              autoFocus
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-signal-red/30 bg-signal-red/10 px-3 py-2 text-xs text-signal-red">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-6 w-full" loading={loading} size="lg">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-500">
          Demo — admin@qaportal.test / user@qaportal.test · ChangeMe123!
        </p>
      </motion.div>
    </div>
  );
};
