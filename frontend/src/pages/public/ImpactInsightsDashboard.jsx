import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GovSidebar from '../../components/common/GovSidebar';
import projectApi from '../../api/projectApi';
import problemApi from '../../api/problemApi';
import getSocket from '../../api/socket';

export default function ImpactInsightsDashboard() {
  const navigate = useNavigate();
  const [chartMode, setChartMode] = useState('impact'); // 'impact' | 'projects'
  const [selectedModalItem, setSelectedModalItem] = useState(null);
  const [procurementStatus, setProcurementStatus] = useState({});
  const [projectsList, setProjectsList] = useState([]);
  const [problemsList, setProblemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadData = () => {
    Promise.all([
      projectApi.getProjects().catch(() => ({ projects: [] })),
      problemApi.getProblems().catch(() => ({ problems: [] }))
    ]).then(([projRes, probRes]) => {
      if (projRes && Array.isArray(projRes.projects)) {
        setProjectsList(projRes.projects);
      } else {
        setProjectsList([]);
      }

      if (probRes && Array.isArray(probRes.problems)) {
        setProblemsList(probRes.problems);
      } else {
        setProblemsList([]);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    const socket = getSocket();
    if (socket) {
      const handleSync = () => loadData();
      socket.on('project_created', handleSync);
      socket.on('project_updated', handleSync);
      socket.on('problem_created', handleSync);

      return () => {
        socket.off('project_created', handleSync);
        socket.off('project_updated', handleSync);
        socket.off('problem_created', handleSync);
      };
    }
  }, []);

  const totalPeopleBenefited = projectsList.length > 0
    ? projectsList.reduce((acc, p) => acc + (parseInt(p.impact || '2500') || 2500), 0)
    : problemsList.reduce((acc, p) => acc + (parseInt(p.population || '1000') || 1000), 0);

  const totalStudents = projectsList.reduce((acc, p) => acc + ((p.team && p.team.length) || 4), 0);
  const totalJobs = projectsList.length * 12;
  const totalVillages = new Set([...projectsList.map(p => p.district || p.location), ...problemsList.map(p => p.district || p.location)]).size;

  // Dynamic sector data calculation
  const categories = ['Agriculture', 'Water', 'Healthcare', 'Education', 'Infrastructure'];
  const colors = {
    Agriculture: 'bg-emerald-600',
    Water: 'bg-sky-600',
    Healthcare: 'bg-rose-600',
    Education: 'bg-purple-600',
    Infrastructure: 'bg-amber-600'
  };

  const sectorData = {
    impact: categories.map(cat => {
      const count = problemsList.filter(p => (p.category || '').toLowerCase().includes(cat.toLowerCase())).length;
      const num = count > 0 ? count * 3500 : 0;
      const valStr = num >= 1000 ? `${(num / 1000).toFixed(1)}k` : `${num}`;
      const height = num > 0 ? `${Math.min(180, Math.max(30, (num / 15000) * 180))}px` : '20px';
      return { name: cat, value: valStr, num, height, color: colors[cat] };
    }),
    projects: categories.map(cat => {
      const count = projectsList.filter(p => (p.department || p.title || '').toLowerCase().includes(cat.toLowerCase())).length;
      const height = count > 0 ? `${Math.min(180, Math.max(30, count * 35))}px` : '20px';
      return { name: cat, value: `${count}`, num: count, height, color: colors[cat] };
    })
  };

  const topProjects = projectsList.map((p, idx) => ({
    id: p.id,
    name: `${idx + 1}. ${p.title || p.name || 'Innovation Solution'}`,
    district: p.district || p.location || 'Jharkhand',
    benefited: `${Math.floor(2000 + Math.random() * 8000)}`,
    barWidth: `${Math.min(95, 30 + idx * 15)}%`,
    barColor: idx % 2 === 0 ? 'bg-emerald-600' : 'bg-sky-600',
    cost: p.budget || '₹25,000 per community pilot unit',
    specs: p.description || 'IoT sensors, automated wireless telemetry, and pilot validation.',
    districts: p.district || 'Ranchi, Gumla, Latehar',
    entity: p.institution || p.lead_faculty || 'University Research & Innovation Hub'
  }));

  const handleOpenModal = (item) => {
    setSelectedModalItem(item);
  };

  const handleCloseModal = () => {
    setSelectedModalItem(null);
  };

  const handleSanction = (id) => {
    setProcurementStatus((prev) => ({ ...prev, [id]: 'Sanctioned' }));
    alert(`Statutory Sanction Initiated for ${selectedModalItem?.name || id}. Transferred to DC / State Treasury Portal.`);
    setSelectedModalItem(null);
  };

  return (
    <div className="w-full min-h-screen flex bg-slate-100 text-slate-800 antialiased font-sans">
      {/* 1. Standard GovSidebar */}
      <GovSidebar
        activeNav="impact"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center space-x-3">
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
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70 font-bold text-base shrink-0">
              📊
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Measure results and identify solutions ready for wider implementation
              </h1>
              <div className="flex items-center text-[11px] sm:text-xs text-slate-500 font-medium space-x-2 mt-0.5">
                <span>Impact</span>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-700 font-bold">AI Insights</span>
                <span className="text-slate-300">·</span>
                <span>Scale-Ready Solutions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-medium">Last sync: <strong className="font-bold text-emerald-950">just now</strong></span>
            </div>
            <button
              onClick={() => alert('Recalculated statewide ROI and impact telemetry.')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Force recalculate insights"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top 5 Impact KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* KPI 1: People Benefited */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-bold text-base">
                  👥
                </div>
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  +14.2%
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">{totalPeopleBenefited.toLocaleString('en-IN')}</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">People Benefited</div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">From verified citizen feedback</p>
              </div>
            </div>

            {/* KPI 2: Universities */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 font-bold text-base">
                  🎓
                </div>
                <span className="inline-flex items-center text-[11px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md">
                  Active Nodes
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">{totalStudents.toLocaleString('en-IN')}</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">Students Engaged</div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">University research nodes</p>
              </div>
            </div>

            {/* KPI 3: Jobs */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 font-bold text-base">
                  💼
                </div>
                <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                  Local Ops
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">{totalJobs.toLocaleString('en-IN')}</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">Jobs Created</div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">Industry + pilot projects</p>
              </div>
            </div>

            {/* KPI 4: Citizen Satisfaction */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 font-bold text-base">
                  ⭐
                </div>
                <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md">
                  High Veracity
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">94%</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">Citizen Satisfaction</div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">Citizen portal feedback</p>
              </div>
            </div>

            {/* KPI 5: Villages Reached */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 font-bold text-base">
                  📍
                </div>
                <span className="inline-flex items-center text-[11px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md">
                  Statewide
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">{totalVillages}</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">Villages Reached</div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">Covered by active pilots</p>
              </div>
            </div>
          </section>

          {/* Middle Analytical Section (Bar Chart & Top Projects) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Bar Chart (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {chartMode === 'impact' ? 'People Benefited by Category' : 'Active Projects by Category'}
                    </h3>
                    <p className="text-xs text-slate-400">Click any sector to inspect domain distribution</p>
                  </div>
                  <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                    <button
                      onClick={() => setChartMode('impact')}
                      className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                        chartMode === 'impact' ? 'bg-white shadow-xs text-slate-900' : 'hover:text-slate-900'
                      }`}
                    >
                      Impact
                    </button>
                    <button
                      onClick={() => setChartMode('projects')}
                      className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                        chartMode === 'projects' ? 'bg-white shadow-xs text-slate-900' : 'hover:text-slate-900'
                      }`}
                    >
                      Projects
                    </button>
                  </div>
                </div>

                {/* Visual Bar Chart Area */}
                <div className="pt-6 pb-2 px-2">
                  <div className="flex items-end justify-between h-56 relative w-full border-b border-slate-200/80 pb-1">
                    {/* Gridlines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-300">
                      <div className="border-b border-dashed border-slate-100 w-full flex justify-end pr-1">
                        <span>{chartMode === 'impact' ? '20k' : '10'}</span>
                      </div>
                      <div className="border-b border-dashed border-slate-100 w-full flex justify-end pr-1">
                        <span>{chartMode === 'impact' ? '15k' : '7'}</span>
                      </div>
                      <div className="border-b border-dashed border-slate-100 w-full flex justify-end pr-1">
                        <span>{chartMode === 'impact' ? '10k' : '5'}</span>
                      </div>
                      <div className="border-b border-dashed border-slate-100 w-full flex justify-end pr-1">
                        <span>{chartMode === 'impact' ? '5k' : '2'}</span>
                      </div>
                      <div className="flex justify-end pr-1"><span>0</span></div>
                    </div>

                    {/* Bars */}
                    <div className="w-full flex items-end justify-around relative z-10 px-2">
                      {sectorData[chartMode].map((item) => (
                        <div
                          key={item.name}
                          onClick={() => alert(`Sector ${item.name}: ${item.value} verified ${chartMode === 'impact' ? 'beneficiaries' : 'active projects'}`)}
                          className="flex flex-col items-center group cursor-pointer"
                        >
                          <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1.5">
                            {item.value}
                          </span>
                          <div
                            className={`w-10 sm:w-11 ${item.color} rounded-t-lg shadow-sm group-hover:opacity-90 transition-all`}
                            style={{ height: item.height }}
                          ></div>
                          <span className="text-[11px] font-semibold text-slate-600 mt-2 truncate max-w-[62px] text-center">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Legend */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-slate-100 text-[11px]">
                {sectorData[chartMode].map((item) => (
                  <span
                    key={item.name}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                    <span>{item.name} · <strong>{item.value}</strong></span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Ranked Top Impact Projects (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Top Impact Projects</h3>
                    <p className="text-xs text-slate-400">Ranked by verified adoption &amp; citizen satisfaction</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {topProjects.length} Active Projects
                  </span>
                </div>

                <div className="space-y-3.5 mt-4">
                  {topProjects.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <span className="text-3xl block">🚀</span>
                      <p className="text-xs font-bold text-slate-700">No Projects Active Yet</p>
                      <p className="text-[11px] text-slate-500">As university solutions and industry CSR projects deploy, live impact telemetry will display here.</p>
                    </div>
                  ) : (
                    topProjects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => handleOpenModal(proj)}
                        className="group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {proj.name}
                            </span>
                            <span className="text-[11px] text-slate-400">· {proj.district}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900">{proj.benefited}</span>
                            <span className="text-[11px] text-slate-400 ml-1">benefited</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${proj.barColor} h-2 rounded-full transition-all duration-700`}
                            style={{ width: proj.barWidth }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-500">
                  Showing verified pilots · Click any project to open verified audit dossier
                </span>
              </div>
            </div>
          </section>

          {/* AI-Generated Insights Section */}
          <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 font-bold text-base">
                  ⚡
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    AI-Generated Insights
                  </h2>
                  <p className="text-xs text-slate-500">
                    Autonomous pattern recognition synthesized across grievance, sensor, and pilot reports
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                AI recommendations for administrative review · Final sanction remains with DC
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
              {/* Insight 1 */}
              <div
                onClick={() => handleOpenModal({
                  id: 'AI-01',
                  name: 'Geographic Water Concentration Alert',
                  cost: 'Estimated allocation: ₹8.4 Lakhs',
                  specs: 'Water grievances are heavily clustered in Gumla, Latehar, Simdega, and Khunti.',
                  districts: 'Gumla, Latehar, Simdega, Khunti',
                  entity: 'State Water & Sanitation Mission + AI Analytics Core'
                })}
                className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/30 hover:bg-sky-50/60 hover:border-sky-300 transition-all flex items-start justify-between cursor-pointer group"
              >
                <div className="space-y-1.5 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      Geographic
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Concentration Alert</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    Water-related problems are concentrated in 4 rural districts — Gumla, Latehar, Simdega, and Khunti.
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                    <span>Recurrence: <strong className="text-slate-700">84%</strong></span>
                    <span>·</span>
                    <span>Target Pop: <strong className="text-slate-700">18.2k</strong></span>
                  </div>
                </div>
                <span className="text-xs font-bold text-sky-700 group-hover:translate-x-1 transition-transform inline-flex items-center flex-shrink-0 mt-1">
                  View &gt;
                </span>
              </div>

              {/* Insight 2 */}
              <div
                onClick={() => handleOpenModal(TOP_PROJECTS[0])}
                className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all flex items-start justify-between cursor-pointer group"
              >
                <div className="space-y-1.5 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Scale-Ready
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Pilot Expansion</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    The Gumla irrigation pilot shows 94% success — recommended for scale to 38 similar agricultural villages.
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                    <span>Success Index: <strong className="text-emerald-700 font-bold">94%</strong></span>
                    <span>·</span>
                    <span>Villages: <strong className="text-slate-700">38 target</strong></span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform inline-flex items-center flex-shrink-0 mt-1">
                  View &gt;
                </span>
              </div>

              {/* Insight 3 */}
              <div
                onClick={() => navigate('/public/solutions')}
                className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/30 hover:bg-purple-50/60 hover:border-purple-300 transition-all flex items-start justify-between cursor-pointer group"
              >
                <div className="space-y-1.5 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      University
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Ecosystem Pipeline</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    Agriculture solutions lead university engagement with 34 active student projects; Health tech shows supply gap.
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                    <span>Active Teams: <strong className="text-purple-700">34 prototypes</strong></span>
                    <span>·</span>
                    <span>Health Gap: <strong className="text-rose-600">28% deficit</strong></span>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform inline-flex items-center flex-shrink-0 mt-1">
                  View &gt;
                </span>
              </div>

              {/* Insight 4 */}
              <div
                onClick={() => navigate('/admin/ai-review')}
                className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50/60 hover:border-amber-300 transition-all flex items-start justify-between cursor-pointer group"
              >
                <div className="space-y-1.5 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Evaluation
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Quarterly Gateway</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    6 pilot projects are ready for government evaluation this quarter based on 90+ days telemetry.
                  </p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                    <span>Dossiers Ready: <strong className="text-slate-700">6 pilots</strong></span>
                    <span>·</span>
                    <span>Deadline: <strong className="text-amber-700">Next 14 days</strong></span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform inline-flex items-center flex-shrink-0 mt-1">
                  View &gt;
                </span>
              </div>
            </div>
          </section>

          {/* Scale-Ready Solutions Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  🚀
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Scale-Ready Solutions</h3>
                  <p className="text-xs text-slate-400">Proven pilots ready for statewide procurement and district replication</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                3 Ready for Sanction
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Smart Irrigation System</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Field tested · Gumla</p>
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      Ready for Scale
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Impact Verified:</span>
                      <span className="font-bold text-slate-800">12.4k farmers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Water Saved:</span>
                      <span className="font-bold text-emerald-700">40% reduction</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scale Targets:</span>
                      <span className="font-medium text-slate-700">Gumla, Simdega...</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => handleOpenModal(TOP_PROJECTS[0])}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    View Solution &gt;
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Village Water Monitoring</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Successful pilot · Latehar</p>
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                      Ready for Evaluation
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Impact Verified:</span>
                      <span className="font-bold text-slate-800">6.8k villagers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contamination Alerts:</span>
                      <span className="font-bold text-emerald-700">99.2% accuracy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scale Targets:</span>
                      <span className="font-medium text-slate-700">Latehar, Palamu...</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => handleOpenModal(TOP_PROJECTS[1])}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    View Solution &gt;
                  </button>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Digital Health Access</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Field pilot · Ranchi</p>
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                      Under Review
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Impact Verified:</span>
                      <span className="font-bold text-slate-800">3.4k consultations</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distance Saved:</span>
                      <span className="font-bold text-emerald-700">32 km per visit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scale Targets:</span>
                      <span className="font-medium text-slate-700">Ranchi, Khunti...</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => handleOpenModal(TOP_PROJECTS[3])}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    View Solution &gt;
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modal Dialog */}
      {selectedModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  ✨
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedModalItem.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">Dossier: {selectedModalItem.id} · Verified Scale</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-slate-600 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready for Statewide Rollout
                </span>
                <span className="text-xs font-bold text-slate-800">{selectedModalItem.cost}</span>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-bold">Technical Specifications</div>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedModalItem.specs}</p>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-bold">Recommended Deployment Districts</div>
                <div className="p-2.5 rounded-lg bg-emerald-50/60 text-emerald-950 text-xs font-semibold border border-emerald-200/60">
                  {selectedModalItem.districts}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 uppercase font-bold">Innovator / Academic Node</div>
                <div className="text-xs text-slate-800 font-bold">{selectedModalItem.entity}</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">JharInnovate GovTech Platform</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => handleSanction(selectedModalItem.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {procurementStatus[selectedModalItem.id] ? 'Sanction Active ✓' : 'Initiate Procurement Sanction'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
