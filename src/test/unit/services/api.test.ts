import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '@/services/api';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        user: { id: 1, name: 'Test User' },
        token: 'new-token',
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.login({ email: 'test@example.com', password: 'password' });

      expect(fetch).toHaveBeenCalledWith('http://188.225.45.8/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password',
        }),
      });

      expect(result.data).toEqual(mockResponse);
    });

    it('should handle login error', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      const result = await apiService.login({ email: 'test@example.com', password: 'wrong-password' });
      expect(result.error).toBe('Invalid credentials');
    });

    it('should handle network error', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.login({ email: 'test@example.com', password: 'password' });
      expect(result.error).toBe('Network error');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        user: { id: 1, name: 'New User' },
        token: 'new-token',
      };

      const userData = {
        email: 'new@example.com',
        password: 'password123',
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.register(userData);

      expect(fetch).toHaveBeenCalledWith('http://188.225.45.8/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify(userData),
      });

      expect(result.data).toEqual(mockResponse);
    });

    it('should handle registration error', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Email already exists' }),
      });

      const result = await apiService.register({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out successfully' }),
      });

      const result = await apiService.deleteAccount();

      expect(fetch).toHaveBeenCalledWith('http://188.225.45.8/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      });

      expect(result.data).toEqual({ message: 'Logged out successfully' });
    });

    it('should handle logout error', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const result = await apiService.deleteAccount();
      expect(result.error).toBe('Server error');
    });
  });

  describe('getProfile', () => {
    it('should get profile successfully', async () => {
      const mockResponse = {
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.getProfile();

      expect(fetch).toHaveBeenCalledWith('http://188.225.45.8/api/auth/profile', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      });

      expect(result.data).toEqual(mockResponse);
    });

    it('should handle profile fetch error', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'User not found' }),
      });

      const result = await apiService.getProfile();
      expect(result.error).toBe('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockResponse = {
        user: { id: 1, name: 'Updated User', email: 'test@example.com' },
      };

      const updateData = {
        name: 'Updated User',
        age: 26,
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.updateProfile(updateData);

      expect(fetch).toHaveBeenCalledWith('http://188.225.45.8/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify(updateData),
      });

      expect(result.data).toEqual(mockResponse);
    });

    it('should handle profile update error', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Validation error' }),
      });

      const result = await apiService.updateProfile({ name: '' });
      expect(result.error).toBe('Validation error');
    });
  });

  describe('API base URL', () => {
    it('should use correct base URL in development', async () => {
      // Reset module to get fresh import
      vi.resetModules();
      const { apiService } = await import('@/services/api');

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await apiService.getProfile();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('http://188.225.45.8/api/auth/profile'),
        expect.any(Object)
      );
    });

    it('should use correct base URL in production', async () => {
      // Mock environment variable
      const originalEnv = import.meta.env.VITE_API_URL;
      import.meta.env.VITE_API_URL = 'https://api.production.com/api';

      // Reset module to get fresh import
      vi.resetModules();
      const { apiService } = await import('@/services/api');

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await apiService.getProfile();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.production.com/api/auth/profile'),
        expect.any(Object)
      );

      // Restore original environment
      import.meta.env.VITE_API_URL = originalEnv;
    });
  });

  describe('Error handling', () => {
    it('should handle non-JSON error responses', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await apiService.login({ email: 'test@example.com', password: 'password' });
      expect(result.error).toBe('Invalid JSON');
    });

    it('should handle empty error responses', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      const result = await apiService.login({ email: 'test@example.com', password: 'password' });
      expect(result.error).toBe('API request failed');
    });
  });
}); 