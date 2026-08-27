import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CIEProvider } from './context/CIEContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages & Layouts
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import PreparationPage from './pages/PreparationPage';
import TodaysTopicPage from './pages/TodaysTopicPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import MentorPage from './pages/MentorPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

// Protected Route Guard: Strictly prevents unauthenticated access to dashboard/onboarding
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#12B8A6]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated but hasn't completed onboarding, direct to /onboarding
  if (!user?.onboardingCompleted && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CIEProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Onboarding (Protected) */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />

              {/* Authenticated Dashboard Core Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="roadmap" element={<PreparationPage />} />
                <Route path="topics" element={<TodaysTopicPage />} />
                <Route path="opportunities" element={<OpportunitiesPage />} />
                <Route path="mentor" element={<MentorPage />} />
                <Route path="profile" element={<ProfileSettingsPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </CIEProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
