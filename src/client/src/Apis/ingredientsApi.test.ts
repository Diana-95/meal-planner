import {
    createIngredient,
    updateIngredient,
    deleteIngredient,
    getIngredients,
  } from './ingredientsApi';
  // In any test file that uses axiosInstance


import { axiosInstance } from './utils';
import { Ingredient } from '../types/types';

jest.mock('./utils'); // Adjust the path according to your file structure
describe('Ingredient API functions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('createIngredient calls axiosInstance.post with correct payload and returns response data', async () => {
      // Arrange: set up the mock to resolve with a sample response
      const mockResponse = { data: { rowID: 123 } };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);
  
      // Act: call the API function
      const result = await createIngredient(1, 2, 3);
  
      // Assert: verify axios was called with the correct URL and payload
      expect(axiosInstance.post).toHaveBeenCalledWith('/ingredients', {
        productId: 1,
        dishId: 2,
        quantity: 3,
      });
      expect(result).toEqual(mockResponse.data);
    });
  
    test('updateIngredient calls axiosInstance.post with id and returns response data', async () => {
      const mockResponse = { data: { rowID: 456 } };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);
  
      const result = await updateIngredient(1, 2, 3, 10);
  
      expect(axiosInstance.post).toHaveBeenCalledWith('/ingredients/10', {
        productId: 1,
        dishId: 2,
        quantity: 3,
      });
      expect(result).toEqual(mockResponse.data);
    });
  
    test('deleteIngredient calls axiosInstance.delete with the correct URL and returns response data', async () => {
      const mockResponse = { data: { success: true } };
      (axiosInstance.delete as jest.Mock).mockResolvedValue(mockResponse);
  
      const result = await deleteIngredient(10);
  
      expect(axiosInstance.delete).toHaveBeenCalledWith('/ingredients/10');
      expect(result).toEqual(mockResponse.data);
    });
  
    test('getIngredients calls axiosInstance.get with query params and returns response data', async () => {
      // Arrange: sample array of ingredients
      const ingredients: Ingredient[] = [
        { id: 1, product: {id: 1, name:"potato", measure:"", price: 5}, dishId: 1, quantity: 2 },
        { id: 2, product: {id: 1, name:"potato", measure:"", price: 5}, dishId: 1, quantity: 3},
      ];
      const mockResponse = { data: ingredients };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);
  
      // Act: call the API function with parameters
      const result = await getIngredients(1, 2, 'Salt');
  
      // Assert: verify axios.get is called with the correct URL and query parameters
      expect(axiosInstance.get).toHaveBeenCalledWith('/ingredients', {
        params: {
          dishId: 1,
          productId: 2,
          searchName: 'Salt',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('getIngredients calls axiosInstance.get with searchName and returns response data', async () => {
        // Arrange: sample array of ingredients
        const ingredients: Ingredient[] = [
          { id: 1, product: {id: 1, name:"potato", measure:"", price: 5}, dishId: 1, quantity: 2 },
          { id: 2, product: {id: 1, name:"potato", measure:"", price: 5}, dishId: 1, quantity: 3},
        ];
        const mockResponse = { data: ingredients };
        (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);
    
        // Act: call the API function with parameters
        const result = await getIngredients(undefined, undefined, 'Salt');
    
        // Assert: verify axios.get is called with the correct URL and query parameters
        expect(axiosInstance.get).toHaveBeenCalledWith('/ingredients', {
          params: {
            searchName: 'Salt'
          },
        });
        expect(result).toEqual(mockResponse.data);
      });
  });