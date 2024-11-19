import axios from 'axios';
import { Ingredient } from '../types/types';


const API_URL = 'http://localhost:4000/api/data/ingredient';

export const addIngredient = async (productId: number, dishId: number, quantity: number) => {
    const response = await axios.post<{ rowID: number }>(API_URL, {
      productId,
      dishId,
      quantity,
    });
    return response.data;
}
// not realised
export const updateIngredient = async (productId: number, dishId: number, quantity: number, id: number) => {
    const response = await axios.post(API_URL.concat('/update'), {
            productId,
            dishId,
            quantity,
            id
          });
    return response.data;
}

export const deleteIngredient = async (id: number) => {
  const response = await axios.post(API_URL.concat('/delete'), {
          id
        });
  return response.data;
}

export const getIngredientsByDishId = async (dishId: number) => {
    const response = await axios.get<Ingredient[]>(
        API_URL.concat(`/bydish/${dishId}`)
      );
    return response.data; 
}

export const getIngredientsByProductId = async (productId: number) => {
  const response = await axios.get<Ingredient[]>(
      API_URL.concat(`/byproduct/${productId}`)
    );
  return response.data; // The response data is an array of Meal
}

