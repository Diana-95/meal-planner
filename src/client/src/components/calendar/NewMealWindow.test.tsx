import { fireEvent, render, screen } from "@testing-library/react";
import { useLocation, useNavigate } from 'react-router-dom';
import NewMealWindow from "./NewMealWindow";
import { Dish } from "../../types/types";
import { useApi } from "../../context/ApiContextProvider";
import { useCalendarEvents } from "../../context/CalendarEventsContextProvider";
import routes from "../../routes/routes";

const mockDish1 = { 
  id: 1, 
  name: 'Mock Dish 1', 
  recipe: 'Mock Recipe 1', 
  imageUrl: 'mock-image-url-1', 
  ingredientList: [] 
};

const mockDish2 = { 
  id: 2, 
  name: 'Mock Dish 2', 
  recipe: 'Mock Recipe 2', 
  imageUrl: 'mock-image-url-2', 
  ingredientList: [] 
};

let mockSetDataCallCount = 0;

jest.mock('../common/Autocomplete', () => ({
  __esModule: true,
  default: ({ data, setData }: {data: Dish | null, setData: (dish: Dish | null) => void}) => (
    <div data-testid="mock-autocomplete" 
    onClick={() => {
      mockSetDataCallCount++;
      // Alternate between dishes when clicked multiple times
      const dishToSet = mockSetDataCallCount % 2 === 1 ? mockDish1 : mockDish2;
      setData(dishToSet);
    }}>
      {data?.name || 'Mock Autocomplete'}
    </div>
  )
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../context/CalendarEventsContextProvider', () => ({
  useCalendarEvents: jest.fn(),
}));
jest.mock('react-datepicker', () => {
  return jest.fn(({ selected, onChange }) => (
    <input
      data-testid="mock-datepicker"
      value={selected}
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  ));
}
);

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
describe('create new meal window', () => {
  const mockCreateMeal = jest.fn();
  const { startDate, endDate } = {
    startDate: new Date('2025-10-01'),
    endDate: new Date('2025-10-02'),
  };

  const resetDates = () => {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
  }
  beforeEach(() => {
    mockSetDataCallCount = 0;
    jest.clearAllMocks();
    (useApi as jest.Mock).mockReturnValue({
      api: {
        meals: {
          create: mockCreateMeal,
        },
        dishes: {
          get: jest.fn(),
          getById: jest.fn((id: number) => {
            const dishes = [mockDish1, mockDish2];
            return Promise.resolve(dishes.find(d => d.id === id) || mockDish1);
          }),
        }
      },
    });
    (useCalendarEvents as jest.Mock).mockReturnValue({
      setMyMeals: jest.fn(),
    });
    (useLocation as jest.Mock).mockReturnValue({
      state: {
        start: '2025-10-01',
        end: '2025-10-02',
      },
    });
  });
  test('should render the create new meal window', () => {
    render(<NewMealWindow />);
    const newEventHeader = screen.getByRole('heading', {
        name: /new event/i
      })
    expect(newEventHeader).toBeInTheDocument();
  });

  test('should call the save function with a single dish', () => {
    render(<NewMealWindow />);
    const titleInput = screen.getByRole('textbox', { name: /title/i });

    const dishInput = screen.getByTestId('mock-autocomplete');
    const addButton = screen.getByRole('button', { name: /add/i });
    const saveButton = screen.getByRole('button', {
        name: /save/i
      });
    
    fireEvent.change(titleInput, { target: { value: 'Test Meal' } });
    fireEvent.click(dishInput);
    fireEvent.click(addButton);
    fireEvent.click(saveButton);
    
    resetDates();
    expect(titleInput).toHaveValue('Test Meal');
    expect(mockCreateMeal).toHaveBeenCalledWith(
      'Test Meal',
      startDate.toISOString(), 
      endDate.toISOString(), 
      [mockDish1.id]
      );
  });

  test('should call the save function with multiple dishes', () => {
    render(<NewMealWindow />);
    const titleInput = screen.getByRole('textbox', { name: /title/i });

    const dishInput = screen.getByTestId('mock-autocomplete');
    const addButton = screen.getByRole('button', { name: /add/i });
    const saveButton = screen.getByRole('button', {
        name: /save/i
      });
    
    fireEvent.change(titleInput, { target: { value: 'Test Meal' } });
    
    // Add first dish
    fireEvent.click(dishInput);
    fireEvent.click(addButton);
    
    // Add second dish
    fireEvent.click(dishInput);
    fireEvent.click(addButton);
    
    fireEvent.click(saveButton);
    
    resetDates();
    expect(titleInput).toHaveValue('Test Meal');
    expect(mockCreateMeal).toHaveBeenCalledWith(
      'Test Meal',
      startDate.toISOString(), 
      endDate.toISOString(), 
      [mockDish1.id, mockDish2.id]
      );
  });

  test('should call the save function with no dishes', () => {
    render(<NewMealWindow />);
    const titleInput = screen.getByRole('textbox', { name: /title/i });
    const saveButton = screen.getByRole('button', {
        name: /save/i
      });
    
    fireEvent.change(titleInput, { target: { value: 'Test Meal' } });
    fireEvent.click(saveButton);
    
    resetDates();
    expect(titleInput).toHaveValue('Test Meal');
    expect(mockCreateMeal).toHaveBeenCalledWith(
      'Test Meal',
      startDate.toISOString(), 
      endDate.toISOString(), 
      []
      );
  });

  test('should handle removing a dish', () => {
    render(<NewMealWindow />);
    const titleInput = screen.getByRole('textbox', { name: /title/i });
    const dishInput = screen.getByTestId('mock-autocomplete');
    const addButton = screen.getByRole('button', { name: /add/i });
    const saveButton = screen.getByRole('button', {
        name: /save/i
      });
    
    fireEvent.change(titleInput, { target: { value: 'Test Meal' } });
    
    // Add first dish
    fireEvent.click(dishInput);
    fireEvent.click(addButton);
    
    // Add second dish
    fireEvent.click(dishInput);
    fireEvent.click(addButton);
    
    // Remove first dish
    const removeButtons = screen.getAllByText(/remove/i);
    expect(removeButtons.length).toBe(2);
    fireEvent.click(removeButtons[0]);
    
    fireEvent.click(saveButton);
    
    resetDates();
    expect(mockCreateMeal).toHaveBeenCalledWith(
      'Test Meal',
      startDate.toISOString(), 
      endDate.toISOString(), 
      [mockDish2.id]
      );
  });

  test('should call the close function', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    render(<NewMealWindow />);
    const closeButton = screen.getByRole('button', {
      name: /cancel/i
    });
    fireEvent.click(closeButton);
    expect(mockNavigate).toHaveBeenCalledWith(routes.calendar);
  });
});