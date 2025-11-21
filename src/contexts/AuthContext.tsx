import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '../types';

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Hook
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================================================
// Provider
// ============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Auth initialized from localStorage:', {
              token: storedToken.substring(0, 20) + '...',
              user: parsedUser,
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback((newToken: string, newUser: User) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('AuthContext login called:', {
          token: newToken.substring(0, 20) + '...',
          user: newUser,
        });
      }

      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);

      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state updated successfully');
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Failed to save authentication data');
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Logging out...');
      }

      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      setToken(null);
      setUser(null);

      if (process.env.NODE_ENV === 'development') {
        console.log('Logged out successfully');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  // Update user function (for profile updates)
  const updateUser = useCallback((updatedUser: User) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);

      if (process.env.NODE_ENV === 'development') {
        console.log('User updated:', updatedUser);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user data');
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// Utility Functions (Optional - for external use)
// ============================================================================

export const getStoredToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

export const clearAuthStorage = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};