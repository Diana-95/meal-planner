import  { axiosInstance }  from './utils';
import { Meal } from '../types/types';

export const createMeal = async (name: string, startDate: string, endDate: string, dishIds?: number[]) => { 
  const response = await axiosInstance.post<{ rowID: number }>('/meals', {
      name, 
      startDate,
      endDate,
      dishIds: dishIds || []
    });
    return response.data;
}

export const updateMeal = async (id: number, startDate: string, endDate: string, name: string, dishIds?: number[]) => {
    const response = await axiosInstance.put(`/meals/${id}`, {
            startDate,
            endDate,
            name,
            dishIds: dishIds || []
          });
          console.log(response);
    return response.data;
}

export const updateMealPart = async (id: number, startDate?: string, endDate?: string, name?: string, 
  dishIds?: number[]) => {
  const response = await axiosInstance.patch<void>(`/meals/${id}`, {
          startDate,
          endDate,
          name,
          dishIds
        }
    );
  return response.data;
}

export const deleteMeal = async (id: number) => {
  const response = await axiosInstance.delete(`/meals/${id}`);
  return response.data;
}

export const getAllMeals = async (
  startDate?: string | undefined,
  endDate?: string | undefined,
  cursor?: number | undefined,
  limit?: number | undefined,
  searchName?: string | undefined
) => {
  const queryParams: Record<string, string | number> = {};
  
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;
  if (cursor !== undefined) queryParams.cursor = cursor;
  if (limit !== undefined) queryParams.limit = limit;
  if (searchName) queryParams.searchName = searchName;

  const response = await axiosInstance.get<Meal[]>(
    '/meals',
    { params: queryParams }
  );
  
  return response.data;
};

export const getMealById = async (id: number) => {
  const response = await axiosInstance.get<Meal>(
      `/meals/${id}`
    );
    console.log(response.data);
  return response.data; // The response data is an array of Meal
}

export interface AggregatedIngredient {
  productId: number;
  productName: string;
  measure: string;
  price: number;
  emoji: string | null;
  totalQuantity: number;
}

export const getAggregatedIngredients = async (mealIds: number[]): Promise<AggregatedIngredient[]> => {
  const response = await axiosInstance.post<AggregatedIngredient[]>(
    '/meals/ingredients',
    { mealIds }
  );
  return response.data;
}
