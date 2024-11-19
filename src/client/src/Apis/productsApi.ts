import axios from 'axios';
import { Product } from '../types/types';


const API_URL = 'http://localhost:4000/api/data/product';

export const createProduct = async (name: string, measure: string, price: number) => {
    const response = await axios.post<{ rowID: number }>(API_URL, {
      name,
      measure,
      price,
    });
    return response.data;
}

export const updateProduct = async (name: string, measure: string, price: number, id: number) => {
    const response = await axios.post(API_URL.concat('/update'), {
            name,
            measure,
            price,
            id
          });
    return response.data;
}

export const deleteProduct = async (id: number) => {
  console.log('id=', id);
  const response = await axios.post(API_URL.concat('/delete'), {
          id
        });
  return response.data;
}

export const getAllProducts = async () => {
    const response = await axios.get<Product[]>(
        API_URL.concat('/getall')
      );
    return response.data; // The response data is an array of Meal
}

export const getProductById = async (id: number) => {
  const response = await axios.get<Product>(
      API_URL.concat(`/${id}`)
    );
  return response.data; // The response data is an array of Meal
}

