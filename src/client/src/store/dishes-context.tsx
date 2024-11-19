import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Dish } from '../types/types';
import { getAllDishes } from '../Apis/dishesApi';

interface DishesContextValue {
    dishes: Dish[];
    findDishById: (id: number) => Dish|undefined;
    reloadDishes: () => void;
  }

  const DishesContext = createContext<DishesContextValue | undefined>(
    undefined
)
  // eslint-disable-next-line react/prop-types
  export const DishesProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [dishes, setDishes] = useState<Dish[]>([]);
  
    const fetchDishes = async () => {
      const data = await getAllDishes();
      setDishes(data);
    };
  
    useEffect(() => {
      fetchDishes();
    }, []);
  
    const reloadDishes = () => {
      fetchDishes();
    };
  
    const findDishById = (id: number) => {
        return dishes.find((dish) => dish.id === id)
    }

    return (
      // eslint-disable-next-line react/react-in-jsx-scope
      <DishesContext.Provider value={{ dishes, reloadDishes, findDishById }}>
        {children}
      </DishesContext.Provider>
    );
  };

  export const useDishes = () => {
    const context = useContext(DishesContext);
    if (!context) {
      throw new Error('useDishes must be used within a DishesProvider');
    }
    return context;
  };