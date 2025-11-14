
import React, { useContext, useState, ReactNode, useEffect, useMemo, useRef } from 'react';
import { User } from '../types/types';
import { UserContext, UserContextType } from './UserContext';
import { useApi } from './ApiContextProvider';

// Create a provider component
export const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  const { api, setUserCallback } = useApi();
  
  // Register setUser callback with ApiContext so it can clear user on 401 errors
  useEffect(() => {
    setUserCallback(setUser);
  }, [setUserCallback, setUser]);

  // Fetch user on mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const currentUser = await api.users.get();
        if (isMounted) {
          if(currentUser) {
            setUser(currentUser);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        // If there's an error (e.g., not authenticated), set user to null
        if (isMounted) {
          setUser(null);
        }
      }
    }

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [api.users.get]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
