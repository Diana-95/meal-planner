import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Dish, Ingredient, Product } from '../../types/types';

import styles from '../../styles/EditDish.module.css';
import routes from '../../routes/routes';
import Autocomplete from '../common/Autocomplete';
import ProductAutocomplete from './IngredientOption';
import { useApi } from '../../context/ApiContextProvider';
import { useDishes } from '../../context/DishesContextProvider';
import { toastError, toastInfo } from '../common/toastService';

const EditDish = () => {

  const navigate = useNavigate();
  const { id: dishId } = useParams<{ id: string }>();;

  const { api, loading } = useApi();
  const { setDishes } = useDishes();

  const [name, setName] = useState('');
  const [recipe, setRecipe] = useState('');
  const [imageUrl, setImage] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddIngredient = async() => {
   
    if (selectedProduct === null) return;
    const newIngredient: Ingredient = {
      id: -1,
      product: selectedProduct,
      dishId: Number(dishId),
      quantity: quantity,
    };
    setIngredients(prevIngredients => 
      [...prevIngredients, newIngredient]);
  
      setSelectedProduct(null);
      setQuantity(0);
  };

  useEffect(() => {
    const fetchIngredients = async () => {
      const dish = await api.dishes.getById(Number(dishId));
      if(dish) {
        if(dish.ingredientList)
          setIngredients(dish.ingredientList);
        else setIngredients([]);
        setName(dish.name);
        setImage(dish.imageUrl);
        setRecipe(dish.recipe);
      }
      else {
        toastError('Dish not found');
        navigate(routes.dishes);  
      }
    }

    fetchIngredients();
  }, [api.dishes.getById]);

  useEffect(() => {
    handleAddIngredient();
  }, [selectedProduct]) ;

  const saveIngredients = async () => {
    // Use Promise.all to wait for all ingredient saves to complete
    await Promise.all(
      ingredients.map(async (ingredient) => {
        const { id, product, dishId, quantity } = ingredient;
        if (id === -1) {
          // New ingredient - create it
          const response = await api.ingredients.create(product.id, dishId, quantity);
          if (response !== undefined) {
            setIngredients((prevIngredients) =>
              prevIngredients.map((ing) => 
                ing.id === id ? { ...ing, id: response.rowID } : ing
              )
            );
          }
        } else {
          // Existing ingredient - update it
          await api.ingredients.update(product.id, dishId, quantity, id);
        }
      })
    );
  }

  const onSaveHandle = async () => {
    try {
      // First save the dish
      const response = await api.dishes.update(name, recipe, imageUrl, Number(dishId));
      
      if (response !== undefined) {
        // Then save all ingredients (wait for completion)
        await saveIngredients();
        
        // Update local state
        setDishes(prevDishes => prevDishes.map((item) => 
          item.id === Number(dishId) ? {...item, name, recipe, imageUrl, ingredientList: ingredients} satisfies Dish
          : item));
        
        toastInfo(`${name} was updated`);
        navigate(routes.dishes);
      }
    } catch (error) {
      console.error('Error saving dish:', error);
      toastError('Failed to save dish');
    }
  }

  const onCloseHandle = () => {
    navigate(routes.dishes);
  }

  const onDeleteHandle = () => {
    const response = api.dishes.delete(Number(dishId));
    if(response !== undefined) {
      setDishes(prevDishes => prevDishes.filter(item => item.id !== Number(dishId)));
      toastInfo(`${name} was deleted`);
      navigate(routes.dishes);
    }
  }

  const onIngredientDeleteHandle = async (id: number) => {
    const response = await api.ingredients.delete(id);
    if(response !== undefined) {
      setIngredients((prevIngredients) => 
        prevIngredients.filter((ingredient) => ingredient.id !== id)
    );
    }
  }

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onCloseHandle}
    >
      <div 
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Dish</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor='name' className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id='name'
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor='recipe' className="block text-sm font-medium text-gray-700 mb-1">
              Recipe
            </label>
            <textarea
              id='recipe'
              value={recipe}
              onChange={(e) => setRecipe(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor='imageUrl' className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              id='imageUrl'
              type="text"
              value={imageUrl}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Ingredients</h3>
            <Autocomplete<Product>
              data={selectedProduct} 
              setData={setSelectedProduct} 
              fetchAllSuggestions={api.products.get}
              CustomComponent={ProductAutocomplete}
            />
          </div>
         
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingredients List</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Measure</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ingredients.map((ingredient, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{ingredient.product.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={ingredient.quantity}
                          onChange={(e) => {
                            setIngredients((prevIngredients) =>
                              prevIngredients.map((ing) =>
                                ing.id === ingredient.id ? { ...ing, quantity: Number(e.target.value) } : ing
                              )
                            );
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ingredient.product.measure}</td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => onIngredientDeleteHandle(ingredient.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button 
            onClick={onCloseHandle}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={onDeleteHandle}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
          <button 
            onClick={onSaveHandle}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDish;