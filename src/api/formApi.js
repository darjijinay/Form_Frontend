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
  submitResponse: (formId, answers) =>
    axiosClient.post(`/responses/${formId}`, { answers }),

  getResponses: (formId) =>
    axiosClient.get(`/responses/form/${formId}`),

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

  // Comments on Responses
  addComment: (formId, responseId, data) =>
    axiosClient.post(`/forms/${formId}/responses/${responseId}/comments`, data),
  getResponseComments: (formId, responseId) =>
    axiosClient.get(`/forms/${formId}/responses/${responseId}/comments`),
  updateComment: (commentId, data) =>
    axiosClient.put(`/comments/${commentId}`, data),
  deleteComment: (commentId) =>
    axiosClient.delete(`/comments/${commentId}`),
  toggleCommentLike: (commentId) =>
    axiosClient.post(`/comments/${commentId}/like`),
  toggleCommentResolve: (commentId) =>
    axiosClient.post(`/comments/${commentId}/resolve`),

  // Webhooks
  createWebhook: (data) => axiosClient.post('/webhooks', data),
  getFormWebhooks: (formId) => axiosClient.get(`/webhooks/form/${formId}`),
  getWebhook: (webhookId) => axiosClient.get(`/webhooks/${webhookId}`),
  updateWebhook: (webhookId, data) => axiosClient.put(`/webhooks/${webhookId}`, data),
  deleteWebhook: (webhookId) => axiosClient.delete(`/webhooks/${webhookId}`),
  testWebhook: (webhookId) => axiosClient.post(`/webhooks/${webhookId}/test`),
  getWebhookLogs: (webhookId) => axiosClient.get(`/webhooks/${webhookId}/logs`),

  // Google Sheets
  getGoogleSheetsAuthUrl: () => axiosClient.get('/google-sheets/auth-url'),
  setupGoogleSheets: (data) => axiosClient.post('/google-sheets/setup', data),
  getGoogleSheetsIntegration: (formId) => axiosClient.get(`/google-sheets/form/${formId}`),
  disconnectGoogleSheets: (formId) => axiosClient.delete(`/google-sheets/form/${formId}`),
  bulkSyncGoogleSheets: (formId) => axiosClient.post(`/google-sheets/form/${formId}/sync`),
  toggleGoogleSheetsSync: (formId, data) => axiosClient.put(`/google-sheets/form/${formId}/toggle-sync`, data),


  // analytics
  logView: (formId) => axiosClient.post(`/analytics/forms/${formId}/view`),
  getAnalyticsOverview: () => axiosClient.get('/analytics/overview'),
};
