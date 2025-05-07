import { fireEvent, render, screen } from "@testing-library/react";
import { useLocation, useNavigate } from 'react-router-dom';
import NewMealWindow from "./NewMealWindow";
import { Dish } from "../../types/types";
import { useApi } from "../../context/ApiContextProvider";
import { useCalendarEvents } from "../../context/CalendarEventsContextProvider";

jest.mock('../common/Autocomplete', () => ({
  __esModule: true,
  default: ({ data, setData }: {data: Dish, setData: (dish: Dish) => void}) => (
    <div data-testid="mock-autocomplete" 
    onClick={() => setData({ 
              id: 1, 
              name: 'Mock Dish', 
              recipe: 'Mock Recipe', 
              imageUrl: 'mock-image-url', 
              ingredientList: [] 
              })
    }>
      Mock Autocomplete
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
    
    jest.clearAllMocks();
    (useApi as jest.Mock).mockReturnValue({
      api: {
        meals: {
          create: mockCreateMeal,
        },
        dishes: {
          get: jest.fn(),
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

  test('should call the save function with arguments that I entered into the input fields', () => {
    render(<NewMealWindow />);
    const titleInput = screen.getByRole('textbox', { name: /title/i });

    const dishInput = screen.getByTestId('mock-autocomplete');
    const saveButton = screen.getByRole('button', {
        name: /save/i
      });
    
    fireEvent.change(titleInput, { target: { value: 'Test Meal' } });
    fireEvent.click(dishInput);
    fireEvent.click(saveButton);
    
    resetDates();
    expect(titleInput).toHaveValue('Test Meal');
    expect(mockCreateMeal).toHaveBeenCalledWith(
      'Test Meal',
      startDate.toISOString(), 
      endDate.toISOString(), 
      1
      );
  });

});