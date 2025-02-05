import  { axiosInstance }  from './utils';
import { Product } from '../types/types';


const API_URL = '/products';

export const createProduct = async (name: string, measure: string, price: number) => {
    const response = await axiosInstance.post<{ rowID: number }>(API_URL, {
      name,
      measure,
      price,
    });
    return response.data;
}

export const updateProduct = async (name: string, measure: string, price: number, id: number) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, {
            name,
            measure,
            price,
            id
          });
    return response.data;
}

export const updateProductPart = async (id: number, name?: string, measure?: string, price?: number) => {
  const response = await axiosInstance.patch(`${API_URL}/${id}`, {
          name,
          price,
          measure
        });
  return response.data;
}

export const deleteProduct = async (id: number) => {
  console.log('id =', id);
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
}

export const getAllProducts = async (cursor?: number, limit?: number, searchName?:  string) => {
    const searchQuery = {
      searchName
    }
    console.log('get peroducts, query:', searchQuery);
    const response = await axiosInstance.get<Product[]>(
        API_URL, {params: searchQuery}
      );
    return response.data; // The response data is an array of Meal
}

export const getProductById = async (id: number) => {
  const response = await axiosInstance.get<Product>(
      `${API_URL}/${id}`
    );
  return response.data; // The response data is an array of Meal
}

