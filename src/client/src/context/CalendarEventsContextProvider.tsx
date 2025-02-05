import { createContext, ReactNode, useContext, useState } from "react";
import { MyMeal } from "../components/calendar/CalendarPage";

interface MyMealEvents {
    myMeals: MyMeal[]; 
    setMyMeals: React.Dispatch<React.SetStateAction<MyMeal[]>>;
  }
  
  const CalendarEventsContext = createContext< MyMealEvents | undefined >(undefined);
  
  export const CalendarEventsContextProvider = ({ children }: { children: ReactNode }) => {
    const [myMeals, setMyMeals] = useState<MyMeal[]>([]);
    return (
      <CalendarEventsContext.Provider value={{ myMeals, setMyMeals }}>
        {children}
      </CalendarEventsContext.Provider>
    );
  };
  
  export const useCalendarEvents = () => {
    const context = useContext(CalendarEventsContext);
    if (!context) throw new Error("useCount must be used within a CountProvider");
    return context;
  }