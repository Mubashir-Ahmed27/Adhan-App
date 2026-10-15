import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { AuthService } from '../services';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { token: storedToken, user: storedUser } = await AuthService.getAuthData();
        
        if (storedToken && storedUser) {
          setUser(storedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await AuthService.login({ email, password });
      
      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        setIsLoading(false);
        return { success: false, message: result.message };
      }
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      return { success: false, message: error.message };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await AuthService.register(userData);
      
      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        setIsLoading(false);
        return { success: false, message: result.message, errors: result.errors };
      }
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      return { success: false, message: error.message, errors: error.errors };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await AuthService.updateProfile(profileData);
      
      if (result.success) {
        setUser(result.user);
        setIsLoading(false);
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        setIsLoading(false);
        return { success: false, message: result.message };
      }
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      return { success: false, message: error.message };
    }
  }, []);

  // Update password function
  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await AuthService.updatePassword(currentPassword, newPassword);
      
      setIsLoading(false);
      return result;
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      return { success: false, message: error.message };
    }
  }, []);

  // Delete account function
  const deleteAccount = useCallback(async (password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await AuthService.deleteAccount(password);
      
      if (result.success) {
        await logout();
        setIsLoading(false);
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        setIsLoading(false);
        return { success: false, message: result.message };
      }
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      return { success: false, message: error.message };
    }
  }, [logout]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const profile = await AuthService.getProfile();
      if (profile) {
        setUser(profile.user);
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile.user));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    deleteAccount,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };
