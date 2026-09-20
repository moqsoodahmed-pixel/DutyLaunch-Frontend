import { api, postForm } from './api.js';

export const resumeService = {
  analyze: (file, onProgress) => {
    const formData = new FormData();
    formData.append('resume', file);
    return postForm('/resume/analyze', formData, onProgress);
  },
  history: (params) => api.get('/resume/history', { params }),
};

export const blogService = {
  list: (params) => api.get('/blogs', { params }),
  index: () => api.get('/blogs/index'),
  get: (slug) => api.get(`/blogs/${slug}`),
};

export const courseService = {
  list: (params) => api.get('/courses', { params }),
  categories: () => api.get('/courses/categories'),
  get: (slug) => api.get(`/courses/${slug}`),
};

export const educationService = {
  programs: (params) => api.get('/education/programs', { params }),
  filters: () => api.get('/education/filters'),
  get: (slug) => api.get(`/education/programs/${slug}`),
};

export const documentationService = {
  list: (params) => api.get('/documentation', { params }),
  get: (slug) => api.get(`/documentation/${slug}`),
};

export const pricingService = {
  cvPackages: () => api.get('/pricing/cv-packages'),
};

export const faqService = {
  list: (params) => api.get('/faqs', { params }),
};

export const testimonialService = {
  list: () => api.get('/testimonials'),
};

export const enquiryService = {
  consultation: (payload) => api.post('/consultations', payload),
  contact: (payload) => api.post('/contact', payload),
};

export const profileService = {
  get: () => api.get('/users/profile'),
  update: (payload) => api.patch('/users/profile', payload),
  uploadResume: (formData) => postForm('/users/profile/resume', formData),
};
