import { authApi } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class AuthService {
  // Register a new user
  static async register(userData) {
    try {
      const response = await authApi.register(userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Save user and token
        await this.saveAuthData(user, token);
        
        return {
          success: true,
          user,
          token,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Registration failed',
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        message: error.message || 'Registration failed',
        errors: error.errors || [],
      };
    }
  }

  // Login user
  static async login(credentials) {
    try {
      const response = await authApi.login(credentials);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Save user and token
        await this.saveAuthData(user, token);
        
        return {
          success: true,
          user,
          token,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Login failed',
      };
    } catch (error) {
      console.error('Error logging in:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  }

  // Logout user
  static async logout() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.authToken);
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Error logging out:', error);
      return {
        success: false,
        message: 'Failed to logout',
      };
    }
  }

  // Save authentication data
  static async saveAuthData(user, token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.authToken, token);
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }

  // Get authentication data
  static async getAuthData() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.authToken);
      const user = await AsyncStorage.getItem(STORAGE_KEYS.user);
      
      return {
        token,
        user: user ? JSON.parse(user) : null,
      };
    } catch (error) {
      console.error('Error getting auth data:', error);
      return {
        token: null,
        user: null,
      };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    try {
      const { token } = await this.getAuthData();
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { user } = await this.getAuthData();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get user profile
  static async getProfile() {
    try {
      const response = await authApi.getProfile();
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(profileData) {
    try {
      const response = await authApi.updateProfile(profileData);
      
      if (response.data.success) {
        const user = response.data.data;
        
        // Update stored user data
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
        
        return {
          success: true,
          user,
          message: response.data.message || 'Profile updated successfully',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to update profile',
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile',
      };
    }
  }

  // Update password
  static async updatePassword(currentPassword, newPassword) {
    try {
      const response = await authApi.updatePassword({
        currentPassword,
        newPassword,
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Password updated successfully',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to update password',
      };
    } catch (error) {
      console.error('Error updating password:', error);
      return {
        success: false,
        message: error.message || 'Failed to update password',
      };
    }
  }

  // Delete account
  static async deleteAccount(password) {
    try {
      const response = await authApi.deleteAccount(password);
      
      if (response.data.success) {
        // Clear all auth data
        await this.logout();
        
        return {
          success: true,
          message: response.data.message || 'Account deleted successfully',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to delete account',
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete account',
      };
    }
  }

  // Get user's saved locations
  static async getUserLocations() {
    try {
      const response = await authApi.getUserLocations();
      
      if (response.data.success) {
        return response.data.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error getting user locations:', error);
      return [];
    }
  }

  // Add a new location
  static async addLocation(locationData) {
    try {
      const response = await authApi.addLocation(locationData);
      
      if (response.data.success) {
        return {
          success: true,
          location: response.data.data,
          message: response.data.message || 'Location added successfully',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to add location',
      };
    } catch (error) {
      console.error('Error adding location:', error);
      return {
        success: false,
        message: error.message || 'Failed to add location',
      };
    }
  }

  // Delete a location
  static async deleteLocation(locationId) {
    try {
      const response = await authApi.deleteLocation(locationId);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Location deleted successfully',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to delete location',
      };
    } catch (error) {
      console.error('Error deleting location:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete location',
      };
    }
  }
}

export default AuthService;
