import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UniversitySidebar from '../../components/common/UniversitySidebar';
import UniversityHeader from '../../components/common/UniversityHeader';
import projectApi from '../../api/projectApi';
import problemApi from '../../api/problemApi';
import collaborationApi from '../../api/collaborationApi';
import { getSocket } from '../../api/socket';
import { useLanguage } from '../../context/LanguageContext';

export default function UniversityDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // State for dynamic active projects & challenges
  const [activeProjects, setActiveProjects] = useState([]);
  const [liveProblems, setLiveProblems] = useState([]);
  const [liveCollabs, setLiveCollabs] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for modals & toast
  const [selectedChallengeModal, setSelectedChallengeModal] = useState(null);
  const [selectedIndustryModal, setSelectedIndustryModal] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const fetchLiveProjects = () => {
    setLoading(true);
    projectApi.getProjects({ accepted_only: 'true' })
      .then(res => {
        if (res && res.success && res.projects) {
          setActiveProjects(res.projects.filter(p => p.is_accepted_by_university !== false));
        } else {
          setActiveProjects([]);
        }
      })
      .catch(err => {
        console.warn('Projects fetch error:', err);
        setActiveProjects([]);
      })
      .finally(() => {
        setLoading(false);
      });

    problemApi.getProblems()
      .then(res => {
        if (res && res.success && Array.isArray(res.problems)) {
          setLiveProblems(res.problems);
        } else {
          setLiveProblems([]);
        }
      })
      .catch(err => {
        console.warn('Live problems fetch notice:', err);
        setLiveProblems([]);
      });

    collaborationApi.getCollaborations()
      .then(res => {
        if (res && res.success && Array.isArray(res.collaborations)) {
          setLiveCollabs(res.collaborations);
        } else {
          setLiveCollabs([]);
        }
      })
      .catch(() => {
        setLiveCollabs([]);
      });
  };

  useEffect(() => {
    fetchLiveProjects();

    const socket = getSocket();
    if (socket) {
      socket.emit('join_role', 'university');
      const onProjectCreated = () => fetchLiveProjects();
      const onProblemUpdated = () => fetchLiveProjects();
      const onCollabUpdated = () => fetchLiveProjects();

      socket.on('project_created', onProjectCreated);
      socket.on('problem_updated', onProblemUpdated);
      socket.on('collaboration_updated', onCollabUpdated);

      return () => {
        socket.off('project_created', onProjectCreated);
        socket.off('problem_updated', onProblemUpdated);
        socket.off('collaboration_updated', onCollabUpdated);
      };
    }
  }, []);

  // Compute dynamic actionable items
  const pendingActions = [];
  const unacceptedProblems = liveProblems.filter(p => p.status !== 'ACCEPTED' && p.status !== 'RESOLVED');
  unacceptedProblems.slice(0, 2).forEach(p => {
    pendingActions.push({
      id: `pa-prob-${p.id}`,
      action: t('btn_accept_challenge', 'Evaluate Challenge'),
      ref: `${p.id} · ${p.title}`,
      badge: 'Priority',
      badgeClass: 'bg-amber-100 text-amber-800',
      iconColor: 'bg-orange-50 text-orange-600 border-orange-100',
      onClick: () => navigate(`/university/challenges?id=${p.id}`),
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
      )
    });
  });

  activeProjects.filter(p => p.stage === 'Proposal' || !p.total_budget || p.total_budget === '₹0').slice(0, 2).forEach(p => {
    pendingActions.push({
      id: `pa-proj-${p.id}`,
      action: 'Update Total Budget & Grants',
      ref: `${p.id} · ${p.title}`,
      badge: 'Budget Plan',
      badgeClass: 'bg-blue-100 text-blue-800',
      iconColor: 'bg-blue-50 text-blue-600 border-blue-100',
      onClick: () => navigate(`/university/projects?id=${p.id}`),
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
          <path d="M2 2l7.586 7.586"></path>
          <circle cx="11" cy="11" r="2"></circle>
        </svg>
      )
    });
  });

  const kpis = [
    {
      title: t('kpi_assigned_challenges', 'Assigned Challenges'),
      value: String(liveProblems.length),
      badge: t('kpi_state_matched', 'State Matched'),
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/70',
      iconBg: 'bg-teal-50 text-teal-600',
      path: '/university/challenges',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      )
    },
    {
      title: t('kpi_active_projects', 'University Active Projects'),
      value: String(activeProjects.length),
      badge: t('kpi_accepted_active', 'Accepted & Active'),
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/70',
      iconBg: 'bg-blue-50 text-blue-600',
      path: '/university/projects',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      )
    },
    {
      title: t('kpi_pending_actions', 'Pending Actions'),
      value: String(pendingActions.length),
      badge: t('kpi_review_needed', 'Review Needed'),
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200/70',
      iconBg: 'bg-orange-50 text-orange-600',
      path: '/university/challenges',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      )
    },
    {
      title: t('kpi_industry_collabs', 'Industry Collaborations'),
      value: String(liveCollabs.length),
      badge: t('kpi_active_mous', 'Active MOUs'),
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/70',
      iconBg: 'bg-amber-50 text-amber-600',
      path: '/university/industry',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="2" y="7" width="20" height="14" rx="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      )
    }
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* 1. Authentic Navy Sidebar */}
      <UniversitySidebar
        activeNav="dashboard"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6 bg-[#f4f5fa]">
        {/* Toast Alert */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-500/40 flex items-center gap-3 animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <p className="text-xs font-semibold">{toastMsg}</p>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <UniversityHeader
          pageTitle="University Dashboard"
          subTitle="Manage accepted active R&D projects, budget requirements, and industry partnerships."
          badgeText="Accepted Projects"
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        {/* Focused KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              onClick={() => navigate(kpi.path)}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold tracking-wide group-hover:text-slate-900 transition-colors">
                  {kpi.title}
                </span>
                <div className={`w-8 h-8 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                  {kpi.icon}
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-black text-slate-900">{kpi.value}</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${kpi.badgeColor}`}>
                  {kpi.badge}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Main Section: Only Active Projects Accepted by University */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {t('sec_accepted_projects', 'Active Projects Accepted by University')}
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                  {activeProjects.length} Active in Database
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('sec_accepted_projects_desc', 'Verified R&D initiatives accepted by academic faculty with live budget tracking, document vault, and lifecycle stages.')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/university/projects')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0c3b2e] hover:bg-[#072a20] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <span>{t('btn_manage_project', 'Open Project Hub →')}</span>
            </button>
          </div>

          {/* Active Projects Grid or Empty State */}
          {activeProjects.length === 0 ? (
            <div className="py-12 px-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900">{t('no_projects_title', 'No Active Accepted Projects Yet')}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                {t('no_projects_desc', 'Accepted university R&D initiatives will appear here with real-time budget tracking, document vaults, team management, and milestone updates.')}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/university/challenges')}
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {t('browse_challenges_btn', 'Explore Civic Challenges')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/university/projects')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  {t('tab_overview', 'Go to Project Hub')}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProjects.map((p) => (
                <article
                  key={p.id}
                  onClick={() => navigate(`/university/projects?id=${p.id}`)}
                  className="bg-slate-50/50 hover:bg-white rounded-xl p-5 border border-slate-200/90 hover:border-teal-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {p.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Stage: {p.stage || 'Prototype'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {t('badge_accepted', 'Accepted ✓')}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                      {p.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span>📍</span>
                      <span>{p.location || 'BIT Mesra · Jharkhand'}</span>
                    </p>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                      {p.description}
                    </p>

                    {/* Budget & Disbursed Info */}
                    <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/40 border border-emerald-100/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('total_budget_req', 'Total Budget Required')}</span>
                        <span className="font-black text-slate-900 text-sm">{p.total_budget || '₹0'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block">{t('disbursed_grant', 'Disbursed Grant')}</span>
                        <span className="font-bold text-emerald-800">{p.disbursed_amount || '₹0'}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-slate-500 font-semibold">{t('progress_lifecycle', 'Lifecycle Progress')}</span>
                        <span className="font-bold text-teal-700">{p.progress_percent || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${p.progress_percent || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Lead Faculty & Lab */}
                    <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                      <span className="truncate"><strong>Lead:</strong> {p.lead_faculty || 'Faculty Lead'}</span>
                      <span className="truncate text-[11px] text-slate-400">{p.industry_partner || 'State CSR'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Next: {p.next_stage || 'Field Pilot'}</span>
                    <span className="font-bold text-teal-700 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                      {t('btn_manage_project', 'Manage Project Hub →')}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Lower Grid: Pending Actions & Industry Collaborations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Pending Actions */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">{t('sec_pending_actions', 'Pending Actions')}</h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {pendingActions.length} {t('items_requiring_action', 'items requiring action')}
              </span>
            </div>

            {pendingActions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <div className="text-2xl mb-2">🎉</div>
                <p className="font-semibold text-slate-700">{t('all_caught_up', 'All caught up! No pending actions require attention.')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingActions.map((pa) => (
                  <div
                    key={pa.id}
                    onClick={pa.onClick}
                    className="px-5 py-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${pa.iconColor}`}>
                        {pa.icon}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-800 group-hover:text-slate-950 flex items-center gap-2">
                          <span>{pa.action}</span>
                          {pa.badge && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${pa.badgeClass}`}>
                              {pa.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{pa.ref}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="View action"
                      className="w-7 h-7 rounded-md text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Industry Partnerships Widget */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">{t('sec_industry_partners', 'Active Industry Partners')}</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/university/industry')}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 cursor-pointer"
              >
                {t('view_all_partners', 'View All Partners →')}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 border border-amber-200/70">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-slate-900">TechNova Solutions</div>
                  <div className="text-xs text-slate-500 mt-0.5">Assigned Partner · IoT &amp; Edge Deployment</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/80 shrink-0">
                  Active MOU
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                MOU executed for co-developing ultrasonic sensor firmware and LoRa telemetry gateway for PRJ-315.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">Committed CSR Grant: <strong>₹2,50,000</strong></span>
                <button
                  type="button"
                  onClick={() => navigate('/university/industry')}
                  className="font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
                >
                  Inspect Dossier →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
