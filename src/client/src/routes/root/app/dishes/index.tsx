import React from 'react';
import DishList from '../../../../components/dishes/DishList';
import { getAllDishes } from '../../../../apis/dishesApi';

const Dishes = () => {
    return (
      <DishList />
    )
    ;
}
export const dishesLoader = async () => {
    return getAllDishes()
    .then((dishes) => {
        console.log('get dishes', dishes);
        
        return dishes;
    })
    .catch((error) => {
        throw new Error(error);
    });
}
export default Dishes;
