import React, { useEffect, useState } from 'react';
import { useNavigate, useRevalidator, useParams } from 'react-router-dom';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { deleteMeal, updateDishoftheMeal, updateMeal } from '../../apis/mealsApi';

import classes from '../../styles/EditDish.module.css';
import routes from '../../routes/routes';
import DishAutocomplete from './DishAutocomplete';
import { Dish } from '../../types/types';
import { getAllSuggestedDishes, getDishById } from '../../apis/dishesApi';
import Autocomplete from '../common/Autocomplete';

const EditMealWindow = () => {

  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const { id, startTime, endTime, title, dish } = 
  useParams<{ id: string, startTime: string, endTime: string, title: string, dish: string }>();
  
  const [eventTitle, setTitle] = useState<string>(title || '');
  const [start, setStart] = useState<Date | null>(new Date(startTime || ''));
  const [end, setEnd] = useState<Date | null>(new Date(endTime || ''));
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  
  useEffect(() => {
    if(selectedDish)
        updateDishoftheMeal(selectedDish?.id, Number(id));
  }, [selectedDish]);
  
  useEffect(() => {
    if(dish)
        getDishById(Number(dish))
        .then(setSelectedDish)
        .catch((error) => {throw new Error(error)});
    
  }, [])

  const handleSave = () => {
    if (eventTitle && start && end) {
      updateMeal(start.toISOString(), end.toISOString(), eventTitle, Number(id))
      .then((response) => {

        revalidator.revalidate();
            //  setMyMeals((prev) => [...prev, { start, end, title, id: response.rowID } as MyMeal]);
        console.log('edit event', response);
        navigate(routes.calendar);
      })
      .catch((error) => {
        console.error('Error sending data:', error);
        // navigate('/', {state: {shouldRefresh: false}});
      });
    }
  };

    const handleClose = () => {
      navigate(routes.calendar);
    }

    const handleDelete = () => {
      deleteMeal(Number(id))
      .then(() => {
        navigate(routes.calendar);
      })
      .catch((error) => {
        throw new Error(error);
      })
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
                fetchAllSuggestions={getAllSuggestedDishes}
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