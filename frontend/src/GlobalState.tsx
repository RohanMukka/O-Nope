import React, { createContext, useContext, useState, useEffect } from 'react';

type TraumaLog = {
  mode: string;
  details: string;
  timestamp: string;
};

type GlobalState = {
  score: number;
  logs: TraumaLog[];
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logTrauma: (mode: string, details: string, scoreChange: number) => Promise<void>;
};

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [score, setScore] = useState<number>(100.0);
  const [logs, setLogs] = useState<TraumaLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/user/profile`);
      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    } finally {
      setLoading(false);
    }
  };

  const logTrauma = async (mode: string, details: string, scoreChange: number) => {
    try {
      const formData = new FormData();
      formData.append('mode', mode);
      formData.append('details', details);
      formData.append('score_change', scoreChange.toString());

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/user/log_trauma`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        await refreshProfile();
      }
    } catch (e) {
      console.error('Failed to log trauma', e);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <GlobalContext.Provider value={{ score, logs, loading, refreshProfile, logTrauma }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  return context;
};
