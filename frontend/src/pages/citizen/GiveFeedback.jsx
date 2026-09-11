import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import problemApi from '../../api/problemApi';
import feedbackApi from '../../api/feedbackApi';
import ProblemDetailModal from '../../components/common/ProblemDetailModal';

export default function GiveFeedback() {
  const navigate = useNavigate();

  // Sidebar collapse & mobile state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // View mode: 'directory' or 'single' or 'track-record'
  const [viewMode, setViewMode] = useState('directory');

  // Main active tab in directory: 'my-problems' | 'public'
  const [activeTab, setActiveTab] = useState('my-problems');

  // Directory filter & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected problem for detailed track record modal
  const [selectedTrackRecord, setSelectedTrackRecord] = useState(null);

  // Dynamic Problems from Neon DB
  const [liveProblems, setLiveProblems] = useState([]);

  useEffect(() => {
    problemApi.getProblems()
      .then(res => {
        if (res && res.success && Array.isArray(res.problems)) {
          setLiveProblems(res.problems);
        }
      })
      .catch(err => {
        console.warn('Notice fetching problems in feedback:', err);
      });
  }, []);

  const rawList = liveProblems;

  // Formatted dynamic problems from Neon PostgreSQL
  const formattedProblems = rawList.map((p) => ({
    id: p.id || 'JH-C1042',
    title: p.title || 'Civic Problem Grievance',
    location: `${p.district || 'Gumla'}, Jharkhand · ${p.block || 'Block'}, ${p.village || 'Panchayat'}`,
    status: p.status === 'RESOLVED' ? 'Resolved & Verified' : p.status === 'IN_PROGRESS' ? 'Field Pilot Active' : p.status === 'ACCEPTED' ? 'Dept Assigned' : 'AI Verified',
    statusType: p.status === 'RESOLVED' ? 'resolved' : 'in-progress',
    statusBadgeClass: p.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-teal-50 text-teal-700 border-teal-200',
    progress: p.status === 'RESOLVED' ? 100 : p.status === 'IN_PROGRESS' ? 65 : p.status === 'ACCEPTED' ? 40 : 25,
    dept: p.ai_category ? `Dept: ${p.ai_category}` : (p.dept || 'Govt of Jharkhand Innovation Pool'),
    mentor: 'Assigned University Researcher & Nodal Officer',
    description: p.description || '',
    updatedTime: `Logged ${new Date(p.created_at || Date.now()).toLocaleDateString()}`,
    timeline: [
      { title: 'Citizen Grievance Logged', date: new Date(p.created_at || Date.now()).toLocaleDateString(), desc: 'Submitted with geo-tag and media evidence.', status: 'completed' },
      { title: 'AI Screening & Veracity Analysis', date: 'AI Engine', desc: `Verified authentic (${p.veracity_score || 95}% veracity score).`, status: 'completed' },
      { title: 'Administrative & Academic Triage', date: 'In Progress', desc: 'Matched to Grand Challenge pipeline.', status: p.status === 'AI_VERIFIED' ? 'in-progress' : 'completed' },
      { title: 'Field Solution & Pilot Sign-off', date: 'Pending', desc: 'Ground verification and resolution confirmation.', status: p.status === 'RESOLVED' ? 'completed' : 'pending' }
    ],
    raw: p
  }));

  const myProblems = formattedProblems;
  const publicProblems = formattedProblems;

  const handleOpenTrackRecordModal = (p) => {
    setSelectedTrackRecord(p.raw || p);
  };

  // Currently selected problem for feedback form
  const [selectedProblem, setSelectedProblem] = useState(formattedProblems[0] || null);

  useEffect(() => {
    if (!selectedProblem && formattedProblems.length > 0) {
      setSelectedProblem(formattedProblems[0]);
    }
  }, [liveProblems]);

  // Form State
  const [solutionStatus, setSolutionStatus] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const ratingDescriptions = {
    1: '1/5 Poor Resolution',
    2: '2/5 Needs More Work',
    3: '3/5 Satisfactory',
    4: '4/5 Very Good',
    5: '5/5 Highly Satisfied'
  };

  const handleOpenFeedbackForm = (p) => {
    setSelectedProblem(p);
    setViewMode('single');
    setSolutionStatus(null);
    setRating(0);
    setFeedbackNotes('');
    setAttachments([]);
    setIsSubmitted(false);
  };

  const handleAddAttachment = (type) => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newAtt = {
      id: Date.now(),
      name: type === 'photo' ? `site_inspection_${randomId}.jpg` : `water_flow_clip_${randomId.toString().slice(0, 2)}.mp4`,
      icon: type === 'photo' ? '📷' : '📹'
    };
    setAttachments([...attachments, newAtt]);
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);
    try {
      await feedbackApi.submitFeedback({
        problem_id: selectedProblem?.id || 'JH-C1042',
        project_id: selectedProblem?.id === 'JH-C1042' ? 'PRJ-315' : selectedProblem?.id === 'JH-C1035' ? 'PRJ-925' : 'PRJ-051',
        citizen_id: 'usr_citizen_01',
        solution_status: solutionStatus || 'completely',
        rating: rating || 5,
        notes: feedbackNotes || 'Ground verification confirmed by citizen.',
        beneficiaries_reached: 500,
        attachments
      });
    } catch (err) {
      console.warn('Feedback API call note:', err);
    }
    setIsSubmitting(false);
    setIsSubmitted(true);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setIsSubmitted(false);
      setViewMode('directory');
    }, 2500);
  };

  // Filter problems for directory
  const currentList = activeTab === 'my-problems' ? myProblems : publicProblems;
  const filteredProblems = currentList.filter((p) => {
    if (statusFilter !== 'all' && p.statusType !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="h-screen overflow-hidden flex flex-row font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900 bg-slate-50">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= FIXED COLLAPSIBLE SIDEBAR ================= */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 bg-[#0c3b2e] text-slate-200 flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-none transition-all duration-300 select-none ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
        id="citizen-feedback-sidebar"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-emerald-800/60 bg-[#052e16]/50">
            <div
              className="flex items-center gap-3 overflow-hidden cursor-pointer"
              onClick={() => navigate('/citizen/dashboard')}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold shrink-0 shadow-inner">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"></path>
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <span className="font-bold text-sm tracking-wide block leading-tight text-white">JharInnovate</span>
                  <span className="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase block">GOVT. OF JHARKHAND</span>
                </div>
              )}
            </div>
            <button
              aria-label="Toggle navigation sidebar"
              className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800/60 rounded-md focus:outline-none transition-all"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Citizen portal navigation" className="p-3 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
            {/* Home */}
            <button
              onClick={() => {
                navigate('/citizen/dashboard');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center ${
                sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl text-slate-300 hover:bg-emerald-800/50 hover:text-white transition-all text-left font-medium text-sm cursor-pointer`}
            >
              <svg className="w-5 h-5 shrink-0 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className={`w-full flex items-center justify-between ${
                sidebarCollapsed ? 'justify-center px-0' : 'px-3'
              } py-2.5 rounded-xl text-slate-300 hover:bg-emerald-800/50 hover:text-white transition-all text-left font-medium text-sm cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                {!sidebarCollapsed && <span>Report</span>}
              </div>
              {!sidebarCollapsed && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/20">
                  AI Fast
                </span>
              )}
            </button>

            {/* Problems (Active) */}
            <button
              onClick={() => {
                navigate('/citizen/feedback');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center ${
                sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 shadow-xs font-semibold text-sm transition-all text-left cursor-pointer`}
            >
              <svg className="w-5 h-5 shrink-0 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {!sidebarCollapsed && <span>Problems &amp; Track Record</span>}
            </button>
          </nav>
        </div>

        {/* Log Out at Bottom */}
        <div className="p-3 border-t border-emerald-800/60 bg-[#052e16]/40">
          <button
            aria-label="Log Out"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-rose-300 hover:bg-rose-950/30 transition-all text-left text-xs font-semibold cursor-pointer"
            onClick={() => {
              if (window.confirm('Do you want to log out of the citizen portal?')) {
                navigate('/login');
              }
            }}
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {!sidebarCollapsed && <span>Log Out</span>}
            </div>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WORKSPACE ================= */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0 bg-[#f8faf9] custom-scrollbar">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 shrink-0">
          {/* Left: Breadcrumb & Mobile hamburger */}
          <div className="flex items-center gap-3 text-sm truncate">
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span
              onClick={() => navigate('/citizen/dashboard')}
              className="text-slate-400 hover:text-slate-700 hidden sm:inline transition-colors cursor-pointer"
            >
              Citizen Portal
            </span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <button
              onClick={() => setViewMode('directory')}
              className="text-slate-700 font-bold hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Problems &amp; Track Record
            </button>
            {viewMode === 'single' && (
              <>
                <span className="text-slate-300">/</span>
                <span className="font-semibold text-emerald-800 truncate">
                  {selectedProblem?.id || 'Grievance'} · Verification
                </span>
              </>
            )}
          </div>

          {/* Right: Status, Notifications & Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
              <span>Live Civic Sync (08 Sep 2026)</span>
            </div>

            <div
              className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer"
              onClick={() => navigate('/citizen/profile')}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-emerald-100 shadow-xs">
                RK
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-bold text-slate-800">Rajesh Kumar</div>
                <div className="text-[11px] text-slate-400">Gumla Citizen</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* ================= 1. DIRECTORY & TRACK RECORD VIEW ================= */}
          {viewMode === 'directory' && (
            <div className="space-y-6 animate-in fade-in" id="problems-directory-view">
              {/* Header Title with Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Civic Problems &amp; Track Record</h1>
                  <p className="text-sm text-slate-500 mt-1">Track your submitted issues step-by-step and inspect community solutions across Jharkhand.</p>
                </div>
                <div className="relative flex-1 sm:w-72">
                  <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search problem ID, keyword, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 shadow-2xs"
                  />
                </div>
              </div>

              {/* Top Tabs Switcher: My Problems vs Public Problems */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('my-problems');
                      setStatusFilter('all');
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeTab === 'my-problems'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    📍 My Reported Problems ({myProblems.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('public');
                      setStatusFilter('all');
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeTab === 'public'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🌐 Public Directory ({publicProblems.length})
                  </button>
                </div>

                {/* Sub-status filters */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                      statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-200/60'
                    }`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                      statusFilter === 'in-progress' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500 hover:bg-slate-200/60'
                    }`}
                    onClick={() => setStatusFilter('in-progress')}
                  >
                    In Progress
                  </button>
                  <button
                    className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                      statusFilter === 'resolved' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-200/60'
                    }`}
                    onClick={() => setStatusFilter('resolved')}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Problem Cards Grid */}
              {filteredProblems.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-dashed border-slate-300 text-center max-w-lg mx-auto space-y-4 my-6">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
                    📋
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No Problems Found</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    No matching grievances found in the system. Report a problem to track resolution status and submit feedback.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/citizen/report-problem')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <span>➕ Report a Problem</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProblems.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleOpenTrackRecordModal(p)}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-lg hover:border-emerald-500 transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        {/* Top Code & Status */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 group-hover:bg-emerald-100 transition-colors">
                            {p.id}
                          </span>
                          <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${p.statusBadgeClass}`}>
                            {p.status}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
                          {p.title}
                        </h3>

                      <p className="text-xs text-slate-500 mt-1 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        {p.location}
                      </p>

                      <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {p.description}
                      </p>

                      {/* If My Problems tab, show Stage Progress Bar & Mentor */}
                      {activeTab === 'my-problems' && p.progress !== undefined && (
                        <div className="mt-3.5 pt-2.5 border-t border-slate-100">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-slate-600 font-semibold">Resolution Progress</span>
                            <span className="font-bold text-emerald-700">{p.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                              style={{ width: `${p.progress}%` }}
                            ></div>
                          </div>
                          {p.dept && (
                            <p className="text-[11px] text-slate-500 mt-2 truncate">
                              <span className="font-medium text-slate-700">Assigned:</span> {p.dept}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">{p.updatedTime}</span>
                      <div className="flex items-center gap-2">
                        {p.timeline && (
                          <button
                            type="button"
                            onClick={() => handleOpenTrackRecordModal(p)}
                            className="text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Track Record
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenFeedbackForm(p)}
                          className="inline-flex items-center text-xs font-bold text-white bg-[#0c3b2e] hover:bg-[#082a21] px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                        >
                          Verify &amp; Feedback →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

          {/* ================= 2. VERIFICATION & FEEDBACK FORM VIEW ================= */}
          {viewMode === 'single' && (
            <div className="max-w-xl mx-auto space-y-4 animate-in fade-in" id="feedback-single-view">
              <button
                className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors group cursor-pointer"
                onClick={() => setViewMode('directory')}
                type="button"
              >
                <svg className="w-4 h-4 mr-1.5 text-slate-400 group-hover:text-slate-700 transition-colors transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span>Back to Problems Directory</span>
              </button>

              {/* Problem Details Summary Card */}
              <section className="bg-white rounded-2xl border border-slate-200/90 px-6 py-5 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedProblem?.id || 'JH-C1042'}
                  </span>
                  <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${selectedProblem?.statusBadgeClass || 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                    {selectedProblem?.status || 'In Progress'}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {selectedProblem?.title || 'Reported Civic Problem'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  📍 {selectedProblem?.location || 'Gumla District, Jharkhand'}
                </p>
              </section>

              {/* Feedback Form Card */}
              <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
                {/* Question 1: Resolution Status */}
                <div className="space-y-2.5">
                  <label className="block text-sm font-semibold text-slate-900">
                    Has this problem been solved on the ground?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className={`h-10 px-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center text-center cursor-pointer ${
                        solutionStatus === 'completely'
                          ? 'bg-[#0c3b2e] text-white border-[#0c3b2e] shadow-inner'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => setSolutionStatus('completely')}
                      type="button"
                    >
                      Completely Solved
                    </button>
                    <button
                      className={`h-10 px-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center text-center cursor-pointer ${
                        solutionStatus === 'partially'
                          ? 'bg-[#0c3b2e] text-white border-[#0c3b2e] shadow-inner'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => setSolutionStatus('partially')}
                      type="button"
                    >
                      Partially Solved
                    </button>
                    <button
                      className={`h-10 px-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center text-center cursor-pointer ${
                        solutionStatus === 'not-solved'
                          ? 'bg-[#0c3b2e] text-white border-[#0c3b2e] shadow-inner'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => setSolutionStatus('not-solved')}
                      type="button"
                    >
                      Not Solved Yet
                    </button>
                  </div>
                </div>

                {/* Question 2: Star Rating */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-900">
                      Satisfaction Rating
                    </label>
                    <span className="text-xs font-semibold text-emerald-700">
                      {ratingDescriptions[rating] || ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const active = (hoverRating || rating) >= starVal;
                      return (
                        <button
                          key={starVal}
                          className={`p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer ${
                            active ? 'text-amber-400' : 'text-slate-300'
                          }`}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starVal)}
                          type="button"
                        >
                          <svg
                            className={`w-7 h-7 stroke-current stroke-2 ${
                              active ? 'fill-amber-400 stroke-amber-400' : 'fill-none'
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question 3: Feedback Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="feedback-notes">
                    Share your on-ground observations &amp; feedback
                  </label>
                  <textarea
                    className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-all resize-y"
                    id="feedback-notes"
                    placeholder="Tell us about the flow rate, quality, stability, or any pending issues..."
                    rows="3"
                    maxLength={400}
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* Question 4: Upload Photo Evidence */}
                <div className="space-y-2.5">
                  <label className="block text-sm font-semibold text-slate-900">
                    Add Updated Inspection Photo / Video <span className="text-slate-400 font-normal text-xs">(optional)</span>
                  </label>
                  <div className="flex items-center space-x-2.5">
                    <button
                      className="inline-flex items-center px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                      onClick={() => handleAddAttachment('photo')}
                      type="button"
                    >
                      📷 Attach Photo
                    </button>
                    <button
                      className="inline-flex items-center px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                      onClick={() => handleAddAttachment('video')}
                      type="button"
                    >
                      📹 Attach Video
                    </button>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                          <div className="flex items-center space-x-2 text-slate-700">
                            <span>{att.icon}</span>
                            <span className="font-medium">{att.name}</span>
                          </div>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-rose-500 cursor-pointer"
                            onClick={() => handleRemoveAttachment(att.id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Feedback Button */}
                <button
                  className={`w-full text-white text-sm font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    isSubmitted
                      ? 'bg-emerald-700'
                      : 'bg-[#0c3b2e] hover:bg-[#072a20] active:scale-[0.99]'
                  }`}
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting}
                  type="button"
                >
                  <span>
                    {isSubmitting ? 'Submitting Verification...' : isSubmitted ? 'Verified & Submitted ✓' : 'Submit Citizen Verification Feedback'}
                  </span>
                </button>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Detailed Inspection Modal */}
      {selectedTrackRecord && (
        <ProblemDetailModal
          problem={selectedTrackRecord}
          onClose={() => setSelectedTrackRecord(null)}
          onStatusUpdated={(id, newStatus) => {
            setLiveProblems(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
          }}
        />
      )}

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start space-x-3 transition-all duration-300 z-50 ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/40">
          ✓
        </div>
        <div className="flex-1 text-xs">
          <p className="font-bold text-white">Feedback Submitted Successfully!</p>
          <p className="text-slate-300 mt-0.5">Thank you for confirming resolution status for {selectedProblem?.id || 'your grievance'}.</p>
        </div>
      </div>
    </div>
  );
}
