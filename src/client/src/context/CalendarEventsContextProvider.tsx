import { ReactNode, useContext, useMemo, useState } from "react";
import { MyMeal } from "../components/calendar/CalendarPage";
import { CalendarEventsContext } from "./CalendarEventsContext";

  
export const CalendarEventsContextProvider = ({ children }: { children: ReactNode }) => {
  const [myMeals, setMyMeals] = useState<MyMeal[]>([]);

  const value = useMemo(() => ({ myMeals, setMyMeals }), [myMeals]);

  return (
    <CalendarEventsContext.Provider value={value}>
      {children}
    </CalendarEventsContext.Provider>
  );
};

export const useCalendarEvents = () => {
  const context = useContext(CalendarEventsContext);
  if (!context) throw new Error("useCalendarEvents must be used within a CalendarEventsContextProvider");
  return context;
}