import React, { useContext, useState } from 'react';
import { useNavigate, useRevalidator, useParams } from 'react-router-dom';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { deleteMeal, updateMeal } from '../../Apis/mealsApi';

import classes from './NewMeal.module.css';
import routes from '../../routes/routes';
import DishesContext from '../../store/dishes-context';

const EditMeal = () => {

  const dishesCtx = useContext(DishesContext);
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const { id, startTime, endTime, title } = 
  useParams<{ id: string, startTime: string, endTime: string, title: string }>();
  
  const [eventTitle, setTitle] = useState<string>(title || '');
  const [start, setStart] = useState<Date | null>(new Date(startTime || ''));
  const [end, setEnd] = useState<Date | null>(new Date(endTime || ''));

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
export default EditMeal;