import { api } from './api.js';

export const resumeOrderService = {
  /** Candidate: Create order with uploaded files */
  async create(formData) {
    const res = await api.post('/resume-orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Candidate: Get all my orders */
  async myOrders() {
    const res = await api.get('/resume-orders/my-orders');
    return res.data;
  },

  /** Candidate: Get single order details */
  async getMyOrder(id) {
    const res = await api.get(`/resume-orders/my-orders/${id}`);
    return res.data;
  },

  /** Download file URL */
  getFileDownloadUrl(orderId, fileType) {
    return `/api/resume-orders/${orderId}/download/${fileType}`;
  },

  /** Admin: List all orders */
  async adminList(params = {}) {
    const res = await api.get('/resume-orders/admin/all', { params });
    return res.data;
  },

  /** Admin: Get single order */
  async adminGet(id) {
    const res = await api.get(`/resume-orders/admin/${id}`);
    return res.data;
  },

  /** Admin: Update status */
  async adminUpdateStatus(id, data) {
    const res = await api.patch(`/resume-orders/admin/${id}/status`, data);
    return res.data;
  },

  /** Admin: Assign staff */
  async adminAssignStaff(id, data) {
    const res = await api.patch(`/resume-orders/admin/${id}/assign`, data);
    return res.data;
  },

  /** Admin: Add internal note */
  async adminAddNote(id, note) {
    const res = await api.post(`/resume-orders/admin/${id}/notes`, { note });
    return res.data;
  },

  /** Admin: Upload completed resume and/or CV */
  async adminUploadCompleted(id, formData) {
    const res = await api.post(`/resume-orders/admin/${id}/upload-completed`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Admin: Replace file */
  async adminReplaceFile(id, formData) {
    const res = await api.post(`/resume-orders/admin/${id}/replace-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Admin: Send update or request info */
  async adminSendUpdate(id, data) {
    const res = await api.post(`/resume-orders/admin/${id}/send-update`, data);
    return res.data;
  },
};
