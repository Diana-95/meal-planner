import React, { ReactNode, useCallback, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { Dish } from '../../types/types';
import routes from '../../routes/routes';
import { useApi } from '../../context/ApiContextProvider';
import { useCalendarEvents } from '../../context/CalendarEventsContextProvider';

const CustomEvent = ({ event }: { event: any }) => {
  return (
    <div>
      <strong>{event.title}</strong>
      {event.dish?.name && (
        <div style={{ fontSize: '0.8em', color: '#111' }}>{event.dish?.name}</div>
      )}
      {event.location && (
        <div style={{ fontSize: '0.8em', color: '#888' }}>📍 {event.location}</div>
      )}
    </div>
  );
};

export interface MyMeal extends Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  dish?: Dish | null;
}
const DragAndDropCalendar = withDragAndDrop<MyMeal>(Calendar);
const localizer = momentLocalizer(moment);

const CalendarPage = () => {

  const { myMeals, setMyMeals } = useCalendarEvents();
  const navigate = useNavigate();
  const { api } = useApi();

  const defaultDate = new Date();
  defaultDate.setHours(0, 0, 0, 0);

  useEffect(() => {
    const loadMeals = async () => {
    
      const loadedMeals = await api.meals.get();
      if(loadedMeals) {
        const loadedMyMeals = loadedMeals.map((meal) => ({
          id: meal.id,
          title: meal.name,
          start: new Date(meal.startDate),
          end: new Date(meal.endDate),
          allDay: true,
          dish: meal.dish
        } as MyMeal));
        setMyMeals(loadedMyMeals);
      }
    }
    loadMeals();

  }, [ api.meals.get ]);

  const handleSelectSlot = useCallback( // add new event into the slot
    ({ start, end }: { start: Date; end: Date }) => {
      const timeToPass = {
        start: start.toISOString(),
        end: end.toISOString(),
      };
      // Navigate with state
      navigate(routes.newMeal, { state: timeToPass });
    }, [navigate]
  );

   const handleSelectEvent = useCallback((event: MyMeal) => { // edit event

    console.log("Selected event ID:", event.id);
    console.log("Selected event title:", event.title);

    navigate(routes.editMeal(event.id));

     }, [navigate]); 

  const handleEventDrop = async (dropInfo: EventInteractionArgs<MyMeal>) => {
    // Handle the drop here, update your events state
    const { event, start, end } = dropInfo;

    const startStr = start instanceof Date ? start.toISOString() :start;
    const endStr = end instanceof Date ? end.toISOString() : end;

    setMyMeals((prev: MyMeal[]) => prev.map((prevEvent) => 
      event.id === prevEvent.id 
        ? ({...prevEvent, start, end} as MyMeal)
        : prevEvent
      ));
    await api.meals.updatePart(event.id, startStr, endStr);
    
  };

  const handleResizeEvent = async (dropInfo: EventInteractionArgs<MyMeal>) => {
    const { event, start, end } = dropInfo;
    const startStr = start instanceof Date ? start.toISOString() :start;
    const endStr = end instanceof Date ? end.toISOString() : end;

    await api.meals.updatePart(event.id, startStr, endStr);
    setMyMeals((prev: MyMeal[]) => prev.map(
            (mealItem) => mealItem.id === event.id 
            ?{
              ...mealItem,
              start,
              end,
            } as MyMeal
          : mealItem
          ));
    console.log(event.title, start, end);
  };

  return (
      <div style={{ height: '80vh', padding: '20px' }}>
        <h2>Weekly Meal Planner</h2>
        <DragAndDropCalendar
          localizer={localizer}
          events={myMeals}
          defaultView='month' // Set default view to week
          views={['month']} // Enable only week and day views
          onEventDrop={handleEventDrop}
          resizable
          onEventResize={handleResizeEvent}
          style={{ height: 800 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          allDayAccessor={(event) => event.allDay || true}
          components={{
            event: CustomEvent, // Use the custom event component
          }}
        />
        
        <Outlet />
      </div>
  );
};

export default CalendarPage;