import  { axiosInstance }  from './utils';
import { Ingredient } from '../types/types';


const API_URL = '/ingredients';

export const createIngredient = async (productId: number, dishId: number, quantity: number) => {
  console.log('prId, dId, q', productId, dishId, quantity);  
  const response = await axiosInstance.post<{ rowID: number }>(API_URL, {
      productId,
      dishId,
      quantity
    });
    console.log('create ingredient', response.data);
    return response.data;
}
// not realised
export const updateIngredient = async (productId: number, dishId: number, quantity: number, id: number) => {
    const response = await axiosInstance.post(`${API_URL}/${id}`, {
            productId,
            dishId,
            quantity
        });
    return response.data;
}

export const deleteIngredient = async (id: number) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
}

export const getIngredients = async (dishId?: number, productId?: number, searchName?: string) => {
    const queryParams = {
      dishId,
      productId,
      searchName
    };
    const response = await axiosInstance.get<Ingredient[]>(
        API_URL, { params: queryParams }
      );
    console.log(response.data);
    return response.data; 
}


