import { useState, useEffect } from 'react';
import { formApi } from '../../api/formApi';

export default function WebhookManager({ formId, isOpen, onClose }) {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    events: ['response.created'],
    description: '',
    active: true,
  });

  const eventOptions = [
    { value: 'response.created', label: 'Response Created' },
    { value: 'response.updated', label: 'Response Updated' },
    { value: 'response.deleted', label: 'Response Deleted' },
    { value: 'form.updated', label: 'Form Updated' },
  ];

  useEffect(() => {
    if (isOpen && formId) {
      fetchWebhooks();
    }
  }, [isOpen, formId]);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await formApi.getFormWebhooks(formId);
       console.log('✅ Webhooks loaded:', response);
      setWebhooks(response.data?.data || []);
    } catch (err) {
       const errorMsg = err.response?.data?.message || err.message || 'Error loading webhooks';
       setError(errorMsg);
       console.error('❌ Webhook fetch error:', {
         message: errorMsg,
         status: err.response?.status,
         data: err.response?.data,
         formId,
         fullError: err
       });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.url.trim()) {
      setError('Webhook URL is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await formApi.createWebhook({
        formId,
        ...formData,
      });
      setShowAddForm(false);
      setFormData({
        url: '',
        events: ['response.created'],
        description: '',
        active: true,
      });
      fetchWebhooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (webhookId, currentActive) => {
    try {
      await formApi.updateWebhook(webhookId, { active: !currentActive });
      fetchWebhooks();
    } catch (err) {
      setError('Error updating webhook');
    }
  };

  const handleDelete = async (webhookId) => {
    if (!confirm('Delete this webhook?')) return;

    try {
      setLoading(true);
      await formApi.deleteWebhook(webhookId);
      fetchWebhooks();
    } catch (err) {
      setError('Error deleting webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (webhookId) => {
    try {
      setLoading(true);
      const response = await formApi.testWebhook(webhookId);
      if (response.data?.success) {
        alert('Test webhook sent successfully!');
      } else {
        alert('Test webhook failed: ' + response.data?.message);
      }
    } catch (err) {
      alert('Test webhook failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEventToggle = (event) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Webhook Management</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Add Webhook Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Add Webhook
            </button>
          )}

          {/* Add Webhook Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Add New Webhook</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://your-server.com/webhook"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Events to Listen *
                  </label>
                  <div className="space-y-2">
                    {eventOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.events.includes(option.value)}
                          onChange={() => handleEventToggle(option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the purpose of this webhook..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || formData.events.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Creating...' : 'Create Webhook'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Webhooks List */}
          {loading && webhooks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Loading webhooks...</p>
          ) : webhooks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No webhooks configured yet
            </p>
          ) : (
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div
                  key={webhook._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            webhook.active ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <span className="font-medium text-gray-900 break-all">
                          {webhook.url}
                        </span>
                      </div>
                      {webhook.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {webhook.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>
                          Success: {webhook.successCount} | Failed:{' '}
                          {webhook.failureCount}
                        </p>
                        {webhook.lastTriggered && (
                          <p>
                            Last triggered:{' '}
                            {new Date(webhook.lastTriggered).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleTest(webhook._id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                    >
                      Test
                    </button>
                    <button
                      onClick={() =>
                        handleToggleActive(webhook._id, webhook.active)
                      }
                      disabled={loading}
                      className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
                    >
                      {webhook.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(webhook._id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50 ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
