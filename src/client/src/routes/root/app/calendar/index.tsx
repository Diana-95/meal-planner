import React from 'react';
import CalendarPage from '../../../../components/calendar/CalendarPage';
import { CalendarEventsContextProvider } from '../../../../context/CalendarEventsContextProvider';

const Calendar = () => {
  
  return (
    <CalendarEventsContextProvider>
      <CalendarPage />
    </CalendarEventsContextProvider>
    
  )
}

export default Calendar;
