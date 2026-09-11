import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CitizenProfile() {
  const navigate = useNavigate();

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // User Profile State
  const [profile, setProfile] = useState({
    name: 'Rajesh Kumar',
    phone: '9835124670',
    district: 'Gumla',
    panchayat: 'Sisai Block, Ward 4',
    language: 'हिन्दी (Hindi)',
    accountStatus: 'Aadhaar Verified Citizen',
    points: 1450
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [notificationMsg, setNotificationMsg] = useState(null);

  const initial = (profile.name || 'R').charAt(0).toUpperCase();

  const handleOpenEditModal = () => {
    setEditForm({ ...profile });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.phone.trim()) return;
    setProfile({
      ...profile,
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      district: editForm.district,
      language: editForm.language
    });
    setIsEditModalOpen(false);
    showToast('Citizen profile details updated successfully!');
  };

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Submitted problems data for the profile
  const submittedProblems = [
    {
      id: 'JH-C1042',
      title: 'Irrigation shortage & check dam feeder channel automation',
      location: 'Gumla · Sisai Block',
      status: 'Field Pilot Active (65%)',
      statusBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      progress: 65,
      dept: 'Water Resources Dept & IIT (ISM) Dhanbad',
      date: '02 Sep 2026'
    },
    {
      id: 'JH-C1048',
      title: 'Solar micro-grid inverter synchronization & voltage trip',
      location: 'Simdega · Kolebira Block',
      status: 'Pilot Testing (80%)',
      statusBadge: 'bg-teal-50 text-teal-700 border-teal-200',
      progress: 80,
      dept: 'Energy Dept (JREDA) & NIELIT Ranchi',
      date: '28 Aug 2026'
    },
    {
      id: 'JH-C1049',
      title: 'Heavy fluoride & iron contamination in 4 community tube wells',
      location: 'Dumka · Jama Block',
      status: 'University R&D (35%)',
      statusBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      progress: 35,
      dept: 'Drinking Water Dept & BIT Mesra R&D',
      date: '06 Sep 2026'
    },
    {
      id: 'JH-C1035',
      title: 'Primary Health Center cold-chain vaccine refrigerator outage',
      location: 'Ranchi · Kanke Block',
      status: 'Resolved & Verified (100%)',
      statusBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      progress: 100,
      dept: 'Health & Family Welfare Dept',
      date: '15 Aug 2026'
    }
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-row bg-[#f8faf9] text-slate-800 antialiased selection:bg-emerald-200 font-sans">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= FIXED SIDEBAR ================= */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 bg-[#074735] text-white flex flex-col justify-between shrink-0 transition-all duration-300 shadow-2xl lg:shadow-none select-none ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-900/60 bg-[#053527]">
            <div
              className="flex items-center space-x-3 overflow-hidden cursor-pointer"
              onClick={() => navigate('/citizen/dashboard')}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-bold text-base text-emerald-300 shadow-inner flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"></path>
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <h1 className="font-bold tracking-tight text-base leading-tight">JharInnovate</h1>
                  <p className="text-[10px] tracking-widest text-emerald-300/80 font-semibold uppercase">GOVT. OF JHARKHAND</p>
                </div>
              )}
            </div>
            <button
              aria-label="Toggle navigation menu"
              className="text-emerald-200/80 hover:text-white p-1 rounded-md transition-colors"
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
          </div>

          {/* Navigation Menu Items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {/* Home */}
            <button
              onClick={() => {
                navigate('/citizen/dashboard');
                setMobileSidebarOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-emerald-100 hover:bg-[#0c5942] transition-colors text-sm font-medium text-left cursor-pointer"
            >
              <svg className="w-4 h-4 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {!sidebarCollapsed && <span>Home</span>}
            </button>

            {/* Report */}
            <button
              onClick={() => {
                navigate('/citizen/report-problem');
                setMobileSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-emerald-100 hover:bg-[#0c5942] transition-colors text-sm font-medium text-left cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                {!sidebarCollapsed && <span>Report</span>}
              </div>
              {!sidebarCollapsed && (
                <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase border border-emerald-400/20">AI FAST</span>
              )}
            </button>

            {/* Problems & Track Record */}
            <button
              onClick={() => {
                navigate('/citizen/feedback');
                setMobileSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-emerald-100 hover:bg-[#0c5942] transition-colors text-sm font-medium text-left cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                {!sidebarCollapsed && <span>Problems &amp; Track Record</span>}
              </div>
              {!sidebarCollapsed && (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded">4 Track</span>
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="p-3 border-t border-emerald-900/50 bg-[#053527]">
          <button
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg text-emerald-200 hover:bg-[#0c5942] hover:text-white transition-colors text-sm font-medium cursor-pointer"
            onClick={() => {
              if (window.confirm('Do you want to log out of the citizen portal?')) {
                navigate('/login');
              }
            }}
            type="button"
          >
            <svg className="w-4 h-4 transform rotate-180 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ================= MAIN SCROLLABLE CONTENT ================= */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0 custom-scrollbar">
        {/* TopBar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3 text-xs md:text-sm">
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center text-slate-500 space-x-1.5">
              <span
                className="hover:text-slate-700 cursor-pointer"
                onClick={() => navigate('/citizen/dashboard')}
              >
                Citizen Portal
              </span>
              <span className="text-slate-400">/</span>
              <span className="font-bold text-slate-800">Profile &amp; Submissions</span>
            </div>
          </div>

          {/* Right Status */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Civic Sync (08 Sep 2026)</span>
            </div>

            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0a4835] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {initial}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">{profile.name}</div>
                <div className="text-[11px] text-slate-500 leading-none">{profile.district} Citizen</div>
              </div>
            </div>
          </div>
        </header>

        {/* Notification Toast */}
        {notificationMsg && (
          <div className="fixed top-20 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl z-50 text-xs font-medium border border-slate-700 flex items-center space-x-2 animate-in fade-in">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* User Profile Card */}
          <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#094835] to-emerald-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                  {initial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{profile.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      1,450 Karma Points
                    </span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span>+91 {profile.phone}</span>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="flex items-center space-x-2.5">
                <button
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  onClick={handleOpenEditModal}
                  type="button"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <span>Edit Details</span>
                </button>
              </div>
            </div>

            {/* Meta Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">District / Block</div>
                <p className="mt-1 text-sm font-semibold text-slate-900">{profile.district} · {profile.panchayat}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preferred Language</div>
                <p className="mt-1 text-sm font-semibold text-slate-900">{profile.language}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Citizen Verification</div>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{profile.accountStatus} ✓</p>
              </div>
            </div>
          </section>

          {/* ================= MY SUBMITTED PROBLEMS & TRACK RECORD ================= */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span>My Submitted Problems (Live Track Record)</span>
              </div>
              <button
                onClick={() => navigate('/citizen/report-problem')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                + Report Another Issue
              </button>
            </div>

            {/* 3 Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/90 py-4 px-6 text-center shadow-xs">
                <div className="text-2xl font-black text-slate-900">4</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Total Problems Logged</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/90 py-4 px-6 text-center shadow-xs">
                <div className="text-2xl font-black text-amber-600">3</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Active in University R&amp;D &amp; Pilots</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/90 py-4 px-6 text-center shadow-xs">
                <div className="text-2xl font-black text-emerald-600">1</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Resolved &amp; Citizen Verified</div>
              </div>
            </div>

            {/* Track Record Problem Cards List */}
            <div className="space-y-3">
              {submittedProblems.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:border-emerald-400 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {p.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${p.statusBadge}`}>
                        {p.status}
                      </span>
                      <span className="text-xs text-slate-400">{p.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                    <p className="text-xs text-slate-500">📍 {p.location} · Assigned: {p.dept}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate('/citizen/feedback')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#0c3b2e] hover:bg-[#072a20] rounded-lg transition cursor-pointer shadow-xs"
                    >
                      Track &amp; Verify →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Citizen Details</h3>
              <button onClick={handleCloseEditModal} className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-lg border-slate-300 text-xs p-2.5 focus:ring-emerald-600 focus:border-emerald-600 border"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full rounded-lg border-slate-300 text-xs p-2.5 focus:ring-emerald-600 focus:border-emerald-600 border"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">District</label>
                <select
                  value={editForm.district}
                  onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  className="w-full rounded-lg border-slate-300 text-xs p-2.5 focus:ring-emerald-600 focus:border-emerald-600 border"
                >
                  <option>Gumla</option>
                  <option>Ranchi</option>
                  <option>Latehar</option>
                  <option>Dumka</option>
                  <option>Simdega</option>
                  <option>Hazaribagh</option>
                  <option>Dhanbad</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
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
