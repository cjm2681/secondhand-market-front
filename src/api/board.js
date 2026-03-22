import api from './axios';

export const getBoards = (params) => api.get('/api/boards', { params });
export const getBoard = (id) => api.get(`/api/boards/${id}`);
export const createBoard = (data) => api.post('/api/boards', data);
export const updateBoard = (id, data) => api.put(`/api/boards/${id}`, data);
export const deleteBoard = (id) => api.delete(`/api/boards/${id}`);
export const createComment = (boardId, data) =>
  api.post(`/api/boards/${boardId}/comments`, data);
export const deleteComment = (boardId, commentId) =>
  api.delete(`/api/boards/${boardId}/comments/${commentId}`);
export const getMyBoards = (page = 0) =>
  api.get('/api/boards/my', { params: { page } });