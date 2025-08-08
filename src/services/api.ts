const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface AuthResponse {
  user: {
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
  };
  token: string;
  message: string;
}

interface ProfileResponse {
  user: {
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
  };
}

interface PreferencesResponse {
  preferences: {
    lookingFor: string;
    notificationSettings: any;
  };
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('API: Making request to:', url, 'with options:', options);
      
      const response = await fetch(url, {
        ...options,
        headers: this.getAuthHeaders(),
      });

      console.log('API: Response status:', response.status);
      const data = await response.json();
      console.log('API: Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return { data };
    } catch (error) {
      console.error('API: Request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    console.log('API: Registering user with:', userData);
    const result = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    console.log('API: Register result:', result);
    return result;
  }

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    return this.request<ProfileResponse>('/auth/profile');
  }

  async updateProfile(profileData: Partial<{
    name: string;
    email: string;
    age: number;
    interests: string[];
    location: string;
    aboutMe: string;
  }>): Promise<ApiResponse<ProfileResponse>> {
    return this.request<ProfileResponse>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updatePreferences(preferences: {
    lookingFor: string;
    notificationSettings: any;
  }): Promise<ApiResponse<PreferencesResponse>> {
    return this.request<PreferencesResponse>('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async deleteAccount() {
    return this.request('/auth/account', {
      method: 'DELETE',
    });
  }

  // Call endpoints
  async createCall(callData: {
    userId1: string;
    userId2: string;
    duration: number;
    rating?: number;
    feedback?: string;
    action: 'like' | 'pass';
  }) {
    return this.request('/calls', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  }

  async getUserCalls(limit = 20, offset = 0) {
    return this.request(`/calls?limit=${limit}&offset=${offset}`);
  }

  async getCallStats() {
    return this.request('/calls/stats');
  }

  async updateCallRating(callId: string, rating: number, feedback?: string) {
    return this.request(`/calls/${callId}/rating`, {
      method: 'PUT',
      body: JSON.stringify({ rating, feedback }),
    });
  }

  async getRecentMatches(limit = 5) {
    return this.request(`/calls/recent-matches?limit=${limit}`);
  }

  async getLikedUsers() {
    return this.request('/calls/liked-users');
  }

  // Matchmaking endpoints
  async joinQueue(queueData: {
    lookingFor: string;
    ageRange?: { min: number; max: number };
    interests: string[];
  }) {
    return this.request('/matchmaking/join-queue', {
      method: 'POST',
      body: JSON.stringify(queueData),
    });
  }

  async leaveQueue() {
    return this.request('/matchmaking/leave-queue', {
      method: 'POST',
    });
  }

  async findMatch(matchData: {
    lookingFor: string;
    ageRange?: { min: number; max: number };
    interests: string[];
  }) {
    return this.request('/matchmaking/find-match', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  async getQueueStatus() {
    return this.request('/matchmaking/queue-status');
  }

  async getOnlineUsers(limit = 10) {
    return this.request(`/matchmaking/online-users?limit=${limit}`);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService; 