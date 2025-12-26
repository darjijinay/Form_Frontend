import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function CompletionRateCard({ stats }) {
  if (!stats) {
    return null;
  }

  const completionRate = parseFloat(stats.completionRate) || 0;
  const incompletionRate = 100 - completionRate;

  const chartData = [
    { name: 'Completed', value: completionRate },
    { name: 'Not Completed', value: incompletionRate },
  ];

  const COLORS = ['#10b981', '#e5e7eb'];

  // Professional stats
  const totalUniqueViews = stats.totalUniqueViews || 0;
  const totalUniqueResponders = stats.totalUniqueResponders || 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Completion Rate</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart */}
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="flex flex-col justify-center space-y-4">
          <div>
            <div className="text-4xl font-bold text-green-600">{completionRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Unique Views</span>
              <span className="text-lg font-bold text-gray-900">{totalUniqueViews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Unique Responders</span>
              <span className="text-lg font-bold text-gray-900">{totalUniqueResponders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Unique Views w/o Response</span>
              <span className="text-lg font-bold text-gray-900">
                {Math.max(0, totalUniqueViews - totalUniqueResponders)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 uppercase font-semibold mb-3">This Period</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">Today</div>
                <div className="text-xl font-bold text-blue-600">{stats.respondentsToday || 0}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">This Week</div>
                <div className="text-xl font-bold text-purple-600">{stats.respondentsThisWeek || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
