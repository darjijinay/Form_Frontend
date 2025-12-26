"use client";
import AppLayout from "../../components/layout/AppLayout";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { formApi } from "../../api/formApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await formApi.getAnalyticsOverview();
        setOverview(data);
      } catch (error) {
        // If unauthorized, clear token and redirect to login
        if (error?.response?.status === 401) {
          try { localStorage.removeItem('token'); } catch (e) {}
          router.push('/auth/login');
          return;
        }
        console.error('Error loading analytics:', error);
        setError('Failed to load analytics. Please refresh the page.');
        setForms([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const totalResponses = overview?.totalResponses || 0;
  const activeForms = overview?.activeForms || 0;
  const totalForms = overview?.totalForms || 0;
  const totalViews = overview?.totalViews || 0;

  // daily data (last 30 days)
  const dailyLabels = (overview?.dailyViewSeries || []).map((d) => d.date.slice(5));
  const lineData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Views',
        data: (overview?.dailyViewSeries || []).map((d) => d.count),
        fill: true,
        backgroundColor: 'rgba(34,197,94,0.08)',
        borderColor: '#10B981',
        tension: 0.35,
      },
      {
        label: 'Submissions',
        data: (overview?.dailyResponseSeries || []).map((d) => d.count),
        fill: true,
        backgroundColor: 'rgba(139,92,246,0.06)',
        borderColor: '#8B5CF6',
        tension: 0.35,
      }
    ],
  };

  // monthly conversion trend (last 6 months)
  const conversionData = (overview?.monthlyResponseSeries || []).map((r, idx) => {
    const v = overview?.monthlyViewSeries?.[idx]?.count || 0;
    const pct = v > 0 ? Math.round((r.count / v) * 100) : 0;
    return pct;
  });

  const perFormStats = overview?.perForm || [];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-slate-300 border-t-indigo-500 rounded-full mb-4"></div>
            <p className="text-slate-600">Loading analytics...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold">Analytics Overview</h1>
          <p className="text-slate-600">Aggregate performance metrics across all your forms.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Stat label="Total Responses" value={totalResponses} />
          <Stat label="Total Views" value={totalViews} />
          <Stat label="Active Forms" value={activeForms} />
          <Stat label="Total Forms" value={totalForms} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Traffic & Responses</h3>
            <Line data={lineData} />
          </div>

          <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4">Conversion Trend</h3>
            <Bar data={{ labels: (overview?.monthlyViewSeries || []).map((m) => m.month), datasets: [{ label: 'Conversion %', data: conversionData, backgroundColor: '#F59E0B' }] }} />
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Top Performing Forms</h3>
          {perFormStats.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <p>No forms created yet. Create a form to see analytics.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500 text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="pb-3 font-semibold">Form Name</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Responses</th>
                    <th className="pb-3 font-semibold text-right">Conversion %</th>
                  </tr>
                </thead>
                <tbody>
                  {perFormStats.sort((a, b) => b.responses - a.responses).slice(0, 10).map((stat) => (
                    <tr key={stat.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-[var(--text)]">{stat.name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stat.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {stat.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-indigo-600">{stat.responses}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          {stat.conversion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
      <div className="text-sm text-slate-600 uppercase mb-2">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
