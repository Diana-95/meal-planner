import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import classes from '../../styles/NewMeal.module.css';
import routes from '../../routes/routes';
import DishAutocomplete from './DishAutocomplete';
import { Dish } from '../../types/types';
import Autocomplete from '../common/Autocomplete';
import { useApi } from '../../context/ApiContextProvider';
import { useCalendarEvents } from '../../context/CalendarEventsContextProvider';
import { MyMeal } from './CalendarPage';

const NewMealWindow = () => {
  const navigate = useNavigate();
  const{ api } = useApi();
  const location = useLocation();
  const { setMyMeals } = useCalendarEvents();
  const state = location.state as {start: string, end: string};
  const [title, setTitle] = useState<string>("");
  const [start, setStart] = useState<Date | null>(new Date(state.start));
  const [end, setEnd] = useState<Date | null>(new Date(state.end));
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  
  const handleSave = async () => {
    if (title && start && end) {
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0 ,0, 0);
      console.log('selecteddish', selectedDish);
      const response = await api.meals.create(title, start.toISOString(), end.toISOString(), selectedDish?.id);
      if(response) {
        console.log('save new event', response.rowID);
        setMyMeals((prev: MyMeal[]) => 
        [...prev,
          {
            id: response.rowID,
            title,
            start,
            end,
            dish: selectedDish
          } satisfies MyMeal
        ]
        )
        navigate(routes.calendar);
      }
       
    }
  };
    const handleClose = () => {
      navigate(routes.calendar);
    }
    return (
      <div className={classes.overlay}>
        <div className={classes.modal_window}>
        
          <h2>New Event</h2>
          {(
            <div>
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor='title'>
                  Title
                </label>
                <input
                  id='title'
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", padding: "5px", marginTop: "5px" }}
                />
                
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor='start'>
                  Start
                </label>
                <DatePicker
                  id='start'
                  selected={start}
                  onChange={(date: Date | null) => setStart(date)}
                  dateFormat="yyyy-MM-dd"
            
                />
                
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor='end'>
                  End
                </label>
                <DatePicker
                  id='end'
                  selected={end}
                  onChange={(date: Date | null) => setEnd(date)}
                  dateFormat="yyyy-MM-dd"
                />
                
              </div>
              <Autocomplete<Dish>
                data={selectedDish} setData={setSelectedDish} 
                fetchAllSuggestions={api.dishes.get}
                CustomComponent={DishAutocomplete}
               />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={handleSave} style={{ padding: "10px 20px" }}>
                  Save
                </button>
                <button onClick={handleClose} style={{ padding: "10px 20px" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      );
}
export default NewMealWindow;