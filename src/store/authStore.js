import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,

  setAuth: ({ user, token }) => {
    if (typeof window !== 'undefined' && token) localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
