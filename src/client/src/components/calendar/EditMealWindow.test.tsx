import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EditMealWindow from "./EditMealWindow";
import { useApi } from "../../context/ApiContextProvider";
import { Dish, Meal } from "../../types/types";
import { useCalendarEvents } from "../../context/CalendarEventsContextProvider";
import { useNavigate, useParams } from "react-router-dom";

const mockGetMealById = jest.fn();
const mockUpdateMeal = jest.fn();
const mockDeleteMeal = jest.fn();

jest.mock('../common/Autocomplete', () => ({
  __esModule: true,
  default: ({ data, setData }: {data: Dish | null, setData: (dish: Dish | null) => void}) => (
    <div 
      data-testid="mock-autocomplete"
      onClick={() => {
        // Set a new dish when clicked to simulate selecting a new dish
        setData({
          id: 3,
          name: 'Test Dish 3',
          recipe: 'Test Recipe 3',
          imageUrl: 'test-image-url-3',
          ingredientList: [],
        });
      }}
    >
      <div>{data?.name}</div>
      Mock Autocomplete
    </div>
  )
}));

jest.mock('react-datepicker', () => ({
  __esModule: true,
  default: ({ selected, onChange, id }: {selected: any, onChange: any, id: string}) => (

    <input
        id={id}
        data-testid="mock-datepicker"
        value={selected}
        onChange={(e) => onChange(new Date(e.target.value))}
    />
  ),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('../../context/CalendarEventsContextProvider', () => ({
  useCalendarEvents: jest.fn(),
}));


jest.mock('../../context/UserContextProvider', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 1,
      username: 'testuser',
      email: 'email@mail.com',
      role: 'user',
    },
  })),
}));
 


jest.mock('../../context/ApiContextProvider', () => ({
  useApi: jest.fn()
}));

