import api from './axios';

export const getOrCreateRoom = (productId) =>
  api.post('/api/chat/rooms', null, { params: { productId } });
export const getMyRooms = () => api.get('/api/chat/rooms');
export const getMessages = (roomId) =>
  api.get(`/api/chat/rooms/${roomId}/messages`);
export const markAsRead = (roomId) =>
  api.patch(`/api/chat/rooms/${roomId}/read`);