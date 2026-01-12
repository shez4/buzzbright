import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Initializing auth with token:', token);
        
        if (token) {
          // For mock tokens, directly set user
          if (token.includes('mock-jwt-token')) {
            console.log('Using mock authentication');
            const mockUser = {
              id: '1',
              email: 'admin@buzzbright.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'admin'
            };
            setUser(mockUser);
            console.log('Mock user set:', mockUser);
          } else {
            console.log('Trying to get user from API');
            const userData = await authService.getCurrentUser();
            setUser(userData.user);
            console.log('API user set:', userData.user);
          }
        } else {
          console.log('No token found');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Don't remove mock tokens on error
        const token = localStorage.getItem('token');
        if (token && !token.includes('mock-jwt-token')) {
          console.log('Removing invalid non-mock token');
          localStorage.removeItem('token');
        }
      } finally {
        console.log('Auth initialization complete');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      console.log('Login successful, user set:', response.user);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const updateUser = (userData) => {
    console.log('Updating user data:', userData);
    setUser({ ...user, ...userData });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
    isStaff: user?.role === 'staff'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};