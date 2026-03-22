import api from './axios';

export const getProducts = (params) => api.get('/api/products', { params });
export const getProduct = (id) => api.get(`/api/products/${id}`);
export const createProduct = (formData) =>
  api.post('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateProduct = (id, formData) =>
  api.put(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);
export const updateProductStatus = (id, status) =>
  api.patch(`/api/products/${id}/status`, { status });
export const getMyProducts = (page = 0) =>
  api.get('/api/products/my', { params: { page } });