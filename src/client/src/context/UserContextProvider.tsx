
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types/types';
import { getCurrentUser } from '../apis/usersApi';

interface UserContextType {
  user: User | null; // The current user (null if not logged in)
  setUser: (user: User | null) => void; // Function to update the user
}

// Create the context with an initial null value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {

    getCurrentUser()
    .then((loggedUser) => {
        setUser({ 
            username: loggedUser.username,
            email: loggedUser.email,
            id: loggedUser.id
        })
    })
    .catch((error) => {
        console.log(error)
    })
    
  }, [])
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for consuming the context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
