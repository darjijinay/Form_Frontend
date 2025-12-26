import { useState, useEffect } from 'react';
import { formApi } from '@/api/formApi';

export default function VersionHistory({ formId, isOpen, onClose, onRollback }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && formId) {
      fetchVersions();
    }
  }, [isOpen, formId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await formApi.getFormVersions(formId);
      setVersions(response.data?.data || []);
    } catch (err) {
      setError('Error loading versions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (versionNumber) => {
    if (
      !confirm(
        `Are you sure you want to rollback to version ${versionNumber}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await formApi.rollbackFormVersion(formId, versionNumber);
      setError('');
      fetchVersions();
      if (onRollback) onRollback();
    } catch (err) {
      setError('Error rolling back version');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading versions...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">No versions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version._id}
                  className="border border-gray-200 rounded-lg hover:border-gray-300 transition"
                >
                  {/* Version Header */}
                  <button
                    onClick={() =>
                      setExpandedVersion(
                        expandedVersion === version._id ? null : version._id
                      )
                    }
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          v{version.versionNumber}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {version.changesSummary || 'Version ' + version.versionNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(version.createdAt)} by{' '}
                            {version.createdBy?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {version.isPublished && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Published
                        </span>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition ${
                          expandedVersion === version._id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedVersion === version._id && (
                    <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Version Number</p>
                          <p className="font-medium text-gray-900">
                            {version.versionNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Fields Count</p>
                          <p className="font-medium text-gray-900">
                            {version.fields?.length || 0} fields
                          </p>
                        </div>
                      </div>

                      {version.changesSummary && (
                        <div>
                          <p className="text-gray-600 text-sm">Changes</p>
                          <p className="text-gray-900">
                            {version.changesSummary}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleRollback(version.versionNumber)}
                          disabled={loading || index === 0}
                          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                        >
                          Rollback to this version
                        </button>
                        {index === 0 && (
                          <span className="text-xs text-gray-500 self-center">
                            (Current version)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
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
