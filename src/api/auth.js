import api from './axios';

export const login = (data) => api.post('/api/auth/login', data);
export const signup = (data) => api.post('/api/users/signup', data);
export const sendVerificationEmail = (email) =>
  api.post('/api/auth/email', { email });
export const verifyEmail = (data) => api.post('/api/auth/email/verify', data);
export const logout = () => api.post('/api/auth/logout');
export const sendPasswordReset = (email) =>
  api.post('/api/auth/password/reset-request', { email });
export const resetPassword = (data) =>
  api.post('/api/auth/password/reset', data);