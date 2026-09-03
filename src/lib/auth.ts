import { api } from './api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
}

export const auth = {
  async login(credentials: any) {
    // Backend returns {access_token, refresh_token, token_type} directly
    const { data } = await api.post('/auth/login', credentials);
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    // Fetch user profile separately
    const { data: me } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(me));
    }
    return me;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  },

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token');
    }
    return false;
  },
};
