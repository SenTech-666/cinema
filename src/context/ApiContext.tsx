// src/context/ApiContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/Api';
import { Hall, Movie, Seance, AllDataResponse } from '../types/api';

interface ApiContextType {
  halls: Hall[];
  films: Movie[];
  seances: Seance[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [films, setFilms] = useState<Movie[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.getAllData() as AllDataResponse;

      setHalls(data.halls || []);
      setFilms(data.films || []);
      setSeances(data.seances || []);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <ApiContext.Provider value={{ 
      halls, 
      films, 
      seances, 
      loading, 
      error, 
      refreshData 
    }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi должен использоваться внутри ApiProvider');
  }
  return context;
};