import React, { useEffect, useState } from 'react';
import { Outlet, useLoaderData, useNavigate, useRevalidator } from "react-router-dom"

import { Dish } from '../../types/types';
import styles from './Dishes.module.css';
import routes from '../../routes/routes';
import { useApi } from '../../context/ApiContextProvider';
import { useDishes } from '../../context/DishesContextProvider';

const DishList = () => {

    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const { api } = useApi();

      const { dishes, setDishes } = useDishes();
    
      useEffect(() => {
        const fetchDishes = async () => {
          const fetchedDishes = await api.dishes.get();
          if(fetchedDishes)
            setDishes(fetchedDishes);
        }
        fetchDishes();
      }, []);

      const addDish = () => {
         navigate(routes.newDish);
      };
    
      const editDish = (id: number) => {
        navigate(routes.editDish(id));
      };

      const viewRecipe = (id: number) => {
        navigate(routes.viewRecipe(id));
      };
      
      const useDishRecipe = (dish: Dish) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(today);

        navigate(routes.newMeal, { 
          state: { 
            start: today.toISOString(), 
            end: end.toISOString(), 
            dishId: dish.id,
            dishName: dish.name,
          } 
        });
      };
      
      const sortDishes = () => {
        const sortedDishes = [...dishes].sort((a, b) => a.name.localeCompare(b.name));
        setDishes(sortedDishes);
      };
    
      // const updateDishes = (dish: Dish) => {
      //   setDishes((prevDishes) => [...prevDishes, dish]);
      // }

      useEffect(() => {
        revalidator.revalidate();
        
      }, []);

      const renderIngredientOverlay = (dish: Dish) => {
        const ingredients = dish.ingredientList || [];
        if (ingredients.length === 0) return null;

        const maxToShow = 4;
        const visibleIngredients = ingredients.slice(0, maxToShow);
        const remainingCount = ingredients.length - visibleIngredients.length;

        return (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs text-gray-700 max-w-[55%]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Ingredients
            </p>
            <ul className="space-y-1">
              {visibleIngredients.map((ingredient) => (
                <li key={ingredient.id} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-500"></span>
                  <span className="text-gray-800 font-medium truncate">
                    {ingredient.product.name}
                  </span>
                  <span className="text-gray-500">
                    {ingredient.quantity} {ingredient.product.measure}
                  </span>
                </li>
              ))}
            </ul>
            {remainingCount > 0 && (
              <p className="mt-1 text-[11px] text-gray-500">
                +{remainingCount} more ingredient{remainingCount === 1 ? '' : 's'}
              </p>
            )}
          </div>
        );
      };

      return (
        <>
        <div className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Recipe Collection</h2>
            <p className="mt-1 text-sm text-gray-500">Manage your favorite recipes and dishes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map((dish) => (
              <div 
                key={dish.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  {dish.imageUrl ? (
                    <img 
                      src={dish.imageUrl} 
                      alt={dish.name} 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                  {renderIngredientOverlay(dish)}
                </div>
                <div className="p-4">
                  <h3 
                    className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => viewRecipe(dish.id)}
                  >
                    {dish.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{dish.recipe}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => viewRecipe(dish.id)}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                      >
                        View Recipe
                      </button>
                      <button 
                        onClick={() => editDish(dish.id)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button 
          onClick={addDish}
          className="fixed bottom-8 right-8 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium flex items-center gap-2 z-50"
        >
          <span className="text-lg leading-none">＋</span>
          <span>Create New Dish</span>
        </button>
        <Outlet />
        </>
      );
}
export default DishList;