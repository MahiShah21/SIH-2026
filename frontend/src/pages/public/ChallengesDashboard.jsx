import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GovSidebar from '../../components/common/GovSidebar';
import problemApi from '../../api/problemApi';
import projectApi from '../../api/projectApi';
import getSocket from '../../api/socket';

export default function ChallengesDashboard() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('30d'); // '30d' | 'quarter' | 'fy'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [challengesList, setChallengesList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const normalizeChallenge = (p) => ({
    id: p.id || `JH-${Math.floor(1000 + Math.random() * 9000)}`,
    title: p.title || 'Civic Infrastructure Challenge',
    district: p.district || p.location || 'Jharkhand',
    category: p.category || 'Water & Sanitation',
    sdg: p.category?.includes('Water') ? 'SDG 6 · Clean Water' : p.category?.includes('Agri') ? 'SDG 2 · Zero Hunger' : p.category?.includes('Health') ? 'SDG 3 · Good Health' : 'SDG 11 · Sustainable Cities',
    priority: p.priority === 'urgent' || p.urgency || p.priority === 'Critical' ? 'Critical' : p.priority === 'High' ? 'High' : 'Medium',
    affected: p.population || `${Math.floor(500 + Math.random() * 15000)} Citizens`,
    partner: p.partner || p.assigned_node || 'State Academic Innovation Node',
    status: p.status === 'APPROVED' ? 'Active Project' : p.status === 'RESOLVED' ? 'Implemented' : p.status === 'AI_VERIFIED' ? 'In Pilot' : 'Awaiting Review',
    score: p.veracity_score || p.score || 88
  });

  const loadData = () => {
    Promise.all([
      problemApi.getProblems().catch(() => ({ problems: [] })),
      projectApi.getProjects().catch(() => ({ projects: [] }))
    ]).then(([probRes, projRes]) => {
      if (probRes && Array.isArray(probRes.problems)) {
        setChallengesList(probRes.problems.map(normalizeChallenge));
      } else {
        setChallengesList([]);
      }

      if (projRes && Array.isArray(projRes.projects)) {
        setProjectsList(projRes.projects);
      } else {
        setProjectsList([]);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    const socket = getSocket();
    if (socket) {
      const handleSync = () => loadData();
      socket.on('problem_created', handleSync);
      socket.on('problem_updated', handleSync);
      socket.on('project_created', handleSync);

      return () => {
        socket.off('problem_created', handleSync);
        socket.off('problem_updated', handleSync);
        socket.off('project_created', handleSync);
      };
    }
  }, []);

  const totalCount = challengesList.length;
  const highPriCount = challengesList.filter(c => c.priority === 'Critical' || c.priority === 'High').length;
  const activeCount = challengesList.filter(c => c.status === 'Active Project').length;
  const pilotCount = challengesList.filter(c => c.status === 'In Pilot').length;
  const implementedCount = challengesList.filter(c => c.status === 'Implemented').length;
  const reviewCount = challengesList.filter(c => c.status === 'Awaiting Review').length;

  const currentMetrics = {
    label: timeFilter === '30d' ? 'Last 30 Days' : timeFilter === 'quarter' ? 'Current Quarter' : 'FY 2026-27',
    total: totalCount,
    highPri: highPriCount,
    active: activeCount,
    pilot: pilotCount,
    implemented: implementedCount,
    review: reviewCount,
    changeText: totalCount > 0 ? `${totalCount} active verified challenges` : 'Fresh state start'
  };

  const filteredChallenges = useMemo(() => {
    return challengesList.filter(c => {
      const matchCat = selectedCategory === 'all' || c.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchSearch = search === '' ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.district.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [challengesList, selectedCategory, search]);

  return (
    <div className="w-full min-h-screen flex bg-slate-100 text-slate-800 antialiased font-sans">
      {/* 1. Standard Government Sidebar */}
      <GovSidebar
        activeNav="overview"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Jharkhand Societal Challenges
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live State Portal
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Statewide overview across 24 districts · Real-time innovation pipeline</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-64 hidden sm:block">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search challenges, districts..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => navigate('/admin/ai-review')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>AI Triage Queue</span>
              <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-mono text-[10px]">18</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
            >
              Switch Role
            </button>
          </div>
        </header>

        {/* Dashboard Main Body */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Time Range Filter Bar (Interactive) */}
          <section className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setTimeFilter('30d')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  timeFilter === '30d'
                    ? 'bg-[#064e3b] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {timeFilter === '30d' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                <span>Last 30 Days · 412</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeFilter('quarter')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  timeFilter === 'quarter'
                    ? 'bg-[#064e3b] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {timeFilter === 'quarter' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                <span>Quarter · 1,186</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeFilter('fy')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  timeFilter === 'fy'
                    ? 'bg-[#064e3b] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {timeFilter === 'fy' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                <span>FY 2024-25 · 2,486</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Showing metrics for: <strong>{currentMetrics.label}</strong> ({currentMetrics.changeText})</span>
            </div>
          </section>

          {/* KPI Metrics Cards Grid */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Card 1 */}
            <div
              onClick={() => setSelectedCategory('all')}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow hover:border-emerald-400 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs">📊</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Live</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{currentMetrics.total}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Total Problems</div>
              <div className="text-[10px] text-slate-400 mt-1">{currentMetrics.changeText}</div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => navigate('/admin/ai-review')}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow hover:border-rose-400 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs">⚡</span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">Urgent</span>
              </div>
              <div className="text-2xl font-black text-rose-600 tracking-tight">{currentMetrics.highPri}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">High Priority</div>
              <div className="text-[10px] text-rose-600 font-semibold mt-1">Immediate Triage →</div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => navigate('/public/solutions')}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow hover:border-cyan-400 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600 font-bold text-xs">🚀</span>
                <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">Active</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{currentMetrics.active}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Active Projects</div>
              <div className="text-[10px] text-cyan-700 font-medium mt-1">24 Districts</div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => navigate('/public/solutions')}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow hover:border-amber-400 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 font-bold text-xs">🧪</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Trials</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{currentMetrics.pilot}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">In Pilot</div>
              <div className="text-[10px] text-amber-700 font-medium mt-1">Field Validations</div>
            </div>

            {/* Card 5 */}
            <div
              onClick={() => navigate('/public/impact')}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow hover:border-emerald-400 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs">✅</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Scaled</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{currentMetrics.implemented}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Implemented</div>
              <div className="text-[10px] text-emerald-700 font-medium mt-1">Impact Verified</div>
            </div>

            {/* Card 6 */}
            <div
              onClick={() => navigate('/admin/ai-review')}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow hover:border-purple-400 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs">📋</span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Queue</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{currentMetrics.review}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Awaiting Review</div>
              <div className="text-[10px] text-purple-700 font-semibold mt-1">Open Queue →</div>
            </div>
          </section>

          {/* Attention Required Section & District Hotspots */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Attention Required Card (Left 6 Cols) */}
            <section className="lg:col-span-6 bg-rose-50/70 rounded-2xl p-5 border border-rose-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <h2 className="text-base font-bold text-rose-950">Attention Required</h2>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                  4 Items Pending
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Item 1 */}
                <div className="bg-white p-3.5 rounded-xl border border-rose-100 flex items-center justify-between gap-3 shadow-xs hover:border-rose-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      ⚠️
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Overdue high-priority issues</h3>
                      <p className="text-[11px] text-slate-500">14 items · 6 districts</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/ai-review')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-xs shrink-0"
                  >
                    Triage &gt;
                  </button>
                </div>

                {/* Item 2 */}
                <div className="bg-white p-3.5 rounded-xl border border-rose-100 flex items-center justify-between gap-3 shadow-xs hover:border-rose-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                      💬
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Panchayat clarifications pending</h3>
                      <p className="text-[11px] text-slate-500">9 requests awaiting response</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/ai-review')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-amber-100 hover:bg-amber-200 transition-all shadow-xs shrink-0"
                  >
                    Triage &gt;
                  </button>
                </div>

                {/* Item 3 */}
                <div className="bg-white p-3.5 rounded-xl border border-rose-100 flex items-center justify-between gap-3 shadow-xs hover:border-rose-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">
                      🚩
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Milestone delivery alerts</h3>
                      <p className="text-[11px] text-slate-500">5 academic projects due for verification</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/public/project-view')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 transition-all shadow-xs shrink-0"
                  >
                    Triage &gt;
                  </button>
                </div>

                {/* Item 4 */}
                <div className="bg-white p-3.5 rounded-xl border border-rose-100 flex items-center justify-between gap-3 shadow-xs hover:border-rose-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                      🧪
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Ready pilot evaluations</h3>
                      <p className="text-[11px] text-slate-500">3 field pilots await formal DC sign-off</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/ai-review')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 transition-all shadow-xs shrink-0"
                  >
                    Triage &gt;
                  </button>
                </div>
              </div>
            </section>

            {/* District Hotspots & Pipeline (Right 6 Cols) */}
            <section className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">District Severity Hotspots</h2>
                  <p className="text-xs text-slate-500">Top critical grievance clusters mapped across state</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/public/map')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <span>Explore GIS Map</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Dumka (Water & Metal Contamination)</span>
                    <span className="text-rose-600 font-bold">Critical (89/100)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Gumla (Irrigation Shortage)</span>
                    <span className="text-amber-600 font-bold">High (87/100)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Latehar (PHC Cold Chain & Vaccines)</span>
                    <span className="text-rose-600 font-bold">Critical (92/100)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Ranchi (School Solar Deficit)</span>
                    <span className="text-blue-600 font-bold">Medium (76/100)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="text-slate-500">Next statewide review: <strong>15 Sept 2026</strong></span>
                <span className="text-emerald-700 font-bold">Accelerated Track</span>
              </div>
            </section>
          </div>

          {/* Active Challenges Catalog Cards */}
          <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Priority State Challenges Catalog</h2>
                <p className="text-xs text-slate-500">Browse verified civic problem statements open for solutions</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {['all', 'Water', 'Agriculture', 'Healthcare', 'Education'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Domains' : cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredChallenges.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <span className="text-3xl block">📋</span>
                <p className="text-sm font-bold text-slate-700">No Challenges Found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">No societal problem challenges match the current filter. As citizens and district collectors log grievances, they will dynamically populate here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredChallenges.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {c.id}
                          </span>
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {c.sdg}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{c.title}</h3>
                      </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                      c.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {c.priority}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>📍 <strong>District:</strong> {c.district} · {c.category}</p>
                    <p>👥 <strong>Affected:</strong> {c.affected}</p>
                    <p>🎓 <strong>Assigned Node:</strong> {c.partner}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Status: {c.status}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/public/project-view')}
                        className="text-xs font-bold text-emerald-700 hover:underline"
                      >
                        View Project →
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/ai-review?id=${c.id}`)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Review Problem →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  </div>
);
}
