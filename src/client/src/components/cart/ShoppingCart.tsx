import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useApi } from '../../context/ApiContextProvider';
import { Meal, Product } from '../../types/types';
import { toastError } from '../common/toastService';

interface AggregatedIngredient {
  product: Product;
  totalQuantity: number;
  measure: string;
  meals: string[]; // Names of meals that use this ingredient
}

const ShoppingCart = () => {
  const { api, loading } = useApi();
  const location = useLocation(); // Track navigation to trigger re-fetch
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to 7 days from now
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [meals, setMeals] = useState<Meal[]>([]); // Local meals state for shopping cart
  const [aggregatedIngredients, setAggregatedIngredients] = useState<AggregatedIngredient[]>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);

  // Fetch meals and aggregate ingredients when date range changes
  const loadMealsAndIngredients = useCallback(async () => {
    if (!startDate || !endDate) {
      setMeals([]);
      setAggregatedIngredients([]);
      return;
    }

    setIsLoadingIngredients(true);
    try {
      // Fetch meals filtered by date range
      const startIso = new Date(startDate).toISOString();
      const endIso = new Date(endDate).toISOString();
      const fetchedMeals = await api.meals.get(startIso, endIso);

      if (!fetchedMeals) {
        setMeals([]);
        setAggregatedIngredients([]);
        setIsLoadingIngredients(false);
        return;
      }

      setMeals(fetchedMeals);

      // Filter meals that have dishes (meals without dishes don't have ingredients)
      const mealsWithDishes = fetchedMeals.filter(meal => meal.dish !== null);
      
      if (mealsWithDishes.length === 0) {
        setAggregatedIngredients([]);
        setIsLoadingIngredients(false);
        return;
      }

      // Extract meal IDs
      const mealIds = mealsWithDishes.map(meal => meal.id);

      // Get aggregated ingredients from the API (SQL aggregation)
      const aggregatedData = await api.meals.getAggregatedIngredients(mealIds);

      if (!aggregatedData || aggregatedData.length === 0) {
        setAggregatedIngredients([]);
        setIsLoadingIngredients(false);
        return;
      }

      // Map the aggregated data to match our component's interface
      // We need to construct Product objects and get meal names
      const aggregated: AggregatedIngredient[] = aggregatedData.map((item) => {
        // Construct Product object from the aggregated data
        const product: Product = {
          id: item.productId,
          name: item.productName,
          measure: item.measure,
          price: item.price
        };

        // Get meal names that use this product
        // Since the API doesn't return meal names per product, we'll show all meals in the date range
        // This is acceptable for now - all meals in the range contribute to the shopping list
        const mealNames = mealsWithDishes.map(meal => meal.name);

        return {
          product,
          totalQuantity: item.totalQuantity,
          measure: item.measure,
          meals: mealNames
        };
      });

      setAggregatedIngredients(aggregated);
    } catch (error: any) {
      console.error('Error loading meals and ingredients:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load shopping list';
      toastError(`Failed to load shopping list: ${errorMessage}`);
      setMeals([]);
      setAggregatedIngredients([]);
    } finally {
      setIsLoadingIngredients(false);
    }
  }, [startDate, endDate, api.meals.get, api.meals.getAggregatedIngredients]);

  useEffect(() => {
    loadMealsAndIngredients();
  }, [loadMealsAndIngredients, location.key]); // Re-fetch when navigating to this page

  // Calculate total price
  const totalPrice = useMemo(() => {
    return aggregatedIngredients.reduce((sum, item) => {
      return sum + item.product.price * item.totalQuantity;
    }, 0);
  }, [aggregatedIngredients]);

  // Count meals in date range
  const mealsCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return meals.filter((meal) => {
      const mealStart = new Date(meal.startDate);
      const mealEnd = new Date(meal.endDate);
      return mealStart <= endDate && mealEnd >= startDate && meal.dish !== null;
    }).length;
  }, [meals, startDate, endDate]);

  return (
    <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Shopping Cart</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select a date range to generate your shopping list based on planned meals
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={startDate || undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              <strong className="text-gray-900">{mealsCount}</strong> meal{mealsCount !== 1 ? 's' : ''} planned
            </span>
            <span>
              <strong className="text-gray-900">{aggregatedIngredients.length}</strong> unique product{aggregatedIngredients.length !== 1 ? 's' : ''}
            </span>
            {totalPrice > 0 && (
              <span>
                Estimated total: <strong className="text-gray-900">${totalPrice.toFixed(2)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Shopping List */}
      {isLoadingIngredients ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shopping list...</p>
        </div>
      ) : aggregatedIngredients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items in shopping list</h3>
          <p className="mt-1 text-sm text-gray-500">
            {!startDate || !endDate
              ? 'Please select a date range'
              : 'No meals with ingredients found in the selected date range'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Shopping List</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {aggregatedIngredients.map((item) => (
              <li key={item.product.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.measure}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Quantity: <strong>{item.totalQuantity}</strong>
                      {item.product.price > 0 && (
                        <span className="ml-2">
                          • ${item.product.price.toFixed(2)}/{item.measure}
                          {' '}• Subtotal: ${(item.product.price * item.totalQuantity).toFixed(2)}
                        </span>
                      )}
                    </p>
                    {item.meals.length > 0 && (
                      <p className="mt-1 text-xs text-gray-400">
                        Used in: {item.meals.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {totalPrice > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Estimated Cost</span>
                <span className="text-lg font-bold text-primary-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;

