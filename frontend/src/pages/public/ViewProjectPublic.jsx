import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Screen ID: c98c2b1986764327a9a428f756232f93
 * Title: Public Project Detailed Tracker
 * Category: Public Details
 * Persona: Public
 */
export default function ViewProjectPublic() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('public');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="w-full min-h-screen text-slate-800 antialiased font-sans overflow-x-hidden">
      {/*  BEGIN: ToastNotification  */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 hidden" id="toast-container">
        <div className="bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-gray-700 pointer-events-auto" id="toast-message">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <span id="toast-text" className="">Navigating back to Problem Overview (JH-C1049)</span>
        </div>
      </div>
      {/*  END: ToastNotification  */}

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/*  BEGIN: MainLayoutWrapper  */}
      <div className="flex-1 flex w-full">
        {/*  BEGIN: LeftSidebar  */}
        <aside
          id="sidebar"
          className={`w-64 bg-[#0d4a36] text-white flex-shrink-0 flex flex-col justify-between transition-transform duration-300 z-50 fixed inset-y-0 left-0 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
            mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div>
            <div className="p-5 border-b border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/citizen/dashboard')}>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-bold text-lg text-emerald-300">
                  झ
                </div>
                <div>
                  <h1 className="font-bold text-base tracking-tight leading-none text-white">JharInnovate</h1>
                  <p className="text-[10px] text-emerald-300/80 font-medium tracking-wide uppercase mt-1">GovTech Jharkhand</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden text-emerald-200 hover:text-white p-1 rounded transition"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
            </div>
            <nav className="p-3 space-y-1.5 text-sm font-medium">
              <Link
                to="/citizen/dashboard"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-emerald-800/50 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span>Home</span>
              </Link>
              <Link
                to="/citizen/report-problem"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-emerald-800/50 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <span>Report Problem</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500 text-emerald-950 px-1.5 py-0.5 rounded">Live</span>
              </Link>
              <Link
                to="/citizen/feedback"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-emerald-800/90 text-white font-semibold shadow-inner border-l-4 border-emerald-400"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <span>Problems</span>
                </div>
                <span className="text-xs bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-full font-mono">Track</span>
              </Link>
              <Link
                to="/citizen/profile"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-emerald-800/50 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span>My Profile</span>
              </Link>
            </nav>
          </div>
          <div className="p-3 border-t border-emerald-800/60 bg-[#0a3a2a]">
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center border border-emerald-300/30">
                  RK
                </div>
                <div className="text-xs">
                  <p className="font-medium text-white truncate max-w-[100px]">Rajesh Kumar</p>
                  <p className="text-[10px] text-emerald-300/70">Dumka, JH</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-emerald-300 hover:text-white p-1 rounded hover:bg-emerald-800/50 transition cursor-pointer"
                title="Log Out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
            </div>
          </div>
        </aside>
        {/*  END: LeftSidebar  */}

        {/*  BEGIN: MainContentArea  */}
        <div className="flex-1 flex flex-col min-w-0">
          {/*  BEGIN: TopBar  */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/*  Hamburger Menu for Mobile  */}
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(prev => !prev)}
                className="md:hidden text-gray-600 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 focus:outline-none cursor-pointer"
                aria-label="Toggle navigation drawer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
              {/*  Breadcrumbs  */}
              <div className="flex items-center text-xs sm:text-sm text-gray-500 font-medium">
                <span onClick={() => navigate('/citizen/dashboard')} className="hover:text-gray-700 cursor-pointer">Citizen Portal</span>
                <span className="mx-2 text-gray-300">/</span>
                <span className="text-gray-900 font-semibold truncate" id="breadcrumb-current">JH-C1049 • Project Details</span>
              </div>
</div>
{/*  Top Right Indicators  */}
<div className="flex items-center gap-3">
<div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span className="">Live Civic Sync</span>
</div>
{/*  Notification Bell with Red Badge  */}
<button className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
</button>
{/*  Status Simulation Toggle (Demo state switch)  */}
<button className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded border border-gray-300 font-medium transition" id="toggle-state-btn" title="Toggle between Unassigned and Assigned state">
            Simulate Assigned
          </button>
</div>
</header>
{/*  END: TopBar  */}
{/*  BEGIN: ContentWorkspace  */}
<main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto flex flex-col justify-start">
{/*  BEGIN: BackNavigation  */}
{/*  Matches "← Back to Problem" in reference image  */}
<div className="mb-5">
<a className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition group" href="#" id="back-link" >
<svg className="w-4 h-4 mr-1.5 text-gray-500 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="">Back to Problem</span>
</a>
</div>
{/*  END: BackNavigation  */}
{/*  BEGIN: CardsContainer  */}
<div className="space-y-4 w-full" id="project-status-view">
{/*  BEGIN: ProjectHeaderCard  */}
{/*  Exactly replicated from image: White card with rounded corners, subtle border, graduation cap icon, PROJECT tag, ID, title, location, progress  */}
<article className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 sm:p-6 transition-all" data-purpose="project-header-card">
{/*  Category Label with Academic Cap Icon  */}
<div className="flex items-center gap-2 mb-2 text-emerald-800">
<svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
<path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"></path>
</svg>
<span className="text-xs font-semibold uppercase tracking-wider text-emerald-900/90">PROJECT</span>
</div>
{/*  Problem Identifier Code  */}
<div className="text-xs font-mono font-medium text-gray-500 tracking-tight" id="project-code">
              JH-C1049
            </div>
{/*  Main Title & Location  */}
<div className="mt-1">
<h2 className="text-xl sm:text-[22px] font-bold text-gray-900 tracking-tight" id="project-title">
                Project not yet assigned
              </h2>
<div className="flex items-center gap-1 text-sm text-gray-500 mt-1.5 font-normal">
{/*  Location Pin Icon  */}
<svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
<path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span id="project-location" className="">Dumka, Jharkhand</span>
</div>
</div>
{/*  Overall Progress Bar Section  */}
<div className="mt-7 pt-1">
<div className="flex items-center justify-between text-xs font-bold mb-2">
<span className="text-gray-500 uppercase tracking-wider text-[11px]">OVERALL PROGRESS</span>
<span className="text-emerald-900 font-semibold text-sm" id="progress-percent-label">5%</span>
</div>
{/*  Track & Indicator  */}
<div className="w-full bg-[#cbdad2] rounded-full h-2.5 overflow-hidden flex" data-purpose="progress-bar-track">
<div className="bg-[#0f4f3a] h-2.5 rounded-full transition-all duration-500 ease-out" id="progress-bar-fill" style={{"width":"5%"}}></div>
</div>
</div>
</article>
{/*  END: ProjectHeaderCard  */}
{/*  BEGIN: PublicMilestonesCard  */}
{/*  Matches second card in reference screenshot: White card, title, helper copy, and locked private notice box  */}
<article className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 sm:p-6 transition-all" data-purpose="public-milestones-card">
<h3 className="text-base sm:text-lg font-bold text-gray-900">
              Public Milestones
            </h3>
{/*  Notice / Status text  */}
<p className="text-sm text-gray-600 mt-2 font-normal leading-relaxed" id="milestones-description">
              Milestones will appear once a university project is assigned to this problem.
            </p>
{/*  Dynamic Milestones List Container (Visible when assigned state is toggled)  */}
<div className="hidden mt-4 space-y-3 pt-2 border-t border-gray-100" id="active-milestones-list">
<div className="flex items-start gap-3">
<div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">✓</div>
<div>
<p className="text-sm font-semibold text-gray-800">Problem Validation &amp; Field Assessment</p>
<p className="text-xs text-gray-500">Completed by Birsa Agricultural University Team • 14 Aug 2026</p>
</div>
</div>
<div className="flex items-start gap-3">
<div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold mt-0.5">●</div>
<div>
<p className="text-sm font-semibold text-gray-800">Prototype Low-Cost Water Filtration Setup</p>
<p className="text-xs text-gray-500">In Progress • Expected completion: 30 Sep 2026</p>
</div>
</div>
</div>
{/*  Private details notice box  */}
<div className="mt-5 bg-[#fbfbfa] rounded-xl border border-gray-100 p-3.5 flex items-center gap-2.5 text-gray-500 text-xs sm:text-sm">
{/*  Lock Icon  */}
<svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="">Private team &amp; industry details are hidden.</span>
</div>
</article>
{/*  END: PublicMilestonesCard  */}
{/*  BEGIN: NotificationActionArea  */}
{/*  Matches bottom outlined notification pill button  */}
<div className="pt-2">
<button className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-200 group" id="notify-btn">
{/*  Bell Icon  */}
<svg className="w-4 h-4 text-gray-700 group-hover:scale-105 transition-transform" fill="none" id="notify-icon-bell" stroke="currentColor" viewBox="0 0 24 24">
<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
{/*  Check Icon (Hidden by default)  */}
<svg className="w-4 h-4 text-emerald-600 hidden" fill="none" id="notify-icon-check" stroke="currentColor" viewBox="0 0 24 24">
<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span id="notify-label" className="">Notify me on updates</span>
</button>
</div>
{/*  END: NotificationActionArea  */}
</div>
{/*  END: CardsContainer  */}
<div id="problem-details-view" className="hidden space-y-6"><div className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3 mb-4"><div className="flex items-center gap-2"><span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">JH-C1049</span><span className="text-xs font-semibold uppercase tracking-wider text-gray-500">WATER SANITATION</span></div><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">Under Review</span></div><h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Heavy Metal Contamination in Community Tube Wells</h2><p className="text-sm text-gray-600 mb-4 leading-relaxed">Groundwater samples from over 14 villages in Dumka block exhibit iron and fluoride concentrations above permissible drinking standards, causing severe gastrointestinal ailments among residents.</p><div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100"><div className="flex items-center gap-1.5"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">Dumka District, Jharkhand</span></div><div className="flex items-center gap-1.5"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">Reported on 12 Jul 2026</span></div><div className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2m-7 0H4a2 2 0 00-2 2v7a2 2 0 002 2h3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="font-medium text-emerald-700">142 Citizens Supported</span></div></div></div><div className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 sm:p-6"><div className="flex items-center gap-2 mb-3"><span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">AI GovTech Analysis</span></div><h3 className="text-base font-bold text-gray-900 mb-2">Automated Feasibility &amp; Urgency Summary</h3><p className="text-sm text-gray-600 leading-relaxed mb-4">High-priority civic grievance cluster detected across 4 contiguous panchayats. Recommended automated pathway: deploy decentralized low-cost electrocoagulation filter plants with technical support from regional engineering institutes.</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><div className="p-3 rounded-xl bg-gray-50 border border-gray-100"><p className="text-xs text-gray-500 font-medium">Priority Index</p><p className="text-base font-bold text-red-600 mt-0.5">Critical (89/100)</p></div><div className="p-3 rounded-xl bg-gray-50 border border-gray-100"><p className="text-xs text-gray-500 font-medium">Estimated Affected</p><p className="text-base font-bold text-gray-900 mt-0.5">~18,500 Citizens</p></div><div className="p-3 rounded-xl bg-gray-50 border border-gray-100"><p className="text-xs text-gray-500 font-medium">Domain Synergy</p><p className="text-base font-bold text-emerald-700 mt-0.5">BAU + Jal Jeevan</p></div></div></div><div className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div className="space-y-1"><div className="flex items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Assigned Solution</span><span className="w-2 h-2 rounded-full bg-emerald-500"></span></div><h4 className="text-base font-bold text-gray-900">BAU Smart Groundwater Purification &amp; Irrigation Project</h4><p className="text-xs text-gray-500">Birsa Agricultural University • Water Resource Engineering Department</p></div><button id="view-project-btn" className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">View Project Status</span></button></div><div className="flex flex-wrap items-center gap-3 pt-2"><button className="flex-1 min-w-[160px] py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm flex items-center justify-center gap-2 transition"><svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2m-7 0H4a2 2 0 00-2 2v7a2 2 0 002 2h3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">Support Problem (142)</span></button><button className="flex-1 min-w-[160px] py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm flex items-center justify-center gap-2 transition"><svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">Give Feedback</span></button></div></div></main>
{/*  END: ContentWorkspace  */}
{/*  BEGIN: PortalFooter  */}
<footer className="mt-auto border-t border-gray-200 bg-white py-4 px-6 text-xs text-gray-500">
<div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
<div className="">
<span className="font-medium text-gray-700">Jharkhand State Data &amp; Innovation Framework</span> • Dept. of Information Technology &amp; e-Governance
          </div>
<div className="flex items-center gap-4 text-gray-400">
<a className="hover:text-gray-600 transition" href="#">Privacy Policy</a>
<span className="">•</span>
<a className="hover:text-gray-600 transition" href="#">Helpline: 1800 - 345 - 6789</a>
</div>
</div>
</footer>
{/*  END: PortalFooter  */}
</div>
{/*  END: MainContentArea  */}
</div>
{/*  END: MainLayoutWrapper  */}
{/*  BEGIN: ClientScripting  */}

{/*  END: ClientScripting  */}
    </div>
  );
}
