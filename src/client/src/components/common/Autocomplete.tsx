import React, { useState } from 'react';

interface ChildComponentProps<T> {
    data: T | null;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
    fetchAllSuggestions: (cursor?: number, limit?: number, searchName?: string) => Promise<T[] | undefined>;
    CustomComponent: React.ComponentType<{ item: T }>;  
  }

function Autocomplete<T>({ data, setData, fetchAllSuggestions,  CustomComponent}: ChildComponentProps<T>) {

  console.log(data);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<T[]>([]);

  // fetchSuggestions
  const fetchSuggestions = async (query: string) => {
    fetchAllSuggestions(undefined, undefined, query)
    .then((suggestedDishes) => {
      if(suggestedDishes)
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

  const handleSuggestionClick = (selected: T) => {
    setData(selected); // Set selected dish
    setInputValue(''); // Set input to the selected dish name
    setSuggestions([]); // Hide suggestions
  };

  // useEffect(() => {
  //   setInputValue(data?.name ?? '');
  // }, [dish?.name])

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
          {suggestions.map((suggestedItem, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestedItem)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
              }}
            >
               { <CustomComponent item={suggestedItem} /> }
            </li>
          ))}
        </ul>
      )}
      {data && (
        <CustomComponent item={data} />
      )}
    </div>
  );
};

export default Autocomplete;
