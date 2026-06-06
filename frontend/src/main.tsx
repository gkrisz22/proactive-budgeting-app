/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import './index.css'

import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { RequireAuth, RequireOnboarding, RedirectIfAuthed, RedirectIfOnboarded } from '@/components/app/guards'

import LoginPage from '@/pages/(auth)/Login.page'
import RegisterPage from '@/pages/(auth)/Register.page'
import HealthPage from '@/pages/Health.page'

import { lazy, Suspense } from 'react'

const OnboardingPage     = lazy(() => import('@/pages/Onboarding.page'))
const AppLayout          = lazy(() => import('@/components/app/AppLayout'))
const DashboardPage      = lazy(() => import('@/pages/(app)/Dashboard.page'))
const CategoryDetailPage = lazy(() => import('@/pages/(app)/CategoryDetail.page'))
const EventsPage         = lazy(() => import('@/pages/(app)/Events.page'))
const BudgetPage         = lazy(() => import('@/pages/(app)/Budget.page'))
const ProfilePage        = lazy(() => import('@/pages/(app)/Profile.page'))

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--c-bg)">
      <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public auth routes */}
              <Route element={<RedirectIfAuthed />}>
                <Route path="/auth/login"    element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
              </Route>

              {/* Protected routes */}
              <Route element={<RequireAuth />}>
                <Route element={<RedirectIfOnboarded />}>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                </Route>

                <Route element={<RequireOnboarding />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard"      element={<DashboardPage />} />
                    <Route path="/categories/:id" element={<CategoryDetailPage />} />
                    <Route path="/events"         element={<EventsPage />} />
                    <Route path="/budget"         element={<BudgetPage />} />
                    <Route path="/profile"        element={<ProfilePage />} />
                  </Route>
                </Route>
              </Route>

              {/* Utilities */}
              <Route path="/health" element={<HealthPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
