import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/features/auth/api';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await authApi.register(values.email, values.password, values.display_name);
      await login(values.email, values.password);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.detail : 'Something went wrong';
      setError('root', { message });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/5 via-background to-brand/10 dark:from-brand/10 dark:via-background dark:to-brand/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/20 dark:bg-brand/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-safe/20 dark:bg-safe/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-brand to-brand-mid flex items-center justify-center mb-4 shadow-lg shadow-brand/20">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-white">
              <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
              <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-c-text tracking-tighter-1">Create your account</h1>
          <p className="text-sm text-c-muted mt-1">Get started with Proactive Budgeting</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-c-text">Your name</label>
            <input
              {...register('display_name')}
              type="text"
              autoComplete="name"
              placeholder="Alex"
              className="w-full h-13 px-4 rounded-md bg-surface-2/50 dark:bg-surface-2 border border-c-border text-base text-c-text placeholder:text-muted-2 outline-none focus:border-brand transition-colors"
            />
            {errors.display_name && <p className="text-xs text-danger">{errors.display_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-c-text">Email</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full h-13 px-4 rounded-md bg-surface-2/50 dark:bg-surface-2 border border-c-border text-base text-c-text placeholder:text-muted-2 outline-none focus:border-brand transition-colors"
            />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-c-text">Password</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="w-full h-13 px-4 rounded-md bg-surface-2/50 dark:bg-surface-2 border border-c-border text-base text-c-text placeholder:text-muted-2 outline-none focus:border-brand transition-colors"
            />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>

          {errors.root && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-13 rounded-lg bg-brand text-white font-semibold text-base tracking-tighter-1 disabled:opacity-45 hover:bg-brand-mid active:scale-[0.98] transition-all shadow-md shadow-brand/20 mt-2"
          >
            {isSubmitting ? 'Creating account…' : 'Create account →'}
          </button>

          <p className="text-center text-sm text-c-muted pt-2">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-brand font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
