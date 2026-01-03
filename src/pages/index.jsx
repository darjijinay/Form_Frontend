import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import logo from '../assets/logo.png';
import bg from '../assets/bg.jpeg';
import { TEMPLATE_LIBRARY } from '../data/templates';
import { formApi } from '../api/formApi';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);

  const handleUseTemplate = async (tpl) => {
    if (!tpl) return;
    if (!user) {
      router.push(`/auth/register?template=${tpl._id || ''}`);
      return;
    }

    try {
      setCreatingFromTemplate(true);
      const normalizedFields = (tpl.fields || []).map((field, idx) => ({
        ...field,
        _id: field._id || `field_${idx}_${Math.random().toString(36).slice(2, 8)}`,
        order: field.order ?? idx,
        width: field.width || 'full',
        validation: field.validation || { required: !!field.required },
      }));

      const payload = {
        title: tpl.title,
        description: tpl.description,
        fields: normalizedFields,
        settings: { isPublic: true },
      };

      const { data } = await formApi.createForm(payload);
      if (data?._id) {
        router.push(`/app/forms/builder/${data._id}`);
      } else {
        router.push('/app/forms');
      }
    } catch (err) {
      console.error('Error creating form from landing template:', err);
      router.push('/app/forms/builder/new');
    } finally {
      setCreatingFromTemplate(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 text-[var(--text)]">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center ">
              <div className="flex items-center justify-center">
                <Image src={logo} alt="FormCraft Logo" width={48} height={48} className="drop-shadow-sm" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">FormCraft</span>
            </div>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-[15px] font-medium text-slate-700 hover:text-indigo-600 transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#templates" className="text-[15px] font-medium text-slate-700 hover:text-indigo-600 transition-colors relative group">
                Templates
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#pricing" className="text-[15px] font-medium text-slate-700 hover:text-indigo-600 transition-colors relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="px-5 py-2.5 text-[15px] font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-6 py-3 text-[15px] font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all transform hover:scale-105">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-100 pointer-events-none">
          <Image 
            src={bg} 
            alt="Background illustration" 
            fill 
            className="object-cover object-center"
            priority
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-40 sm:pb-56">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Build Powerful Forms
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                Without Code
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
              Build, customize, and share dynamic forms with our intuitive drag-and-drop builder. 
              Collect responses, analyze data, and streamline your workflow.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/register" className="px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all">
                Start Building Free
              </Link>
              <a href="#features" className="px-8 py-4 text-lg font-medium rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Build Forms</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Powerful features to create, share, and manage your forms efficiently</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 hover:border-indigo-200 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Drag & Drop Builder</h3>
              <p className="text-slate-600">Intuitive interface to create forms without any coding knowledge. Simply drag fields and customize.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 hover:border-emerald-200 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Custom Themes</h3>
              <p className="text-slate-600">Personalize your forms with custom colors, fonts, and styling to match your brand perfectly.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 hover:border-sky-200 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-6 group-hover:bg-sky-500/20 transition-colors">
                <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Response Analytics</h3>
              <p className="text-slate-600">Track submissions, analyze responses, and export data to CSV for deeper insights.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 hover:border-purple-200 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
              <p className="text-slate-600">Your data is encrypted and secure. Control who can access your forms and responses.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 hover:border-pink-200 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition-colors">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Sharing</h3>
              <p className="text-slate-600">Share forms via link, embed on websites, or send directly to respondents with one click.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 hover:border-orange-200 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">10+ Field Types</h3>
              <p className="text-slate-600">Text, email, number, date, dropdown, radio, checkbox, file upload, rating, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-16 md:py-24 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">Start with Ready-Made Templates</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Choose from our collection of professionally designed templates and customize them to match your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {TEMPLATE_LIBRARY.slice(0, 6).map((t) => {
              const category = (t.category || 'General').toLowerCase();
              const colorMap = {
                events: 'bg-rose-400',
                hr: 'bg-emerald-400',
                feedback: 'bg-violet-400',
                education: 'bg-orange-400',
                general: 'bg-sky-400',
                survey: 'bg-purple-400',
                product: 'bg-blue-400',
                travel: 'bg-cyan-400',
                appointment: 'bg-pink-400',
              };
              const stripeClass = colorMap[category] || 'bg-sky-400';

              return (
                <div
                  key={t._id}
                  className="relative rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white h-full flex flex-col"
                >
                  <div className={`${stripeClass} h-2 w-full`} />
                  
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs uppercase text-slate-500 font-semibold tracking-wider bg-slate-50 px-3 py-1 rounded-full w-fit mb-4">{t.category}</span>
                    <h4 className="font-bold text-base text-slate-900 mb-3">{t.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">{t.description}</p>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/30 to-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-md rounded-2xl">
                    <div className="flex gap-3 flex-wrap justify-center px-4">
                      <button
                        onClick={() => setSelectedTemplate(t)}
                        className="bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUseTemplate(t); }}
                        disabled={creatingFromTemplate}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Use This Template
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12 md:mt-16">
            <Link href="/templates" className="inline-flex items-center gap-2 px-6 py-3 text-indigo-600 hover:text-indigo-700 font-semibold group transition-colors">
              Browse All Templates
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
            <p className="text-sm font-medium text-purple-100 mb-3">Join thousands of users creating forms with FormCraft</p>
            <h2 className="text-4xl font-bold mb-8">Ready to Build Your First Form?</h2>
            <p className="text-lg text-purple-100 mb-10 leading-relaxed">
              Join thousands of users creating beautiful forms. Start with FormCraft today.
            </p>
            <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
              <Link href="/auth/register" className="px-8 py-3 text-lg font-medium rounded-lg bg-white text-purple-600 hover:bg-gray-100 transition-all">
                Get Started for Free
              </Link>
              <button className="px-8 py-3 text-lg font-medium rounded-lg border-2 border-white/50 text-white hover:border-white transition-all">
                Contact Sales
              </button>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-purple-100 flex-wrap">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                14-day free trial
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div>
              <div className="flex items-center mb-4">
                <Image src={logo} alt="FormCraft Logo" width={36} height={36} className="drop-shadow-sm" />
                <span className="text-lg font-bold">FormCraft</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Building the future of data collection, one form at a time.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a></li>
                <li><a href="#templates" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Templates</a></li>
                <li><a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200/80"></div>

          {/* Footer Bottom */}
          <div className="pt-8 text-center">
            <p className="text-sm text-slate-600">© 2025 FormCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
                    <span className="text-slate-700 font-medium">{typeof field === 'string' ? field : (field?.label || 'Field')}</span>
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
              <button
                onClick={() => handleUseTemplate(selectedTemplate)}
                disabled={creatingFromTemplate}
                className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors text-center disabled:opacity-60"
              >
                {creatingFromTemplate ? 'Working…' : 'Use This Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}