import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '@/services/api';
import socketService from '@/services/socket';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  interests: string[];
  location: string;
  aboutMe: string;
  lookingFor?: string;
  notificationSettings?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: { lookingFor: string; notificationSettings: any }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('authToken');
    if (token) {
      loadUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      console.log('Loading user profile...');
      const response = await apiService.getProfile();
      console.log('Profile response:', response);
      if (response.data) {
        console.log('Setting user data:', response.data.user);
        setUser(response.data.user);
        // Connect to WebSocket
        socketService.connect(localStorage.getItem('authToken') || undefined);
      } else {
        console.log('No data in response, removing token');
        localStorage.removeItem('authToken');
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.login({ email, password });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        // Connect to WebSocket
        socketService.connect(response.data.token);
      } else {
        throw new Error('Не удалось получить токен авторизации');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.register(userData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        // Connect to WebSocket
        socketService.connect(response.data.token);
      } else {
        throw new Error('Не удалось получить токен авторизации');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setError(null);
    // Disconnect from WebSocket
    socketService.disconnect();
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setError(null);
      
      const response = await apiService.updateProfile(data);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления профиля';
      setError(errorMessage);
      throw err;
    }
  };

  const updatePreferences = async (preferences: { lookingFor: string; notificationSettings: any }) => {
    try {
      setError(null);
      
      const response = await apiService.updatePreferences(preferences);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data?.preferences && user) {
        setUser({ ...user, ...response.data.preferences });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления настроек';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 