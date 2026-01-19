
import React, { useContext, useState, ReactNode, useEffect, useMemo, useRef } from 'react';
import { User } from '../types/types';
import { UserContext, UserContextType } from './UserContext';
import { useApi } from './ApiContextProvider';

// Create a provider component
export const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const isDemoMode = user?.username === 'demo';
  const value = useMemo(() => ({ user, setUser, isDemoMode }), [user, isDemoMode]);
  const { api, setUserCallback } = useApi();
  
  // Register setUser callback with ApiContext so it can clear user on 401 errors
  useEffect(() => {
    setUserCallback(setUser);
  }, [setUserCallback, setUser]);

  // Fetch user on mount and auto-login to demo if enabled
  useEffect(() => {
    let isMounted = true;
    const demoModeEnabled = process.env.REACT_APP_DEMO_MODE === 'true';
    const userExplicitlyLoggedOut = localStorage.getItem('userExplicitlyLoggedOut') === 'true';
    
    const fetchData = async () => {
      try {
        const currentUser = await api.users.get();
        if (isMounted) {
          if(currentUser) {
            setUser(currentUser);
            // Clear the explicit logout flag if user is logged in
            if (currentUser.username !== 'demo') {
              localStorage.removeItem('userExplicitlyLoggedOut');
            }
          } else {
            setUser(null);
            // Auto-login to demo if enabled and user hasn't explicitly logged out
            if (demoModeEnabled && !userExplicitlyLoggedOut) {
              try {
                const demoUser = await api.users.login('demo', 'demo123');
                if (isMounted && demoUser) {
                  setUser(demoUser);
                }
              } catch (error) {
                // If demo login fails, just continue without user
                console.log('Demo auto-login failed, continuing without user');
              }
            }
          }
        }
      } catch (error) {
        // If there's an error (e.g., not authenticated), set user to null
        if (isMounted) {
          setUser(null);
          // Auto-login to demo if enabled and user hasn't explicitly logged out
          if (demoModeEnabled && !userExplicitlyLoggedOut) {
            try {
              const demoUser = await api.users.login('demo', 'demo123');
              if (isMounted && demoUser) {
                setUser(demoUser);
              }
            } catch (error) {
              // If demo login fails, just continue without user
              console.log('Demo auto-login failed, continuing without user');
            }
          }
        }
      }
    }

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [api.users.get, api.users.login]);

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
