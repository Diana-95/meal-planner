import React, { useState } from 'react';

interface ChildComponentProps<T> {
    data: T | null;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
    fetchAllSuggestions: (cursor?: number, limit?: number, searchName?: string) => Promise<T[] | undefined>;
    CustomComponent: React.ComponentType<{ item: T }>;  
  }

function Autocomplete<T>({ data, setData, fetchAllSuggestions,  CustomComponent}: ChildComponentProps<T>) {

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
    if (value.length >= 3) { // Fetch suggestions for 3 or more characters
      fetchSuggestions(value);
    } 
    else {
      setSuggestions([]); // Clear suggestions if input is less than 3 characters
    }
  };

  const handleSuggestionClick = (selected: T) => {
    setData(selected); // Set selected dish
    setInputValue(''); // Set input to the selected dish name
    setSuggestions([]); // Hide suggestions
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
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
      {data && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
          <CustomComponent item={data} />
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
