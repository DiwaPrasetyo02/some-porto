import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANT: Send cookies with every request
});

// Public API calls
export const getAbout = () => api.get('/api/about');
export const getStack = () => api.get('/api/stack');
export const getProjects = (featured = false) => 
  api.get(`/api/projects${featured ? '?featured=true' : ''}`);
export const getProject = (id) => api.get(`/api/projects/${id}`);
export const getExperience = () => api.get('/api/experience');
export const getEducation = () => api.get('/api/education');
export const getSocialLinks = () => api.get('/api/social-links');
export const submitContact = (data) => api.post('/api/contact', data);

// Admin Authentication
export const adminLogin = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  // Token now stored in httpOnly cookie (automatic, more secure)
  const response = await api.post('/api/admin/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response;
};

export const adminVerify = () => api.get('/api/admin/verify');

export const adminLogout = async () => {
  // Call backend to delete cookie
  return api.post('/api/admin/logout');
};

// Admin CRUD - About
export const adminUpdateAbout = (id, data) => api.put(`/api/admin/about/${id}`, data);
export const adminCreateAbout = (data) => api.post('/api/admin/about', data);

// Admin CRUD - Stack
export const adminCreateStack = (data) => api.post('/api/admin/stack', data);
export const adminUpdateStack = (id, data) => api.put(`/api/admin/stack/${id}`, data);
export const adminDeleteStack = (id) => api.delete(`/api/admin/stack/${id}`);

// Admin CRUD - Projects
export const adminCreateProject = (data) => api.post('/api/admin/projects', data);
export const adminUpdateProject = (id, data) => api.put(`/api/admin/projects/${id}`, data);
export const adminDeleteProject = (id) => api.delete(`/api/admin/projects/${id}`);

// Admin CRUD - Experience
export const adminCreateExperience = (data) => api.post('/api/admin/experience', data);
export const adminUpdateExperience = (id, data) => api.put(`/api/admin/experience/${id}`, data);
export const adminDeleteExperience = (id) => api.delete(`/api/admin/experience/${id}`);

// Admin CRUD - Education
export const adminCreateEducation = (data) => api.post('/api/admin/education', data);
export const adminUpdateEducation = (id, data) => api.put(`/api/admin/education/${id}`, data);
export const adminDeleteEducation = (id) => api.delete(`/api/admin/education/${id}`);

// Admin CRUD - Social Links
export const adminCreateSocialLink = (data) => api.post('/api/admin/social-links', data);
export const adminUpdateSocialLink = (id, data) => api.put(`/api/admin/social-links/${id}`, data);
export const adminDeleteSocialLink = (id) => api.delete(`/api/admin/social-links/${id}`);

// Admin - Contacts
export const adminGetContacts = () => api.get('/api/admin/contacts');
export const adminMarkContactRead = (id) => api.put(`/api/admin/contacts/${id}/read`);
export const adminDeleteContact = (id) => api.delete(`/api/admin/contacts/${id}`);

// Public - Blog
export const getBlogs = (skip = 0, limit = 20) =>
  api.get(`/api/blogs?skip=${skip}&limit=${limit}&published_only=true`);
export const getBlogBySlug = (slug) => api.get(`/api/blogs/${slug}`);

// Admin CRUD - Blog
export const adminGetBlogs = () => api.get('/api/admin/blogs');
export const adminCreateBlog = (data) => api.post('/api/admin/blogs', data);
export const adminUpdateBlog = (id, data) => api.put(`/api/admin/blogs/${id}`, data);
export const adminDeleteBlog = (id) => api.delete(`/api/admin/blogs/${id}`);

export default api;
