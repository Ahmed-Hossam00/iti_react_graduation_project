import { apiClient, setStoredToken, setStoredRefreshToken, setStoredRememberMe, clearTokens } from './client';

export const authApi = {
  async register(data) {
    const res = await apiClient('/auth/register', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
    if (res.data?.tokens) {
      setStoredRememberMe(true);
      setStoredToken(res.data.tokens.accessToken);
      setStoredRefreshToken(res.data.tokens.refreshToken);
    }
    return res.data;
  },

  async login(credentials) {
    const { rememberMe = true, ...creds } = credentials;
    const res = await apiClient('/auth/login', {
      method: 'POST',
      body: { ...creds, rememberMe },
      requiresAuth: false,
    });
    if (res.data?.tokens) {
      setStoredRememberMe(rememberMe);
      setStoredToken(res.data.tokens.accessToken);
      setStoredRefreshToken(res.data.tokens.refreshToken);
    }
    return res.data;
  },

  async logout(refreshToken) {
    try {
      await apiClient('/auth/logout', {
        method: 'POST',
        body: { refreshToken },
      });
    } finally {
      clearTokens();
    }
  },

  async getMe() {
    const res = await apiClient('/auth/me');
    return res.data;
  },

  async refresh(refreshToken) {
    const res = await apiClient('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      requiresAuth: false,
    });
    const tokens = res?.data?.tokens || res?.data;
    if (tokens?.accessToken) {
      setStoredToken(tokens.accessToken);
      if (tokens.refreshToken) {
        setStoredRefreshToken(tokens.refreshToken);
      }
    }
    return res?.data;
  },

  async forgotPassword(email) {
    const res = await apiClient('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      requiresAuth: false,
    });
    return res.data;
  },

  async resetPassword(token, newPassword) {
    const res = await apiClient('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
      requiresAuth: false,
    });
    return res.data;
  },
};

export default authApi;
