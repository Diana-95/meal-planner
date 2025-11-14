import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import classes from '../../styles/NewMeal.module.css';
import routes from '../../routes/routes';
import { useDishes } from '../../context/DishesContextProvider';
import { Dish } from '../../types/types';
import { useApi } from '../../context/ApiContextProvider';
import { toastError, toastInfo } from '../common/toastService';


const NewDishWindow = () => {

  const navigate = useNavigate();
  const { api, loading } = useApi();
  const { setDishes } = useDishes();
  const [name, setName] = useState('');
  const [recipe, setRecipe] = useState('');
  const [imageUrl, setImage] = useState('');

  const onClickSaveHandle = async () => {
    if(name === '' || recipe === ''){
        toastError('Please fill in all fields before saving.');
        return;
    }
    const response = await api.dishes.create(name, recipe, imageUrl);
    if(response !== undefined){
        toastInfo(`New dish "${name}" was created`);
        setDishes((prevDishes) => 
            [...prevDishes, ({ id: response.rowID, name, recipe, imageUrl} as Dish)]
        )
        navigate(routes.dishes);
    }   
  }

    const onCloseHandle = () => {
        navigate(routes.dishes);
    }
    return (
        <div 
            data-testid="overlay" 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onCloseHandle}
        >
            <div 
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create new dish recipe</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter dish name"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recipe
                        </label>
                        <textarea
                            value={recipe}
                            onChange={(e) => setRecipe(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter recipe instructions"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                        </label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImage(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter image URL"
                        />
                    </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                    <button 
                        onClick={onCloseHandle}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onClickSaveHandle} 
                        disabled={loading}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewDishWindow;
