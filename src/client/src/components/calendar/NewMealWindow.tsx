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
  type NewMealState = { start?: string; end?: string; dishId?: number; dishName?: string } | null;
  const state = (location.state as NewMealState) ?? null;
  const stateDishId = state?.dishId;
  const stateDishName = state?.dishName;

  const getInitialDate = (dateString?: string) => {
    if (!dateString) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) {
      const fallback = new Date();
      fallback.setHours(0, 0, 0, 0);
      return fallback;
    }
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  };

  const initialStart = getInitialDate(state?.start);
  const initialEnd = state?.end ? getInitialDate(state.end) : new Date(initialStart);

  const [title, setTitle] = useState<string>(stateDishName ?? "");
  const [start, setStart] = useState<Date | null>(initialStart);
  const [end, setEnd] = useState<Date | null>(initialEnd);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const hasDish = !!selectedDish;

  useEffect(() => {
    const preloadDish = async () => {
      if (!stateDishId) return;
      if (selectedDish?.id === stateDishId) return;
      try {
        const dish = await api.dishes.getById(stateDishId);
        if (dish) {
          setSelectedDish(dish);
          setTitle((prev) => (prev ? prev : dish.name));
        }
      } catch (error) {
        console.error(`Unable to load dish ${stateDishId}`, error);
      }
    };
    preloadDish();
  }, [api.dishes.getById, selectedDish, stateDishId]);

  useEffect(() => {
    const hydrateDish = async () => {
      if (!selectedDish?.id) return;
      if (selectedDish.ingredientList && selectedDish.ingredientList.length > 0) return;
      try {
        const fullDish = await api.dishes.getById(selectedDish.id);
        if (fullDish) {
          setSelectedDish(fullDish);
        }
      } catch (error) {
        console.error(`Unable to load dish ${selectedDish.id}`, error);
      }
    };
    hydrateDish();
  }, [api.dishes.getById, selectedDish]);

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
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh]"
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
                        removeData={() => setSelectedDish(null)}
                        getEditLink={(dish) => `${routes.dishes}/${routes.editDish(dish.id)}`}
                    />
                {hasDish && (
                  <button
                    type="button"
                    onClick={() => setSelectedDish(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove dish
                  </button>
                )}
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