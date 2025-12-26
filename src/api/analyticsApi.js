import axiosClient from './axiosClient';

const analyticsApi = {
  // Get form-specific analytics with field data and timeline
  getFormAnalytics: (formId, params = {}) => {
    return axiosClient.get(`/analytics/forms/${formId}/analytics`, { params });
  },

  // Get paginated form responses with optional search and filters
  getFormResponses: (formId, params = {}) => {
    return axiosClient.get(`/analytics/forms/${formId}/analytics/responses`, { params });
  },

  // Get detailed analytics for a specific field
  getFieldAnalytics: (formId, fieldId) => {
    return axiosClient.get(`/analytics/forms/${formId}/analytics/field/${fieldId}`);
  },

  // Get overview across all forms
  getOverview: () => {
    return axiosClient.get('/analytics/overview');
  },

  // Record a form view (public endpoint)
  recordFormView: (formId) => {
    return axiosClient.post(`/analytics/forms/${formId}/view`);
  },
};

export default analyticsApi;
