// DishList.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DishList from './DishList';
import { useApi } from '../../context/ApiContextProvider';
import { useDishes } from '../../context/DishesContextProvider';
import { useNavigate, useRevalidator } from 'react-router-dom';
import routes from '../../routes/routes';

// Mock the context and router hooks
jest.mock('../../context/ApiContextProvider', () => ({
  useApi: jest.fn(),
}));
jest.mock('../../context/DishesContextProvider', () => ({
  useDishes: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useRevalidator: jest.fn(),
}));

describe('DishList component', () => {
  // Dummy dishes to simulate API response
  const dummyDishes = [
    { id: 1, name: 'Dish 1', recipe: 'Recipe 1', imageUrl: 'image1.jpg' },
    { id: 2, name: 'Dish 2', recipe: 'Recipe 2', imageUrl: 'image2.jpg' },
  ];

  const mockGetDishes = jest.fn();
  const mockSetDishes = jest.fn();
  const mockNavigate = jest.fn();
  const mockRevalidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks for the contexts and router hooks
    (useApi as jest.Mock).mockReturnValue({
      api: {
        dishes: {
          // Simulate the get method returning dummy dishes
          get: mockGetDishes.mockResolvedValue(dummyDishes),
        },
      },
    });

    (useDishes as jest.Mock).mockReturnValue({
      // For testing, we provide dummyDishes as the current state
      dishes: dummyDishes,
      setDishes: mockSetDishes,
    });

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useRevalidator as jest.Mock).mockReturnValue({
      revalidate: mockRevalidate,
    });
  });

  test('renders dish list and Create New Dish button', async () => {
    render(<DishList />);

    // Wait until the dish names appear
    await waitFor(() => {
      expect(screen.getByText('Dish 1')).toBeInTheDocument();
      expect(screen.getByText('Dish 2')).toBeInTheDocument();
    });

    // Check that the "Create New Dish" button is rendered
    const createButton = screen.getByText('Create New Dish');
    expect(createButton).toBeInTheDocument();
  });

  test('clicking Create New Dish navigates to new dish route', async () => {
    render(<DishList />);

    const createButton = screen.getByText('Create New Dish');
    fireEvent.click(createButton);
    expect(mockNavigate).toHaveBeenCalledWith(routes.newDish);
  });

  test('clicking an Edit button navigates to the edit dish route with correct id', async () => {
    render(<DishList />);

    // Find all Edit buttons (one per dish)
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);

    // Click the first Edit button (for the dish with id: 1)
    fireEvent.click(editButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith(routes.editDish(1));
  });

  test('calls revalidate on mount', async () => {
    render(<DishList />);
    await waitFor(() => {
      expect(mockRevalidate).toHaveBeenCalled();
    });
  });
});

