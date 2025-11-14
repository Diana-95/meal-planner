import { createContext } from "react";
import { MyMeal } from "../components/calendar/CalendarPage";

interface CalendarEventsContextType {
    myMeals: MyMeal[]; 
    setMyMeals: React.Dispatch<React.SetStateAction<MyMeal[]>>;
  }
  
 export const CalendarEventsContext = createContext<CalendarEventsContextType | undefined>(undefined);