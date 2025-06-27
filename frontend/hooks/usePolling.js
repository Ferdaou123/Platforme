import { useState, useEffect, useRef } from 'react';

export const usePolling = (fetcher, interval = 30000, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const isActiveRef = useRef(true);

  const fetchData = async () => {
    if (!isActiveRef.current) return;
    
    try {
      setError(null);
      const result = await fetcher();
      if (isActiveRef.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (isActiveRef.current) {
        setError(err);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Première requête immédiate
    fetchData();

    // Démarrer le polling
    intervalRef.current = setInterval(fetchData, interval);

    // Nettoyer à la destruction
    return () => {
      isActiveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled]);

  // Arrêter le polling quand l'onglet n'est pas visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        if (enabled) {
          fetchData(); // Requête immédiate au retour
          intervalRef.current = setInterval(fetchData, interval);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [interval, enabled]);

  return { data, loading, error, refetch: fetchData };
};