import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { formApi } from "../api/formApi";
import { templateApi } from "../api/templateApi";
import Link from 'next/link';
import logo from '../assets/logo.png';
import Image from 'next/image';

const FALLBACK_TEMPLATES = [
  { 
    _id: "tpl1", 
    title: "Workshop Registration", 
    description: "Collect attendee details for your upcoming workshop or seminar.", 
    category: "Events",
    fields: [
      { _id: "f1", type: "short_text", label: "Full Name", required: true, placeholder: "Enter your full name", order: 0 },
      { _id: "f2", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com", order: 1 },
      { _id: "f3", type: "short_text", label: "Phone Number", required: false, placeholder: "+1 (555) 000-0000", order: 2 },
      { _id: "f4", type: "short_text", label: "Company/Organization", required: false, placeholder: "Your company name", order: 3 },
      { _id: "f5", type: "dropdown", label: "Dietary Requirements", required: false, options: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Other"], order: 4 },
      { _id: "f6", type: "radio", label: "Preferred Session", required: true, options: ["Morning Session", "Afternoon Session"], order: 5 },
      { _id: "f7", type: "long_text", label: "Additional Comments", required: false, placeholder: "Any questions or special requirements?", order: 6 }
    ]
  },
  { 
    _id: "tpl2", 
    title: "Job Application", 
    description: "Standard job application form with resume upload section.", 
    category: "HR",
    fields: [
      { _id: "f1", type: "short_text", label: "Full Name", required: true, placeholder: "Enter your full name", order: 0 },
      { _id: "f2", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com", order: 1 },
      { _id: "f3", type: "short_text", label: "Phone Number", required: true, placeholder: "+1 (555) 000-0000", order: 2 },
      { _id: "f4", type: "short_text", label: "Position Applied For", required: true, placeholder: "e.g., Software Engineer", order: 3 },
      { _id: "f5", type: "dropdown", label: "Years of Experience", required: true, options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"], order: 4 },
      { _id: "f6", type: "file", label: "Upload Resume", required: true, placeholder: "PDF or DOC file", order: 5 },
      { _id: "f7", type: "long_text", label: "Cover Letter", required: false, placeholder: "Tell us why you're a great fit...", order: 6 },
      { _id: "f8", type: "date", label: "Available Start Date", required: true, order: 7 }
    ]
  },
  { 
    _id: "tpl3", 
    title: "Customer Feedback", 
    description: "Gather insights from your customers about your product.", 
    category: "Feedback",
    fields: [
      { _id: "f1", type: "short_text", label: "Name", required: false, placeholder: "Your name (optional)", order: 0 },
      { _id: "f2", type: "email", label: "Email", required: true, placeholder: "your.email@example.com", order: 1 },
      { _id: "f3", type: "short_text", label: "Product/Service Used", required: true, placeholder: "Which product did you use?", order: 2 },
      { _id: "f4", type: "radio", label: "Overall Rating", required: true, options: ["Poor", "Fair", "Good", "Very Good", "Excellent"], order: 3 },
      { _id: "f5", type: "radio", label: "Would you recommend us?", required: true, options: ["Yes", "No", "Maybe"], order: 4 },
      { _id: "f6", type: "long_text", label: "Your Feedback", required: true, placeholder: "Share your experience with us...", order: 5 },
      { _id: "f7", type: "long_text", label: "Suggestions for Improvement", required: false, placeholder: "What could we do better?", order: 6 }
    ]
  },
  { 
    _id: "tpl4", 
    title: "College Admission", 
    description: "Comprehensive form for student admission inquiries.", 
    category: "Education",
    fields: [
      { _id: "f1", type: "short_text", label: "First Name", required: true, placeholder: "Enter first name", order: 0 },
      { _id: "f2", type: "short_text", label: "Last Name", required: true, placeholder: "Enter last name", order: 1 },
      { _id: "f3", type: "email", label: "Email Address", required: true, placeholder: "student@example.com", order: 2 },
      { _id: "f4", type: "short_text", label: "Phone Number", required: true, placeholder: "+1 (555) 000-0000", order: 3 },
      { _id: "f5", type: "date", label: "Date of Birth", required: true, order: 4 },
      { _id: "f6", type: "dropdown", label: "Program of Interest", required: true, options: ["Computer Science", "Engineering", "Business Administration", "Medicine", "Arts", "Other"], order: 5 },
      { _id: "f7", type: "short_text", label: "Current GPA", required: false, placeholder: "e.g., 3.8", order: 6 },
      { _id: "f8", type: "short_text", label: "High School Name", required: true, placeholder: "Your high school", order: 7 },
      { _id: "f9", type: "long_text", label: "Personal Statement", required: true, placeholder: "Tell us about yourself and why you want to join our institution...", order: 8 }
    ]
  },
  { 
    _id: "tpl5", 
    title: "Event RSVP", 
    description: "Simple RSVP form for parties, weddings, and corporate events.", 
    category: "Events",
    fields: [
      { _id: "f1", type: "short_text", label: "Full Name", required: true, placeholder: "Enter your name", order: 0 },
      { _id: "f2", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com", order: 1 },
      { _id: "f3", type: "radio", label: "Will you attend?", required: true, options: ["Yes, I'll be there", "No, I can't make it"], order: 2 },
      { _id: "f4", type: "number", label: "Number of Guests", required: false, placeholder: "Including yourself", order: 3 },
      { _id: "f5", type: "dropdown", label: "Dietary Restrictions", required: false, options: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Other"], order: 4 },
      { _id: "f6", type: "long_text", label: "Special Requests/Comments", required: false, placeholder: "Any special requirements or messages?", order: 5 }
    ]
  },
  { 
    _id: "tpl6", 
    title: "Contact Us", 
    description: "Basic contact form for your website visitors.", 
    category: "General",
    fields: [
      { _id: "f1", type: "short_text", label: "Your Name", required: true, placeholder: "Enter your name", order: 0 },
      { _id: "f2", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com", order: 1 },
      { _id: "f3", type: "short_text", label: "Subject", required: true, placeholder: "What is this regarding?", order: 2 },
      { _id: "f4", type: "long_text", label: "Message", required: true, placeholder: "Write your message here...", order: 3 },
      { _id: "f5", type: "radio", label: "Preferred Contact Method", required: false, options: ["Email", "Phone"], order: 4 },
      { _id: "f6", type: "short_text", label: "Phone Number (optional)", required: false, placeholder: "+1 (555) 000-0000", order: 5 }
    ]
  },
  {
    _id: "tpl7",
    title: "Quick Survey",
    description: "Simple multi-choice survey template.",
    category: "Survey",
    fields: [
      { _id: "qs1", type: "short_text", label: "Your Name (Optional)", required: false, placeholder: "Enter your name", order: 0 },
      { _id: "qs2", type: "radio", label: "How did you hear about us?", required: true, options: ["Social Media", "Search Engine", "Friend Referral", "Advertisement", "Other"], order: 1 },
      { _id: "qs3", type: "checkbox", label: "Which features interest you?", required: true, options: ["Feature A", "Feature B", "Feature C", "Feature D"], order: 2 },
      { _id: "qs4", type: "rating", label: "Rate your experience", required: true, placeholder: "Select rating", order: 3 },
      { _id: "qs5", type: "long_text", label: "Any suggestions?", required: false, placeholder: "We appreciate your feedback...", order: 4 }
    ]
  },
  {
    _id: "tpl8",
    title: "Product Template",
    description: "Product order form with customer and product details.",
    category: "Product",
    fields: [
      { _id: "pf1", type: "short_text", label: "Product Name", required: true, placeholder: "Enter product name", order: 0 },
      { _id: "pf2", type: "short_text", label: "Product Category", required: true, placeholder: "Enter product category", order: 1 },
      { _id: "pf3", type: "number", label: "Quantity", required: true, placeholder: "1", order: 2 },
      { _id: "pf4", type: "short_text", label: "Price", required: true, placeholder: "$0.00", order: 3 },
      { _id: "pf5", type: "short_text", label: "Customer Name", required: true, placeholder: "Enter customer name", order: 4 },
      { _id: "pf6", type: "email", label: "Email", required: true, placeholder: "customer@example.com", order: 5 }
    ]
  },
  {
    _id: "tpl9",
    title: "Course Template",
    description: "Collect course enrollment details from students.",
    category: "Education",
    fields: [
      { _id: "cf1", type: "short_text", label: "Course Name", required: true, placeholder: "Enter course name", order: 0 },
      { _id: "cf2", type: "short_text", label: "Student Name", required: true, placeholder: "Enter student name", order: 1 },
      { _id: "cf3", type: "email", label: "Email", required: true, placeholder: "student@example.com", order: 2 },
      { _id: "cf4", type: "dropdown", label: "Mode", required: true, options: ["Online", "Offline", "Hybrid"], order: 3 }
    ]
  },
  {
    _id: "tpl10",
    title: "Trip Package Template",
    description: "Capture trip package details and traveler info.",
    category: "Travel",
    fields: [
      { _id: "tp1", type: "short_text", label: "Destination", required: true, placeholder: "Enter destination", order: 0 },
      { _id: "tp2", type: "dropdown", label: "Package Type", required: true, options: ["Standard", "Deluxe", "Premium", "Custom"], order: 1 },
      { _id: "tp3", type: "date", label: "Travel Date", required: true, placeholder: "Select date", order: 2 },
      { _id: "tp4", type: "number", label: "Travelers", required: true, placeholder: "1", order: 3 },
      { _id: "tp5", type: "short_text", label: "Name", required: true, placeholder: "Enter primary traveler name", order: 4 },
      { _id: "tp6", type: "email", label: "Email", required: true, placeholder: "traveler@example.com", order: 5 }
    ]
  },
  {
    _id: "tpl11",
    title: "Appointment Booking Template",
    description: "Book appointments with preferred service and time slot.",
    category: "Appointment",
    fields: [
      { _id: "ab1", type: "dropdown", label: "Service Type", required: true, options: ["Consultation", "Follow-up", "Therapy", "Support", "Other"], order: 0 },
      { _id: "ab2", type: "date", label: "Appointment Date", required: true, placeholder: "Select date", order: 1 },
      { _id: "ab3", type: "short_text", label: "Time Slot", required: true, placeholder: "e.g., 2:00 PM - 3:00 PM", order: 2 },
      { _id: "ab4", type: "short_text", label: "Name", required: true, placeholder: "Enter your name", order: 3 },
      { _id: "ab5", type: "short_text", label: "Phone", required: true, placeholder: "+1 (555) 123-4567", order: 4 }
    ]
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [previewTemplateId, setPreviewTemplateId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await templateApi.getTemplates();
        const apiTemplates = Array.isArray(res.data?.templates) ? res.data.templates : (Array.isArray(res.data) ? res.data : []);
        if (apiTemplates.length > 0) {
          const mapped = apiTemplates.map(t => ({
            _id: t._id,
            title: t.name || t.title || 'Untitled Template',
            description: t.description || '',
            category: (t.category || 'General'),
            fields: t.fields || [],
          }));
          setTemplates(mapped);
        }
      } catch (e) {
        // fall back to local list
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleUseTemplate = (tpl) => {
    // Redirect to login - user must be authenticated to create forms
    router.push(`/auth/login?returnTo=/app/templates`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Public Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <Image src={logo} alt="FormCraft Logo" width={40} height={40} />
              <span className="text-xl font-bold">FormCraft</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="px-4 py-2 text-slate-700 hover:text-indigo-600 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Browse Templates</h1>
            <p className="text-sm sm:text-base text-slate-600">Choose from our collection of professionally designed templates.</p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => {
            const id = t._id || t.id;
            const category = (t.category || 'General').toLowerCase();

            const colorMap = {
              events: 'bg-rose-400',
              hr: 'bg-emerald-400',
              feedback: 'bg-violet-400',
              survey: 'bg-purple-400',
              education: 'bg-orange-400',
              general: 'bg-sky-400',
              product: 'bg-amber-400',
              travel: 'bg-teal-400',
              appointment: 'bg-indigo-400',
            };

            const stripeClass = colorMap[category] || 'bg-sky-400';

            return (
              <div
                key={id}
                className="relative rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-all flex flex-col justify-between h-full overflow-hidden shadow-sm hover:shadow-md"
              >
                {/* colored top stripe */}
                <div className={`${stripeClass} h-1 w-full`} />

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs uppercase text-slate-500 font-medium">{t.category || 'General'}</div>
                      <div className="text-slate-400 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-semibold text-[var(--text)] mb-2">{t.title}</h3>
                    <p className="text-sm text-slate-600">{t.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setPreviewTemplateId(id); }} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors">Preview</button>
                    <button onClick={(e) => { e.stopPropagation(); handleUseTemplate(t); }} className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">Use Template</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer action for selected template */}
        <div className="mt-6 flex justify-end">
        </div>

        {/* Template Preview Modal */}
        {previewTemplateId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm uppercase text-slate-500 font-semibold mb-2">
                    {templates.find(t => (t._id || t.id) === previewTemplateId)?.category}
                  </div>
                  <h2 className="text-2xl font-bold">{templates.find(t => (t._id || t.id) === previewTemplateId)?.title}</h2>
                  <p className="text-slate-600 mt-2">{templates.find(t => (t._id || t.id) === previewTemplateId)?.description}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplateId(null)}
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
                  {templates.find(t => (t._id || t.id) === previewTemplateId)?.fields?.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-indigo-600">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-700 font-medium">{field.label || field}</p>
                        <p className="text-xs text-slate-500">{field.type || 'Field'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 bg-slate-50 p-6 flex gap-3">
                <button
                  onClick={() => setPreviewTemplateId(null)}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}