import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import classes from '../../styles/NewMeal.module.css';
import routes from '../../routes/routes';
import DishAutocomplete from './DishAutocomplete';
import { Dish } from '../../types/types';
import Autocomplete from '../common/Autocomplete';
import { useApi } from '../../context/ApiContextProvider';
import { useCalendarEvents } from '../../context/CalendarEventsContextProvider';
import { toastError, toastInfo } from '../common/toastService';

const EditMealWindow = () => {

  const navigate = useNavigate();
  const{ api, loading } = useApi();
  const { id } = useParams<{ id: string }>();
  const { setMyMeals } = useCalendarEvents();
  const [title, setTitle] = useState<string>('');
  const [start, setStart] = useState<Date | null>();
  const [end, setEnd] = useState<Date | null>();
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  
  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const meal = await api.meals.getById(Number(id));
        if(meal) {
          setTitle(meal.name);
          setStart(new Date(meal.startDate));
          setEnd(new Date(meal.endDate));
          setSelectedDish(meal.dish);
        }
        else {
          console.error("Meal not found");
          navigate(routes.calendar);
        }
      } catch (error) {
        console.error("Error fetching meal:", error);
      }
    };
  
    fetchMeal();
  }, [api.meals.getById, id]); // Include 'id' in the dependency array if it can change

  const handleSave = async () => {
    if(!title || !start || !end) {
      toastError('Please fill in all fields before saving.');
      return;
    }
    const response = await api.meals.update(Number(id), start.toISOString(), end.toISOString(), title, selectedDish? selectedDish.id: undefined)
    if(!response) {
      toastError('Failed to update meal. Please try again.');
      return;
    }
    toastInfo(`${title} was updated`);
    setMyMeals((prev) => 
      prev.map((item) => 
        item.id === Number(id) ? 
        {...item, title, start, end, dish: selectedDish } : item
      ));
    navigate(routes.calendar);
  } 

  const handleClose = () => {
    navigate(routes.calendar);
  }

  const handleDelete = async () => {
    const response = await api.meals.delete(Number(id));
    if(!response) { 
      toastError('Failed to delete meal. Please try again.');
      return;
    }
    toastInfo(`${title} was deleted`);
    setMyMeals((prev) => (
      prev.filter((item) => item.id !== Number(id))
    ))
    navigate(routes.calendar);
  }

  return (
    <div className={classes.overlay} onClick={handleClose}>
      <div className={classes.modal_window} onClick={(e) => e.stopPropagation()}>
        <h2>Edit Meal</h2>
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
                Start:
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
                End:
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
              <button onClick={handleSave} disabled={loading || (!title || !start || !end)} style={{ padding: "10px 20px" }} >
                {loading ? 'Submitting' : 'Save'}
              </button>
              <button onClick={handleClose} style={{ padding: "10px 20px" }}>
                Cancel
              </button>
              <button onClick={handleDelete} style={{ padding: "10px 20px" }}>
                Delete meal
              </button>

            </div>
          </div>
        )}
        </div>
      </div>
    );
}
export default EditMealWindow;