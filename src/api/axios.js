import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청마다 액세스 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 응답 시 리프레시 토큰으로 재발급 시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 로그인/재발급 요청 자체가 401이면 재시도 없이 로그아웃
    const excludeUrls = ['/api/auth/login', '/api/auth/reissue'];
    const isExcluded = excludeUrls.some((url) =>
      originalRequest.url?.includes(url)
    );

    if (error.response?.status === 401 && !isExcluded && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 재시도 방지

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // 리프레시 토큰으로 액세스 토큰 재발급
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/reissue`,
            {},
            { headers: { 'Refresh-Token': refreshToken } }
          );
          const newAccessToken = res.data.data.accessToken;

          // 새 토큰 저장 후 원래 요청 재시도
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);

        } catch {
          // 리프레시 토큰도 만료 → 로그아웃
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;