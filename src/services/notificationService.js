import { api } from './api.js';

export const notificationService = {
  async getMine() {
    const res = await api.get('/notifications/mine');
    return res.data;
  },

  async markRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};
