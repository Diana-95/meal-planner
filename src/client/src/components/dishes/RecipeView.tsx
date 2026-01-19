import React, { useEffect, useState } from 'react';
import { normalizeImageUrl } from '../../utils/imageUrl';
import { useNavigate, useParams } from 'react-router-dom';
import { Dish, Ingredient } from '../../types/types';
import routes from '../../routes/routes';
import { useApi } from '../../context/ApiContextProvider';
import { toastError } from '../common/toastService';

const RecipeView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { api, loading } = useApi();
  const [dish, setDish] = useState<Dish | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const fetchedDish = await api.dishes.getById(Number(id));
        if (fetchedDish) {
          setDish(fetchedDish);
        } else {
          toastError('Dish not found');
          navigate(routes.dishes);
        }
      } catch (error) {
        console.error('Error fetching dish:', error);
        toastError('Failed to load recipe');
        navigate(routes.dishes);
      }
    };

    if (id) {
      fetchDish();
    }
  }, [id, api.dishes.getById, navigate]);

  const handleIngredientToggle = (ingredientId: number) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!dish?.ingredientList) return;
    if (checkedIngredients.size === dish.ingredientList.length) {
      setCheckedIngredients(new Set());
    } else {
      setCheckedIngredients(new Set(dish.ingredientList.map(ing => ing.id)));
    }
  };

  if (loading || !dish) {
    return (
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const ingredients = dish.ingredientList || [];
  const allChecked = ingredients.length > 0 && checkedIngredients.size === ingredients.length;

  return (
    <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(routes.dishes)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Recipes
      </button>

      {/* Recipe Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <h1 className="text-4xl font-bold text-gray-900 px-6 pt-6 pb-4">{dish.name}</h1>
        
        {/* Recipe Image */}
        {dish.imageUrl ? (
          <div className="w-full">
            <img
              src={normalizeImageUrl(dish.imageUrl)}
              alt={dish.name}
              className="w-full h-96 object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-400">
            <svg
              className="w-24 h-24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ingredients Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
            {ingredients.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {allChecked ? 'Unselect All' : 'Select All'}
              </button>
            )}
          </div>
          
          {ingredients.length === 0 ? (
            <p className="text-gray-500 text-sm">No ingredients added yet.</p>
          ) : (
            <ul className="space-y-3">
              {ingredients.map((ingredient: Ingredient) => {
                const isChecked = checkedIngredients.has(ingredient.id);
                return (
                  <li
                    key={ingredient.id}
                    className="flex items-start group"
                  >
                    <label className="flex items-start cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleIngredientToggle(ingredient.id)}
                        className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                      />
                      <div className="ml-3 flex-1">
                        <span
                          className={`text-base ${
                            isChecked
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {ingredient.product.name}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {ingredient.quantity} {ingredient.product.measure}
                        </span>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recipe Instructions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
          {dish.recipe ? (
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {dish.recipe}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recipe instructions added yet.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4 justify-end">
        <button
          onClick={() => navigate(routes.editDish(dish.id))}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Edit Recipe
        </button>
        <button
          onClick={() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const end = new Date(today);
            navigate(routes.newMeal, {
              state: {
                start: today.toISOString(),
                end: end.toISOString(),
                dishId: dish.id,
                dishName: dish.name,
              },
            });
          }}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Use This Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeView;

