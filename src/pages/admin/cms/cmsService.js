import { api } from '../../../services/api.js';

export const cmsService = {
  // Public (for website pages)
  async getPublicPricing() {
    const res = await api.get('/cms/pricing');
    return res.data;
  },

  // Admin
  async getAdminPricing() {
    const res = await api.get('/cms/admin/pricing');
    return res.data;
  },

  async createItem(payload) {
    const res = await api.post('/cms/admin/pricing', payload);
    return res.data;
  },

  async updateItem(id, payload) {
    const res = await api.put(`/cms/admin/pricing/${id}`, payload);
    return res.data;
  },

  async deleteItem(id) {
    const res = await api.delete(`/cms/admin/pricing/${id}`);
    return res.data;
  },

  async updateGlobalConfig(payload) {
    const res = await api.put('/cms/admin/config', payload);
    return res.data;
  },

  async resetDefaults() {
    const res = await api.post('/cms/admin/reset-defaults');
    return res.data;
  },
};

