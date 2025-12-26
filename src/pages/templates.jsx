"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from '../assets/logo.png';

const FALLBACK_TEMPLATES = [
  { 
    _id: "tpl1", 
    title: "Workshop Registration", 
    description: "Collect attendee details for your upcoming workshop or seminar.", 
    category: "Events",
    fields: ["Full Name", "Email Address", "Phone Number", "Company/Organization", "Dietary Requirements", "Preferred Session", "Additional Comments"]
  },
  { 
    _id: "tpl2", 
    title: "Job Application", 
    description: "Standard job application form with resume upload section.", 
    category: "HR",
    fields: ["Full Name", "Email Address", "Phone Number", "Position Applied For", "Years of Experience", "Resume Upload", "Cover Letter", "Available Start Date"]
  },
  { 
    _id: "tpl3", 
    title: "Customer Feedback", 
    description: "Gather insights from your customers about your product.", 
    category: "Feedback",
    fields: ["Name", "Email", "Product/Service Used", "Overall Rating", "Would you recommend us?", "Your Feedback", "Suggestions for Improvement"]
  },
  { 
    _id: "tpl4", 
    title: "College Admission", 
    description: "Comprehensive form for student admission inquiries.", 
    category: "Education",
    fields: ["First Name", "Last Name", "Email Address", "Phone Number", "Date of Birth", "Program of Interest", "Current GPA", "High School Name", "Personal Statement"]
  },
  { 
    _id: "tpl5", 
    title: "Event RSVP", 
    description: "Simple RSVP form for parties, weddings, and corporate events.", 
    category: "Events",
    fields: ["Full Name", "Email Address", "Will you attend?", "Number of Guests", "Dietary Restrictions", "Special Requests/Comments"]
  },
  { 
    _id: "tpl6", 
    title: "Contact Us", 
    description: "Basic contact form for your website visitors.", 
    category: "General",
    fields: ["Your Name", "Email Address", "Subject", "Message", "Preferred Contact Method", "Phone Number (optional)"]
  },
];

export default function PublicTemplatesPage() {
  const [templates] = useState(FALLBACK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src={logo} alt="FormCraft Logo" width={40} height={40} className="drop-shadow-sm" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">FormCraft</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">All Templates</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Browse our collection of professionally designed templates and get started instantly</p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {templates.map((t) => {
            const category = (t.category || 'General').toLowerCase();
            const colorMap = {
              events: 'bg-rose-400',
              hr: 'bg-emerald-400',
              feedback: 'bg-violet-400',
              education: 'bg-orange-400',
              general: 'bg-sky-400',
            };
            const stripeClass = colorMap[category] || 'bg-sky-400';

            return (
              <div
                key={t._id}
                className="relative rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group overflow-hidden bg-white"
              >
                <div className={`${stripeClass} h-2 w-full`} />
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase text-slate-500 font-semibold tracking-wide">{t.category}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t.title}</h3>
                  <p className="text-sm text-slate-600">{t.description}</p>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm rounded-xl">
                  <div className="flex gap-2 flex-wrap justify-center px-4">
                    <button
                      onClick={() => setSelectedTemplate(t)}
                      className="bg-white text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </button>
                    <Link
                      href="/auth/register"
                      className="bg-indigo-500 text-white hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Use
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm uppercase text-slate-500 font-semibold mb-2">{selectedTemplate.category}</div>
                <h2 className="text-2xl font-bold">{selectedTemplate.title}</h2>
                <p className="text-slate-600 mt-2">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="ml-4 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Form Fields</h3>
              <div className="space-y-3">
                {selectedTemplate.fields && selectedTemplate.fields.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-indigo-600">{idx + 1}</span>
                    </div>
                    <span className="text-slate-700 font-medium">{field}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-slate-50 p-6 flex gap-3">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <Link
                href="/auth/register"
                className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors text-center"
              >
                Use This Template
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
