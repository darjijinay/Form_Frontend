import { useState, useEffect } from 'react';
import { formApi } from '../../api/formApi';

export default function GoogleSheetsIntegration({ formId, isOpen, onClose }) {
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('Responses');

  useEffect(() => {
    if (isOpen && formId) {
      fetchIntegration();
    }
  }, [isOpen, formId]);

  const fetchIntegration = async () => {
    try {
      setLoading(true);
      const response = await formApi.getGoogleSheetsIntegration(formId);
      setIntegration(response.data?.data || null);
      setError('');
    } catch (err) {
      console.error(err);
      setIntegration(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async () => {
    try {
      setLoading(true);
      const response = await formApi.getGoogleSheetsAuthUrl();
      // Redirect to Google OAuth
      window.location.href = `${response.data.authUrl}&state=${formId}`;
    } catch (err) {
      setError('Failed to get authorization URL');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    if (!spreadsheetId.trim()) {
      setError('Spreadsheet ID is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await formApi.setupGoogleSheets({
        formId,
        spreadsheetId: spreadsheetId.trim(),
        sheetName: sheetName || 'Responses',
      });
      setShowSetup(false);
      setSpreadsheetId('');
      setSheetName('Responses');
      fetchIntegration();
    } catch (err) {
      setError(err.response?.data?.message || 'Error setting up Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSync = async () => {
    if (!confirm('Sync all responses to Google Sheets? This may take a while.')) return;

    try {
      setLoading(true);
      const response = await formApi.bulkSyncGoogleSheets(formId);
      alert(response.data?.message);
      fetchIntegration();
    } catch (err) {
      setError('Error syncing responses');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSync = async (newValue) => {
    try {
      setLoading(true);
      await formApi.toggleGoogleSheetsSync(formId, { syncOnSubmit: newValue });
      fetchIntegration();
    } catch (err) {
      setError('Error updating sync setting');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google Sheets? Syncing will stop.')) return;

    try {
      setLoading(true);
      await formApi.disconnectGoogleSheets(formId);
      setIntegration(null);
      fetchIntegration();
    } catch (err) {
      setError('Error disconnecting Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Google Sheets Integration</h2>
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

          {loading ? (
            <p className="text-gray-500 text-center py-12">Loading...</p>
          ) : !integration ? (
            /* Not Connected */
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📊 Sync Form Responses to Google Sheets
                </h3>
                <p className="text-sm text-blue-800">
                  Automatically sync all form responses to a Google Sheet for easy data analysis and reporting.
                </p>
              </div>

              <button
                onClick={handleAuthorize}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 22c-5.5 0-10-4.5-10-10S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm3.5-9c.8 0 1.5-.7 1.5-1.5S16.3 10 15.5 10 14 10.7 14 11.5s.7 1.5 1.5 1.5zm-7 0c.8 0 1.5-.7 1.5-1.5S9.3 10 8.5 10 7 10.7 7 11.5 7.7 13 8.5 13z" />
                </svg>
                Connect to Google Sheets
              </button>
            </div>
          ) : (
            /* Connected */
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 flex items-center gap-2">
                  <span>✓</span> Connected to Google Sheets
                </h3>
                <p className="text-sm text-green-800 mt-1">
                  Spreadsheet: <span className="font-mono">{integration.spreadsheetId}</span>
                </p>
                <p className="text-sm text-green-800">
                  Sheet: <span className="font-mono">{integration.sheetName}</span>
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium">Synced Responses</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {integration.syncCount}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium">Last Sync</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {integration.lastSyncTime
                      ? new Date(integration.lastSyncTime).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>

              {/* Settings */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Settings</h4>

                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={integration.syncOnSubmit}
                    onChange={(e) => handleToggleSync(e.target.checked)}
                    disabled={loading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 flex-1">
                    <span className="font-medium">Auto-sync on Response</span>
                    <p className="text-xs text-gray-600">
                      Automatically sync new responses to Google Sheets
                    </p>
                  </span>
                </label>
              </div>

              {/* Sheet Details */}
              {!showSetup && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowSetup(true)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Change Spreadsheet
                  </button>
                </div>
              )}

              {/* Change Sheet Form */}
              {showSetup && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <h4 className="font-semibold text-gray-900">Update Sheet Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spreadsheet ID
                    </label>
                    <input
                      type="text"
                      value={spreadsheetId}
                      onChange={(e) => setSpreadsheetId(e.target.value)}
                      placeholder="e.g., 1BxiMVs0XRA5nFMXYuJimuZ5xr4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Find this in your Google Sheets URL
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sheet Name
                    </label>
                    <input
                      type="text"
                      value={sheetName}
                      onChange={(e) => setSheetName(e.target.value)}
                      placeholder="Responses"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSetup}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setShowSetup(false)}
                      className="flex-1 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 border-t pt-4">
                <button
                  onClick={handleBulkSync}
                  disabled={loading}
                  className="w-full px-4 py-2 text-sm border border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 font-medium"
                >
                  💾 Sync All Responses Now
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full px-4 py-2 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
                >
                  Disconnect
                </button>
              </div>

              {/* Error Log */}
              {integration.errors && integration.errors.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-900 mb-2">
                    Recent Errors
                  </p>
                  <div className="space-y-1 text-xs text-yellow-800">
                    {integration.errors.slice(-3).map((err, idx) => (
                      <p key={idx}>
                        {new Date(err.timestamp).toLocaleString()}: {err.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
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
