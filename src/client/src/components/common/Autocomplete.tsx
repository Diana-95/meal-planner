import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ChildComponentProps<T> {
    data: T | null;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
    removeData: () => void;
    fetchAllSuggestions: (cursor?: number, limit?: number, searchName?: string) => Promise<T[] | undefined>;
    CustomComponent: React.ComponentType<{ item: T }>;
    getEditLink?: (item: T) => string; // Optional function to get edit link
  }

function Autocomplete<T>({ data, setData, removeData, fetchAllSuggestions, CustomComponent, getEditLink}: ChildComponentProps<T>) {

  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<T[]>([]);

  const fetchSuggestions = async (query: string) => {
    const suggestedDishes = await fetchAllSuggestions(undefined, undefined, query);
    if(suggestedDishes)
        setSuggestions(suggestedDishes);
    
  }

  const handleInputChange = ({ target: {value}} : React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input changed:', value);
    setInputValue(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (selected: T) => {
    setData(selected); // Set selected dish
    setInputValue(''); // Set input to the selected dish name
    setSuggestions([]); // Hide suggestions
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data && getEditLink) {
      const link = getEditLink(data);
      navigate(link);
    }
  };

  const handleInputBlur = () => {
    // Delay to let onClick fire when a suggestion is clicked
    if(inputValue === '')
      setTimeout(() => setSuggestions([]), 100);
  };

  return (
    <div className="relative w-full">
      {data ? (
        <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200 relative">
          <CustomComponent item={data} />
          <div className="flex items-center gap-2 mt-2">
            {getEditLink && (
              <button
                type="button"
                onClick={handleEditClick}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium underline"
              >
                Edit dish
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {setData(null); removeData();}}
            className="calendar-remove-dish-btn line-height-1"
            aria-label="Remove dish"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            onBlur={handleInputBlur}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />  
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 border border-gray-200 bg-white rounded-md shadow-lg list-none m-0 p-0 z-50 max-h-60 overflow-y-auto">
              {suggestions.map((suggestedItem, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestedItem)}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  { <CustomComponent item={suggestedItem} /> }
                </li>
              ))}
            </ul>
          )}
          </>
      )}
    </div>
  );
};

export default Autocomplete;
