import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isLoggedIn: !!localStorage.getItem('accessToken'),
  user: null,

  login: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ isLoggedIn: false, user: null });
  },
}));

export default useAuthStore;