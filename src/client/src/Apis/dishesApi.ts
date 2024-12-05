import { axiosInstance } from './utils';
import { Dish } from '../types/types';


const API_URL = '/dish';

export const createDish = async (name: string, recipe: string, imageUrl: string) => {
    const response = await axiosInstance.post<{ rowID: number }>(API_URL, {
      name,
      recipe,
      imageUrl,
    });
    return response.data;
}

export const updateDish = async (name: string, recipe: string, imageUrl: string, id: number) => {
    const response = await axiosInstance.post(`${API_URL}/update`, {
            name,
            recipe,
            imageUrl,
            id
          });
    return response.data;
}

export const deleteDish = async (id: number) => {
  const response = await axiosInstance.post(`${API_URL}/delete`, {
          id
        });
  return response.data;
}

export const getAllDishes = async () => {
    const response = await axiosInstance.get<Dish[]>(
        `${API_URL}/getall`
      );
    return response.data; // The response data is an array of Meal
}
// getallsuggestions/:query
export const getAllSuggestedDishes = async (query: string) => {
  const response = await axiosInstance.get<Dish[]>(
      `${API_URL}/getallsuggestions/${query}`
    );
  return response.data; // The response data is an array of Meal
}

export const getDishById = async (id: number) => {
  const response = await axiosInstance.get<Dish>(
      `${API_URL}/${id}`
    );
  return response.data; // The response data is an array of Meal
}

