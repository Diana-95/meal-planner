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
  emoji: string | null;
}

const ShoppingCart = () => {
  const { api, loading } = useApi();
  const location = useLocation(); // Track navigation to trigger re-fetch
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7); // Default to 7 days from now
    end.setHours(0, 0, 0, 0);

    return [start, end];
  });
  const [startDate, endDate] = dateRange;
  const [showCalendar, setShowCalendar] = useState(false);
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
      const mealsWithDishes = fetchedMeals.filter(meal => meal.dishes && meal.dishes.length > 0);
      
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
        // Ensure price is a number (Postgres NUMERIC can return as string)
        const product: Product = {
          id: item.productId,
          name: item.productName,
          measure: item.measure,
          price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
          emoji: item.emoji || null
        };

        // Get meal names that use this product
        // Since the API doesn't return meal names per product, we'll show all meals in the date range
        // This is acceptable for now - all meals in the range contribute to the shopping list
        const mealNames = mealsWithDishes.map(meal => meal.name);

        return {
          product,
          totalQuantity: item.totalQuantity,
          measure: item.measure,
          meals: mealNames,
          emoji: item.emoji || null
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
      return mealStart <= endDate && mealEnd >= startDate && meal.dishes && meal.dishes.length > 0;
    }).length;
  }, [meals, startDate, endDate]);

  return (
    <div className="pt-16 md:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Select a date range to generate your shopping list based on planned meals
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="mb-4">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left text-sm border border-gray-300 rounded-md text-gray-700 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => setShowCalendar((prev) => !prev)}
          >
            <span>
              {startDate
                ? `${startDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}${
                    endDate
                      ? ` – ${endDate.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : ''
                  }`
                : 'Select date range'}
            </span>
            <svg
              className={`h-4 w-4 transition-transform ${
                showCalendar ? 'rotate-180' : ''
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.172l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {showCalendar && (
            <div className="mt-3">
              <DatePicker
                selectsRange
                inline
                shouldCloseOnSelect={false}
                startDate={startDate ?? undefined}
                endDate={endDate ?? undefined}
                onChange={(range: [Date | null, Date | null]) => {
                  setDateRange(range);
                  if (range[0] && range[1]) {
                    setShowCalendar(false);
                  }
                }}
                calendarClassName="!text-sm"
              />
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span>
              <strong className="text-gray-900">{mealsCount}</strong> meal{mealsCount !== 1 ? 's' : ''}
            </span>
            <span>
              <strong className="text-gray-900">{aggregatedIngredients.length}</strong> product{aggregatedIngredients.length !== 1 ? 's' : ''}
            </span>
            {totalPrice > 0 && (
              <span>
                Total: <strong className="text-gray-900">${totalPrice.toFixed(2)}</strong>
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
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Shopping List</h3>
          </div>
          
          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-gray-200">
            {aggregatedIngredients.map((item) => {
              const amount = item.product.price * item.totalQuantity;
              return (
                <div key={item.product.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {item.emoji && (
                        <span className="text-2xl flex-shrink-0" role="img" aria-label={item.product.name}>
                          {item.emoji}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</h4>
                          <input
                            type="checkbox"
                            className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer flex-shrink-0"
                            defaultChecked
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                          <span>Qty: <strong className="text-gray-900">{item.totalQuantity} {item.measure}</strong></span>
                          <span>Price: <strong className="text-gray-900">${item.product.price > 0 ? item.product.price.toFixed(2) : '0.00'}</strong></span>
                        </div>
                        {item.meals.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Used in:</div>
                            <div className="flex flex-wrap gap-1">
                              {item.meals.slice(0, 2).map((meal, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-[120px]"
                                  title={meal}
                                >
                                  {meal}
                                </span>
                              ))}
                              {item.meals.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                  +{item.meals.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-bold text-primary-600">
                        ${amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Mobile Total */}
            {totalPrice > 0 && (
              <div className="px-4 py-4 bg-gray-50 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-primary-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { label: "Product", className: "text-left" },
                    { label: "Quantity", className: "text-left" },
                    { label: "Unit Price", className: "text-left" },
                    { label: "Amount", className: "text-left" },
                    { label: "Where Used", className: "text-left" },
                    { label: "✓", className: "text-center" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      scope="col"
                      className={`px-6 py-3 ${col.className} text-xs font-medium text-gray-500 uppercase tracking-wider`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aggregatedIngredients.map((item) => {
                  const amount = item.product.price * item.totalQuantity;
                  return (
                    <tr key={item.product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {item.emoji && (
                            <span className="text-2xl" role="img" aria-label={item.product.name}>
                              {item.emoji}
                            </span>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                            <div className="text-xs text-gray-500">{item.measure}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.totalQuantity} {item.measure}
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${item.product.price > 0 ? item.product.price.toFixed(2) : '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-2">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {item.meals.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.meals.slice(0, 3).map((meal, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {meal}
                                </span>
                              ))}
                              {item.meals.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                  +{item.meals.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                          defaultChecked
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {totalPrice > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      Total Estimated Cost:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-primary-600">
                        ${totalPrice.toFixed(2)}
                      </div>
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;

