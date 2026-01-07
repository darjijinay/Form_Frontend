import axiosClient from './axiosClient';

export const formApi = {
  getMyForms: () => axiosClient.get('/forms'),
  getFormById: (id) => axiosClient.get(`/forms/${id}`),
  getForm: (id) => axiosClient.get(`/forms/${id}`),
  createForm: (data) => axiosClient.post('/forms', data),
  updateForm: (id, data) => axiosClient.put(`/forms/${id}`, data),
  deleteForm: (id) => axiosClient.delete(`/forms/${id}`),

  // templates (optional)
  getTemplates: () => axiosClient.get('/templates'),
  getTemplate: (id) => axiosClient.get(`/templates/${id}`),

  // public forms
  getPublicForm: (id) => axiosClient.get(`/forms/${id}/public`),

  // responses
  submitResponse: (formId, payload) =>
    axiosClient.post(`/responses/${formId}`, payload),

  getResponses: (formId, params) =>
    axiosClient.get(`/responses/form/${formId}`, { params }),

  exportResponsesCsv: (formId) =>
    axiosClient.get(`/responses/form/${formId}/export`, {
      responseType: 'blob',
    }),

  // Sharing (Collaboration)
  shareForm: (formId, data) =>
    axiosClient.post(`/forms/${formId}/share`, data),
  getFormShares: (formId) =>
    axiosClient.get(`/forms/${formId}/shares`),
  updateShare: (formId, shareId, data) =>
    axiosClient.put(`/forms/${formId}/shares/${shareId}`, data),
  removeShare: (formId, shareId) =>
    axiosClient.delete(`/forms/${formId}/shares/${shareId}`),
  getSharedWithMe: () => axiosClient.get('/shared-with-me'),

  // Versioning
  createFormVersion: (formId, data) =>
    axiosClient.post(`/forms/${formId}/versions`, data),
  getFormVersions: (formId) =>
    axiosClient.get(`/forms/${formId}/versions`),
  getFormVersion: (formId, versionNumber) =>
    axiosClient.get(`/forms/${formId}/versions/${versionNumber}`),
  rollbackFormVersion: (formId, versionNumber) =>
    axiosClient.post(`/forms/${formId}/versions/${versionNumber}/rollback`),
  compareVersions: (formId, v1, v2) =>
    axiosClient.get(`/forms/${formId}/versions/compare`, {
      params: { v1, v2 },
    }),

  // analytics
  logView: (formId) => axiosClient.post(`/analytics/forms/${formId}/view`),
  getAnalyticsOverview: () => axiosClient.get('/analytics/overview'),
};
