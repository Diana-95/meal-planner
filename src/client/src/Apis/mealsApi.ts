import axios from 'axios';
import { Meal } from '../types/types';


const API_URL = 'http://localhost:4000/api/data';

export const createMeal = async (start: string, end: string, title: string) => {
    const response = await axios.post<{ rowID: number }>(API_URL, {
      start,
      end,
      title,
    });
    return response.data;
}

export const updateMeal = async (start: string, end: string, title: string, id: number) => {
    const response = await axios.post(API_URL.concat('/update'), {
            start,
            end,
            title,
            id
          });
    return response.data;
}

export const deleteMeal = async (id: number) => {
  const response = await axios.post(API_URL.concat('/delete'), {
          id
        });
  return response.data;
}

export const getAllMeals = async () => {
    const response = await axios.get<Meal[]>(
        API_URL.concat('/getall')
      );
    return response.data; // The response data is an array of Meal
}
