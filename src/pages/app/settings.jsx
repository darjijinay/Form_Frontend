"use client";
import AppLayout from "../../components/layout/AppLayout";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

export default function SettingsPage() {
  const { user, token, setAuth } = useAuthStore();
  const [form, setForm] = useState({ fullName: '', email: '', company: '', jobTitle: '' });

  useEffect(() => {
    if (user) setForm({ fullName: user.name || '', email: user.email || '', company: user.company || '', jobTitle: user.jobTitle || '' });
  }, [user]);

  const handleSave = () => {
    // here we update local auth store (backend update endpoint not available in current api)
    const updatedUser = { ...(user || {}), name: form.fullName, email: form.email, company: form.company, jobTitle: form.jobTitle };
    setAuth({ user: updatedUser, token });
    alert('Profile updated (local). Implement backend update to persist changes.');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-slate-600">Manage your account preferences and workspace settings.</p>
        </div>

        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4">Profile Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">Full Name</label>
              <input value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} className="mt-2 w-full px-3 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Email Address</label>
              <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="mt-2 w-full px-3 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Company</label>
              <input value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} className="mt-2 w-full px-3 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Job Title</label>
              <input value={form.jobTitle} onChange={(e) => setForm({...form, jobTitle: e.target.value})} className="mt-2 w-full px-3 py-2 border rounded-xl" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-xl">Save Changes</button>
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-4 text-red-600">Danger Zone</h3>
          <p className="text-sm text-slate-600 mb-4">Delete your account and all associated data. This action is irreversible.</p>
          <div className="flex flex-col md:flex-row gap-3">
            <button className="w-full md:w-auto px-4 py-2 rounded-xl border border-slate-200">Deactivate</button>
            <button onClick={() => { if (confirm('Delete account? This cannot be undone.')) alert('Delete action not implemented on backend.'); }} className="w-full md:w-auto px-4 py-2 rounded-xl bg-red-600 text-white">Delete Account</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
