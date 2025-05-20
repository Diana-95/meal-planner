// mealApi.test.ts
import {
    createMeal,
    updateMeal,
    updateMealPart,
    deleteMeal,
    getAllMeals,
    getMealById,
  } from './mealsApi'; // adjust the path if needed
  import { axiosInstance } from './utils';
  
  // Automatically mock the axiosInstance methods from the utils module
  jest.mock('./utils');
  
  describe('Meal API functions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('createMeal calls axiosInstance.post with correct payload and returns response data', async () => {
      const mockResponse = { data: { rowID: 101 } };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);
  
      const startDate = '2023-01-01';
      const endDate = '2023-01-02';
      const name = 'Test Meal';
      const dishId = 3;
  
      const result = await createMeal(name, startDate, endDate, dishId);
  
      expect(axiosInstance.post).toHaveBeenCalledWith('/meals', {
        name,
        startDate,
        endDate,
        dishId
      });
      expect(result).toEqual(mockResponse.data);
    });
  
    test('updateMeal calls axiosInstance.put with correct payload and returns response data', async () => {
      const mockResponse = { data: { rowID: 102 } };
      (axiosInstance.put as jest.Mock).mockResolvedValue(mockResponse);
  
      const id = 1;
      const startDate = '2023-01-10';
      const endDate = '2023-01-11';
      const name = 'Updated Meal';
      const dishId = 5;
  
      const result = await updateMeal(id, startDate, endDate, name, dishId);
  
      expect(axiosInstance.put).toHaveBeenCalledWith(`/meals/${id}`, {
        startDate,
        endDate,
        name,
        dishId,
      });
      expect(result).toEqual(mockResponse.data);
    });
  
    test('updateMealPart calls axiosInstance.patch with correct payload and returns response data', async () => {
      // Since updateMealPart is declared to return void, we simulate no response data.
      const mockResponse = { data: undefined };
      (axiosInstance.patch as jest.Mock).mockResolvedValue(mockResponse);
  
      const id = 2;
      const startDate = '2023-02-01';
      const endDate = '2023-02-02';
      const name = 'Partial Update Meal';
      const dishId = null;
  
      const result = await updateMealPart(id, startDate, endDate, name, dishId);
  
      expect(axiosInstance.patch).toHaveBeenCalledWith(`/meals/${id}`, {
        startDate,
        endDate,
        name,
        dishId,
      });
      expect(result).toEqual(mockResponse.data);
    });
  
    test('deleteMeal calls axiosInstance.delete with correct URL and returns response data', async () => {
      const mockResponse = { data: { success: true } };
      (axiosInstance.delete as jest.Mock).mockResolvedValue(mockResponse);
  
      const id = 3;
      const result = await deleteMeal(id);
  
      expect(axiosInstance.delete).toHaveBeenCalledWith(`/meals/${id}`);
      expect(result).toEqual(mockResponse.data);
    });
  
    test('getAllMeals calls axiosInstance.get with correct URL and returns response data', async () => {
      const mockMeals = [
        { id: 1, startDate: '2023-03-01', endDate: '2023-03-02', name: 'Meal 1' },
        { id: 2, startDate: '2023-03-03', endDate: '2023-03-04', name: 'Meal 2' },
      ];
      const mockResponse = { data: mockMeals };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);
  
      const result = await getAllMeals();
  
      expect(axiosInstance.get).toHaveBeenCalledWith('/meals');
      expect(result).toEqual(mockMeals);
    });
  
    test('getMealById calls axiosInstance.get with correct URL and returns response data', async () => {
      const meal = { id: 1, startDate: '2023-04-01', endDate: '2023-04-02', name: 'Meal 1' };
      const mockResponse = { data: meal };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);
  
      const id = 1;
      const result = await getMealById(id);
  
      expect(axiosInstance.get).toHaveBeenCalledWith(`/meals/${id}`);
      expect(result).toEqual(meal);
    });
  });
  