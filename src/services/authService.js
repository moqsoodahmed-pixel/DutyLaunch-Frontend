import { api, tokenStore } from './api.js';

export const authService = {
  async register(payload) {
    const res = await api.post('/auth/register', payload);
    tokenStore.set(res.data.token);
    return res.data.user;
  },
  async login(payload) {
    const res = await api.post('/auth/login', payload);
    tokenStore.set(res.data.token);
    return res.data.user;
  },
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStore.set(null);
    }
  },
  async me() {
    const res = await api.get('/auth/me');
    return res.data.user;
  },
  async changePassword(payload) {
    const res = await api.patch('/auth/password', payload);
    tokenStore.set(res.data.token);
    return res;
  },
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
};
