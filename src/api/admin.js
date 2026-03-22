import api from './axios';
// import { adminDeleteProduct } from '../api/admin';
// import { adminDeleteBoard, adminDeleteComment } from '../api/admin';

export const getAdminUsers = (params) => api.get('/api/admin/users', { params });
export const getAdminUser = (userId) => api.get(`/api/admin/users/${userId}`);
export const toggleBan = (userId) => api.patch(`/api/admin/users/${userId}/ban`);
export const adminDeleteProduct = (productId) => api.delete(`/api/admin/products/${productId}`);
export const adminDeleteBoard = (boardId) => api.delete(`/api/admin/boards/${boardId}`);
export const adminDeleteComment = (commentId) => api.delete(`/api/admin/comments/${commentId}`);