describe('EditMealWindow', () => {
    const startDateInputData = new Date('2025-01-01').toISOString();
    const endDateInputData = new Date('2025-01-02').toISOString();
    const testDish1 = {
      id: 1,
      name: 'Test Dish 1',
      recipe: 'Test Recipe 1',
      imageUrl: 'test-image-url-1',
      ingredientList: [],
    };
    const testDish2 = {
      id: 2,
      name: 'Test Dish 2',
      recipe: 'Test Recipe 2',
      imageUrl: 'test-image-url-2',
      ingredientList: [],
    };
    beforeEach(() => {
        jest.clearAllMocks();
        (useApi as jest.Mock).mockReturnValue({
            api: {
                meals: {
                    getById: mockGetMealById.mockResolvedValue({
                      id: 1,
                      name: 'Test Meal',
                      startDate: startDateInputData,
                      endDate: endDateInputData,
                      dishes: [testDish1, testDish2]
                    } satisfies Meal
                    ),
                    update: mockUpdateMeal,
                    updatePart: jest.fn(),
                    delete: mockDeleteMeal,
                },
                dishes: {
                    get: jest.fn(),
                    getById: jest.fn((id: number) => {
                        const dishes = [testDish1, testDish2];
                        return Promise.resolve(dishes.find(d => d.id === id) || testDish1);
                    }),
                }
            },
        });
        (useCalendarEvents as jest.Mock).mockReturnValue({
            myMeals: [
                
            ],
            setMyMeals: jest.fn(),
        });
        (useParams as jest.Mock).mockReturnValue({
            id: '1',
        });
        (useNavigate as jest.Mock).mockReturnValue(
          jest.fn()
        );
    }
    );
    test('renders the component and handles form submission with multiple dishes', async () => {
        render(<EditMealWindow />);
        
        await waitFor(() => {
            const mealNameInput = screen.getByRole('textbox', {
              name: /title/i
            });
            const startDateInput = screen.getByRole('textbox', {
              name: /start/i
            });
            const endDateInput = screen.getByRole('textbox', {
              name: /end/i
            });
            const saveButton = screen.getByRole('button', {
              name: /save/i
            });
            const dish1Name = screen.getByText('Test Dish 1');
            const dish2Name = screen.getByText('Test Dish 2');
            
            expect(mealNameInput).toBeInTheDocument();
            expect(mealNameInput).toHaveValue('Test Meal');
            expect(startDateInput).toHaveValue(new Date(startDateInputData).toString());
            expect(startDateInput).toBeInTheDocument();
            
            expect(endDateInput).toHaveValue(new Date(endDateInputData).toString());
            expect(endDateInput).toBeInTheDocument();
            
            expect(dish1Name).toBeInTheDocument();
            expect(dish2Name).toBeInTheDocument();

            fireEvent.change(mealNameInput, { target: { value: 'Updated Meal' } });
            fireEvent.change(startDateInput, { target: { value: '2025-01-03'} });
            fireEvent.change(endDateInput, { target: { value: '2025-01-04' } });
            fireEvent.click(saveButton);
          
        });
        await waitFor(() => {
            expect(mockUpdateMeal).toHaveBeenCalledWith(
                1,
                new Date('2025-01-03').toISOString(),
                new Date('2025-01-04').toISOString(),
                'Updated Meal',
                [testDish1.id, testDish2.id]
            );
        });
    });

    test('handles adding a new dish to the meal', async () => {
        render(<EditMealWindow />);
        
        await waitFor(() => {
            expect(screen.getByText('Test Dish 1')).toBeInTheDocument();
            expect(screen.getByText('Test Dish 2')).toBeInTheDocument();
        });

        const addButton = screen.getByRole('button', { name: /add/i });
        const autocomplete = screen.getByTestId('mock-autocomplete');
        
        // Simulate selecting a dish in autocomplete
        fireEvent.click(autocomplete);
        
        // The mock autocomplete sets tempDish when clicked
        // Now we need to trigger the add button
        await waitFor(() => {
            expect(addButton).not.toBeDisabled();
        });
        
        fireEvent.click(addButton);
        
        await waitFor(() => {
            // Should now show 3 dishes (original 2 + newly added)
            expect(screen.getByText('Test Dish 1')).toBeInTheDocument();
            expect(screen.getByText('Test Dish 2')).toBeInTheDocument();
            expect(screen.getByText('Test Dish 3')).toBeInTheDocument();
        });
    });

    test('handles removing a dish from the meal', async () => {
        render(<EditMealWindow />);
        
        await waitFor(() => {
            expect(screen.getByText('Test Dish 1')).toBeInTheDocument();
            expect(screen.getByText('Test Dish 2')).toBeInTheDocument();
        });

        const removeButtons = screen.getAllByText(/remove/i);
        expect(removeButtons.length).toBeGreaterThan(0);
        
        fireEvent.click(removeButtons[0]);
        
        await waitFor(() => {
            // One dish should be removed
            const remainingDishes = screen.queryAllByText(/Test Dish/i);
            expect(remainingDishes.length).toBe(1);
        });
    });

    test('handles saving with no dishes', async () => {
        // Mock meal with no dishes
        (useApi as jest.Mock).mockReturnValue({
            api: {
                meals: {
                    getById: mockGetMealById.mockResolvedValue({
                      id: 1,
                      name: 'Test Meal',
                      startDate: startDateInputData,
                      endDate: endDateInputData,
                      dishes: []
                    } satisfies Meal
                    ),
                    update: mockUpdateMeal,
                    updatePart: jest.fn(),
                    delete: mockDeleteMeal,
                },
                dishes: {
                    get: jest.fn(),
                    getById: jest.fn().mockResolvedValue(testDish1),
                }
            },
        });

        render(<EditMealWindow />);
        
        await waitFor(() => {
            const saveButton = screen.getByRole('button', {
              name: /save/i
            });
            fireEvent.click(saveButton);
        });
        
        await waitFor(() => {
            expect(mockUpdateMeal).toHaveBeenCalledWith(
                1,
                expect.any(String),
                expect.any(String),
                'Test Meal',
                []
            );
        });
    });
});