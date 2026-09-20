import { api, postForm } from './api.js';

export const jobService = {
  list: (params) => api.get('/jobs', { params }),
  filters: () => api.get('/jobs/filters'),
  get: (idOrSlug) => api.get(`/jobs/${idOrSlug}`),
  apply: (id, formData) => postForm(`/jobs/${id}/apply`, formData),

  myApplications: (params) => api.get('/users/applications', { params }),
  withdraw: (id) => api.patch(`/users/applications/${id}/withdraw`),
  savedJobs: () => api.get('/users/saved-jobs'),
  toggleSaved: (id) => api.post(`/users/saved-jobs/${id}`),
};

export const employerService = {
  listJobs: (params) => api.get('/employers/jobs', { params }),
  createJob: (payload) => api.post('/employers/jobs', payload),
  updateJob: (id, payload) => api.patch(`/employers/jobs/${id}`, payload),
  deleteJob: (id) => api.delete(`/employers/jobs/${id}`),
  jobApplications: (id) => api.get(`/employers/jobs/${id}/applications`),
  applications: (params) => api.get('/employers/applications', { params }),
  setStatus: (id, payload) => api.patch(`/employers/applications/${id}/status`, payload),
  resumeUrl: (id) => `${import.meta.env.VITE_API_URL || '/api'}/employers/applications/${id}/resume`,
};
