import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CalendarPage from "./CalendarPage";
import { useApi } from "../../context/ApiContextProvider";
import { useCalendarEvents } from "../../context/CalendarEventsContextProvider";
import { MemoryRouter, useNavigate } from "react-router-dom";
import routes from "../../routes/routes";
import exp from "constants";

jest.mock('react-big-calendar/lib/addons/dragAndDrop', () => {
    const React = require('react');
  
    // Simulate the HOC (Higher Order Component)
    return {
      __esModule: true,
      default: (Component: any) => {
        return (props: any) => (
          <div data-testid="mock-dnd-calendar">
            {/* Simulate internal component call if needed */}
            <button onClick={() => props.onEventDrop?.({
              event: { id: 1, title: 'Mock Meal' },
              start: new Date('2025-05-13T10:00:00'),
              end: new Date('2025-05-13T11:00:00'),
            })}>
              Trigger Drop
            </button>
  
            <button onClick={() => props.onSelectSlot?.({
              start: new Date('2025-05-13T08:00:00'),
              end: new Date('2025-05-13T09:00:00'),
              slots: [],
              action: 'select',
            })}>
              Trigger Slot Select
            </button>
  
            <button onClick={() => props.onSelectEvent?.({
                id: 1,  
                title: 'Test Meal',
                start: new Date('2025-05-05'),
                end: new Date('2025-05-06'),
                allDay: true,
                dishes: [],
            })}>
                Trigger Event Click
            </button>
            <button onClick={() => props.onEventResize?.({
              event: { id: 2, title: 'Resizable Event' },
              start: new Date('2025-05-13T09:00:00'),
              end: new Date('2025-05-13T10:00:00'),
            })}>
              Trigger Resize
            </button>
          </div>
        );
      },
      EventInteractionArgs: {}, // Optional: Mock type export if you're using it
    };
  });

  
jest.mock('../../context/ApiContextProvider', () => ({
    useApi: jest.fn(),
}));

jest.mock('../../context/CalendarEventsContextProvider', () => ({
    useCalendarEvents: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));

jest.mock('react-big-calendar', () => {
    const originalModule = jest.requireActual('react-big-calendar');
    return {
      ...originalModule,
      dateFnsLocalizer: jest.fn(() => ({})),
    };
  });
  
describe('CalendarPage', () => {
    const mockGetMyMeals = jest.fn();
    const mockSetMealsToCalendar = jest.fn();
    const mockUpdateMealPart = jest.fn();
    const mockNavigate = jest.fn();
       
    const initialMeals = [
        {
            id: 1,
            name: 'Test Meal',
            startDate: new Date('2025-05-05').toISOString(),
            endDate: new Date('2025-05-06').toISOString(),
            dishes: [{
                id: 1,
                name: 'Test Dish',
                recipe: 'Test Recipe',
                imageUrl: 'test-image-url',
                ingredientList: [],
            }],
        },
    ];
    const mockCalendarEvents = [
        {   'id': 1, 
            'title': 'Test Meal', 
            'start': new Date('2025-05-05'), 
            'end': new Date('2025-05-06'), 
            'allDay': true, 
            'dishes': [{ id: 1, 
                    name: 'Test Dish', 
                    recipe: 'Test Recipe', 
                    imageUrl: 'test-image-url', 
                    ingredientList: [] 
                }] 
        }];
    beforeEach(() => {
        jest.clearAllMocks();
        (useApi as jest.Mock).mockReturnValue({
            api: {
                meals: {
                    get: mockGetMyMeals.mockResolvedValue(initialMeals),
                    getById: jest.fn(),
                    updatePart: mockUpdateMealPart,
                },
            },
        });
        (useCalendarEvents as jest.Mock).mockReturnValue({
            myMeals: mockCalendarEvents,
            setMyMeals: mockSetMealsToCalendar,
        });
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    test('renders correctly', async () => {
        render(<MemoryRouter>
                <CalendarPage />
               </MemoryRouter>);
        const heading = screen.getByRole('heading', { name: /weekly meal planner/i });
        const calendar = screen.getByTestId('mock-dnd-calendar');
        expect(heading).toBeInTheDocument();
        expect(calendar).toBeInTheDocument();
    });

    test('loads meals on mount', async () => {
        render(<MemoryRouter>
                <CalendarPage />
               </MemoryRouter>);
        await waitFor(() => {
            expect(mockGetMyMeals).toHaveBeenCalled();
            expect(mockSetMealsToCalendar).toHaveBeenCalledWith(mockCalendarEvents);
        });
    });

    test('moves event to new date', async () => {
        
        render(<MemoryRouter>
                <CalendarPage />
               </MemoryRouter>);

        fireEvent.click(screen.getByText('Trigger Drop'));
        expect(mockUpdateMealPart).toHaveBeenCalledWith(
            1,
            (new Date('2025-05-13T10:00:00')).toISOString(),
            (new Date('2025-05-13T11:00:00')).toISOString(), 
        );
        expect(mockSetMealsToCalendar).toHaveBeenCalled();
    });
    
    test('selects slot and navigates to new meal page', async () => {
        
        render(<MemoryRouter>
                <CalendarPage />
               </MemoryRouter>);

        fireEvent.click(screen.getByText('Trigger Slot Select'));
        await waitFor( () => {
           
            expect(mockNavigate).toHaveBeenCalledWith(routes.newMeal, expect.objectContaining({
                state: expect.objectContaining({
                    start: expect.any(String),
                    end: expect.any(String),
                })
            }));
        });
    });

    test('resizes event and updates meal', async () => {
        render(<MemoryRouter>
                <CalendarPage />
               </MemoryRouter>);

        fireEvent.click(screen.getByText('Trigger Resize'));
        expect(mockUpdateMealPart).toHaveBeenCalledWith(
            2,
            (new Date('2025-05-13T09:00:00')).toISOString(),
            (new Date('2025-05-13T10:00:00')).toISOString(), 
        );
    });

    test('handles event click', async () => {
        render(<MemoryRouter>
                <CalendarPage />
               </MemoryRouter>);

        fireEvent.click(screen.getByText('Trigger Event Click'));
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(routes.editMeal(1));
        });
    });
});