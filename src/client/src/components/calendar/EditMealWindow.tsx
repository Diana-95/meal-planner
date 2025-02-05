import React, { useEffect, useState } from 'react';
import { useNavigate, useRevalidator, useParams } from 'react-router-dom';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { deleteMeal, getMealById, updateMeal, updateMealPart } from '../../apis/mealsApi';

import classes from '../../styles/NewMeal.module.css';
import routes from '../../routes/routes';
import DishAutocomplete from './DishAutocomplete';
import { Dish, Meal } from '../../types/types';
import { getAllDishes} from '../../apis/dishesApi';
import Autocomplete from '../common/Autocomplete';
import { useApi } from '../../context/ApiContextProvider';
import { useCalendarEvents } from '../../context/CalendarEventsContextProvider';
import { MyMeal } from './CalendarPage';

const EditMealWindow = () => {

  const navigate = useNavigate();
  const{ api } = useApi();
  const { id } = useParams<{ id: string }>();
  const {myMeals, setMyMeals} = useCalendarEvents();
  const [eventTitle, setTitle] = useState<string>('');
  const [start, setStart] = useState<Date | null>();
  const [end, setEnd] = useState<Date | null>();
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  
  useEffect(() => {
    const updateMeal = async () => {
    if(selectedDish){
        await api.meals.updatePart(Number(id), undefined, undefined, undefined, selectedDish?.id);
        console.log('updatePart', selectedDish);
        setMyMeals((prev) => 
          prev.map((item) => 
          item.id === Number(id) ? {...item, dish: selectedDish } : item
          ));
    }
  }
  updateMeal();
  }, [selectedDish]);
  
  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const meal = await api.meals.getById(Number(id));
        if(meal) {
          setTitle(meal.name);
          setStart(new Date(meal.startDate));
          setEnd(new Date(meal.endDate));
          console.log('dish:', meal.dish);
          setSelectedDish(meal.dish);
        }
      } catch (error) {
        console.error("Error fetching meal:", error);
        // Handle the error (e.g., set an error state)
      }
    };
  
    fetchMeal();
  }, [id]); // Include 'id' in the dependency array if it can change
  

  const handleSave = async () => {
    if (eventTitle && start && end) {
      const response = await api.meals.update(Number(id), start.toISOString(), end.toISOString(), eventTitle, selectedDish? selectedDish.id: undefined)
      if(response !== undefined) {
        
        console.log('edit event', response, selectedDish);
        setMyMeals((prev) => 
          prev.map((item) => 
          item.id === Number(id) ? 
            {...item, 
              title: eventTitle,
                start,
                end,
              dish: selectedDish 
            } : item
          ));
        console.log(myMeals)
        navigate(routes.calendar);
      }
    }
  };

    const handleClose = () => {
      navigate(routes.calendar);
    }

    const handleDelete = async () => {
      const response = await api.meals.delete(Number(id));
      if(response !== undefined) {
        setMyMeals((prev) => (
          prev.filter((item) => item.id !== Number(id))
        ))
        navigate(routes.calendar);
      }
    }
    return (
      <div className={classes.overlay}>
        <div className={classes.modal_window}>
        
          <h2>Edit Meal</h2>
          {(
            <div>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Title:
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: "100%", padding: "5px", marginTop: "5px" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Start:
                  <DatePicker
                    selected={start}
                    onChange={(date: Date | null) => setStart(date)}
                    dateFormat="yyyy-MM-dd"
              
                  />
                </label>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  End:
                  <DatePicker
                    selected={end}
                    onChange={(date: Date | null) => setEnd(date)}
                    dateFormat="yyyy-MM-dd"
                
                  />
                </label>
              </div>
              <Autocomplete<Dish>
                data={selectedDish} setData={setSelectedDish} 
                fetchAllSuggestions={getAllDishes}
                CustomComponent={DishAutocomplete}
               />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={handleSave} style={{ padding: "10px 20px" }}>
                  Save
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