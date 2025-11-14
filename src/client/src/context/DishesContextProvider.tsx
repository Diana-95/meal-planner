import { ReactNode, useContext, useState } from "react";
import { Dish } from "../types/types";
import { DishesContext } from "./DishesContext";
  
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