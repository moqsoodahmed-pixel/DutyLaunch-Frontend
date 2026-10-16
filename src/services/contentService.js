import { api, postForm } from './api.js';

export const resumeService = {
  analyze: (file, onProgress, { consent } = {}) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('consent', consent ? 'true' : 'false');
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
  mine: () => api.get('/courses/mine'),
  create: (payload) => api.post('/courses', payload),
  update: (id, payload) => api.put(`/courses/${id}`, payload),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const educationService = {
  programs: (params) => api.get('/education/programs', { params }),
  filters: () => api.get('/education/filters'),
  get: (slug) => api.get(`/education/programs/${slug}`),
  mine: () => api.get('/education/mine'),
  create: (payload) => api.post('/education/programs', payload),
  update: (id, payload) => api.put(`/education/programs/${id}`, payload),
  delete: (id) => api.delete(`/education/programs/${id}`),
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

/* Partner institutes: public list of APPROVED partners, public profile, and partner portal. */
export const partnerService = {
  list: (params) => api.get('/partners', { params }),
  getPublic: (id) => api.get(`/partners/${id}`),
  mine: () => api.get('/partners/me'),
  saveMine: (payload) => api.put('/partners/me', payload),
  submitMine: () => api.post('/partners/me/submit'),
};

export const enrolmentService = {
  myEnrolments: () => api.get('/enrolments/mine'),
  enrolFree: (payload) => api.post('/enrolments/free', payload),
  partnerEnrolments: (params) => api.get('/enrolments/partner', { params }),
  adminEnrolments: (params) => api.get('/enrolments/admin', { params }),
};

export const settlementService = {
  mine: () => api.get('/settlements/mine'),
  adminList: (params) => api.get('/settlements/admin', { params }),
  generate: (partnerId) => api.post('/settlements/generate', { partnerId }),
  updateStatus: (id, payload) => api.patch(`/settlements/${id}`, payload),
  fees: () => api.get('/settlements/fees'),
  saveFee: (payload) => api.post('/settlements/fees', payload),
  deleteFee: (id) => api.delete(`/settlements/fees/${id}`),
};

export const uploadService = {
  image: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return postForm('/uploads/image', fd);
  },
  document: (file) => {
    const fd = new FormData();
    fd.append('document', file);
    return postForm('/uploads/document', fd);
  },
};
