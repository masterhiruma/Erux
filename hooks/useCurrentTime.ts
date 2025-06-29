
import { useState, useEffect } from 'react';

export const useCurrentTime = () => {
  const [dateState, setDateState] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setDateState(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return {
    time: dateState.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: dateState.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  };
};
