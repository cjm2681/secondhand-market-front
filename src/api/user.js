import api from './axios';

export const getMe = () => api.get('/api/users/me');
export const updateProfile = (data) => api.patch('/api/users/me/profile', data);
export const updatePassword = (data) => api.patch('/api/users/me/password', data);