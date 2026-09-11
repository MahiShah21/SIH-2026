import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import problemApi from '../../api/problemApi';
import ProblemDetailModal from '../../components/common/ProblemDetailModal';
import { getSocket } from '../../api/socket';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

/**
 * Screen: JanSetu — Government of Jharkhand Citizen Dashboard
 * Complete with Fixed Sidebar & Dedicated "My Problems" Track Record & Lifecycle Timeline
 */
export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  // Sidebar states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Problem view tab state: 'all' | 'my-problems' | 'public'
  const [problemTab, setProblemTab] = useState('my-problems');

  // Dynamic Problems from Neon DB
  const [liveProblems, setLiveProblems] = useState([]);

  // Fetch live problems from backend Neon PostgreSQL & setup socket
  useEffect(() => {
    problemApi.getProblems()
      .then((res) => {
        if (res && res.success && Array.isArray(res.problems)) {
          const unique = Array.from(new Map(res.problems.map(item => [item.id, item])).values());
          setLiveProblems(unique);
        }
      })
      .catch((err) => {
        console.warn('Live problems fetch notice:', err);
      });

    const socket = getSocket();
    if (socket) {
      socket.emit('join_role', 'citizen');
      
      const onProblemCreated = (newP) => {
        setLiveProblems(prev => [newP, ...prev.filter(p => p.id !== newP.id)]);
      };

      const onProblemUpdated = (upP) => {
        setLiveProblems(prev => prev.map(p => p.id === upP.id ? { ...p, ...upP } : p));
      };

      socket.on('problem_created', onProblemCreated);
      socket.on('problem_updated', onProblemUpdated);

      return () => {
        socket.off('problem_created', onProblemCreated);
        socket.off('problem_updated', onProblemUpdated);
      };
    }
  }, []);

  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Toast state
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Inspect details / Track Record modal state
  const [inspectData, setInspectData] = useState(null);

  // Quick report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [quickReportForm, setQuickReportForm] = useState({
    headline: '',
    sector: 'Agriculture & Irrigation',
    pin: '📍 Gumla Block (Auto-detected)'
  });

  const rawProblemList = liveProblems;

  // Formatted dynamic problems from Neon PostgreSQL or fallback
  const formattedProblems = rawProblemList.map((p) => ({
    id: p.id || 'JH-C1042',
    date: new Date(p.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    title: p.title || 'Civic Problem Grievance',
    location: `${p.district || 'Gumla'}, Jharkhand · ${p.block || 'Local Block'}, ${p.village || 'Panchayat'}`,
    category: p.category || 'Civic Infrastructure',
    priority: ((p.priority || 'high').charAt(0).toUpperCase() + (p.priority || 'high').slice(1)),
    status: p.status === 'RESOLVED' ? 'Resolved & Verified' : p.status === 'IN_PROGRESS' ? 'Field Pilot Active' : p.status === 'ACCEPTED' ? 'Dept Assigned' : 'AI Verified',
    statusBadge: p.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-teal-50 text-teal-700 border-teal-200',
    progress: p.status === 'RESOLVED' ? 100 : p.status === 'IN_PROGRESS' ? 65 : p.status === 'ACCEPTED' ? 40 : 25,
    dept: p.ai_category ? `Dept: ${p.ai_category}` : (p.dept || 'Govt of Jharkhand Innovation Pool'),
    mentor: 'Assigned to University R&D & District Nodal Officer',
    summary: p.description || '',
    gps: `${p.latitude || '23.04° N'}, ${p.longitude || '84.54° E'} (GPS Verified)`,
    timeline: [
      { title: 'Citizen Grievance Logged', date: new Date(p.created_at || Date.now()).toLocaleDateString(), desc: 'Problem submitted with geo-tag and media evidence.', status: 'completed' },
      { title: 'AI Screening & Veracity Analysis', date: 'AI Engine', desc: `Verified as authentic (${p.veracity_score || 95}% veracity score).`, status: 'completed' },
      { title: 'Administrative & Academic Triage', date: 'In Progress', desc: 'Matched to Grand Challenge pipeline.', status: p.status === 'AI_VERIFIED' ? 'in-progress' : 'completed' },
      { title: 'Field Solution & Pilot Sign-off', date: 'Pending', desc: 'Ground verification and resolution confirmation.', status: p.status === 'RESOLVED' ? 'completed' : 'pending' }
    ],
    raw: p
  }));

  const myReportedProblems = formattedProblems;
  const publicProblems = formattedProblems;

  const openTrackRecordModal = (problem) => {
    setInspectData(problem.raw || problem);
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  const markAllNotificationsRead = (e) => {
    e.stopPropagation();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    triggerToast('All notifications marked as read.');
  };

  const handleNotificationClick = (id, message) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    triggerToast(message);
  };

  const closeInspectModal = () => {
    setInspectData(null);
  };

  const handleQuickReportSubmit = (e) => {
    e.preventDefault();
    setShowReportModal(false);
    triggerToast('Problem successfully logged! AI Engine matched BIT Mesra & Water Resources team.');
  };

  return (
    <div className="h-screen overflow-hidden flex flex-row font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900 bg-slate-50">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity opacity-100"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* ================= FIXED COLLAPSIBLE SIDEBAR ================= */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 bg-[#0c3b2e] text-slate-200 flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-none transition-all duration-300 select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-[4.5rem]' : 'w-64'}`}
        id="citizen-fixed-sidebar"
      >
        {/* Top Branding Section */}
        <div className="flex flex-col flex-1 min-h-0">
          <div
            className={`h-16 flex items-center gap-3 px-5 border-b border-emerald-800/60 bg-[#052e16]/50 cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            onClick={() => navigate('/citizen/dashboard')}
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold shrink-0 shadow-inner">
              JS
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-wide text-white leading-tight">{t('brand_name', 'JanSetu')}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/20">
                    Citizen
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/80 truncate">{t('govt_title', 'Govt. of Jharkhand')}</p>
              </div>
            )}
          </div>

          {/* Quick Action Button: Report Problem */}
          {!isCollapsed && (
            <div className="p-3 pb-1">
              <button
                type="button"
                onClick={() => navigate('/citizen/report-problem')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Report Grievance</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="p-3 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
            {/* Home (Active) */}
            <button
              type="button"
              onClick={() => {
                navigate('/citizen/dashboard');
                setIsMobileOpen(false);
              }}
              className={`w-full group relative flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl text-sm font-semibold bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 shadow-xs hover:bg-emerald-600/40 transition text-left cursor-pointer`}
            >
              <svg className="w-5 h-5 text-emerald-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {!isCollapsed && <span>Home</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-xs rounded text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Home
                </span>
              )}
            </button>

            {/* Report a Problem */}
            <button
              type="button"
              onClick={() => {
                navigate('/citizen/report-problem');
                setIsMobileOpen(false);
              }}
              className={`w-full group relative flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition text-left cursor-pointer`}
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {!isCollapsed && (
                <>
                  <span>Report</span>
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                    AI Fast
                  </span>
                </>
              )}
              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-xs rounded text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Report a Problem
                </span>
              )}
            </button>

            {/* Problems & Track Record */}
            <button
              type="button"
              onClick={() => {
                navigate('/citizen/feedback');
                setIsMobileOpen(false);
              }}
              className={`w-full group relative flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition text-left cursor-pointer`}
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {!isCollapsed && (
                <>
                  <span>Problems &amp; Track Record</span>
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-950 rounded">
                    {liveProblems.length} Track
                  </span>
                </>
              )}
              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-xs rounded text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Problems &amp; Track Record
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Streamlined Workspace Footer */}
        <div className="p-3 border-t border-emerald-800/60 bg-[#052e16]/40 flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full text-xs text-emerald-300">
              <span className="text-[11px] font-medium text-emerald-300/80">Citizen Portal</span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                title="Logout / Switch Role"
                className="flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white hover:bg-emerald-800/80 px-2 py-1 rounded transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                title="Logout"
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ================= MAIN SCROLLABLE WORKSPACE ================= */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0 bg-slate-50 custom-scrollbar">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs shrink-0">
          {/* Left: Hamburger toggle + Government Badge */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle Navigation Sidebar"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              id="sidebarToggleBtn"
              onClick={handleSidebarToggle}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  {t('govt_title', 'Government of Jharkhand')}
                </h1>
                <p className="text-xs text-slate-500">
                  {t('citizen_portal', 'Citizen Innovation & Grievance Resolution Dashboard')}
                </p>
              </div>
              <div className="sm:hidden font-semibold text-slate-800 text-sm">
                {t('govt_title', 'Govt. of Jharkhand')}
              </div>
            </div>
          </div>

          {/* Right: Language Switcher, Live Sync, Notifications, Profile Chip */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            {/* Live Sync Chip */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/70">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Civic Sync</span>
            </div>

            {/* Notification Bell */}
            <div className="relative" id="notificationWrapper">
              <button
                aria-expanded={showNotifications}
                aria-haspopup="true"
                aria-label="Notifications"
                className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative focus:outline-none transition cursor-pointer"
                id="notificationBellBtn"
                onClick={toggleNotifications}
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                    id="bellUnreadDot"
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden text-left animate-in fade-in duration-200"
                  id="notificationsDropdown"
                >
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                        Notifications
                      </h3>
                      <span className="text-xs text-slate-500 font-normal mt-0.5" id="unreadCounterText">
                        {unreadCount} unread
                      </span>
                    </div>
                    <button
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 py-1 px-1.5 rounded transition cursor-pointer"
                      id="markAllReadBtn"
                      onClick={markAllNotificationsRead}
                      type="button"
                    >
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      <span className="font-medium text-emerald-700 text-xs">Mark all read</span>
                    </button>
                  </div>

                  <div className="overflow-y-auto max-h-[380px] divide-y divide-slate-100 text-xs" id="notificationsList">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3.5 hover:bg-slate-50/80 transition cursor-pointer flex items-start gap-3 relative group"
                        onClick={() => handleNotificationClick(notif.id, `${notif.title}: ${notif.desc}`)}
                      >
                        <div className={`w-8 h-8 rounded-full ${notif.colorBg} ${notif.colorText} flex items-center justify-center shrink-0 mt-0.5 font-bold`}>
                          ✓
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-semibold text-slate-800 text-[13px] leading-snug truncate">
                              {notif.title}
                            </span>
                            {notif.unread && (
                              <span className="w-2 h-2 rounded-full bg-[#f97316] shrink-0"></span>
                            )}
                          </div>
                          <p className="text-slate-500 text-[11px] leading-relaxed">{notif.desc}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
                    <button
                      className="w-full py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 rounded-lg hover:bg-white transition cursor-pointer"
                      onClick={() => {
                        setShowNotifications(false);
                        triggerToast('Opened complete notification center history.');
                      }}
                      type="button"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Citizen Profile Avatar Dropdown */}
            <div className="relative pl-2 border-l border-slate-200">
              <div
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-xs border border-emerald-700 shadow-xs">
                  {((currentUser?.name || 'Citizen').split(' ').map(n => n[0]).join('').substring(0, 2) || 'CZ').toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">{currentUser?.name || 'Citizen User'}</div>
                  <div className="text-[11px] text-slate-500 leading-tight">{currentUser?.organization_or_district || 'Jharkhand'} · {currentUser?.karma_points || currentUser?.karmaPoints || 0} KP</div>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Citizen Profile Dropdown Popover */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in">
                  <div className="p-4 bg-gradient-to-br from-[#064e3b] to-[#043d2e] text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/20">
                        {((currentUser?.name || 'Citizen').split(' ').map(n => n[0]).join('').substring(0, 2) || 'CZ').toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{currentUser?.name || 'Citizen User'}</h4>
                        <p className="text-[11px] text-emerald-300">{currentUser?.organization_or_district || 'Jharkhand'}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-emerald-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-300/80">Civic Karma Points:</span>
                      <span className="font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/60">
                        ⭐ {currentUser?.karma_points || currentUser?.karmaPoints || 0} KP
                      </span>
                    </div>
                  </div>

                  <div className="p-2 space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/citizen/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition font-medium cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>View Citizen Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/citizen/report-problem');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition font-medium cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Report New Problem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition font-medium cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span>Switch Portal / Role</span>
                    </button>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition font-semibold cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Welcome Banner */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back, {currentUser?.name || 'Citizen'}! <span className="inline-block animate-bounce">👋</span>
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  {currentUser?.organization_or_district || 'Jharkhand'}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1.5">
                Participate, report, and track real civic transformations across your panchayat.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProblemTab('my-problems')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
              >
                📍 My Track Record ({myReportedProblems.length})
              </button>
            </div>
          </section>

          {/* Hero CTA Report Card */}
          <section
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c3b2e] via-[#064e3b] to-[#084234] text-white p-6 sm:p-8 shadow-md border border-emerald-900"
            id="report-section"
          >
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 max-w-3xl">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300 shadow-inner">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      Report a Civic Problem
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                      AI Fast Intake &amp; Tracking
                    </span>
                  </div>
                  <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                    Share an infrastructure, water, road, or energy challenge with photographic evidence &amp; GPS pin. AI matches departmental engineers and academic R&amp;D teams immediately.
                  </p>
                </div>
              </div>

              {/* Start Report Action Button */}
              <button
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-950/30 hover:shadow-emerald-400/20 transition-all shrink-0 active:scale-95 cursor-pointer"
                onClick={() => navigate('/citizen/report-problem')}
                type="button"
              >
                <span>Start New Report</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
            </div>
          </section>

          {/* Statistics Metrics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Stat 1: Problems Submitted */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
                  </svg>
                </div>
                <button
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group cursor-pointer"
                  onClick={() => {
                    setProblemTab('my-problems');
                    triggerToast('Filtered for My Reported Problems Track Record');
                  }}
                  type="button"
                >
                  View My Submissions <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>
              <div className="mt-4">
                <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  My Reported Problems
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black tracking-tight text-slate-900">{myReportedProblems.length}</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">All Tracked Live</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>View real-time status</span>
                <button
                  className="font-semibold text-slate-700 hover:text-emerald-700 cursor-pointer"
                  onClick={() => setProblemTab('my-problems')}
                >
                  Show Track Record
                </button>
              </div>
            </div>

            {/* Stat 2: In Progress */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
                  </svg>
                </div>
                <button
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 group cursor-pointer"
                  onClick={() => {
                    setProblemTab('my-problems');
                    triggerToast('Showing active pilots and development stages');
                  }}
                  type="button"
                >
                  Active Queue <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>
              <div className="mt-4">
                <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  In Progress (Pilots &amp; Dev)
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black tracking-tight text-slate-900">
                    {myReportedProblems.filter(p => p.status !== 'Resolved & Verified').length}
                  </span>
                  <span className="text-xs font-medium text-slate-500">Assigned R&amp;D Pipeline</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Hardware &amp; R&amp;D Pilots</span>
                <span className="font-semibold text-amber-700">Active Workflow</span>
              </div>
            </div>

            {/* Stat 3: Solved & Verified */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
                  </svg>
                </div>
                <button
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 group cursor-pointer"
                  onClick={() => {
                    setProblemTab('my-problems');
                    triggerToast('Showing verified resolved problems');
                  }}
                  type="button"
                >
                  Verified Solved <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>
              <div className="mt-4">
                <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  Resolved &amp; Verified
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black tracking-tight text-slate-900">
                    {myReportedProblems.filter(p => p.status === 'Resolved & Verified').length}
                  </span>
                  <span className="text-xs font-medium text-emerald-700">Citizen Confirmed</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Panchayat verified</span>
                <span className="font-semibold text-emerald-700">Citizen Signoff</span>
              </div>
            </div>
          </section>

          {/* ================= PROBLEMS & TRACK RECORD SECTION ================= */}
          <section className="space-y-4" id="problems-section">
            {/* Section Header with Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    {problemTab === 'my-problems' ? 'My Reported Problems & Track Record' : 'Public Community Problems'}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {myReportedProblems.length} Submissions
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Click any problem card to inspect full AI veracity score, GPS coordinates, evidence media, and resolution progress.
                </p>
              </div>

              {/* View Switcher Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setProblemTab('my-problems')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    problemTab === 'my-problems'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  My Problems ({myReportedProblems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProblemTab('public')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    problemTab === 'public'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Public Directory ({publicProblems.length})
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/citizen/feedback')}
                  className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  title="Open full interactive problem explorer"
                >
                  Full Directory →
                </button>
              </div>
            </div>

            {/* TAB 1: MY REPORTED PROBLEMS & DETAILED TRACK RECORD CARDS */}
            {problemTab === 'my-problems' && (
              myReportedProblems.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-dashed border-slate-300 text-center max-w-lg mx-auto space-y-4 my-6">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
                    🌱
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No Civic Issues Reported Yet</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Be the first to submit a problem in your locality. Your report will be classified by AI and connected to researchers and state departments.
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in">
                  {myReportedProblems.map((problem) => (
                    <article
                      key={problem.id}
                      onClick={() => openTrackRecordModal(problem)}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-500 transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        {/* Card Header: Code + Priority + Status */}
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-1.5 font-medium text-slate-600">
                            <span className="font-mono font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors">
                              {problem.id}
                            </span>
                            <span>·</span>
                            <span className="text-slate-500">{problem.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {problem.priority} Priority
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${problem.statusBadge}`}>
                              {problem.status}
                            </span>
                          </div>
                        </div>

                        {/* Title & Location */}
                        <h4 className="text-base font-bold text-slate-900 mt-2.5 leading-snug group-hover:text-emerald-700 transition-colors">
                          {problem.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path>
                          </svg>
                          <span>{problem.location}</span>
                        </div>

                        {/* Summary text */}
                        <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {problem.summary}
                        </p>

                        {/* Progress Bar & Milestone Stage */}
                        <div className="mt-3.5">
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-slate-600 font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              Track Record Progress
                            </span>
                            <span className="font-bold text-emerald-700">{problem.progress}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                              style={{ width: `${problem.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Assigned Entity */}
                        <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Assigned:</span>
                          <span className="font-bold text-slate-800 truncate">{problem.dept}</span>
                        </div>
                      </div>

                      {/* Bottom Actions: Inspect Track Record & Verify Feedback */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 group-hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>Inspect Full Details &amp; Map →</span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/citizen/feedback');
                          }}
                          className="font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                        >
                          Give Feedback
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )
            )}

            {/* TAB 2: PUBLIC PROBLEMS CARDS */}
            {problemTab === 'public' && (
              publicProblems.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-dashed border-slate-300 text-center max-w-lg mx-auto space-y-4 my-6">
                  <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
                    🏛️
                  </div>
                  <h4 className="text-base font-bold text-slate-800">Public Directory Empty</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    No verified community problems in the public registry yet. Reports filed by citizens will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in">
                  {publicProblems.map((pub) => (
                    <article
                      key={pub.id}
                      onClick={() => openTrackRecordModal(pub)}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-400 transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-1.5 font-medium text-slate-600">
                            <span className="font-semibold text-slate-800 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 group-hover:bg-emerald-50 transition-colors">
                              {pub.id}
                            </span>
                            <span>·</span>
                            <span className="text-slate-500">{pub.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              {pub.priority}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {pub.status}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-3 leading-snug group-hover:text-emerald-700 transition-colors">
                          {pub.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path>
                          </svg>
                          <span>{pub.location}</span>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-500 font-medium">Stage Progress</span>
                            <span className="font-bold text-slate-800">{pub.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${pub.progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 truncate">{pub.dept}</span>
                        <span className="font-semibold text-emerald-700 group-hover:text-emerald-800 inline-flex items-center gap-1">
                          Inspect details <span>→</span>
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )
            )}
          </section>

          {/* State Civic Footer */}
          <footer className="pt-8 pb-4 text-xs text-slate-500 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>JanSetu State Civic Innovation Framework — Department of Higher &amp; Technical Education &amp; Dept of IT</span>
            </div>
            <div className="text-slate-400">
              Citizen Portal Version 3.4.1 · Jharkhand State Data Center
            </div>
          </footer>
        </main>
      </div>

      {/* ================= DETAILED TRACK RECORD MODAL DRAWER ================= */}
      {inspectData && (
        <ProblemDetailModal 
          problem={inspectData} 
          onClose={() => setInspectData(null)}
          onStatusUpdated={(id, newStatus) => {
            setLiveProblems(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
          }}
        />
      )}

      {/* Global Toast Notification */}
      <div
        className={`fixed bottom-5 right-5 z-50 transition-all duration-300 pointer-events-none ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
        id="toastNotification"
      >
        <div className="bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMsg}</span>
        </div>
      </div>
    </div>
  );
}
