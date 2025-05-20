import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../context/ApiContextProvider";
import { useDishes } from "../../context/DishesContextProvider";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import EditDish from "./EditDish";
import { Product } from "../../types/types";
import routes from "../../routes/routes";


jest.mock('../common/Autocomplete', () => ({
  __esModule: true,
  default: ({ data, setData }: {data: Product, setData: (prod: Product) => void}) => (
    <div data-testid="mock-autocomplete"
     onClick={() => 
        setData({ 
          id: 1, 
          name: 'Mock Product',
          measure: 'kg',
          price: 10
        } satisfies Product)
      }
      >
      Mock Autocomplete
    </div>
  )
}));

jest.mock('../../context/ApiContextProvider', () => ({
  useApi: jest.fn(),
}));
jest.mock('../../context/DishesContextProvider', () => ({
  useDishes: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

describe('EditDish', () => {
  const mockSetDishes = jest.fn();
  const mockGetDishesById = jest.fn();
  const mockCreateIngredient = jest.fn();
  const mockGetProducts = jest.fn();
  const mockNavigate = jest.fn();
  const mockUpdateDish = jest.fn();
  const mockUpdateIngredient = jest.fn();

  beforeEach(() => {
    (useApi as jest.Mock).mockReturnValue({
      api: {
        dishes: { 
          getById: mockGetDishesById.mockResolvedValue({
            id: 1,
            name: 'Test Dish',
            recipe: 'Test Recipe',
            imageUrl: 'test-image-url',
            ingredientList: [
                { id: 1, product: { id: 1, name: 'Test Product', imageUrl: 'test-image-url' }, dishId: 1, quantity: 2 },
            ],
          }),
          update: mockUpdateDish.mockResolvedValue({
            success: true,
          }),
        },
        ingredients: { 
          create: mockCreateIngredient.mockResolvedValue({ rowID: 1 }),
          update: mockUpdateIngredient.mockResolvedValue({ success: true }),
        },
        products: { get: mockGetProducts}
      },
    });
    (useDishes as jest.Mock).mockReturnValue({
      setDishes: mockSetDishes,
    });
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

  });

  test('renders Dish to edit component', async () => {
    render(<EditDish />);
    const input = screen.getByLabelText(/name/i);
    await waitFor(() => {
        expect(screen.getByText('Edit Dish')).toBeInTheDocument();
        expect(input).toHaveValue('Test Dish');
        expect(screen.getByText('Test Recipe')).toBeInTheDocument();
        expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  test('handles editing dish', async () => {
    render(<EditDish />);
    const input = screen.getByLabelText(/name/i);
    const recipeInput = screen.getByLabelText(/recipe/i);
    const imageInput = screen.getByLabelText(/image/i);
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    await waitFor(() => {
      expect(input).toHaveValue('Test Dish');
      expect(recipeInput).toHaveValue('Test Recipe');
      expect(imageInput).toHaveValue('test-image-url');
    });

    // Simulate user input
    fireEvent.change(input, { target: { value: 'New Dish Name' } });
    fireEvent.change(recipeInput, { target: { value: 'New Recipe' } });
    fireEvent.change(imageInput, { target: { value: 'new-image-url' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateDish).toHaveBeenCalledWith('New Dish Name', 'New Recipe', 'new-image-url', 1);
      expect(mockSetDishes).toHaveBeenCalledWith(expect.any(Function));
      expect(mockNavigate).toHaveBeenCalledWith(routes.dishes);
    });
  });
  test('handles adding ingredient', async () => {
    render(<EditDish />);
    const productInput = screen.getByTestId('mock-autocomplete');
    fireEvent.click(productInput);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(mockCreateIngredient).toHaveBeenCalledWith(1, 1, 1);
      expect(mockSetDishes).toHaveBeenCalled();
    });
  });
  
  test('handles ingredient quantity change', async () => {
    render(<EditDish />);
    const testProductCell = await screen.findByText('Test Product');
    const targetRow = testProductCell.closest('tr');
    if (!targetRow) {
      throw new Error('Target row not found');
    }

    // Find the 'Quantity' column index
    const quantityColumn = screen.getByText('Quantity');
    const headersRow = quantityColumn.closest('tr');
    if (!headersRow) {
      throw new Error('Headers row not found');
    }
    const headers = within(headersRow).getAllByRole('columnheader');
    const quantityColumnIndex = headers.findIndex(
      (header) => header.textContent === 'Quantity'
    );

    // Get all cells in the row and find the quantity cell
    const cells = within(targetRow).getAllByRole('cell');
    const quantityCell = cells[quantityColumnIndex];

    // Interact with the spinbutton
    const quantityInput = within(quantityCell).getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    // Click the Save button
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Wait for mock function assertions
    await waitFor(() => {
      expect(mockUpdateIngredient).toHaveBeenCalledWith(1, 1, 5, 1);
      expect(mockSetDishes).toHaveBeenCalled();
    });

  });

});