// frontend/custom-form-next/src/components/integrations/SlackIntegration.jsx
import React, { useEffect, useState } from 'react';
import { formApi } from '../../api/formApi';
import styles from '../../styles/integrations.module.css';

export default function SlackIntegration({ formId }) {
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [errors, setErrors] = useState([]);

  // Form state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [botToken, setBotToken] = useState('');
  const [channel, setChannel] = useState('');
  const [notifyOn, setNotifyOn] = useState(['response.created']);
  const [mentionUsers, setMentionUsers] = useState('');
  const [threadReplies, setThreadReplies] = useState(false);
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [messageTemplate, setMessageTemplate] = useState(
    'New response received for {{formTitle}}'
  );

  // Load integration
  useEffect(() => {
    loadIntegration();
  }, [formId]);

  const loadIntegration = async () => {
    try {
      setLoading(true);
      const response = await formApi.getSlackIntegration(formId);
      if (response.data) {
        setIntegration(response.data);
        setWebhookUrl(response.data.webhookUrl || '');
        setBotToken(response.data.botToken || '');
        setChannel(response.data.channel || '');
        setNotifyOn(response.data.notifyOn || ['response.created']);
        setMentionUsers((response.data.mentionUsers || []).join(', '));
        setThreadReplies(response.data.threadReplies || false);
        setIncludeAnswers(response.data.includeAnswers !== false);
        setMessageTemplate(
          response.data.messageTemplate ||
            'New response received for {{formTitle}}'
        );
        setErrors(response.data.errors || []);
      }
    } catch (error) {
      console.error('Error loading integration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    if (!webhookUrl && !botToken) {
      alert('Please provide either a Webhook URL or Bot Token');
      return;
    }

    try {
      setLoading(true);
      const mentions = mentionUsers
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m);

      const response = await formApi.setupSlackIntegration(formId, {
        webhookUrl,
        botToken,
        channel,
        notifyOn,
        mentionUsers: mentions,
        threadReplies,
        includeAnswers,
        messageTemplate,
      });

      setIntegration(response.data);
      setSetupMode(false);
      setTestResult(null);
    } catch (error) {
      alert('Error setting up integration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field, value) => {
    try {
      setLoading(true);
      const updateData = { [field]: value };

      const response = await formApi.updateSlackIntegration(formId, updateData);
      setIntegration(response.data);
    } catch (error) {
      alert('Error updating setting: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setTestLoading(true);
      const response = await formApi.testSlackIntegration(formId);
      setTestResult(response);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error testing integration: ' + error.message,
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect Slack?')) {
      try {
        setLoading(true);
        await formApi.disconnectSlackIntegration(formId);
        setIntegration(null);
        setWebhookUrl('');
        setBotToken('');
        setChannel('');
        setErrors([]);
      } catch (error) {
        alert('Error disconnecting: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && setupMode === false && !integration) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (setupMode) {
    return (
      <div className={styles.integrationsContainer}>
        <div className={styles.integrationsCard}>
          <h3>Setup Slack Integration</h3>

          <form onSubmit={handleSetup} className={styles.form}>
            <div className={styles.formGroup}>
              <label>
                Webhook URL (Incoming Webhook)
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                Bot Token
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="xoxb-..."
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                Channel Name
                <input
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  placeholder="#notifications or U1234567890"
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                Message Template
                <textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="New response received for {{formTitle}}"
                  rows={3}
                />
              </label>
              <small>Available variables: {'{{formTitle}}'}, {'{{responseCount}}'}</small>
            </div>

            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={(e) => setIncludeAnswers(e.target.checked)}
                />
                Include form answers in notification
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={threadReplies}
                  onChange={(e) => setThreadReplies(e.target.checked)}
                />
                Enable threaded replies
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                Mention Users (comma-separated Slack user IDs)
                <input
                  type="text"
                  value={mentionUsers}
                  onChange={(e) => setMentionUsers(e.target.value)}
                  placeholder="U1234567890, U0987654321"
                />
              </label>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                disabled={loading}
                className={styles.primaryBtn}
              >
                {loading ? 'Setting up...' : 'Setup Integration'}
              </button>
              <button
                type="button"
                onClick={() => setSetupMode(false)}
                className={styles.secondaryBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!integration) {
    return (
      <div className={styles.integrationsContainer}>
        <div className={styles.integrationsCard}>
          <h3>Slack Notifications</h3>
          <p>Send form responses to Slack</p>
          <button
            onClick={() => setSetupMode(true)}
            className={styles.primaryBtn}
          >
            Connect Slack
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.integrationsContainer}>
      <div className={styles.integrationsCard}>
        <div className={styles.cardHeader}>
          <h3>Slack Integration</h3>
          <span className={styles.status}>
            {integration.active ? '🟢 Connected' : '🔴 Inactive'}
          </span>
        </div>

        {/* Stats Section */}
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Notifications Sent</div>
            <div className={styles.statValue}>
              {integration.notificationCount || 0}
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Errors</div>
            <div className={styles.statValue}>{integration.errorCount || 0}</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Last Notified</div>
            <div className={styles.statValue}>
              {integration.lastNotifiedAt
                ? new Date(integration.lastNotifiedAt).toLocaleDateString()
                : 'Never'}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className={styles.settingsSection}>
          <h4>Settings</h4>

          <div className={styles.settingItem}>
            <label>Active</label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={integration.active}
                onChange={(e) => handleUpdate('active', e.target.checked)}
                disabled={loading}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingItem}>
            <label>Channel</label>
            <input
              type="text"
              value={integration.channel}
              onChange={(e) => {
                handleUpdate('channel', e.target.value);
              }}
              disabled={loading}
            />
          </div>

          <div className={styles.settingItem}>
            <label>Include Answers</label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={integration.includeAnswers}
                onChange={(e) => handleUpdate('includeAnswers', e.target.checked)}
                disabled={loading}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingItem}>
            <label>Thread Replies</label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={integration.threadReplies}
                onChange={(e) => handleUpdate('threadReplies', e.target.checked)}
                disabled={loading}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        {/* Error Log */}
        {errors.length > 0 && (
          <div className={styles.errorLog}>
            <h4>Recent Errors</h4>
            <ul>
              {errors.slice(-5).map((error, idx) => (
                <li key={idx}>
                  <small>{error}</small>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div
            className={`${styles.testResult} ${
              testResult.success ? styles.success : styles.error
            }`}
          >
            {testResult.message}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.buttonGroup}>
          <button
            onClick={handleTest}
            disabled={loading || testLoading}
            className={styles.secondaryBtn}
          >
            {testLoading ? 'Testing...' : 'Test Notification'}
          </button>

          <button
            onClick={() => setSetupMode(true)}
            disabled={loading}
            className={styles.secondaryBtn}
          >
            Reconfigure
          </button>

          <button
            onClick={handleDisconnect}
            disabled={loading}
            className={styles.dangerBtn}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
