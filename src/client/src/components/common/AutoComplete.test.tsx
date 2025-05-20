// Autocomplete.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Autocomplete from './Autocomplete';

interface DummyProps {
  listitem: string;
  id: number;
}

const DummyAutocompleteComponent: React.FC<{item: DummyProps}> = ({ item }) => (
    <div data-testid={item.id.toString()}>
        {item.listitem}
    </div>
);

const sampleSuggestions: DummyProps[] = [
  { listitem: 'Apple', id: 1 },
  { listitem: 'Salt', id: 3 },
  { listitem: 'Apricot', id: 2 },
];

describe('Autocomplete component', () => {
  const mockFetchAllSuggestions = jest.fn();
  const mockSetData = jest.fn();

  beforeEach(() => {
    // Clear all mock histories before each test
    jest.clearAllMocks();
  });

  test('renders the input field', () => {
    render(
  
      <Autocomplete<DummyProps>
        data={null}
        setData={mockSetData}
        fetchAllSuggestions={mockFetchAllSuggestions}
        CustomComponent={DummyAutocompleteComponent}
      />
    );
    const input = screen.getByPlaceholderText('Search for a dish...');
    expect(input).toBeInTheDocument();
  });

  test('does not fetch suggestions for input shorter than 2 characters', async () => {
    render(
      <Autocomplete
        data={null}
        setData={mockSetData}
        fetchAllSuggestions={mockFetchAllSuggestions}
        CustomComponent={DummyAutocompleteComponent}
      />
    );
    const input = screen.getByPlaceholderText('Search for a dish...');
    await userEvent.type(input, 'a'); // Only 1 character
    expect(mockFetchAllSuggestions).not.toHaveBeenCalled();
  });

  test('fetches suggestions when input length is >= 2 and renders them', async () => {
    
    // Simulate fetchAllSuggestions resolving to our suggestions
    mockFetchAllSuggestions.mockResolvedValue(sampleSuggestions);
    render(
      <Autocomplete
        data={null}
        setData={mockSetData}
        fetchAllSuggestions={mockFetchAllSuggestions}
        CustomComponent={DummyAutocompleteComponent}
      />
    );
    const input = screen.getByPlaceholderText('Search for a dish...');
    await userEvent.type(input, 'Sa'); // 2 characters trigger suggestion fetch

    // Wait until fetchAllSuggestions is called with the correct query
    await waitFor(() =>
      expect(mockFetchAllSuggestions).toHaveBeenCalledWith(undefined, undefined, 'Sa')
    );

    // Verify that each suggestion is rendered using the DummyComponent
    sampleSuggestions.forEach((suggestion) => {
      const elem =screen.getByTestId(suggestion.id);
      
      expect(elem).toBeInTheDocument();
    });
  });

  test('clicking a suggestion calls setData and clears input and suggestions', async () => {
  
    mockFetchAllSuggestions.mockResolvedValue(sampleSuggestions);
    render(
      <Autocomplete
        data={null}
        setData={mockSetData}
        fetchAllSuggestions={mockFetchAllSuggestions}
        CustomComponent={DummyAutocompleteComponent}
      />
    );
    const input = screen.getByPlaceholderText('Search for a dish...');
    const searchString = 'Sa';
    await userEvent.type(input, searchString);

    const filteredItems = sampleSuggestions.filter(item => item.listitem.includes(searchString));
    // Wait for suggestions to appear
    await Promise.all(
      filteredItems.map(item =>
        waitFor(() =>
          expect(screen.getByTestId(item.id)).toBeInTheDocument()
        )
      )
    );
    
    const chosenSuggestionItem = screen.getByTestId(filteredItems[0].id);
    await userEvent.click(chosenSuggestionItem);

    expect(mockSetData).toHaveBeenCalledWith(filteredItems[0]);
    expect(input).toHaveValue('');
  });

  test('renders selected item', () => {
    const preselectedData = sampleSuggestions[0];
    render(
      <Autocomplete
        data={preselectedData}
        setData={mockSetData}
        fetchAllSuggestions={mockFetchAllSuggestions}
        CustomComponent={DummyAutocompleteComponent}
      />
    );
    // The custom component should render the preselected data
    expect(screen.getByTestId(preselectedData.id)).toBeInTheDocument();
  });
});
