import { api } from './api.js';

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),

  users: (params) => api.get('/admin/users', { params }),
  updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload),

  jobs: (params) => api.get('/admin/jobs', { params }),
  moderateJob: (id, status) => api.patch(`/admin/jobs/${id}/moderate`, { status }),
  deleteJob: (id) => api.delete(`/employers/jobs/${id}`),

  applications: (params) => api.get('/admin/applications', { params }),

  blogs: (params) => api.get('/blogs/admin/all', { params }),
  createBlog: (payload) => api.post('/blogs', payload),
  updateBlog: (id, payload) => api.put(`/blogs/${id}`, payload),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),

  faqs: () => api.get('/faqs/admin/all'),
  createFaq: (payload) => api.post('/faqs', payload),
  updateFaq: (id, payload) => api.put(`/faqs/${id}`, payload),
  deleteFaq: (id) => api.delete(`/faqs/${id}`),

  courses: (params) => api.get('/courses/admin/all', { params }),
  createCourse: (payload) => api.post('/courses', payload),
  updateCourse: (id, payload) => api.put(`/courses/${id}`, payload),
  deleteCourse: (id) => api.delete(`/courses/${id}`),

  consultations: (params) => api.get('/consultations', { params }),
  updateConsultation: (id, payload) => api.patch(`/consultations/${id}`, payload),

  messages: (params) => api.get('/contact', { params }),
  updateMessage: (id, payload) => api.patch(`/contact/${id}`, payload),

  testimonials: () => api.get('/testimonials/admin/all'),
  createTestimonial: (payload) => api.post('/testimonials', payload),
  updateTestimonial: (id, payload) => api.put(`/testimonials/${id}`, payload),
  deleteTestimonial: (id) => api.delete(`/testimonials/${id}`),
};
