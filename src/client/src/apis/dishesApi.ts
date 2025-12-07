import  { axiosInstance }  from './utils';
import { Dish } from '../types/types';


const API_URL = '/dishes';

export const createDish = async (name: string, recipe: string, imageUrl: string) => {
    const response = await axiosInstance.post<{ rowID: number }>(API_URL, {
      name,
      recipe,
      imageUrl,
    });
    return response.data;
}

export const updateDish = async (name: string, recipe: string, imageUrl: string, id: number) => {
    const response = await axiosInstance.put<{ success: boolean} >(`${API_URL}/${id}`, {
            name,
            recipe,
            imageUrl
          });
    return response.data;
}

export const deleteDish = async (id: number) => {
    const response = await axiosInstance.delete<{ success: boolean }>(`${API_URL}/${id}`);
    return response.data;
}

export const getAllDishes = async (cursor?: number, limit?: number, searchName?: string) => {
    const queryParams = {
      cursor,
      limit,
      searchName
    };

    const response = await axiosInstance.get<Dish[]>(
        API_URL, {params: queryParams}
      );
    return response.data; // The response data is an array of Meal
}

export const getDishById = async (id: number) => {
  const response = await axiosInstance.get<Dish>(
      `${API_URL}/${id}`
    );
  return response.data; // The response data is an array of Meal
}

