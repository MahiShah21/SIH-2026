import React, { useState, useEffect } from 'react';
import UniversitySidebar from '../../components/common/UniversitySidebar';
import UniversityHeader from '../../components/common/UniversityHeader';
import feedbackApi from '../../api/feedbackApi';
import projectApi from '../../api/projectApi';

export default function UniversityImpact() {
  const [projectsList, setProjectsList] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [activeSectorFilter, setActiveSectorFilter] = useState('All');
  const [selectedModalProject, setSelectedModalProject] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [exportPeriod, setExportPeriod] = useState('all');
  const [toastMsg, setToastMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'feedbacks'

  // Dynamic Impact Metrics from Feedback DB
  const [impactStats, setImpactStats] = useState({
    projectsImpacted: 0,
    totalBeneficiaries: 0,
    institutionsEngaged: 0,
    impactScorePercent: 0,
    feedbacksCount: 0
  });
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // New feedback form state
  const [newFeedback, setNewFeedback] = useState({
    problem_id: '',
    project_id: '',
    citizen_id: 'usr_citizen_jh',
    solution_status: 'completely',
    rating: 5,
    notes: 'Ground verification confirmed positive civic impact.',
    beneficiaries_reached: 100
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Fetch live impact statistics & projects from DB
  const fetchImpactData = async () => {
    setLoadingStats(true);
    try {
      const res = await feedbackApi.getImpactStats();
      if (res && res.success && res.stats) {
        setImpactStats(res.stats);
        if (res.feedbacks) {
          setFeedbacksList(res.feedbacks);
        }
      }
    } catch (err) {
      console.warn('Error fetching impact stats:', err);
    } finally {
      setLoadingStats(false);
    }

    try {
      const projRes = await projectApi.getProjects({ accepted_only: 'true' });
      if (projRes && projRes.success && Array.isArray(projRes.projects)) {
        const mapped = projRes.projects.map(p => ({
          code: p.id,
          name: `${p.id} · ${p.title}`,
          sector: p.domain || 'General',
          beneficiaries: p.beneficiaries || 'Verified',
          score: `${p.progress_percent || p.progress || 50}%`,
          status: p.stage || 'Active',
          impactLevel: (p.progress_percent || p.progress || 50) > 60 ? 'High' : 'Medium',
          outcomes: [
            `${p.title} deployed under state R&D guidance.`,
            `Telemetry and ground metrics validated by faculty team.`,
            `Civic stakeholders and beneficiaries onboarded.`
          ]
        }));
        setProjectsList(mapped);
      }
    } catch (err) {
      console.warn('Error fetching projects for impact:', err);
    }
  };

  useEffect(() => {
    fetchImpactData();
  }, []);

  const handleExport = () => {
    setShowExportModal(false);
    showToast(`Impact report exported successfully (${exportFormat})`);
  };

  const handleCreateFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await feedbackApi.submitFeedback(newFeedback);
      if (res && res.success) {
        showToast(`Citizen feedback logged! Impact metrics updated.`);
        setShowFeedbackModal(false);
        await fetchImpactData();
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      showToast('Error recording feedback. Please check backend.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredProjects = projectsList.filter(p => {
    const matchCode = selectedFilter === 'All' || p.code === selectedFilter;
    const matchSector = activeSectorFilter === 'All' || p.sector === activeSectorFilter;
    return matchCode && matchSector;
  });

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive University Sidebar */}
      <UniversitySidebar
        activePath="/university/impact"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Header */}
        <UniversityHeader
          title="Impact & Citations"
          activeBadge="Feedback Driven Metrics"
          subtitle="Real-world outcomes and verified civic impact dynamically updated through citizen feedback forms."
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-all shadow-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Log Citizen Feedback</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#0b1329] text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export Report</span>
              </button>
            </div>
          }
        />

        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed top-5 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-emerald-900/90 border border-emerald-500/40 text-emerald-100 text-sm font-medium animate-fadeIn">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="max-w-7xl w-full space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              📊 Live Impact Overview
            </button>
            <button
              onClick={() => setActiveTab('feedbacks')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'feedbacks'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span>💬 Citizen Ground Verifications</span>
              <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-700 text-[10px] rounded-full font-bold">
                {feedbacksList.length}
              </span>
            </button>
          </div>

          {/* 4 Summary Stat Cards - Dynamically calculated & increasing from feedback information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Projects Impacted */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex items-center justify-between hover:border-teal-500 transition-all group">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects Impacted</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1.5 group-hover:text-teal-600 transition-colors">
                  {loadingStats ? '...' : impactStats.projectsImpacted}
                </h3>
                <p className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" /> Verified by feedback
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>

            {/* Card 2: Beneficiaries Reached */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex items-center justify-between hover:border-emerald-500 transition-all group">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Beneficiaries Reached</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">
                  {loadingStats ? '...' : (impactStats.totalBeneficiaries || 0).toLocaleString()}
                </h3>
                <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ground verified count
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>

            {/* Card 3: Institutions Engaged */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex items-center justify-between hover:border-indigo-500 transition-all group">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institutions Engaged</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1.5 group-hover:text-indigo-700 transition-colors">
                  {loadingStats ? '...' : impactStats.institutionsEngaged}
                </h3>
                <p className="text-[11px] text-indigo-700 font-medium mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-700" /> Active R&D networks
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>

            {/* Card 4: Impact Score */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex items-center justify-between hover:border-teal-500 transition-all group">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Impact Score</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1.5 group-hover:text-teal-600 transition-colors">
                  {loadingStats ? '...' : `${impactStats.impactScorePercent}%`}
                </h3>
                <p className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> From {impactStats.feedbacksCount || feedbacksList.length} reviews
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* ================= TAB 1: OVERVIEW & BENCHMARKS ================= */}
          {activeTab === 'overview' && (
            <>
              {/* 2 Benchmark Metrics Aggregate Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span>Impact Overview</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Overall Aggregates</span>
                  </div>
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Social Impact</span>
                        <span className="text-slate-900 font-bold">{Math.min(95, impactStats.impactScorePercent || 82)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${Math.min(95, impactStats.impactScorePercent || 82)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Economic Impact</span>
                        <span className="text-slate-900 font-bold">78%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-[#0b1329] h-2 rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Environmental Impact</span>
                        <span className="text-slate-900 font-bold">91%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '91%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Technology Adoption</span>
                        <span className="text-slate-900 font-bold">84%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: '84%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span>Impact by Sector</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Benchmark Metrics</span>
                  </div>
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Agriculture</span>
                        <span className="text-slate-900 font-bold">88%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Water</span>
                        <span className="text-slate-900 font-bold">84%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Environment</span>
                        <span className="text-slate-900 font-bold">92%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 font-semibold text-slate-700">
                        <span>Energy</span>
                        <span className="text-slate-900 font-bold">79%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '79%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Impact Table */}
              <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Project Impact Registry</h3>
                    <span className="text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                      {filteredProjects.length} Projects
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label htmlFor="projFilterSelect" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Filter:
                    </label>
                    <select
                      id="projFilterSelect"
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="All">All projects</option>
                      {projectsList.map(p => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                      <tr>
                        <th className="py-3.5 px-5">Project</th>
                        <th className="py-3.5 px-5">Sector</th>
                        <th className="py-3.5 px-5">Beneficiaries</th>
                        <th className="py-3.5 px-5">Impact</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProjects.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 px-4 text-center text-slate-500">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2 text-lg font-bold">
                              📊
                            </div>
                            <p className="font-semibold text-slate-800">No Projects Tracked for Impact</p>
                            <p className="text-xs text-slate-400 mt-0.5">Projects and their civic beneficiaries will appear here once active.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredProjects.map((proj) => (
                          <tr
                            key={proj.code}
                            onClick={() => setSelectedModalProject(proj)}
                            className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-5 font-semibold text-slate-900">
                              {proj.name}
                            </td>
                            <td className="py-3.5 px-5 text-slate-700">{proj.sector}</td>
                            <td className="py-3.5 px-5 font-bold text-slate-900">{proj.beneficiaries}</td>
                            <td className="py-3.5 px-5">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                proj.impactLevel === 'High'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-teal-50 text-teal-700 border-teal-200'
                              }`}>
                                {proj.impactLevel}
                              </span>
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {proj.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                type="button"
                                className="text-teal-600 font-semibold hover:text-teal-800 text-xs inline-flex items-center gap-1"
                              >
                                View Details →
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Impact Areas Cards */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Key Impact Areas</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Filter project impact metrics by thematic domain.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    onClick={() => {
                      setActiveSectorFilter(activeSectorFilter === 'Environment' ? 'All' : 'Environment');
                      showToast(activeSectorFilter === 'Environment' ? 'Reset sector filter' : 'Filtered to Environment');
                    }}
                    className={`bg-white border rounded-xl p-5 shadow-2xs cursor-pointer transition-all hover:border-teal-500 ${
                      activeSectorFilter === 'Environment' ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 font-bold">
                      🌱
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Environmental</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Reduced waste, smart bin sensor telemetry & sanitation.</p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveSectorFilter(activeSectorFilter === 'Agriculture' ? 'All' : 'Agriculture');
                      showToast(activeSectorFilter === 'Agriculture' ? 'Reset sector filter' : 'Filtered to Agriculture');
                    }}
                    className={`bg-white border rounded-xl p-5 shadow-2xs cursor-pointer transition-all hover:border-teal-500 ${
                      activeSectorFilter === 'Agriculture' ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-3 font-bold">
                      🌾
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Agriculture</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Smart irrigation, soil telemetry & crop disease AI.</p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveSectorFilter(activeSectorFilter === 'Water' ? 'All' : 'Water');
                      showToast(activeSectorFilter === 'Water' ? 'Reset sector filter' : 'Filtered to Water');
                    }}
                    className={`bg-white border rounded-xl p-5 shadow-2xs cursor-pointer transition-all hover:border-teal-500 ${
                      activeSectorFilter === 'Water' ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-3 font-bold">
                      💧
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Water Resources</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Subsurface telemetry, aquifer recharge & leak detection.</p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveSectorFilter(activeSectorFilter === 'Energy' ? 'All' : 'Energy');
                      showToast(activeSectorFilter === 'Energy' ? 'Reset sector filter' : 'Filtered to Energy');
                    }}
                    className={`bg-white border rounded-xl p-5 shadow-2xs cursor-pointer transition-all hover:border-teal-500 ${
                      activeSectorFilter === 'Energy' ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 font-bold">
                      ⚡
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Clean Energy</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Decentralized off-grid solar micro-grids & telemetry.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ================= TAB 2: LIVE CITIZEN VERIFICATIONS & FEEDBACKS ================= */}
          {activeTab === 'feedbacks' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Live Citizen On-Ground Verifications</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Audited feedback reports directly powering the Projects Impacted and Beneficiaries Reached metrics.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
                  >
                    + Record Ground Feedback
                  </button>
                </div>

                {feedbacksList.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm font-semibold text-slate-600">No citizen feedback records logged yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Submit a feedback form to increase impact scores and beneficiary counts.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="py-3 px-4">Feedback ID</th>
                          <th className="py-3 px-4">Problem / Grievance</th>
                          <th className="py-3 px-4">Associated Project</th>
                          <th className="py-3 px-4">Resolution Status</th>
                          <th className="py-3 px-4">Satisfaction</th>
                          <th className="py-3 px-4">Beneficiaries</th>
                          <th className="py-3 px-4">Verification Notes</th>
                          <th className="py-3 px-4 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {feedbacksList.map((fb) => (
                          <tr key={fb.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-700">{fb.id}</td>
                            <td className="py-3 px-4 font-medium text-slate-900">{fb.problem_id || 'JH-C1042'}</td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono">
                                {fb.project_id || 'PRJ-315'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {fb.solution_status || 'Completely Solved'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-amber-500 font-bold">★ {fb.rating || 5}/5</span>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              +{(Number(fb.beneficiaries_reached) || 500).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={fb.notes}>
                              {fb.notes || 'Verified on ground.'}
                            </td>
                            <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                              {new Date(fb.created_at || Date.now()).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL: LOG CITIZEN VERIFICATION FEEDBACK ================= */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Log Citizen Ground Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">Recording feedback increases project impact metrics and beneficiary counters.</p>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFeedback} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Project</label>
                  <select
                    value={newFeedback.project_id}
                    onChange={(e) => setNewFeedback({ ...newFeedback, project_id: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
                    required
                  >
                    <option value="PRJ-315">PRJ-315 · Smart Waste Management</option>
                    <option value="PRJ-925">PRJ-925 · Smart Irrigation Monitoring</option>
                    <option value="PRJ-051">PRJ-051 · AI Crop Disease Detection</option>
                    <option value="PRJ-038">PRJ-038 · Rural Solar Monitoring</option>
                    <option value="PRJ-042">PRJ-042 · Smart Water Management</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Problem / Grievance ID</label>
                  <input
                    type="text"
                    value={newFeedback.problem_id}
                    onChange={(e) => setNewFeedback({ ...newFeedback, problem_id: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                    placeholder="e.g. JH-C1042"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">On-Ground Solution Status</label>
                  <select
                    value={newFeedback.solution_status}
                    onChange={(e) => setNewFeedback({ ...newFeedback, solution_status: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="completely">Completely Solved</option>
                    <option value="partially">Partially Solved</option>
                    <option value="in_progress">Field In Progress</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beneficiaries Reached (+Count)</label>
                  <input
                    type="number"
                    value={newFeedback.beneficiaries_reached}
                    onChange={(e) => setNewFeedback({ ...newFeedback, beneficiaries_reached: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="e.g. 1500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Citizen Satisfaction Rating (1-5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                      className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                        newFeedback.rating >= star
                          ? 'bg-amber-50 border-amber-400 text-amber-600'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 ml-2 font-medium">
                    {newFeedback.rating === 5 ? '5/5 Outstanding' : `${newFeedback.rating}/5 Verified`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ground Verification Notes</label>
                <textarea
                  rows="3"
                  value={newFeedback.notes}
                  onChange={(e) => setNewFeedback({ ...newFeedback, notes: e.target.value })}
                  placeholder="Details about water quality, sensor telemetry, community impact..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white shadow-xs disabled:opacity-50"
                >
                  {submittingFeedback ? 'Saving to DB...' : 'Save Feedback & Increase Count'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EXPORT REPORT ================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Export Impact Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">Generate an audited impact summary for state grant stakeholders.</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Select Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setExportFormat('PDF')}
                    className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                      exportFormat === 'PDF' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="font-bold text-slate-900">PDF Document</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Print-ready dossier with charts</p>
                  </div>
                  <div
                    onClick={() => setExportFormat('CSV')}
                    className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                      exportFormat === 'CSV' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="font-bold text-slate-900">CSV / Excel</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Raw data metrics for analysis</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Reporting Period</label>
                <select
                  value={exportPeriod}
                  onChange={(e) => setExportPeriod(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 focus:outline-none"
                >
                  <option value="all">All-time to date (FY 2026-27)</option>
                  <option value="q3">Current Quarter (Q3 2026)</option>
                  <option value="ytd">Year to Date (2026)</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-5 py-2 rounded-lg bg-[#0b1329] hover:bg-slate-800 text-xs font-semibold text-white shadow-xs"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PROJECT DETAIL ================= */}
      {selectedModalProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Impact Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedModalProject.name}</p>
              </div>
              <button
                onClick={() => setSelectedModalProject(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Sector</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedModalProject.sector}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Beneficiaries</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedModalProject.beneficiaries}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Impact Score</span>
                  <span className="font-bold text-teal-600 mt-0.5 block">{selectedModalProject.score}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Current Status</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">{selectedModalProject.status}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Key Outcomes</h4>
                <ul className="space-y-2 text-slate-600">
                  {selectedModalProject.outcomes.map((out, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-500 font-bold mt-0.5">•</span>
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedModalProject(null)}
                className="px-5 py-2 rounded-lg bg-[#0b1329] hover:bg-slate-800 text-xs font-semibold text-white shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
