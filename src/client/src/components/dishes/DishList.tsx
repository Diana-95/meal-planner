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

      return (
        <>
        <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Recipe Collection</h2>
              <p className="mt-1 text-sm text-gray-500">Manage your favorite recipes and dishes</p>
            </div>
            <button 
              onClick={addDish}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
            >
              + Create New Dish
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map((dish) => (
              <div 
                key={dish.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <img 
                  src={dish.imageUrl} 
                  alt={dish.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{dish.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{dish.recipe}</p>
                  <button 
                    onClick={() => editDish(dish.id)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Outlet />
        </>
      );
}
export default DishList;