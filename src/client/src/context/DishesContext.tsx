import { createContext } from "react";
import { Dish } from "../types/types";

interface DishesContextType {
    dishes: Dish[]; 
    setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  }
  
 export const DishesContext = createContext< DishesContextType | undefined >(undefined);