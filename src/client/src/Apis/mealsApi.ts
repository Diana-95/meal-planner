import { axiosInstance } from './utils';
import { Meal } from '../types/types';





export const createMeal = async (start: string, end: string, title: string, dishId?: number| null) => {
    const response = await axiosInstance.post<{ rowID: number }>('', {
      start,
      end,
      title,
      dishId
    });
    return response.data;
}

export const updateMeal = async (start: string, end: string, title: string, id: number, dishId?: number| null) => {
    const response = await axiosInstance.post('/update', {
            start,
            end,
            title,
            id,
            dishId
          });
    return response.data;
}

export const updateDishoftheMeal = async (dishId: number, id: number) => {
  const response = await axiosInstance.post('/update/dish', {
          id,
          dishId
        }
    );
  return response.data;
}

export const deleteMeal = async (id: number) => {
  const response = await axiosInstance.post('/delete', {
          id
        });
  return response.data;
}

// deletedish
export const deleteDishfromMeals = async (id: number) => {
  const response = await axiosInstance.post('/deletedish', {
          id
        });
  return response.data;
}

export const getAllMeals = async () => {
    const response = await axiosInstance.get<Meal[]>(
        '/getall'
      );
      console.log(response.data);
    return response.data; // The response data is an array of Meal
}
