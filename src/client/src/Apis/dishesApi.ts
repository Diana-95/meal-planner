import axios from 'axios';
import { Dish } from '../types/types';


const API_URL = 'http://localhost:4000/api/data/dish';

export const createDish = async (name: string, recipe: string, imageUrl: string) => {
    const response = await axios.post<{ rowID: number }>(API_URL, {
      name,
      recipe,
      imageUrl,
    });
    return response.data;
}

export const updateDish = async (name: string, recipe: string, imageUrl: string, id: number) => {
    const response = await axios.post(API_URL.concat('/update'), {
            name,
            recipe,
            imageUrl,
            id
          });
    return response.data;
}

export const getAllDishes = async () => {
    const response = await axios.get<Dish[]>(
        API_URL.concat('/getall')
      );
    return response.data; // The response data is an array of Meal
}

export const getDishById = async (id: number) => {
  const response = await axios.get<Dish>(
      API_URL.concat(`/${id}`)
    );
  return response.data; // The response data is an array of Meal
}

