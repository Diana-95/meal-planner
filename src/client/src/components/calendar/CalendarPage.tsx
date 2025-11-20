import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import * as dates from 'date-arithmetic';
// @ts-ignore - TimeGrid doesn't have TypeScript definitions
import TimeGrid from 'react-big-calendar/lib/TimeGrid';

import { Calendar, momentLocalizer, Event, Navigate, View } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../../styles/CalendarPage.css";

import { Dish } from '../../types/types';
import routes from '../../routes/routes';
import { useApi } from '../../context/ApiContextProvider';
import { useCalendarEvents } from '../../context/CalendarEventsContextProvider';

const localizer = momentLocalizer(moment);

const getRange = (date: Date, culture?: string) => {
  // Ensure culture is always a string (fallback to 'en-US' if undefined)
  let firstOfWeek = localizer.startOfWeek(culture ?? 'en-US');
  let start = dates.startOf(date, 'week', firstOfWeek);
  let end = dates.endOf(date, 'week', firstOfWeek);

  if (firstOfWeek === 1) {
    end = dates.subtract(end, 2, 'day');
  } else {
    start = dates.add(start, 1, 'day');
    end = dates.subtract(end, 1, 'day');
  }

  // Manually create the range array
  const range: Date[] = [];
  let current = new Date(start);
  while (current <= end) {
    range.push(new Date(current));
    current = dates.add(current, 1, 'day');
  }
  return range;
}
const EVENT_COLORS = [
  'calendar-event--blue',
  'calendar-event--green',
  'calendar-event--purple',
  'calendar-event--pink',
  'calendar-event--orange',
];

const getEventColorClass = (id: number) =>
  EVENT_COLORS[id % EVENT_COLORS.length];

const CustomEvent = ({ event }: { event: MyMeal }) => (
  <div className={`calendar-event-card ${getEventColorClass(event.id)}`}>
    <div className="calendar-event-title">{event.title}</div>
    {event.dish?.name && (
      <div className="calendar-event-dish">{event.dish.name}</div>
    )}
  </div>
);

export interface MyMeal extends Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  dish?: Dish | null;
}
const DragAndDropCalendar = withDragAndDrop<MyMeal>(Calendar);

interface MyWeekProps {
  date: Date;
  culture?: string;
  [key: string]: any;
}

class MyWeek extends React.Component<MyWeekProps> {
  static navigate(date: Date, action: string): Date {
    switch (action){
      case Navigate.PREVIOUS:
        return dates.add(date, -1, 'week');
      case Navigate.NEXT:
        return dates.add(date, 1, 'week');
      default:
        return date;
    }
  }

  static title(date: Date, options: { formats?: any; culture?: string }): string {
    return `My awesome week: ${date.toLocaleDateString()}`;
  }

  render() {
    let { date, culture } = this.props;
    let range = getRange(date, culture);

    return (
      <TimeGrid {...this.props} range={range} eventOffset={15} />
    );
  }
}

const CalendarPage = () => {

  const { myMeals, setMyMeals } = useCalendarEvents();
  const navigate = useNavigate();
  const { api } = useApi();
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

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

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleDrillDown = useCallback((date: Date) => {
    const startOfWeek = localizer.startOf(date, 'week' as any);
    setCurrentDate(startOfWeek);
    setCurrentView('agenda');
  }, []);

  const formats = {
    agendaTimeRangeFormat: () => '',
    agendaTimeFormat: () => '',
    eventTimeRangeFormat: () => '',
  };

  return (
      <div className="mt-16">
        <h2>Weekly Meal Planner</h2>
        <DragAndDropCalendar
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          localizer={localizer}
          events={myMeals}
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          defaultView='month'
          views={{ month: true, agenda: true }}// Enable only week and day views
          onEventDrop={handleEventDrop}
          resizable
          onEventResize={handleResizeEvent}                                                               
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          allDayAccessor={(event) => event.allDay || true}
          components={{
            event: CustomEvent, // Use the custom event component
          }}
          onShowMore={(events: MyMeal[], date: Date) => console.log(events, date)}
          step={60}
          onDrillDown={handleDrillDown}
          drilldownView="week"
          formats={formats}
        />
        
        <Outlet />
      </div>
  );
};

export default CalendarPage;