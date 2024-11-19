import React, { useState } from 'react';
import { useNavigate, useLocation, useRevalidator } from 'react-router-dom';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { createMeal } from '../../Apis/mealsApi';

import classes from './NewMeal.module.css';
import routes from '../../routes/routes';

const NewMeal = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const state = location.state as {start: string, end: string};

  const [title, setTitle] = useState<string>("");
  const [start, setStart] = useState<Date | null>(new Date(state.start));
  const [end, setEnd] = useState<Date | null>(new Date(state.end));

  const handleSave = () => {
    if (title && start && end) {
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0 ,0, 0);
      createMeal(start.toISOString(), end.toISOString(), title)
      .then((response) => {
            //  setMyMeals((prev) => [...prev, { start, end, title, id: response.rowID } as MyMeal]);
        console.log('save new event', response.rowID);
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
    return (
      <div className={classes.overlay}>
        <div className={classes.modal_window}>
        
          <h2>New Event</h2>
          {(
            <div>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Title:
                  <input
                    type="text"
                    value={title}
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
              </div>
            </div>
          )}
          </div>
        </div>
      );
}
export default NewMeal;