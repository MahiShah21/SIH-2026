import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IndustrySidebar from '../../components/common/IndustrySidebar';
import IndustryHeader from '../../components/common/IndustryHeader';
import { useAuth } from '../../context/AuthContext';

export default function IndustryProfile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [toastMsg, setToastMsg] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [profile, setProfile] = useState({
    companyName: currentUser?.organization || currentUser?.name || 'Industry Partner',
    industryType: 'Technology & CSR Innovation',
    location: currentUser?.location || currentUser?.district || 'Jharkhand, India',
    expertise: ['Applied R&D', 'CSR Grant Sponsorship', 'Pilot Deployment', 'Technology Transfer'],
    technologies: ['IoT Systems', 'Edge Compute', 'Clean Energy', 'Civic Telemetry'],
    availableSupport: [
      'Funding & Grants',
      'Mentorship',
      'Co-development',
      'Hardware Prototyping',
      'Field Testing',
      'Pilot Implementation'
    ],
    contactEmail: currentUser?.email || 'industry@jansetu.gov.in',
    contactPhone: currentUser?.phone || '+91 98765 00000',
    contactWebsite: 'https://jansetu.gov.in',
    repName: currentUser?.name || 'CSR Director',
    repEmail: currentUser?.email || 'industry@jansetu.gov.in',
    repPhone: currentUser?.phone || '+91 98765 00000'
  });

  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        companyName: currentUser.organization || currentUser.name || prev.companyName,
        contactEmail: currentUser.email || prev.contactEmail,
        repName: currentUser.name || prev.repName,
        repEmail: currentUser.email || prev.repEmail,
        location: currentUser.location || currentUser.district || prev.location
      }));
    }
  }, [currentUser]);

  // Edit form state
  const [formData, setFormData] = useState({ ...profile });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleOpenEdit = () => {
    setFormData({
      ...profile,
      expertiseStr: profile.expertise.join(', '),
      technologiesStr: profile.technologies.join(', '),
      supportStr: profile.availableSupport.join(', ')
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      companyName: formData.companyName || profile.companyName,
      industryType: formData.industryType || profile.industryType,
      location: formData.location || profile.location,
      contactEmail: formData.contactEmail || profile.contactEmail,
      contactPhone: formData.contactPhone || profile.contactPhone,
      contactWebsite: formData.contactWebsite || profile.contactWebsite,
      repName: formData.repName || profile.repName,
      repEmail: formData.repEmail || profile.repEmail,
      repPhone: formData.repPhone || profile.repPhone,
      expertise: formData.expertiseStr
        ? formData.expertiseStr.split(',').map((s) => s.trim()).filter(Boolean)
        : profile.expertise,
      technologies: formData.technologiesStr
        ? formData.technologiesStr.split(',').map((s) => s.trim()).filter(Boolean)
        : profile.technologies,
      availableSupport: formData.supportStr
        ? formData.supportStr.split(',').map((s) => s.trim()).filter(Boolean)
        : profile.availableSupport
    };
    setProfile(updated);
    setIsEditModalOpen(false);
    showToast('Company profile & CSR credentials updated successfully!');
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 font-sans antialiased overflow-x-hidden">
      {/* Responsive Industry Sidebar */}
      <IndustrySidebar
        activePath="/industry/profile"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <IndustryHeader
          title="Profile"
          subtitle="Company information and industry representative."
          actionText="Edit Profile"
          onActionClick={handleOpenEdit}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
            <svg className="w-5 h-5 text-emerald-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMsg}</span>
          </div>
        )}

        <main className="p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
          {/* Page Title & Subtitle + Edit Profile CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Profile</h1>
              <p className="text-xs text-slate-500 mt-1">
                Verified CSR credentials, domain capabilities, and key contact details.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Profile</span>
            </button>
          </div>

          {/* 1. COMPANY HEADER CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Company Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm ring-4 ring-slate-100 shrink-0">
                TN
              </div>
              {/* Company Overview */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {profile.companyName}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
                    Verified Industry Partner
                  </span>
                </div>
                <div className="flex flex-wrap items-center text-xs text-slate-600 gap-y-1 gap-x-4 pt-0.5 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-semibold text-slate-700">{profile.industryType}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center space-x-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold text-slate-700">{profile.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. MAIN PROFILE CONTENT (TWO-COLUMN LAYOUT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Company Details Card (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Company Details</h3>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Company Name</div>
                  <div className="text-xs font-bold text-slate-900">{profile.companyName}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Industry Type</div>
                  <div className="text-xs font-bold text-slate-900">{profile.industryType}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Location</div>
                  <div className="text-xs font-bold text-slate-900">{profile.location}</div>
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* EXPERTISE */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Expertise</div>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* TECHNOLOGIES */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Technologies</div>
                <div className="flex flex-wrap gap-2">
                  {profile.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* AVAILABLE SUPPORT */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Available Support</div>
                <div className="flex flex-wrap gap-2">
                  {profile.availableSupport.map((sup, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/80"
                    >
                      {sup}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Contact Info, Representative, & CSR Mandate Cards (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 3. CONTACT INFORMATION CARD */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Contact Information</h3>
                </div>
                <div className="space-y-3.5 text-xs">
                  {/* Email */}
                  <div className="flex items-center space-x-3 text-slate-700">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a
                      className="font-semibold text-slate-900 hover:text-emerald-700 transition"
                      href={`mailto:${profile.contactEmail}`}
                    >
                      {profile.contactEmail}
                    </a>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center space-x-3 text-slate-700">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-slate-900">{profile.contactPhone}</span>
                  </div>

                  {/* Website */}
                  <div className="flex items-center space-x-3 text-slate-700">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <a
                      className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition"
                      href={`https://${profile.contactWebsite}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {profile.contactWebsite}
                    </a>
                  </div>
                </div>
              </div>

              {/* 4. INDUSTRY REPRESENTATIVE CARD */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Industry Representative</h3>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                    RK
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 leading-tight">{profile.repName}</h4>
                    <p className="text-xs font-semibold text-emerald-700">Industry Representative & CSR Officer</p>
                  </div>
                </div>
                <div className="pt-2 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-slate-400 font-medium">Email:</span>
                    <span className="font-semibold text-slate-800">{profile.repEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-slate-400 font-medium">Phone:</span>
                    <span className="font-semibold text-slate-800">{profile.repPhone}</span>
                  </div>
                </div>
              </div>

              {/* 5. CSR BUDGET OVERVIEW CARD */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <h3 className="text-sm font-bold tracking-tight">CSR Innovation Grant Fund</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    FY 2024-25
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Total Committed Budget</span>
                  <span className="text-xl font-extrabold text-white">₹25,00,000</span>
                </div>
                <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Disbursed (3 Pilots)</span>
                    <span className="font-bold text-emerald-400">₹14,50,000</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Available Pool</span>
                    <span className="font-bold text-slate-200">₹10,50,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Company Profile</h3>
                <p className="text-xs text-slate-500">Update company details, tags, and representative contact information.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1 text-xs">
              {/* Company Basics */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Company Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Industry Type</label>
                    <input
                      type="text"
                      value={formData.industryType}
                      onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* Tag Arrays */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Capabilities & Offerings</h4>
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Expertise <span className="text-[10px] font-normal text-slate-400">(Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.expertiseStr}
                      onChange={(e) => setFormData({ ...formData, expertiseStr: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Technologies <span className="text-[10px] font-normal text-slate-400">(Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.technologiesStr}
                      onChange={(e) => setFormData({ ...formData, technologiesStr: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Available Support <span className="text-[10px] font-normal text-slate-400">(Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.supportStr}
                      onChange={(e) => setFormData({ ...formData, supportStr: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* Contact Information */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Website</label>
                    <input
                      type="text"
                      value={formData.contactWebsite}
                      onChange={(e) => setFormData({ ...formData, contactWebsite: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* Industry Representative */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Industry Representative</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Representative Name</label>
                    <input
                      type="text"
                      value={formData.repName}
                      onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Representative Email</label>
                    <input
                      type="email"
                      value={formData.repEmail}
                      onChange={(e) => setFormData({ ...formData, repEmail: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Representative Phone</label>
                    <input
                      type="text"
                      value={formData.repPhone}
                      onChange={(e) => setFormData({ ...formData, repPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
