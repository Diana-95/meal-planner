import React, { useEffect, useState } from 'react';
import { getAllSuggestedDishes } from '../../Apis/dishesApi';
import { Dish } from '../../types/types';

interface ChildComponentProps {
    dish: Dish | null;
    setDish: React.Dispatch<React.SetStateAction<Dish | null>>
  }

const DishAutocomplete: React.FC<ChildComponentProps> = ({ dish, setDish }) => {

    console.log(dish);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Dish[]>([]);

  const fetchSuggestions = async (query: string) => {
    getAllSuggestedDishes(query)
    .then((suggestedDishes) => {
        setSuggestions(suggestedDishes);
    })
    .catch((error) => {
        console.error('Error fetching suggestions:', error);
    });
  }
 // event: React.ChangeEvent<HTMLInputElement>
  const handleInputChange = ({ target: {value}} : React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(value);
    if (value.length >= 2) { // Fetch suggestions for 2 or more characters
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (selected: Dish) => {
    setDish(selected); // Set selected dish
    // setInputValue(selected.name); // Set input to the selected dish name
    setSuggestions([]); // Hide suggestions
  };

  useEffect(() => {
    setInputValue(dish?.name ?? '');
  }, [dish?.name])

  return (
    <div style={{ position: 'relative', width: '300px' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Search for a dish..."
        style={{ width: '100%', padding: '8px' }}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            zIndex: 1000,
          }}
        >
          {suggestions.map((suggestedDish) => (
            <li
              key={suggestedDish.id}
              onClick={() => handleSuggestionClick(suggestedDish)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
              }}
            >
              {suggestedDish.name}
            </li>
          ))}
        </ul>
      )}
      {dish && (
        <div style={{ marginTop: '16px' }}>
          <h4>Selected Dish:</h4>
          <p><strong>Name:</strong> {dish.name}</p>
          <p><strong>Recipe:</strong> {dish.recipe}</p>
        </div>
      )}
    </div>
  );
};

export default DishAutocomplete;
