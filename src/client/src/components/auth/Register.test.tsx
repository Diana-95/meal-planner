
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContextProvider';
import routes from '../../routes/routes';
import { useApi } from '../../context/ApiContextProvider';

import Register from "./Register";
import { MemoryRouter } from "react-router-dom";

jest.mock('../../context/ApiContextProvider', () => ({
    useApi: jest.fn(),
  }));
  
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

describe('Register new User', () => {
    const username = 'John Doe';
    const email = 'mail@mail.com';
    const password = 'password';
    const id = 1;

    const mockRegister = jest.fn();

    const mockSetUser = jest.fn();
    const mockNavigate = jest.fn();

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock implementations for context hooks
       
        (useApi as jest.Mock).mockReturnValue({
            api: {
                users: {
                    create: mockRegister,
                },
            },
        });
        (useUser as jest.Mock).mockReturnValue({
            setUser: mockSetUser,
        });

        // Mock useNavigate hook
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    test('registers new user with entered data',async () => {
        mockRegister.mockResolvedValue({ rowID: id });
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>);

        const inputElementUsername = screen.getByLabelText(/Username/i);
        const inputElementEmail = screen.getByLabelText(/Email/i);
        const inputElementPassword = screen.getByLabelText(/Password/i);

        fireEvent.change(inputElementUsername, { target: { value: username } });
        fireEvent.change(inputElementEmail, { target: { value:  email} });
        fireEvent.change(inputElementPassword, { target: { value:  password} });
        
        const button = screen.getByRole("button", { name: "Register" });
        fireEvent.click(button);
        
        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith(username, email, password);
            expect(mockSetUser).toHaveBeenCalledWith({email, id, username});
            expect(mockNavigate).toHaveBeenCalledWith(routes.calendar);
        });

    });

    test('', async () => {

    });
});