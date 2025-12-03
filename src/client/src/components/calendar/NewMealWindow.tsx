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
  const [selectedDishes, setSelectedDishes] = useState<Dish[]>([]);
  const [tempDish, setTempDish] = useState<Dish | null>(null); // Temporary selection before adding to list

  useEffect(() => {
    const preloadDish = async () => {
      if (!stateDishId) return;
      if (selectedDishes.some(d => d.id === stateDishId)) return;
      try {
        const dish = await api.dishes.getById(stateDishId);
        if (dish) {
          setSelectedDishes([dish]);
          setTitle((prev) => (prev ? prev : dish.name));
        }
      } catch (error) {
        console.error(`Unable to load dish ${stateDishId}`, error);
      }
    };
    preloadDish();
  }, [api.dishes.getById, stateDishId, selectedDishes]);

  useEffect(() => {
    const hydrateDish = async () => {
      if (!tempDish?.id) return;
      if (tempDish.ingredientList && tempDish.ingredientList.length > 0) return;
      try {
        const fullDish = await api.dishes.getById(tempDish.id);
        if (fullDish) {
          setTempDish(fullDish);
        }
      } catch (error) {
        console.error(`Unable to load dish ${tempDish.id}`, error);
      }
    };
    hydrateDish();
  }, [api.dishes.getById, tempDish]);

  const handleAddDish = () => {
    if (tempDish && !selectedDishes.some(d => d.id === tempDish.id)) {
      setSelectedDishes([...selectedDishes, tempDish]);
      setTempDish(null);
    }
  };

  const handleRemoveDish = (dishId: number) => {
    setSelectedDishes(selectedDishes.filter(d => d.id !== dishId));
  };

  const handleSave = async () => {
   
    if(!title || !start || !end) {
      toastInfo('Please fill in all fields before saving.');
      return;
    }
        
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0 ,0, 0);
    const dishIds = selectedDishes.map(d => d.id);
    const response = await api.meals.create(title, start.toISOString(), end.toISOString(), dishIds);

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
        dishes: selectedDishes
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
                        Dishes (Optional)
                    </label>
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Autocomplete<Dish>
                                    data={tempDish} 
                                    setData={setTempDish} 
                                    fetchAllSuggestions={api.dishes.get}
                                    CustomComponent={DishAutocomplete}
                                    removeData={() => setTempDish(null)}
                                    getEditLink={(dish) => routes.editDish(dish.id)}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddDish}
                                disabled={!tempDish || selectedDishes.some(d => d.id === tempDish.id)}
                                className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                Add
                            </button>
                        </div>
                        {selectedDishes.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {selectedDishes.map((dish) => (
                                    <div key={dish.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                                        <span className="text-sm text-gray-900">{dish.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDish(dish.id)}
                                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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