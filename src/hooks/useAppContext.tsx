import { useContext } from 'react';
import { AppContext } from '../contexts/app-context'

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within a AppContextProvider');
  }

  return context;
}