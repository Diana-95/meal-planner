import { Dish } from '../types/types';
import { createDish, deleteDish, getAllDishes, getDishById, updateDish } from './dishesApi';
import { axiosInstance } from './utils';
jest.mock('./utils');
describe('Dishes API functions',() => {
    const dishExample: Dish = ({
        id: 1,
            name: 'potato soup',
            recipe: 'cook it',
            imageUrl: '',
            ingredientList: []
        } satisfies Dish );
    test('get all dishes of current user', async () => {
        const dishes: Dish[] = [
            {
                id: 1,
                name: 'potato soup',
                recipe: 'cook it',
                imageUrl: '',
                ingredientList: []
            } satisfies Dish,
            {
                id: 2,
                name: 'broccoli soup',
                recipe: 'cook it',
                imageUrl: 'https://img.freepik.com/free-photo/piece-chocolate-cake-with-mint-chocolate-topping-lights-with-blurry-background_181624-16989.jpg?t=st=1742562217~exp=1742565817~hmac=36cff4c25076647984ced5e123ecea51084179c439d5983704f701956e857385&w=826',
                ingredientList: []
            } satisfies Dish,
        ];
        const mockResponse = { data: dishes };
        
        (axiosInstance.get  as jest.Mock).mockResolvedValue(mockResponse);
        const response = await getAllDishes();
        expect(response).toEqual(mockResponse.data);
        expect(axiosInstance.get).toHaveBeenCalled();
    });

    test('create new dish', async () => {
        
        
            (axiosInstance.post as jest.Mock).mockResolvedValue({data: {rowID: dishExample.id}});
            const actualResponse = await createDish(dishExample.name, dishExample.recipe, dishExample.imageUrl);
            
            expect(actualResponse).toEqual({rowID: dishExample.id});

    });

    test('update dish', async () => {
        (axiosInstance.put as jest.Mock).mockResolvedValue({data: {success: true}});
        const actualResponse = await updateDish(dishExample.name, dishExample.recipe, dishExample.imageUrl, dishExample.id);
        expect(actualResponse).toEqual({success: true});
    })

    test('delete dish', async () => {
        (axiosInstance.delete as jest.Mock).mockResolvedValue({data: {success: true}});
        const actualResponse = await deleteDish(dishExample.id);
        expect(actualResponse).toEqual({success: true});
    })

    test('get dish by ID', async () => {
        (axiosInstance.get as jest.Mock).mockResolvedValue({data: dishExample});
        const actualResponse = await getDishById(dishExample.id);
        expect(actualResponse).toEqual(dishExample);

    })
})