import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import axios from 'axios';

const localizer = momentLocalizer(moment);

interface MyMeal extends Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

interface Meal {
  id: number;
  name: string;
  startDate: number;
  endDate: number;
}

const DragAndDropCalendar = withDragAndDrop<MyMeal>(Calendar);
const CalendarPage = () => {

/*   async function fetchMealById(id: number): Promise<Meal> {
    const url = `http://localhost:4000/api/data/get/${id}`;
    try {
        const response = await axios.get<Meal>(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching meal:', error);
        throw new Error('Could not fetch meal');
    } 
  } */
  // Sample events data

  const [myMeals, setMyMeals] = useState<MyMeal[]>([]);

  const handleSelectSlot = useCallback( // add new event into the slot
    ({ start, end }: { start: Date; end: Date }) => {
      const title = window.prompt('New Event name');
    
        // Fetch data from the Express backend
        axios
          .post<{ rowID: number }>('http://localhost:4000/api/data', {
            start: start.toISOString(),
            end: end.toISOString(),
            title,
          })
          .then((response) => {
            if (title) {
              setMyMeals((prev) => [...prev, { start, end, title, id: response.data.rowID } as MyMeal]);
              console.log('Server response:', response.data.rowID);
            }
          })
          .catch((error) => {
            console.error('Error sending data:', error);
          });
      },
    [setMyMeals]
  );

   const handleSelectEvent = useCallback((event: MyMeal) => { // edit event

    console.log("Selected event ID:", event.id);
    console.log("Selected event title:", event.title);

    const newTitle = window.prompt("Edit Event Title", event.title);
    const newStartTime = window.prompt(
      "Edit Start Time (format HH:MM)",
      moment(event.start).format("HH:mm")
    );
    const newEndTime = window.prompt(
       "Edit End Time (format HH:MM)",
        moment(event.end).format("HH:mm")
    );

    if (newTitle && newStartTime && newEndTime) {
      const [startHours, startMinutes] = newStartTime.split(":").map(Number);
      const [endHours, endMinutes] = newEndTime.split(":").map(Number);

    axios
          .post('http://localhost:4000/api/data/update', {
            start: new Date(
              event.start.getFullYear(),
              event.start.getMonth(),
              event.start.getDate(),
              startHours,
              startMinutes),
            end: new Date(
              event.end.getFullYear(),
              event.end.getMonth(),
              event.end.getDate(),
              endHours,
              endMinutes
            ),
            title: newTitle,
            id: event.id
          })
          .then(() => {
            setMyMeals((prev) => prev.map(
              (mealItem) => mealItem.id === event.id 
              ?{
                ...mealItem,
                title: newTitle,
                start: new Date(
                  event.start.getFullYear(),
                  event.start.getMonth(),
                  event.start.getDate(),
                  startHours,
                  startMinutes
                ),
                end: new Date(
                  event.end.getFullYear(),
                  event.end.getMonth(),
                  event.end.getDate(),
                  endHours,
                  endMinutes
                ),
              }
            : mealItem
            ));
            console.log('Server response:');
            
          })
          .catch((error) => {
            console.error('Error sending data:', error);
          });
      }
    /* fetchMealById(event.id)
      .then((meal) => {
        const newTitle = window.prompt("Edit Event Title", event.title);
        const newStartTime = window.prompt(
          "Edit Start Time (format HH:MM)",
          moment(event.start).format("HH:mm")
        );
        const newEndTime = window.prompt(
          "Edit End Time (format HH:MM)",
          moment(event.end).format("HH:mm")
        );
        if (newTitle && newStartTime && newEndTime) {
          const [startHours, startMinutes] = newStartTime.split(":").map(Number);
          const [endHours, endMinutes] = newEndTime.split(":").map(Number);
    
          setMyMeals((prev) => prev.map(
            (mealItem) => mealItem.id === meal.id 
            ?{
              ...mealItem,
              title: newTitle,
              start: new Date(
                event.start.getFullYear(),
                event.start.getMonth(),
                event.start.getDate(),
                startHours,
                startMinutes
              ),
              end: new Date(
                event.end.getFullYear(),
                event.end.getMonth(),
                event.end.getDate(),
                endHours,
                endMinutes
              ),
            }
          : mealItem
          ));
        }
      return meal
      })
      .catch(); */
  }, []); 

  async function fetchMeals(): Promise<Meal[]> {
    try {
      const response = await axios.get<Meal[]>(
        'http://localhost:4000/api/data/getall'
      );
      return response.data; // The response data is an array of Meal
    } catch (error) {
      console.error('Error fetching meals:', error);
      throw new Error('Could not fetch meals');
    }
  }

  useEffect(() => {
    fetchMeals().then((fetchedMeals) => {
      setMyMeals(
        fetchedMeals.map((meal: Meal) => ({
          start: new Date(meal.startDate), // Ensure to format if needed
          end: new Date(meal.endDate), // Ensure to format if needed
          title: meal.name,
          id: meal.id,
        } as MyMeal))
      );

      console.log('setMeals');
    });
  }, [setMyMeals]);

  const handleEventDrop = (dropInfo: EventInteractionArgs<MyMeal>) => {
    // Handle the drop here, update your events state
    const { event, start, end } = dropInfo;
    console.log(event.title, start, end);
  };

  return (
      <div style={{ height: '80vh', padding: '20px' }}>
          <h2>Weekly Meal Planner</h2>
          <DragAndDropCalendar
            localizer={localizer}
            events={myMeals}
            startAccessor="start"
            endAccessor="end"
            defaultView="week" // Set default view to week
            views={['month', 'week', 'day']} // Enable only week and day views
            onEventDrop={handleEventDrop}
            style={{ height: 800 }}
            min={new Date(2024, 10, 29, 8, 0)} // 8 AM
            max={new Date(2024, 10, 29, 20, 0)} // 8 PM
            defaultDate={new Date()}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
          />
        </div>
  );
};

export default CalendarPage;
