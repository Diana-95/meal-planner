import React from 'react';
import DishList from '../../../../components/dishes/DishList';
import { DishesContextProvider } from '../../../../context/DishesContextProvider';

const Dishes = () => {
    return (
      <DishesContextProvider>
        <DishList />
      </DishesContextProvider>
    )
    ;
}

export default Dishes;
