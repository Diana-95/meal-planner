import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Outlet, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';

import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { getAllMeals, updateMeal } from '../Apis/mealsApi';
import { Meal } from '../types/types';
import routes from './routes';
import DishesContext from '../store/dishes-context';

const CustomEvent = ({ event }: { event: any }) => {
  return (
    <div>
      <strong>{event.title}</strong>
      {event.dishName && (
        <div style={{ fontSize: '0.8em', color: '#111' }}>{event.dishName}</div>
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
  dishName: string
}

const DragAndDropCalendar = withDragAndDrop<MyMeal>(Calendar);
const localizer = momentLocalizer(moment);

const CalendarPage = () => {

  const dishesCtx = useContext(DishesContext);
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const loadedMeals = useLoaderData() as Meal[];
  const loadedMyMeals: MyMeal[] = loadedMeals.map((meal) => ({
    id: meal.id,
    title: meal.name,
    start: new Date(meal.startDate),
    end: new Date(meal.endDate),
    allDay: true,
    dishName: dishesCtx.
  }));

  const [myMeals, setMyMeals] = useState(loadedMyMeals);
  const defaultDate = new Date();
  defaultDate.setHours(0, 0, 0, 0);

  useEffect(() => {
    // Optionally revalidate on certain conditions, or after editing
    // e.g., re-fetch data after saving to backend
    revalidator.revalidate();
  }, [myMeals]);

  console.log('loaded meals:', loadedMeals);
  const handleSelectSlot = useCallback( // add new event into the slot
    ({ start, end }: { start: Date; end: Date }) => {

      const timeToPass = {
        start: start.toISOString(),
        end: end.toISOString(),
      };
      // Navigate with state
      navigate(routes.newMeal, { state: timeToPass });
    },
    []
  );

   const handleSelectEvent = useCallback((event: MyMeal) => { // edit event

    console.log("Selected event ID:", event.id);
    console.log("Selected event title:", event.title);

    navigate(routes.editMeal(event.id, event.start.toISOString(), event.end.toISOString(), event.title));

     }, []); 

  const handleEventDrop = (dropInfo: EventInteractionArgs<MyMeal>) => {
    // Handle the drop here, update your events state
    const { event, start, end } = dropInfo;

    const startStr = start instanceof Date ? start.toISOString() :start;
    const endStr = end instanceof Date ? end.toISOString() : end;

    navigate(routes.editMeal(event.id, startStr, endStr, event.title));
  };

  const handleResizeEvent = (dropInfo: EventInteractionArgs<MyMeal>) => {
    const { event, start, end } = dropInfo;
    const startStr = start instanceof Date ? start.toISOString() :start;
    const endStr = end instanceof Date ? end.toISOString() : end;

    updateMeal(startStr, endStr, event.title, event.id)
        .then(() => {
          setMyMeals((prev) => prev.map(
            (mealItem) => mealItem.id === event.id 
            ?{
              ...mealItem,
              title: event.title,
              start: new Date(startStr),
              end: new Date(endStr),
            }
          : mealItem
          ));
          console.log('Server response:');
          console.log(event.start);
        })
        .catch((error) => {
          console.error('Error sending data:', error);
        });
    console.log(event.title, start, end);
  };

  return (
    <div style={{ height: '80vh', padding: '20px' }}>
      <h2>Weekly Meal Planner</h2>
      <DragAndDropCalendar
        localizer={localizer}
        events={loadedMyMeals}
        defaultView='month' // Set default view to week
        views={['month']} // Enable only week and day views
        onEventDrop={handleEventDrop}
        resizable
        onEventResize={handleResizeEvent}
        style={{ height: 800 }}
        // defaultDate={defaultDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        allDayAccessor={(event) => event.allDay || true}
        components={{
          event: CustomEvent, // Use the custom event component
        }}
        // toolbar={true} // Keep toolbar
        // components={{
        //   toolbar: MyCustomToolbar // Your custom toolbar component
        // }}
      />
      
      <Outlet />
      
    </div>
  );
};

export default CalendarPage;
export const mealsLoader = async (): Promise<Meal[]> => {
  return getAllMeals()
    .then((fetchedMeals) => {
      // setMyMeals(
      //   fetchedMeals.map((meal: Meal) => ({
      //     start: new Date(meal.startDate), // Ensure to format if needed
      //     end: new Date(meal.endDate), // Ensure to format if needed
      //     title: meal.name,
      //     id: meal.id,
      //   } as MyMeal))
      // );
      console.log('setMeals');
      return fetchedMeals;
      
    })
    .catch((error) => {
      console.error('Error fetching meals:', error);
      throw new Error('Could not fetch meals');
    });
}