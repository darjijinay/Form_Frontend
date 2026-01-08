import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import analyticsApi from '../../api/analyticsApi';
import CompletionRateCard from './CompletionRateCard';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-bold text-gray-800">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{`${p.name}: ${p.value}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard({ formId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const { data } = await analyticsApi.getFormAnalytics(formId, params);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [formId, dateRange]);

  useEffect(() => {
    loadAnalytics();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAnalytics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
        No data available for this form yet. Submit a response to see analytics.
      </div>
    );
  }

  const { stats, fieldAnalytics, timeline } = analytics;

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Form Analytics</h2>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2 transition-all duration-300"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
            </svg>
            Refresh
          </button>
        </div>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Professional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6" title="Total unique views (per user/session/IP)">
          <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
            Unique Views
            <span className="ml-1" title="Unique viewers are counted once per user/session/IP.">🛈</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUniqueViews || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6" title="Total unique responders (per user/session/IP)">
          <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
            Unique Responders
            <span className="ml-1" title="Unique responders are counted once per user/session/IP.">🛈</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUniqueResponders || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6" title="Professional completion rate: unique responders / unique viewers">
          <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
            Completion Rate
            <span className="ml-1" title="Completion Rate = Unique Responders / Unique Views × 100%">🛈</span>
          </div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats?.completionRate}%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6" title="Number of respondents this week">
          <div className="text-sm font-medium text-gray-500">This Week</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats?.respondentsThisWeek}</div>
        </div>
      </div>

      {/* Completion Rate Visualization */}
      <CompletionRateCard stats={stats} />

      {/* Timeline Chart */}
      {timeline && timeline.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Submission Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="submissions"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Field Analytics */}
      {fieldAnalytics && Object.keys(fieldAnalytics).length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Field Response Breakdown</h3>

          {Object.entries(fieldAnalytics).map(([fieldId, field]) => (
            <FieldChart key={fieldId} field={field} />
          ))}
        </div>
      )}
    </div>
  );
}

// Component for individual field analytics
function FieldChart({ field }) {
  if (!field.chartData && !field.stats && !field.uniqueCount) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h4 className="text-base font-semibold text-gray-900">{field.label}</h4>
        <div className="text-sm text-gray-500">
          {field.completionRate}% completed ({field.totalResponses} responses)
        </div>
      </div>

      {field.chartData && field.chartData.type === 'pie' && (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={field.chartData.labels.map((label, idx) => ({
                name: label,
                value: field.chartData.data[idx],
              }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationBegin={200}
              animationDuration={800}
            >
              {field.chartData.labels.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )}

      {field.chartData && field.chartData.type === 'bar' && (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={field.chartData.labels.map((label, idx) => ({
              name: label,
              value: field.chartData.data[idx],
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#3b82f6" animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {field.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase">Min</div>
            <div className="text-lg font-bold text-gray-900">{field.stats.min}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase">Max</div>
            <div className="text-lg font-bold text-gray-900">{field.stats.max}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase">Avg</div>
            <div className="text-lg font-bold text-gray-900">{field.stats.avg}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase">Total</div>
            <div className="text-lg font-bold text-gray-900">{field.stats.total}</div>
          </div>
        </div>
      )}

      {field.uniqueCount && (
        <div className="text-sm text-gray-600 mt-4">
          {field.uniqueCount} unique responses
        </div>
      )}
    </div>
  );
}
