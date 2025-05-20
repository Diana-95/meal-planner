
import { fireEvent, render, screen } from "@testing-library/react";
import NavBar from "./NavBar";
import { useUser } from '../../context/UserContextProvider';
import { User } from "../../types/types";
import { MemoryRouter, useNavigate } from "react-router-dom";
import routes from "../../routes/routes";

jest.mock('../../context/UserContextProvider', () => ({
    useUser: jest.fn(),
}));

jest.mock('react-router-dom', () => {
    // Keep the original functionalities for everything except useNavigate
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: jest.fn(),
    };
});
const mockNavigate = jest.fn();
describe('Navigation Bar tests', () => {
    const userMock: User = {
        id: 0,
        username: "name",
        email: ""
    } satisfies User;
    const mockSetUser = jest.fn();
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        

        (useUser as jest.Mock).mockReturnValue({
            user: userMock,
            setUser: mockSetUser,
        });
        (useNavigate as jest.Mock).mockReturnValue(
            mockNavigate);
        
    });

    test('all links are active and logo shows up', () => {
        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
            ); 
        const userName = screen.getByText(userMock.username);
        expect(userName).toBeInTheDocument();
    });

    test('logout button works', () => {
        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
            ); 
        const logoutButton = screen.getByRole('button', { name: /logout/i });
        expect(logoutButton).toBeInTheDocument();
        logoutButton.click();
        expect(mockSetUser).toHaveBeenCalledWith(null);
    });

    test('all links are active', () => {
        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
            ); 
        const homeLink = screen.getByRole('link', { name: /home/i });
        const calendarLink = screen.getByRole('link', { name: /calendar/i });
        const recipesLink = screen.getByRole('link', { name: /recipes/i });
        const productsLink = screen.getByRole('link', { name: /products list/i });

        expect(homeLink).toBeInTheDocument();
        expect(calendarLink).toBeInTheDocument();
        expect(recipesLink).toBeInTheDocument();
        expect(productsLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', routes.home);
        expect(calendarLink).toHaveAttribute('href', routes.calendar);
        expect(recipesLink).toHaveAttribute('href', routes.dishes);
        expect(productsLink).toHaveAttribute('href', routes.products);
    });

  
}); 