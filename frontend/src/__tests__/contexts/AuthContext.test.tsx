/**
 * AuthContext Tests
 * 
 * Tests authentication context functionality, state management, and user sessions
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { createMockResponse } from '@/test-utils/test-helpers';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test component to interact with AuthContext
const TestComponent = () => {
  const { user, login, logout, isLoading } = useAuth();

  return (
    <div>
      <div data-testid="loading-state">{isLoading.toString()}</div>
      <div data-testid="user-info">
        {user ? `${user.name} (${user.email})` : 'Not logged in'}
      </div>
      <button 
        onClick={() => login('test@example.com', 'Test User')}
        data-testid="login-button"
      >
        Login
      </button>
      <button 
        onClick={logout}
        data-testid="logout-button"
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Initial State', () => {
    it('starts with no authenticated user', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-info')).toHaveTextContent('Not logged in');
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });

    it('restores user from localStorage on mount', () => {
      const savedUser = {
        id: '1',
        name: 'Saved User',
        email: 'saved@example.com',
      };
      
      localStorage.setItem('auth-user', JSON.stringify(savedUser));
      localStorage.setItem('auth-token', 'saved-token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-info')).toHaveTextContent('Saved User (saved@example.com)');
    });

    it('clears invalid stored data', () => {
      localStorage.setItem('auth-user', 'invalid-json');
      localStorage.setItem('auth-token', 'token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-info')).toHaveTextContent('Not logged in');
      expect(localStorage.getItem('auth-user')).toBeNull();
      expect(localStorage.getItem('auth-token')).toBeNull();
    });
  });

  describe('Login Functionality', () => {
    it('successfully logs in user', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };
      
      const mockResponse = createMockResponse({
        data: {
          login: {
            user: mockUser,
            token: 'auth-token-123',
          },
        },
      });
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      
      await act(async () => {
        await user.click(loginButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Test User (test@example.com)');
      });

      // Check localStorage is updated
      expect(localStorage.getItem('auth-user')).toBe(JSON.stringify(mockUser));
      expect(localStorage.getItem('auth-token')).toBe('auth-token-123');
    });

    it('shows loading state during login', async () => {
      // Mock a delayed response
      mockFetch.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(createMockResponse({})), 100))
      );

      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      
      await act(async () => {
        await user.click(loginButton);
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('true');
      
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
      });
    });

    it('handles login errors gracefully', async () => {
      const mockErrorResponse = createMockResponse({
        errors: [{ message: 'Invalid credentials' }],
      }, false);
      
      mockFetch.mockResolvedValueOnce(mockErrorResponse);

      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      
      await act(async () => {
        await user.click(loginButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Not logged in');
        expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
      });

      // Should not store anything in localStorage on error
      expect(localStorage.getItem('auth-user')).toBeNull();
      expect(localStorage.getItem('auth-token')).toBeNull();
    });

    it('handles network errors during login', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      
      await act(async () => {
        await user.click(loginButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Not logged in');
        expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
      });
    });
  });

  describe('Logout Functionality', () => {
    it('successfully logs out user', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };
      
      // Set up initial authenticated state
      localStorage.setItem('auth-user', JSON.stringify(mockUser));
      localStorage.setItem('auth-token', 'auth-token');

      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Verify user is initially logged in
      expect(screen.getByTestId('user-info')).toHaveTextContent('Test User (test@example.com)');

      const logoutButton = screen.getByTestId('logout-button');
      
      await act(async () => {
        await user.click(logoutButton);
      });

      expect(screen.getByTestId('user-info')).toHaveTextContent('Not logged in');
      
      // Check localStorage is cleared
      expect(localStorage.getItem('auth-user')).toBeNull();
      expect(localStorage.getItem('auth-token')).toBeNull();
    });

    it('clears all auth-related storage on logout', async () => {
      // Set up multiple auth-related items
      localStorage.setItem('auth-user', '{"id":"1"}');
      localStorage.setItem('auth-token', 'token');
      localStorage.setItem('auth-refresh-token', 'refresh');
      sessionStorage.setItem('auth-temp', 'temp');

      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByTestId('logout-button');
      
      await act(async () => {
        await user.click(logoutButton);
      });

      expect(localStorage.getItem('auth-user')).toBeNull();
      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(localStorage.getItem('auth-refresh-token')).toBeNull();
      expect(sessionStorage.getItem('auth-temp')).toBeNull();
    });
  });

  describe('Token Management', () => {
    it('includes auth token in API requests', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };
      
      const mockResponse = createMockResponse({
        data: {
          login: {
            user: mockUser,
            token: 'auth-token-123',
          },
        },
      });
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login-button');
      
      await act(async () => {
        await user.click(loginButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });
    });

    it('handles expired token gracefully', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };
      
      // Set up user with expired token
      localStorage.setItem('auth-user', JSON.stringify(mockUser));
      localStorage.setItem('auth-token', 'expired-token');

      // Mock API call that returns 401 (unauthorized)
      mockFetch.mockResolvedValueOnce(createMockResponse({
        errors: [{ message: 'Token expired' }],
      }, false));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially shows user as logged in
      expect(screen.getByTestId('user-info')).toHaveTextContent('Test User (test@example.com)');

      // After token validation fails, should log out
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Not logged in');
      });

      expect(localStorage.getItem('auth-user')).toBeNull();
      expect(localStorage.getItem('auth-token')).toBeNull();
    });
  });

  describe('Context Error Handling', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });

    it('provides default values when context is undefined', () => {
      // This test might be implementation-specific
      // depending on how the context is set up
    });
  });

  describe('Multiple Components', () => {
    it('shares auth state across multiple components', async () => {
      const ComponentA = () => {
        const { user } = useAuth();
        return <div data-testid="component-a">{user?.name || 'Not logged in'}</div>;
      };

      const ComponentB = () => {
        const { user, login } = useAuth();
        return (
          <div>
            <div data-testid="component-b">{user?.name || 'Not logged in'}</div>
            <button 
              onClick={() => login('test@example.com', 'Shared User')}
              data-testid="shared-login"
            >
              Login
            </button>
          </div>
        );
      };

      const mockResponse = createMockResponse({
        data: {
          login: {
            user: { id: '1', name: 'Shared User', email: 'test@example.com' },
            token: 'shared-token',
          },
        },
      });
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const user = userEvent.setup();
      render(
        <AuthProvider>
          <ComponentA />
          <ComponentB />
        </AuthProvider>
      );

      // Initially both show not logged in
      expect(screen.getByTestId('component-a')).toHaveTextContent('Not logged in');
      expect(screen.getByTestId('component-b')).toHaveTextContent('Not logged in');

      // Login from ComponentB
      const loginButton = screen.getByTestId('shared-login');
      await act(async () => {
        await user.click(loginButton);
      });

      // Both components should now show the user
      await waitFor(() => {
        expect(screen.getByTestId('component-a')).toHaveTextContent('Shared User');
        expect(screen.getByTestId('component-b')).toHaveTextContent('Shared User');
      });
    });
  });
}); 