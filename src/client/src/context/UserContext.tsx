import { createContext } from "react";
import { User } from "../types/types";

export interface UserContextType {
  user: User | null; // The current user (null if not logged in)
  setUser: (user: User | null) => void; // Function to update the user
  isDemoMode: boolean; // Whether the current user is the demo account
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
