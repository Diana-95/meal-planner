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
import { toastInfo } from '../common/toastService';

const NewMealWindow = () => {
  const navigate = useNavigate();
  const{ api, loading } = useApi();
  const location = useLocation();
  const { setMyMeals } = useCalendarEvents();
  const state = location.state as {start: string, end: string};
  const [title, setTitle] = useState<string>("");
  const [start, setStart] = useState<Date | null>(new Date(state.start));
  const [end, setEnd] = useState<Date | null>(new Date(state.end));
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const handleSave = async () => {
   
    if(!title || !start || !end) {
      toastInfo('Please fill in all fields before saving.');
      return;
    }
        
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0 ,0, 0);
    const response = await api.meals.create(title, start.toISOString(), end.toISOString(), selectedDish?.id);

    if(!response) {
      toastInfo('Failed to create meal. Please try again.');
      return;
    }

    toastInfo(`New meal "${title}" was created`);
    setMyMeals((prev: MyMeal[]) => 
    [...prev,
      {
        id: response.rowID,
        title,
        start,
        end,
        dish: selectedDish
      } satisfies MyMeal
    ])

    navigate(routes.calendar);
  };

  const handleClose = () => {
    navigate(routes.calendar);
  }
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
    >
        <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
        >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Meal Event</h2>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor='title' className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                    </label>
                    <input
                        id='title'
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter meal title"
                    />
                </div>
                
                <div>
                    <label htmlFor='start' className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                    </label>
                    <DatePicker
                        id='start'
                        selected={start}
                        onChange={(date: Date | null) => setStart(date)}
                        dateFormat="yyyy-MM-dd"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                
                <div>
                    <label htmlFor='end' className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                    </label>
                    <DatePicker
                        id='end'
                        selected={end}
                        onChange={(date: Date | null) => setEnd(date)}
                        dateFormat="yyyy-MM-dd"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dish (Optional)
                    </label>
                    <Autocomplete<Dish>
                        data={selectedDish} 
                        setData={setSelectedDish} 
                        fetchAllSuggestions={api.dishes.get}
                        CustomComponent={DishAutocomplete}
                    />
                </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
                <button 
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {loading ? "Submitting..." : "Save"}
                </button>
            </div>
        </div> 
    </div>
  )}

export default NewMealWindow;