import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Screen: JharInnovate — Report a Problem (Page 2)
 * Faithfully constructed from uploaded screen: screens_raw/28_c995bf10b7694407b59cc382c8bb9b52_...
 */
export default function ReportProblemStep2() {
  const navigate = useNavigate();

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Wizard state (1: Describe, 2: Evidence, 3: Location, 'success': Step 4)
  const [currentStep, setCurrentStep] = useState(2);

  // Form states
  const [title, setTitle] = useState('Irrigation shortage affecting village farms in Dumri');
  const [description, setDescription] = useState(
    'The main branch canal water flow has dropped by 80% since last week, endangering standing Kharif paddy crops across Majhgaon and neighboring tolas. Need immediate lift-irrigation pump repair or reservoir sluice gate opening.'
  );
  const [category, setCategory] = useState('Agriculture & Irrigation');
  const [isUrgent, setIsUrgent] = useState(true);

  // Location fields
  const [district, setDistrict] = useState('Gumla');
  const [block, setBlock] = useState('Dumri Block');
  const [village, setVillage] = useState('Majhgaon Tola');
  const [lat, setLat] = useState('23.0428° N');
  const [long, setLong] = useState('84.5421° E');
  const [isGpsLocked, setIsGpsLocked] = useState(true);

  // Evidence state
  const [evidenceList, setEvidenceList] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const addMockEvidence = (type) => {
    let badgeLabel = 'Document';
    let iconColor = 'bg-blue-100 text-blue-700';
    let fileName = 'site_measurement.pdf';
    let detail = '1.1 MB • Validated';

    if (type === 'photo') {
      badgeLabel = 'Photo';
      iconColor = 'bg-emerald-100 text-emerald-700';
      fileName = 'site_photo_' + Math.floor(Math.random() * 900 + 100) + '.jpg';
      detail = '3.1 MB • Geo-tagged';
    } else if (type === 'video') {
      badgeLabel = 'Video';
      iconColor = 'bg-purple-100 text-purple-700';
      fileName = 'site_inspection_footage.mp4';
      detail = '14.2 MB • 720p HD';
    } else if (type === 'voice') {
      badgeLabel = 'Voice Memo';
      iconColor = 'bg-teal-100 text-teal-700';
      fileName = 'ward_member_audio.wav';
      detail = '1:15 duration • Clear';
    }

    const newItem = {
      id: 'evidenceItem_' + Date.now(),
      name: fileName,
      type,
      badge: badgeLabel,
      detail,
      iconColor
    };

    setEvidenceList((prev) => [...prev, newItem]);
  };

  const removeEvidenceItem = (id) => {
    setEvidenceList((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllEvidence = () => {
    setEvidenceList([]);
  };

  const autoDetectLocation = () => {
    setDistrict('Gumla');
    setBlock('Dumri Block');
    setVillage('Majhgaon Tola (Auto-detected)');
    setLat('23.0428° N');
    setLong('84.5421° E');
    setIsGpsLocked(true);
  };

  const submitFinalReport = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep('success');
    }, 1000);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-row font-sans text-slate-800 antialiased bg-slate-50">
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      {/* LeftSidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-40 bg-[#063f2e] text-white shrink-0 flex flex-col shadow-xl border-r border-[#084835] transition-all duration-300 select-none ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        id="mainSidebar"
      >
          {/* Sidebar Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#084835]/80">
            <div
              className="flex items-center space-x-3 overflow-hidden cursor-pointer"
              onClick={() => navigate('/citizen/dashboard')}
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              {!isSidebarCollapsed && (
                <div className="sidebar-text leading-tight whitespace-nowrap">
                  <h1 className="font-bold tracking-tight text-white text-base">JharInnovate</h1>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300">
                    Govt. of Jharkhand
                  </span>
                </div>
              )}
            </div>
            <button
              className="hidden md:flex p-1.5 rounded-md hover:bg-[#084835] text-slate-300 hover:text-white transition cursor-pointer"
              id="sidebarCollapseBtn"
              onClick={toggleSidebar}
              title="Toggle Sidebar"
              type="button"
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
            <a
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-[#084835] hover:text-white transition group cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                navigate('/citizen/dashboard');
              }}
            >
              <svg className="w-5 h-5 text-slate-300 group-hover:text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {!isSidebarCollapsed && <span className="sidebar-text text-sm font-medium">Home</span>}
            </a>

            <a
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-emerald-600 text-white shadow-sm font-medium transition group cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                navigate('/citizen/report-problem');
              }}
            >
              <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {!isSidebarCollapsed && (
                <>
                  <span className="sidebar-text text-sm font-semibold">Report</span>
                  <span className="sidebar-text ml-auto bg-emerald-800 text-[10px] px-1.5 py-0.5 rounded text-emerald-100 uppercase tracking-wide">
                    Live
                  </span>
                </>
              )}
            </a>

            <a
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-[#084835] hover:text-white transition group cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                navigate('/citizen/feedback');
              }}
            >
              <svg className="w-5 h-5 text-slate-300 group-hover:text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {!isSidebarCollapsed && <span className="sidebar-text text-sm font-medium">Problems</span>}
            </a>
          </nav>

          {/* Sidebar Footer / Logout */}
          <div className="p-3 border-t border-[#084835]/80">
            <a
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#084835] hover:text-white transition cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {!isSidebarCollapsed && <span className="sidebar-text text-sm">Log Out</span>}
            </a>
          </div>
        </aside>

        {/* Content Container */}
        <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0 bg-slate-50 custom-scrollbar">
          {/* TopBar */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            <div className="flex items-center space-x-3">
              <button
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
                id="mobileMenuBtn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                  <span className="cursor-pointer hover:text-emerald-700" onClick={() => navigate('/citizen/dashboard')}>
                    Citizen Portal
                  </span>
                  <span>/</span>
                  <span className="text-emerald-800 font-bold">Submit Grievance</span>
                </div>
                <h2 className="text-sm md:text-base font-bold text-slate-800">
                  JHARKHAND Civic Problem Resolution
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Live Civic Sync (08 Sep 2026)</span>
              </div>
              <button
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
                onClick={() => navigate('/citizen/dashboard')}
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
              <div
                className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 cursor-pointer"
                onClick={() => navigate('/citizen/profile')}
              >
                <div className="w-8 h-8 rounded-full bg-[#063f2e] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  RK
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">Rajesh Kumar</p>
                  <p className="text-[11px] text-slate-500">Gumla Citizen</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-5xl mx-auto w-full">
            <section className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                    AI-Assisted Filing
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Portal v3.2</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Report a Problem
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Provide civic problem details for AI analysis and rapid departmental assignment.
                </p>
              </div>

              {/* Wizard Step Navigation */}
              <div className="bg-white border border-slate-200 px-4 py-2 rounded-full shadow-xs flex items-center space-x-3 text-xs md:text-sm font-medium self-start md:self-auto">
                <button
                  className={`flex items-center space-x-1.5 font-semibold focus:outline-none cursor-pointer ${
                    currentStep === 1
                      ? 'text-[#063f2e] font-bold'
                      : currentStep > 1
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                  onClick={() => setCurrentStep(1)}
                  type="button"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      currentStep === 1
                        ? 'bg-[#063f2e] text-white'
                        : currentStep > 1
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {currentStep > 1 ? '✓' : '1'}
                  </span>
                  <span>Describe</span>
                </button>
                <span className="w-4 h-px bg-slate-300"></span>

                <button
                  className={`flex items-center space-x-1.5 font-semibold focus:outline-none cursor-pointer ${
                    currentStep === 2
                      ? 'text-[#063f2e] font-bold'
                      : currentStep > 2
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                  onClick={() => setCurrentStep(2)}
                  type="button"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      currentStep === 2
                        ? 'bg-[#063f2e] text-white'
                        : currentStep > 2
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {currentStep > 2 ? '✓' : '2'}
                  </span>
                  <span>Evidence</span>
                </button>
                <span className="w-4 h-px bg-slate-300"></span>

                <button
                  className={`flex items-center space-x-1.5 font-semibold focus:outline-none cursor-pointer ${
                    currentStep === 3
                      ? 'text-[#063f2e] font-bold'
                      : currentStep === 'success'
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                  onClick={() => setCurrentStep(3)}
                  type="button"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      currentStep === 3
                        ? 'bg-[#063f2e] text-white'
                        : currentStep === 'success'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {currentStep === 'success' ? '✓' : '3'}
                  </span>
                  <span>Location</span>
                </button>
              </div>
            </section>

            {/* Step 2 Section */}
            {currentStep === 2 && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 mb-6 gap-3">
                  <div className="flex items-center space-x-3.5">
                    <span className="w-8 h-8 rounded-full bg-[#063f2e] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                      2
                    </span>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Add Evidence</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Attach photos, videos, technical documents, or audio testimonies to speed up verification.
                      </p>
                    </div>
                  </div>
                  <div className="self-start sm:self-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-xs">
                      Recommended for High Priority
                    </span>
                  </div>
                </div>

                {/* 4 Upload Category Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => addMockEvidence('photo')}
                    className="group flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-white hover:bg-emerald-50/30 hover:border-emerald-400 transition cursor-pointer text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-900 leading-snug">Photo</span>
                    <span className="text-xs text-slate-400 mt-0.5">Upload &amp; Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addMockEvidence('video')}
                    className="group flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-white hover:bg-emerald-50/30 hover:border-emerald-400 transition cursor-pointer text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-900 leading-snug">Video</span>
                    <span className="text-xs text-slate-400 mt-0.5">Upload &amp; Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addMockEvidence('document')}
                    className="group flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-white hover:bg-emerald-50/30 hover:border-emerald-400 transition cursor-pointer text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-900 leading-snug">Document</span>
                    <span className="text-xs text-slate-400 mt-0.5">PDF or Doc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addMockEvidence('voice')}
                    className="group flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-white hover:bg-emerald-50/30 hover:border-emerald-400 transition cursor-pointer text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-900 leading-snug">Voice Evidence</span>
                    <span className="text-xs text-slate-400 mt-0.5">Record Audio</span>
                  </button>
                </div>

                {/* Attached Evidence Section */}
                <div className="border border-slate-200 rounded-xl p-5 md:p-6 bg-white shadow-xs mb-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                      <svg className="w-4 h-4 text-slate-400 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                      </svg>
                      <span>ATTACHED EVIDENCE ( {evidenceList.length} ITEMS )</span>
                    </div>
                    {evidenceList.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllEvidence}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {evidenceList.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No evidence attached yet. Use the buttons above to add documents, audio, or images.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {evidenceList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition shadow-xs"
                        >
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconColor}`}>
                              {item.type === 'photo' ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                              ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-slate-800 truncate">{item.name}</span>
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md flex-shrink-0">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{item.detail}</p>
                              {item.type === 'voice' ? (
                                <button
                                  type="button"
                                  onClick={(e) => e.currentTarget.classList.toggle('text-emerald-950')}
                                  className="mt-1 text-xs text-emerald-800 font-bold hover:text-emerald-900 inline-flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>▶</span>
                                  <span>Play Audio</span>
                                </button>
                              ) : (
                                <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
                                  <span>✓</span>
                                  <span>Ready</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEvidenceItem(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-2 flex-shrink-0 cursor-pointer"
                            title="Delete evidence"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2 Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    <span>Back to Step 1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#063f2e] hover:bg-[#022c22] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition cursor-pointer"
                  >
                    <span>Next: Location Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </button>
                </div>
              </section>
            )}

            {/* Step 3 Section */}
            {currentStep === 3 && (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:p-7 transition-all">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-md bg-[#063f2e] text-white flex items-center justify-center font-bold text-sm">
                      3
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Location Details</h2>
                      <p className="text-xs text-slate-500">
                        Provide accurate jurisdiction data so departmental engineers can resolve the issue.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>GPS Ready</span>
                  </span>
                </div>

                {/* Auto Location Banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#063f2e] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Automatic Location Detection</p>
                      <p className="text-[11px] text-slate-600">Fetch accurate latitude, longitude, panchayat block, and district instantly.</p>
                    </div>
                  </div>
                  <button
                    className={`inline-flex items-center justify-center space-x-2 px-4 py-2 ${
                      isGpsLocked ? 'bg-emerald-700' : 'bg-[#063f2e] hover:bg-[#022c22]'
                    } text-white rounded-lg text-xs font-bold transition shadow-xs flex-shrink-0 cursor-pointer`}
                    id="geoLocateBtn"
                    onClick={autoDetectLocation}
                    type="button"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span>{isGpsLocked ? 'Location Locked ✓' : 'Use My Current Location'}</span>
                  </button>
                </div>

                {/* Location Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">State</label>
                    <input className="w-full bg-slate-100 border-slate-300 text-slate-600 rounded-lg text-sm cursor-not-allowed font-medium" disabled type="text" value="Jharkhand" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="districtSelect">
                      District <span className="text-rose-600">*</span>
                    </label>
                    <select
                      className="w-full rounded-lg border-slate-300 text-sm focus:border-emerald-700 focus:ring-emerald-700 font-medium bg-white"
                      id="districtSelect"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      <option value="Gumla">Gumla</option>
                      <option value="Ranchi">Ranchi</option>
                      <option value="Latehar">Latehar</option>
                      <option value="Simdega">Simdega</option>
                      <option value="Khunti">Khunti</option>
                      <option value="Hazaribagh">Hazaribagh</option>
                      <option value="Palamu">Palamu</option>
                      <option value="East Singhbhum">East Singhbhum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="blockInput">
                      Block <span className="text-rose-600">*</span>
                    </label>
                    <input
                      className="w-full rounded-lg border-slate-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                      id="blockInput"
                      type="text"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="villageInput">
                      Village / Area
                    </label>
                    <input
                      className="w-full rounded-lg border-slate-300 text-sm focus:border-emerald-700 focus:ring-emerald-700"
                      id="villageInput"
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="latInput">
                      Latitude
                    </label>
                    <input
                      className="w-full rounded-lg border-slate-300 text-sm bg-slate-50 focus:border-emerald-700 focus:ring-emerald-700 font-mono text-xs"
                      id="latInput"
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="longInput">
                      Longitude
                    </label>
                    <input
                      className="w-full rounded-lg border-slate-300 text-sm bg-slate-50 focus:border-emerald-700 focus:ring-emerald-700 font-mono text-xs"
                      id="longInput"
                      type="text"
                      value={long}
                      onChange={(e) => setLong(e.target.value)}
                    />
                  </div>
                </div>

                {/* Stylized Mini Interactive Map Card */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 bg-slate-50">
                  <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>Coordinates on Native Gumla Topo-topography Map centering resolution ward (Majhgaon Sector)</span>
                    </span>
                    <button className="text-[#063f2e] hover:underline font-semibold" type="button">
                      Select via Manual Input
                    </button>
                  </div>
                  <div className="relative h-44 bg-emerald-950/5 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(#064e3b 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                    <svg className="absolute inset-0 w-full h-full text-emerald-600/10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 150">
                      <path d="M0,80 Q100,20 200,80 T400,60 L400,150 L0,150 Z" fill="currentColor"></path>
                      <path d="M0,110 Q150,50 300,100 T400,90 L400,150 L0,150 Z" fill="rgba(4, 120, 87, 0.1)"></path>
                    </svg>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono shadow-md mb-1 border border-slate-700">
                        {block}: {lat}, {long}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg ring-4 ring-white animate-bounce">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path>
                        </svg>
                      </div>
                      <span className="w-3 h-1 bg-black/30 rounded-full blur-[1px]"></span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] text-slate-600 font-semibold border border-slate-200">
                      {district} Admin Boundary • Precision: ±4m
                    </div>
                  </div>
                </div>

                {/* Step 3 Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    className="inline-flex items-center space-x-1 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => setCurrentStep(2)}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span>Back to Evidence</span>
                  </button>
                  <button
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#063f2e] hover:bg-[#022c22] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-md transition cursor-pointer"
                    id="finalSubmitBtn"
                    onClick={submitFinalReport}
                    disabled={isSubmitting}
                    type="button"
                  >
                    <span>{isSubmitting ? 'Analyzing with AI...' : 'Submit for AI Analysis'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </button>
                </div>
              </section>
            )}

            {/* Step 4: Success Screen */}
            {currentStep === 'success' && (
              <section className="bg-white rounded-xl border border-emerald-200 shadow-lg p-6 md:p-10 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
                  <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                  </svg>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                  Civic Ticket Registered
                </span>
                <h2 className="text-2xl font-black text-slate-900 mb-1">
                  Civic Problem Submitted Successfully!
                </h2>
                <p className="text-xs md:text-sm text-slate-600 mb-6 max-w-md mx-auto">
                  Your complaint has been synchronized with the Government of Jharkhand Unified Grievance Engine.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                    <span className="text-slate-500 font-medium">Reference Tracking ID:</span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">#JH-C1099</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Problem Title</span>
                      <span className="font-medium text-slate-800">{title}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                      <span className="font-medium text-slate-800">{category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Jurisdiction</span>
                      <span className="font-medium text-slate-800">{district} / {block}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">AI Workflow Status</span>
                      <span className="inline-flex items-center text-emerald-700 font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                        Queued for Department Routing
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => setCurrentStep(1)}
                    type="button"
                  >
                    Submit Another Report
                  </button>
                  <a
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#063f2e] hover:bg-[#022c22] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition cursor-pointer"
                    onClick={() => navigate('/citizen/feedback')}
                  >
                    View Problem in Directory
                  </a>
                </div>
              </section>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-3 px-4 md:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Jharkhand State Data &amp; Innovation Framework • Dept. of Information Technology &amp; e-Governance</span>
            </div>
            <div className="flex items-center space-x-4">
              <a className="hover:text-emerald-800 transition" href="#privacy">Privacy Policy</a>
              <a className="hover:text-emerald-800 transition" href="#guidelines">Portal Guidelines</a>
              <span>Helpline: 1800 - 345 - 6789</span>
            </div>
          </footer>
        </div>
      </div>
  );
}
