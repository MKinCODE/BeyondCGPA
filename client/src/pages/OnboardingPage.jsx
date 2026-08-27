import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import ConfigBanner from '../components/layout/ConfigBanner';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';

export const OnboardingPage = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#12B8A6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ConfigBanner />
      <Navbar />
      <main className="flex-1 bg-white">
        <OnboardingWizard />
      </main>
    </div>
  );
};

export default OnboardingPage;
