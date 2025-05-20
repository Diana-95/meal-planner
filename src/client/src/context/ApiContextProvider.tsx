// src/context/ApiContext.tsx
import React, { createContext, useState, ReactNode, useContext } from 'react';

import { createMeal, deleteMeal, getAllMeals, getMealById, updateMeal, updateMealPart } from '../apis/mealsApi';
import { useUser } from './UserContextProvider';
import { createDish, deleteDish, getAllDishes, getDishById, updateDish } from '../apis/dishesApi';
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct, updateProductPart } from '../apis/productsApi';
import { createIngredient, deleteIngredient, getIngredients, updateIngredient } from '../apis/ingredientsApi';
import { useNavigate } from 'react-router-dom';
import routes from '../routes/routes';
import { loginUser, registerUser } from '../apis/usersApi';

interface AxiosError<T = any> extends Error {
  response?: {
      status: number;
  };
  isAxiosError: boolean;
}
// Define types for the context
interface ApiContextType {
  handleApiCall: (
    <F extends (...args: any[]) => Promise<any>>
    (fn: F) => (...args: Parameters<F>) => Promise<Awaited<ReturnType<F>> | undefined>
  ) | null
  loading: boolean;
  
}

interface ApiProviderProps {
  children: ReactNode;
}
function isAxiosError<T = any>(error: any): error is AxiosError<T> {
  return error.isAxiosError === true;
}
// Create the context
export const ApiContext = createContext<ApiContextType>({ handleApiCall: null, loading: false });

// Create the provider component
export const ApiContextProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const {setUser} = useUser();
  const navigate = useNavigate();


  const handleApiCall: ApiContextType['handleApiCall'] = (fn) =>
    async (...args) => {
    setLoading(true);

    try {
      console.log(...args);
      const result = await fn( ...args);
      
      return result;
    } 
    catch(error) {
      if(isAxiosError(error)){
        
        if((error as AxiosError).response?.status === 401) {
          setUser(null);
          console.log('axios error');
          navigate(routes.authentification);
        }
       
      }
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  }



  return (
    <ApiContext.Provider value={{ handleApiCall, loading }}>
      {children}
    </ApiContext.Provider>
  );
};
export const useApi = () => {
  const { handleApiCall } = useContext(ApiContext);

  if (!handleApiCall) {
    throw new Error('useApi should be within ApiContextProvider');
  }

  const api = {
    meals: {
      create: handleApiCall(createMeal),
      get: handleApiCall(getAllMeals),
      updatePart: handleApiCall(updateMealPart),
      update: handleApiCall(updateMeal),
      delete: handleApiCall(deleteMeal),
      getById: handleApiCall(getMealById)
      
    },
    dishes: {
      create: handleApiCall(createDish),
      get: handleApiCall(getAllDishes),
      update: handleApiCall(updateDish),
      delete: handleApiCall(deleteDish),
      getById: handleApiCall(getDishById)
    },
    products: {
      create: handleApiCall(createProduct),
      get: handleApiCall(getAllProducts),
      update: handleApiCall(updateProduct),
      updatePart: handleApiCall(updateProductPart),
      delete: handleApiCall(deleteProduct),
      getById: handleApiCall(getProductById)
    },
    ingredients: {
      create: handleApiCall(createIngredient),
      get: handleApiCall(getIngredients),
      update: handleApiCall(updateIngredient),
      delete: handleApiCall(deleteIngredient)
    },
    users: {
      create: handleApiCall(registerUser),
      login: handleApiCall(loginUser),
      
    }
    // Add more entities similarly
  };

  
  return { api };
}
