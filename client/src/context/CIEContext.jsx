import React, { createContext, useContext, useState, useEffect } from 'react';
import { preparationAPI, cieAPI, profileAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CIEContext = createContext(null);

export const CIEProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [todaysFocus, setTodaysFocus] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.getProfile();
      if (res.data?.success) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.warn('Error fetching profile:', err.message);
    }
  };

  const fetchRoadmap = async () => {
    try {
      const res = await preparationAPI.getRoadmap();
      if (res.data?.success) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.warn('Error fetching roadmap:', err.message);
    }
  };

  const fetchTodaysFocus = async () => {
    try {
      const res = await preparationAPI.getTodaysFocus();
      if (res.data?.success) {
        setTodaysFocus(res.data.todaysFocus);
      }
    } catch (err) {
      console.warn('Error fetching Today\'s Focus:', err.message);
    }
  };

  const fetchReadiness = async () => {
    try {
      const res = await cieAPI.getReadiness();
      if (res.data?.success) {
        setReadiness(res.data.analysis);
      }
    } catch (err) {
      console.warn('Error fetching readiness analysis:', err.message);
    }
  };

  const refreshAll = async () => {
    if (!isAuthenticated || !user?.onboardingCompleted) return;
    setIsLoading(true);
    try {
      await Promise.all([
        fetchProfile(),
        fetchRoadmap(),
        fetchTodaysFocus(),
        fetchReadiness()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.onboardingCompleted) {
      refreshAll();
    }
  }, [isAuthenticated, user?.onboardingCompleted]);

  const logPreparationEffort = async (payload) => {
    try {
      const res = await preparationAPI.logEffort(payload);
      if (res.data?.success) {
        // Refresh all connected telemetry
        await refreshAll();
        return { success: true, progress: res.data.progress };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to log preparation effort'
      };
    }
  };

  return (
    <CIEContext.Provider
      value={{
        roadmap,
        todaysFocus,
        readiness,
        profile,
        isLoading,
        refreshAll,
        logPreparationEffort,
        setRoadmap,
        setTodaysFocus,
        setProfile
      }}
    >
      {children}
    </CIEContext.Provider>
  );
};

export const useCIE = () => {
  const context = useContext(CIEContext);
  if (!context) {
    throw new Error('useCIE must be used within a CIEProvider');
  }
  return context;
};
