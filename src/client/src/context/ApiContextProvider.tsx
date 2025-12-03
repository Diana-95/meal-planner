// src/context/ApiContext.tsx
import React, { createContext, useState, ReactNode, useContext, useMemo, useCallback, useRef } from 'react';

import { createMeal, deleteMeal, getAllMeals, getMealById, getAggregatedIngredients, updateMeal, updateMealPart } from '../apis/mealsApi';
import { createDish, deleteDish, getAllDishes, getDishById, updateDish } from '../apis/dishesApi';
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct, updateProductPart } from '../apis/productsApi';
import { createIngredient, deleteIngredient, getIngredients, updateIngredient } from '../apis/ingredientsApi';
import { useNavigate } from 'react-router-dom';
import routes from '../routes/routes';
import { getCurrentUser, loginUser, registerUser, updateUserPart } from '../apis/usersApi';
import { toastError } from '../components/common/toastService';
import { User } from '../types/types';

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
  setUserCallback: (callback: (user: User | null) => void) => void;
}

interface ApiProviderProps {
  children: ReactNode;
}
function isAxiosError<T = any>(error: any): error is AxiosError<T> {
  return error.isAxiosError === true;
}
// Create the context
export const ApiContext = createContext<ApiContextType>({ 
  handleApiCall: null, 
  loading: false,
  setUserCallback: () => {}
});

// Create the provider component
export const ApiContextProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const setUserRef = useRef<((user: User | null) => void) | null>(null);
  const navigate = useNavigate();

  const setUserCallback = useCallback((callback: (user: User | null) => void) => {
    setUserRef.current = callback;
  }, []);

  const handleApiCall: ApiContextType['handleApiCall'] = useCallback(
    (fn: any) => async (...args: any) => {
    setLoading(true);

    try {
      console.log(...args);
      const result = await fn( ...args);
      
      return result;
    } 
    catch(error) {
      if(isAxiosError(error)){
        
        if((error as AxiosError).response?.status === 401) {
          if (setUserRef.current) {
            setUserRef.current(null);
          }
          toastError('You are not authorized. Please log in again.');
          navigate(routes.authentification);
        }
       else {
          toastError(`An error occurred: ${error.message}`);
        }
       }
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  }, [navigate]);



  return (
    <ApiContext.Provider value={{ handleApiCall, loading, setUserCallback }}>
      {children}
    </ApiContext.Provider>
  );
};
export const useApi = () => {
  const { handleApiCall, loading, setUserCallback } = useContext(ApiContext);

  if (!handleApiCall) {
    throw new Error('useApi should be within ApiContextProvider');
  }

  const api = useMemo(() => ({
    meals: {
      create: handleApiCall(createMeal),
      get: handleApiCall(getAllMeals),
      updatePart: handleApiCall(updateMealPart),
      update: handleApiCall(updateMeal),
      delete: handleApiCall(deleteMeal),
      getById: handleApiCall(getMealById),
      getAggregatedIngredients: handleApiCall(getAggregatedIngredients)
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
      get: handleApiCall(getCurrentUser),
      update: handleApiCall(updateUserPart),
    }
    // Add more entities similarly
  }), [handleApiCall]);

  
  return { api, loading, setUserCallback };
}
