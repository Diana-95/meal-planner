import  { axiosInstance }  from './utils';
import { Meal } from '../types/types';

export const createMeal = async (name: string, startDate: string, endDate: string, dishId?: number) => { 
  const response = await axiosInstance.post<{ rowID: number }>('/meals', {
      name, 
      startDate,
      endDate,
      dishId
    });
    return response.data;
}

export const updateMeal = async (id: number, startDate: string, endDate: string, name: string, dishId?: number| null) => {
    const response = await axiosInstance.put(`/meals/${id}`, {
            startDate,
            endDate,
            name,
            dishId
          });
          console.log(response);
    return response.data;
}

export const updateMealPart = async (id: number, startDate?: string, endDate?: string, name?: string, 
  dishId?: number| null) => {
  const response = await axiosInstance.patch<void>(`/meals/${id}`, {
          startDate,
          endDate,
          name,
          dishId
        }
    );
  return response.data;
}

export const deleteMeal = async (id: number) => {
  const response = await axiosInstance.delete(`/meals/${id}`);
  return response.data;
}

export const getAllMeals = async () => {
    const response = await axiosInstance.get<Meal[]>(
        '/meals'
      );
    console.log(response.data);
    return response.data; // The response data is an array of Meal
}

export const getMealById = async (id: number) => {
  const response = await axiosInstance.get<Meal>(
      `/meals/${id}`
    );
    console.log(response.data);
  return response.data; // The response data is an array of Meal
}
