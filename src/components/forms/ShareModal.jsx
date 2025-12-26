import { useState, useEffect } from 'react';
import { formApi } from '@/api/formApi';

export default function ShareModal({ formId, isOpen, onClose, onShare }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const roleOptions = [
    { value: 'viewer', label: 'Viewer - View form & responses only' },
    { value: 'editor', label: 'Editor - Edit form structure' },
    { value: 'response_manager', label: 'Response Manager - Manage responses only' },
    { value: 'owner', label: 'Owner - Full control (admin)' },
  ];

  // Fetch current shares
  useEffect(() => {
    if (isOpen && formId) {
      fetchShares();
    }
  }, [isOpen, formId]);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const response = await formApi.getFormShares(formId);
      setShares(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching shares:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await formApi.shareForm(formId, { email, role });
      setMessage('Form shared successfully!');
      setEmail('');
      setRole('viewer');
      setTimeout(() => setMessage(''), 3000);
      fetchShares();
      if (onShare) onShare();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error sharing form';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId) => {
    try {
      setLoading(true);
      await formApi.removeShare(formId, shareId);
      fetchShares();
    } catch (err) {
      setError('Error removing share');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (shareId, newRole) => {
    try {
      setLoading(true);
      await formApi.updateShare(formId, shareId, { role: newRole });
      fetchShares();
    } catch (err) {
      setError('Error updating role');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Share Form</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Form */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Share with others</h3>
            <form onSubmit={handleShare} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={loading}
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label.split(' - ')[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Info */}
              {role && (
                <p className="text-sm text-gray-600">
                  {roleOptions.find((opt) => opt.value === role)?.label.split(' - ')[1]}
                </p>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Sharing...' : 'Share Form'}
              </button>
            </form>
          </div>

          {/* Current Shares */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Shared with ({shares.length})</h3>
            {shares.length === 0 ? (
              <p className="text-gray-500 text-sm">Not shared with anyone yet</p>
            ) : (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share._id}
                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {share.sharedWith?.name || share.sharedWith?.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {share.sharedWith?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={share.role}
                        onChange={(e) =>
                          handleUpdateRole(share._id, e.target.value)
                        }
                        disabled={loading}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label.split(' - ')[0]}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemoveShare(share._id)}
                        disabled={loading}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
