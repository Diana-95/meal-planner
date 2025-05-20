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
  default: ({ data, setData }: {data: Dish, setData: (dish: Dish) => void}) => (
    <div data-testid="mock-autocomplete">
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
    const testDish = {
      id: 1,
      name: 'Test Dish',
      recipe: 'Test Recipe',
      imageUrl: 'test-image-url',
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
                      dish: testDish
                    } satisfies Meal
                    ),
                    update: mockUpdateMeal,
                    updatePart: jest.fn(),
                    delete: mockDeleteMeal,
                },
                dishes: {
                    get: jest.fn(),
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
    test('renders the component and handles form submission', async () => {
        render(<EditMealWindow />);
        
        
        // const startDateInput = screen.getByRole('textbox', { 
        //     name: /start/i
        // });
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
            const dishName = screen.getByText('Test Dish');
            expect(mealNameInput).toBeInTheDocument();
            expect(mealNameInput).toHaveValue('Test Meal');
            expect(startDateInput).toHaveValue(new Date(startDateInputData).toString());
            expect(startDateInput).toBeInTheDocument();
            
            expect(endDateInput).toHaveValue(new Date(endDateInputData).toString());
            expect(endDateInput).toBeInTheDocument();
            
            expect(dishName).toBeInTheDocument();

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
                testDish.id
            );
        });
    });
});