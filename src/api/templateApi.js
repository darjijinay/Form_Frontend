import axiosClient from './axiosClient';

export const templateApi = {
  // Get all templates
  getTemplates: (category) => {
    const params = category ? { category } : {};
    return axiosClient.get('/api/templates', { params });
  },

  // Get single template
  getTemplateById: (id) => {
    return axiosClient.get(`/api/templates/${id}`);
  },

  // Create custom template from form
  createTemplate: (data) => {
    return axiosClient.post('/api/templates', data);
  },

  // Create form from template
  createFormFromTemplate: (templateId, data) => {
    return axiosClient.post(`/api/templates/${templateId}/use`, data);
  },

  // Update custom template
  updateTemplate: (id, data) => {
    return axiosClient.put(`/api/templates/${id}`, data);
  },

  // Delete custom template
  deleteTemplate: (id) => {
    return axiosClient.delete(`/api/templates/${id}`);
  },
};
