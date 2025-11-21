import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '../types';
import api, { setAuthService } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { usersAPI } from '../services/users';
import { authAPI } from '../services/auth';

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
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
  TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

// Internal helper for clearing auth storage
const clearAuthStorage = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

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
  const [token, setToken] = useState<string | null>(null); // This will store accessToken
  const [isLoading, setIsLoading] = useState(true);

  // Helper to get email from token (JWT only contains email in sub field)
  const getEmailFromToken = useCallback((accessToken: string): string | null => {
    try {
      // Validate that accessToken is a non-empty string
      if (!accessToken || typeof accessToken !== 'string' || accessToken.trim().length === 0) {
        console.error('Error decoding token: Invalid token specified: must be a non-empty string');
        return null;
      }
      const decoded: any = jwtDecode(accessToken);
      // JWT token only contains email in the 'sub' field
      return decoded.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);

  // Set Authorization header for Axios
  const setAuthHeader = useCallback((accessToken: string | null) => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAccessToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        
        if (storedAccessToken) {
          // Validate token is still valid
          const email = getEmailFromToken(storedAccessToken);
          if (!email) {
            console.warn('Stored token is invalid or cannot be decoded. Clearing auth data.');
            clearAuthStorage();
            setIsLoading(false);
            return;
          }

          // Try to use stored user, otherwise fetch from API
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              setToken(storedAccessToken);
              setUser(user);
              setAuthHeader(storedAccessToken);
              
              if (process.env.NODE_ENV === 'development') {
                console.log('Auth initialized from localStorage:', {
                  token: storedAccessToken.substring(0, 20) + '...',
                  user: user,
                });
              }
            } catch (parseError) {
              console.warn('Failed to parse stored user, fetching from API');
              // Fall through to fetch from API
            }
          }

          // Fetch fresh user data from API
          try {
            setAuthHeader(storedAccessToken);
            const user = await usersAPI.getProfile();
            setToken(storedAccessToken);
            setUser(user);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            
            if (process.env.NODE_ENV === 'development') {
              console.log('Auth initialized from API:', {
                token: storedAccessToken.substring(0, 20) + '...',
                user: user,
              });
            }
          } catch (fetchError) {
            console.error('Failed to fetch user profile:', fetchError);
            // Keep token but clear user if fetch fails
            clearAuthStorage();
          }
        }
      } catch (error) {
        console.error('Error initializing auth from localStorage:', error);
        clearAuthStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [getEmailFromToken, setAuthHeader]);

  // Login function
  const login = useCallback(async (newAccessToken: string, newRefreshToken: string): Promise<void> => {
    try {
      // Validate tokens are strings before processing
      if (!newAccessToken || typeof newAccessToken !== 'string' || newAccessToken.trim().length === 0) {
        throw new Error('Invalid access token provided during login: must be a non-empty string');
      }
      if (!newRefreshToken || typeof newRefreshToken !== 'string' || newRefreshToken.trim().length === 0) {
        throw new Error('Invalid refresh token provided during login: must be a non-empty string');
      }
      
      // Validate token can be decoded (at least get email)
      const email = getEmailFromToken(newAccessToken);
      if (!email) {
        throw new Error('Invalid access token provided during login.');
      }

      // Store tokens first
      localStorage.setItem(STORAGE_KEYS.TOKEN, newAccessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      setToken(newAccessToken);
      setAuthHeader(newAccessToken);

      // Fetch user data from API
      const newUser = await usersAPI.getProfile();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('AuthContext login called:', {
          accessToken: newAccessToken.substring(0, 20) + '...',
          refreshToken: newRefreshToken.substring(0, 20) + '...',
          user: newUser,
        });
      }

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);

      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state updated successfully');
      }
    } catch (error) {
      console.error('Error during login:', error);
      clearAuthStorage();
      throw new Error('Failed to save authentication data');
    }
  }, [getEmailFromToken, setAuthHeader]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Logging out...');
      }

      // Call backend logout endpoint before clearing local storage
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      try {
        await authAPI.logout(refreshToken || undefined);
      } catch (error) {
        // Even if logout API call fails, we still clear local storage
        console.error('Error calling logout API:', error);
      }

      clearAuthStorage();
      setToken(null);
      setUser(null);
      setAuthHeader(null); // Clear auth header

      if (process.env.NODE_ENV === 'development') {
        console.log('Logged out successfully');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local storage even if there's an error
      clearAuthStorage();
      setToken(null);
      setUser(null);
      setAuthHeader(null);
    }
  }, [setAuthHeader]);

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

  // Provide login and logout functions to the API service for token refresh
  useEffect(() => {
    setAuthService({ login, logout });
  }, [login, logout]);

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