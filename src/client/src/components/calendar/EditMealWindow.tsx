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
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
    >
      <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Meal</h2>
        
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
        
        <div className="mt-6 flex justify-between space-x-3">
            <button 
                onClick={handleSave} 
                disabled={loading || (!title || !start || !end)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
                {loading ? 'Submitting' : 'Save'}
            </button>
            <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
                Delete
            </button>
            <button 
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
}
export default EditMealWindow;