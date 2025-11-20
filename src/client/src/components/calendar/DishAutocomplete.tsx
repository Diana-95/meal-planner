import React from 'react';
import { Dish } from '../../types/types';

const DishAutocomplete: React.FC<{ item: Dish }> = ({ item }) => {
  const ingredients = item.ingredientList ?? [];

  return (
    <div className="flex items-center gap-3 py-1">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-14 h-14 object-cover rounded border border-gray-200"
        />
      )}
      <div className="flex-1">
        <div className="text-sm font-semibold text-gray-900">{item.name}</div>
        {item.recipe && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {item.recipe}
          </p>
        )}
        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-gray-600">
            {ingredients.slice(0, 3).map((ingredient) => (
              <span
                key={ingredient.id}
                className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-full"
              >
                {ingredient.product.name}
                <span className="ml-1 text-gray-500">
                  {ingredient.quantity} {ingredient.product.measure}
                </span>
              </span>
            ))}
            {ingredients.length > 3 && (
              <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded-full text-gray-500">
                +{ingredients.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DishAutocomplete;
