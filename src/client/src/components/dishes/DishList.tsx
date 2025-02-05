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
        <div className={styles.dishListContainer}>
        {dishes.map((dish) => (
          <div className={styles.dishCard} key={dish.id}>
            <img src={dish.imageUrl} alt={dish.name} className={styles.dishImage} />
            <div className={styles.dishContent}>
              <h3 className={styles.dishTitle}>{dish.name}</h3>
              <p className={styles.dishRecipe}>{dish.recipe}</p>
              <button className={styles.createButton} onClick={() => editDish(dish.id)}>Edit</button>
            </div>
          </div>
        ))}
        <button className={styles.createButton} onClick={addDish}>Create New Dish</button>
        
      </div>
      <Outlet />
      </>
      );
}
export default DishList;