import api from './axios';

export const createReadyOrder = (data) => api.post('/api/orders/ready', data);
export const confirmPayment = (data) => api.post('/api/orders/confirm', data);
export const createOrder = (data) => api.post('/api/orders', data);
export const getMyOrders = () => api.get('/api/orders/my-purchases');
export const getMySales = () => api.get('/api/orders/my-sales');
export const cancelOrder = (id) => api.patch(`/api/orders/${id}/cancel`);
export const confirmOrder = (id) => api.patch(`/api/orders/${id}/confirm`);