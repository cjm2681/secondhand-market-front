// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청마다 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 응답 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl = error.config?.url || '';

    // ✅ 이 API들은 401을 컴포넌트에서 직접 처리
    const excludeUrls = [
      '/api/auth/login',
      '/api/users/me/password',
      '/api/auth/reissue',   // ✅ 재발급 API 자체도 제외 (무한루프 방지)
    ];

    const isExcluded = excludeUrls.some((url) => requestUrl.includes(url));

    // ✅ 401이고 제외 대상이 아니면 자동 재발급 시도
    if (error.response?.status === 401 && !isExcluded) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Refresh Token으로 새 Access Token 재발급 요청
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/reissue`,
            {},
            { headers: { 'Refresh-Token': refreshToken } }
          );

          const newAccessToken = res.data.data.accessToken;

          // 새 Access Token 저장
          localStorage.setItem('accessToken', newAccessToken);

          // ✅ 실패했던 원래 요청을 새 토큰으로 재시도
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(error.config);

        } catch (reissueError) {
          // 재발급도 실패 → 진짜 로그아웃
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        // Refresh Token 자체가 없음 → 로그아웃
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;