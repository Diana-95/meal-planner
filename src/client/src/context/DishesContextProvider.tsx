import { createContext, ReactNode, useContext, useState } from "react";
import { MyMeal } from "../components/calendar/CalendarPage";
import { Dish } from "../types/types";

interface Dishes {
    dishes: Dish[]; 
    setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  }
  
  const DishesContext = createContext< Dishes | undefined >(undefined);
  
  export const DishesContextProvider = ({ children }: { children: ReactNode }) => {
    const [dishes, setDishes] = useState<Dish[]>([]);
    return (
      <DishesContext.Provider value={{ dishes, setDishes }}>
        {children}
      </DishesContext.Provider>
    );
  };
  
  export const useDishes = () => {
    const context = useContext(DishesContext);
    if (!context) throw new Error("useDishes must be used within a DishesProvider");
    return context;
  }