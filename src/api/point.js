import api from './axios';

// 출금 신청
export const requestWithdrawal = (data) =>
    api.post('/api/point/withdrawal', data);

// 내 출금 내역
export const getMyWithdrawals = () =>
    api.get('/api/point/withdrawals');

// 내 포인트 내역
export const getMyPointHistory = () =>
    api.get('/api/point/history');

// 관리자 - 전체 출금 신청 목록
export const getAllWithdrawals = () =>
    api.get('/api/point/admin/withdrawals');

// 관리자 - 출금 승인
export const approveWithdrawal = (id) =>
    api.patch(`/api/point/admin/withdrawals/${id}/approve`);

// 관리자 - 출금 거절
export const rejectWithdrawal = (id) =>
    api.patch(`/api/point/admin/withdrawals/${id}/reject`);