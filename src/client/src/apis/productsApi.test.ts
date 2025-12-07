// productApi.test.ts
import {
    createProduct,
    updateProduct,
    updateProductPart,
    deleteProduct,
    getAllProducts,
    getProductById,
  } from './productsApi'; // adjust path if necessary
  import { axiosInstance } from './utils';
  import { Product } from '../types/types';
  
  // Replace the real axiosInstance with a mocked version
  jest.mock('./utils');
  
  describe('Product API functions', () => {
    beforeEach(() => {
      // Reset mock history before each test
      jest.clearAllMocks();
    });
  
    test('createProduct calls axiosInstance.post with correct payload and returns response data', async () => {
      const mockResponse = { data: { rowID: 100 } };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);
  
      const result = await createProduct('Test Product', 'kg', 50);
  
      expect(axiosInstance.post).toHaveBeenCalledWith('/products', {
        name: 'Test Product',
        measure: 'kg',
        price: 50,
      });
      expect(result).toEqual(mockResponse.data);
    });
  
    test('updateProduct calls axiosInstance.put with correct payload and returns response data', async () => {
      const mockResponse = { data: { rowID: 101 } };
      (axiosInstance.put as jest.Mock).mockResolvedValue(mockResponse);
  
      const result = await updateProduct('Updated Product', 'g', 25, 1);
  
      expect(axiosInstance.put).toHaveBeenCalledWith('/products/1', {
        name: 'Updated Product',
        measure: 'g',
        price: 25,
        id: 1,
      });
      expect(result).toEqual(mockResponse.data);
    });
  
    test('updateProductPart calls axiosInstance.patch with correct payload and returns response data', async () => {
      const mockResponse = { data: { message: 'partial update success' } };
      (axiosInstance.patch as jest.Mock).mockResolvedValue(mockResponse);
  
      const result = await updateProductPart(1, 'Partially Updated', 'liters', 10);
  
      expect(axiosInstance.patch).toHaveBeenCalledWith('/products/1', {
        name: 'Partially Updated',
        measure: 'liters',
        price: 10,
      });
      expect(result).toEqual(mockResponse.data);
    });
  
    test('deleteProduct calls axiosInstance.delete with correct URL and returns response data', async () => {
      const mockResponse = { data: { success: true } };
      (axiosInstance.delete as jest.Mock).mockResolvedValue(mockResponse);
  
      const result = await deleteProduct(2);
  
      expect(axiosInstance.delete).toHaveBeenCalledWith('/products/2');
      expect(result).toEqual(mockResponse.data);
    });
  
    test('getAllProducts calls axiosInstance.get with correct query parameters and returns response data', async () => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Product 1', measure: 'kg', price: 10 },
        { id: 2, name: 'Product 2', measure: 'g', price: 5 },
      ];
      const mockResponse = { data: mockProducts };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);
  
      const result = await getAllProducts(undefined, undefined, 'Product');
  
      expect(axiosInstance.get).toHaveBeenCalledWith('/products', {
        params: {
          searchName: 'Product',
        },
      });
      expect(result).toEqual(mockProducts);
    });
  
    test('getProductById calls axiosInstance.get with correct URL and returns response data', async () => {
      const product: Product = { id: 1, name: 'Product 1', measure: 'kg', price: 10 };
      const mockResponse = { data: product };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);
  
      const result = await getProductById(1);
  
      expect(axiosInstance.get).toHaveBeenCalledWith('/products/1');
      expect(result).toEqual(product);
    });
  });
  