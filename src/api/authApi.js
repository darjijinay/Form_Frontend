import axiosClient from './axiosClient';

export const authApi = {
  register: (payload) => axiosClient.post('/auth/register', payload),
  login: (payload) => axiosClient.post('/auth/login', payload),
  me: () => axiosClient.get('/auth/me'),
  verify: (payload) => axiosClient.post('/auth/verify', payload),
  resendCode: (payload) => axiosClient.post('/auth/resend-code', payload),
  forgotPassword: (payload) => axiosClient.post('/auth/forgot-password', payload),
  verifyResetCode: (payload) => axiosClient.post('/auth/verify-reset-code', payload),
  resetPassword: (payload) => axiosClient.post('/auth/reset-password', payload),
};
