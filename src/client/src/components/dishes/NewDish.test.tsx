
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NewDishWindow from "./NewDish";
import { useApi } from "../../context/ApiContextProvider";
import { useDishes } from "../../context/DishesContextProvider";
import { useNavigate } from "react-router-dom";
import routes from "../../routes/routes";

jest.mock('../../context/ApiContextProvider', () => ({
    useApi: jest.fn(),
}));
jest.mock('../../context/DishesContextProvider', () => ({
    useDishes: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

describe('create new dish window', () => {
    const mockCreateDish = jest.fn();
    const mockSetDishes = jest.fn();
    const mockNavigate = jest.fn();
    beforeEach(() => {
        (useApi as jest.Mock).mockReturnValue({
            api: {
                dishes: {
                    create: mockCreateDish.mockResolvedValue({ rowID: 1 }),
                },
            },
        });
        (useDishes as jest.Mock).mockReturnValue({
            setDishes: mockSetDishes,
        });
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });
    
    test('renders NewDishWindow component', () => {
        render(<NewDishWindow />);
        const nameInput = screen.getByLabelText(/name/i);
        expect(nameInput).toBeInTheDocument();
        expect(screen.getByText('Create new dish recipe')).toBeInTheDocument();
        expect(screen.getByText('Recipe:')).toBeInTheDocument();
        expect(screen.getByText('Image URL:')).toBeInTheDocument();
    });

    test('calls create dish API and updates dishes context on save', async () => {
        render(<NewDishWindow />);
        const nameInput = screen.getByLabelText(/name/i);
        const recipeInput = screen.getByLabelText(/recipe/i);
        const imageUrlInput = screen.getByLabelText(/image url/i);
        const saveButton = screen.getByText('Save');
        
        fireEvent.change(nameInput, { target: { value: 'Test Dish' } });
        fireEvent.change(recipeInput, { target: { value: 'Test Recipe' } });
        fireEvent.change(imageUrlInput, { target: { value: 'test-image-url' } });
        fireEvent.click(saveButton);
        
        await waitFor(() => {
            expect(mockCreateDish).toHaveBeenCalledWith('Test Dish', 'Test Recipe', 'test-image-url');
            expect(mockSetDishes).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith(routes.dishes);
            const callback = mockSetDishes.mock.calls[0][0];
            const result = callback([]);
            expect(result).toEqual([{ id: 1, name: 'Test Dish', recipe: 'Test Recipe', imageUrl: 'test-image-url' }]);
        });
    });

    test('does not call create dish API if name is empty', async () => {
        render(<NewDishWindow />);
        const saveButton = screen.getByText('Save');
        
        fireEvent.click(saveButton);
        
        await waitFor(() => {
            expect(mockCreateDish).not.toHaveBeenCalled();
        });
    });

    test('does not call create dish API if recipe is empty', async () => {
        render(<NewDishWindow />);
        const nameInput = screen.getByLabelText(/name/i);
        const saveButton = screen.getByText('Save');
        
        fireEvent.change(nameInput, { target: { value: 'Test Dish' } });
        fireEvent.click(saveButton);
        
        await waitFor(() => {
            expect(mockCreateDish).not.toHaveBeenCalled();
        });
    });

    test('closes the modal when cancel button or overlay is clicked', async () => {
        render(<NewDishWindow />);
        const cancelButton = screen.getByText('Cancel');
        const overlay = screen.getByTestId('overlay');
        
        fireEvent.click(cancelButton);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(routes.dishes);
        });
        
        fireEvent.click(overlay);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(routes.dishes);
        });
    });
});