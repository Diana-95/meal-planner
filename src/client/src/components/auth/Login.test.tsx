// Login.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Login from './Login';
import routes from '../../routes/routes';

import { useApi } from '../../context/ApiContextProvider';
import { useUser } from '../../context/UserContextProvider';
import { useNavigate } from 'react-router-dom';

// Mock the context hooks and useNavigate
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



describe('Login Component', () => {
  const mockLogin = jest.fn();
  const mockSetUser = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock implementations for context hooks
    (useApi as jest.Mock).mockReturnValue({
      api: {
        users: {
          login: mockLogin,
        },
      },
    });

    (useUser as jest.Mock).mockReturnValue({
      setUser: mockSetUser,
    });

    // Mock useNavigate hook
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  test('calls login API and navigates on successful login', async () => {
    // Arrange: mock API login to resolve with a user object
    const loggedUser = { username: 'testuser', email: 'test@example.com', id: '123' };
    mockLogin.mockResolvedValue(loggedUser);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Act: simulate user input and form submission
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password');
    userEvent.click(loginButton);

    // Assert: verify that login was called with correct values
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password');
    });

    // Assert: check that setUser was called with the expected user object
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        username: loggedUser.username,
        email: loggedUser.email,
        id: loggedUser.id,
      });
    });

    // Assert: verify that navigation to routes.calendar was triggered
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(routes.calendar);
    });
  });

  test('does not update user or navigate if login fails', async () => {
    // Arrange: mock API login to resolve with null (failed login)
    mockLogin.mockResolvedValue(null);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Act: simulate user input and form submission
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password');
    userEvent.click(loginButton);

    // Assert: login should be called with the correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password');
    });

    // Assert: setUser and navigate should NOT be called when login fails
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
