import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GovSidebar from '../../components/common/GovSidebar';
import projectApi from '../../api/projectApi';
import getSocket from '../../api/socket';

const LIFECYCLE_STAGES = [
  'Problem',
  'Review',
  'University Matched',
  'Solution',
  'Prototype',
  'Field Pilot',
  'Implementation'
];

export default function SolutionsProjectsDashboard() {
  const navigate = useNavigate();

  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('All');
  const [uniFilter, setUniFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const normalizeProject = (p) => ({
    id: p.id,
    title: p.title || p.name || 'Societal Innovation Project',
    problemId: p.problem_id || p.problemId || 'JH-PROB',
    problemTitle: p.problem_title || p.problemTitle || p.title || 'Civic Infrastructure Challenge',
    university: p.institution || p.university || 'State Academic Innovation Cell',
    department: p.department || 'Water Resources & Civic Systems',
    industry: p.partner || p.industry || 'Industry CSR Partner',
    stage: p.stage || p.lifecycle_stage || 'Field Pilot',
    status: p.status || 'On Track',
    progress: p.progress || 50,
    location: p.location || p.district || 'Jharkhand',
    mentor: {
      name: p.lead_faculty || (p.mentor && p.mentor.name) || 'Lead Faculty Investigator',
      dept: p.department || (p.mentor && p.mentor.dept) || 'Engineering Research',
      initials: 'PI'
    },
    students: p.students || [
      { name: 'Research Team', role: 'Innovation Engineer', initial: 'R' }
    ],
    milestone: p.milestone || 'Field pilot testbed operational',
    expectedImpact: p.expectedImpact || p.impact || 'Statewide civic benefit',
    industryDetail: p.industryDetail || 'Academic Consortium & CSR Co-Funded'
  });

  const loadProjects = () => {
    projectApi.getProjects()
      .then(res => {
        if (res && Array.isArray(res.projects)) {
          const formatted = res.projects.map(normalizeProject);
          setProjectsData(formatted);
          if (formatted.length > 0 && !selectedProjectId) {
            setSelectedProjectId(formatted[0].id);
          }
        } else {
          setProjectsData([]);
        }
      })
      .catch(err => {
        console.warn('Failed to load projects dynamically:', err);
        setProjectsData([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();

    const socket = getSocket();
    if (socket) {
      const handleSync = () => loadProjects();
      socket.on('project_created', handleSync);
      socket.on('project_updated', handleSync);

      return () => {
        socket.off('project_created', handleSync);
        socket.off('project_updated', handleSync);
      };
    }
  }, []);

  const filteredProjects = useMemo(() => {
    return projectsData.filter((p) => {
      const matchDept = deptFilter === 'All' || p.department.toLowerCase().includes(deptFilter.toLowerCase());
      const matchUni = uniFilter === 'All' || p.university.toLowerCase() === uniFilter.toLowerCase();
      const matchStage = stageFilter === 'All' || p.stage.toLowerCase() === stageFilter.toLowerCase();
      const matchStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();
      return matchDept && matchUni && matchStage && matchStatus;
    });
  }, [projectsData, deptFilter, uniFilter, stageFilter, statusFilter]);

  const activeProject = useMemo(() => {
    return projectsData.find((p) => p.id === selectedProjectId) || filteredProjects[0] || null;
  }, [selectedProjectId, filteredProjects, projectsData]);

  const handleResetFilters = () => {
    setDeptFilter('All');
    setUniFilter('All');
    setStageFilter('All');
    setStatusFilter('All');
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex bg-slate-100 text-slate-800 antialiased font-sans">
      {/* 1. Standard GovSidebar */}
      <GovSidebar
        activeNav="solutions"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-sm sticky top-0 z-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start md:items-center space-x-3">
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
              <span className="relative flex h-3 w-3 mt-1 md:mt-0 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <h1 className="text-sm md:text-base font-bold text-slate-900">
                  Track departments, universities, industry partners and solution progress
                </h1>
                <p className="text-[11px] text-slate-500 font-medium flex flex-wrap items-center gap-1 mt-0.5">
                  <span>Verified Problem</span>
                  <span className="text-slate-400">→</span>
                  <span>University Solution</span>
                  <span className="text-slate-400">→</span>
                  <span>Industry Support</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-emerald-700 font-bold">Pilot</span>
                  <span className="text-slate-400">→</span>
                  <span>Implementation</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 self-end md:self-auto">
              <span>Last sync: <strong className="font-semibold text-slate-800">just now</strong></span>
              <button
                onClick={() => alert('Project data synchronized with University Nodes.')}
                className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition"
                title="Refresh sync data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="p-5 md:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
          {/* KPI Metrics */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 font-bold text-lg">
                📁
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">147</div>
                <div className="text-xs font-semibold text-slate-500">Active Projects</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 font-bold text-lg">
                🎓
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">82</div>
                <div className="text-xs font-semibold text-slate-500">University Teams</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 font-bold text-lg">
                🏢
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">34</div>
                <div className="text-xs font-semibold text-slate-500">Industry Partners</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 font-bold text-lg">
                🧪
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">42</div>
                <div className="text-xs font-semibold text-slate-500">In Pilot</div>
              </div>
            </div>
          </section>

          {/* Filtering Controls */}
          <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">Filter Projects</span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline flex items-center space-x-1"
              >
                <span>Reset filters</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Department */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Department</label>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-200 text-slate-700 py-2 focus:border-emerald-500 focus:ring-emerald-500 bg-slate-50/50"
                >
                  <option value="All">All Departments</option>
                  <option value="Water Resources">Water Resources</option>
                  <option value="Drinking Water">Drinking Water</option>
                  <option value="Health">Health</option>
                  <option value="Forest">Forest</option>
                  <option value="Education">Education</option>
                  <option value="Agriculture">Agriculture</option>
                </select>
              </div>

              {/* University */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">University</label>
                <select
                  value={uniFilter}
                  onChange={(e) => setUniFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-200 text-slate-700 py-2 focus:border-emerald-500 focus:ring-emerald-500 bg-slate-50/50"
                >
                  <option value="All">All Universities</option>
                  <option value="BIT Mesra">BIT Mesra</option>
                  <option value="BIT Sindri">BIT Sindri</option>
                  <option value="AIIMS Ranchi">AIIMS Ranchi</option>
                  <option value="NIT Jamshedpur">NIT Jamshedpur</option>
                  <option value="IIT Ranchi">IIT Ranchi</option>
                </select>
              </div>

              {/* Stage */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Stage</label>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-200 text-slate-700 py-2 focus:border-emerald-500 focus:ring-emerald-500 bg-slate-50/50"
                >
                  <option value="All">All Stages</option>
                  <option value="Field Pilot">Field Pilot</option>
                  <option value="Prototype">Prototype</option>
                  <option value="University Matched">University Matched</option>
                  <option value="Implementation">Implementation</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-xs rounded-lg border-slate-200 text-slate-700 py-2 focus:border-emerald-500 focus:ring-emerald-500 bg-slate-50/50"
                >
                  <option value="All">All Statuses</option>
                  <option value="On Track">On Track</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </section>

          {/* Main Two-Column Workspace */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Column: Projects Table (7 cols) */}
            <div className="xl:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">State Solution Registry</h2>
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredProjects.length} of {projectsData.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                {filteredProjects.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <span className="text-3xl block">🚀</span>
                    <p className="text-sm font-bold text-slate-700">No Solutions Registered</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">No university innovation projects found for the selected criteria. When universities propose solutions to verified challenges, they will appear here.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
                    <thead className="bg-slate-50/70 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      <tr>
                        <th className="py-3 px-4">PROJECT</th>
                        <th className="py-3 px-4">PROBLEM</th>
                        <th className="py-3 px-4">UNIVERSITY</th>
                        <th className="py-3 px-4">DEPARTMENT</th>
                        <th className="py-3 px-4">INDUSTRY</th>
                        <th className="py-3 px-4">STAGE</th>
                        <th className="py-3 px-4">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProjects.map((p) => {
                        const isSelected = activeProject && p.id === activeProject.id;
                        return (
                          <tr
                            key={p.id}
                            onClick={() => setSelectedProjectId(p.id)}
                            className={`cursor-pointer transition-colors duration-150 ${
                              isSelected
                                ? 'bg-emerald-50/80 font-medium text-slate-900 border-l-4 border-l-emerald-600'
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              <div>{p.title}</div>
                              <span className="text-[10px] text-slate-400 font-mono font-normal">{p.id}</span>
                            </td>
                            <td className="py-3 px-4 max-w-[160px] text-slate-600 truncate" title={p.problemTitle}>
                              {p.problemTitle}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">{p.university}</td>
                            <td className="py-3 px-4 text-slate-600">{p.department}</td>
                            <td className="py-3 px-4 text-slate-600">{p.industry}</td>
                            <td className="py-3 px-4 font-medium text-slate-700">{p.stage}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === 'On Track' ? 'bg-emerald-100 text-emerald-800' :
                                p.status === 'Delayed' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right Column: Detailed Project Dossier (5 cols) */}
            <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              {!activeProject ? (
                <div className="py-16 text-center text-slate-400 space-y-3">
                  <span className="text-3xl block">📋</span>
                  <p className="text-sm font-bold text-slate-700">No Project Selected</p>
                  <p className="text-xs text-slate-500">Select a project from the registry to view its lifecycle milestones, mentor info, and impact metrics.</p>
                </div>
              ) : (
                <>
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wide uppercase">
                        {activeProject.id} · {activeProject.university}
                      </span>
                      <button
                        onClick={() => navigate('/public/project-view')}
                        className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Open Full Dossier →
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{activeProject.title}</h3>
                    <div className="flex items-center space-x-2.5 mt-2">
                      <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${
                        activeProject.status === 'On Track' ? 'bg-emerald-100 text-emerald-800' :
                        activeProject.status === 'Delayed' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activeProject.status}
                      </span>
                      <div className="flex items-center text-xs text-slate-500">
                        <span>📍 {activeProject.location}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                        <span>Project Progress</span>
                        <span className="font-bold text-emerald-700">{activeProject.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${activeProject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Solution Flow Box */}
                  <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1.5 border border-slate-100">
                    <div className="font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">Solution Flow</div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Problem:</span>
                      <span className="font-semibold text-slate-700 text-right max-w-[240px] truncate">
                        {activeProject.problemId} - {activeProject.problemTitle}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">University:</span>
                      <span className="font-semibold text-slate-700">{activeProject.university}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Industry:</span>
                      <span className="font-semibold text-slate-700">{activeProject.industry}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Stage:</span>
                      <span className="font-bold text-emerald-700">{activeProject.stage}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Pilot Site:</span>
                      <span className="font-semibold text-slate-700">{activeProject.location}</span>
                    </div>
                  </div>

                  {/* Project Lifecycle Stepper */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Project Lifecycle</h4>
                    <div className="space-y-1.5 text-xs">
                      {LIFECYCLE_STAGES.map((stg, idx) => {
                        const currentIndex = LIFECYCLE_STAGES.indexOf(activeProject.stage);
                        const isPassed = idx < currentIndex;
                        const isCurrent = idx === currentIndex;

                        return (
                          <div key={stg} className="flex items-center justify-between py-0.5">
                            <div className="flex items-center space-x-2.5">
                              {isPassed ? (
                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">
                                  ✓
                                </span>
                              ) : isCurrent ? (
                                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">
                                  ●
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px]">
                                  ○
                                </span>
                              )}
                              <span className={`text-xs ${isCurrent ? 'font-bold text-slate-900' : isPassed ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                {stg}
                              </span>
                            </div>
                            {isCurrent && (
                              <span className="text-[9px] font-bold tracking-wider uppercase bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">
                                CURRENT
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mentor */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <span>🎓 Faculty Mentor</span>
                    </h4>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {activeProject.mentor?.initials || 'PI'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{activeProject.mentor?.name || 'Faculty Lead'}</p>
                        <p className="text-[11px] text-slate-500">{activeProject.mentor?.dept || 'Engineering'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Student Team */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <span>👥 Student Team</span>
                      <span className="text-[10px] text-slate-400 font-normal">• {activeProject.students?.length || 0} members</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(activeProject.students || []).map((st) => (
                        <div key={st.name} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center text-center">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center mb-1">
                            {st.initial || 'S'}
                          </div>
                          <span className="font-bold text-slate-800 text-[11px]">{st.name}</span>
                          <span className="text-[10px] text-slate-400">{st.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Impact Box */}
                  <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        🎯
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Key Milestone</div>
                        <div className="text-slate-700 text-[11px] font-medium">{activeProject.milestone}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 rounded bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 text-[10px]">
                        📈
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Expected Impact</div>
                        <div className="text-slate-700 text-[11px] font-medium">{activeProject.expectedImpact}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Balanced Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Departments */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Departments Distribution</h3>
                <span className="text-xs text-slate-400 font-medium">Click to filter</span>
              </div>
              <div className="space-y-3.5">
                {[
                  { name: 'Water Resources', count: 38, pct: '82%' },
                  { name: 'Agriculture', count: 42, pct: '92%' },
                  { name: 'Health', count: 27, pct: '58%' },
                  { name: 'Education', count: 21, pct: '45%' }
                ].map((d) => (
                  <div
                    key={d.name}
                    onClick={() => setDeptFilter(d.name)}
                    className="group cursor-pointer"
                  >
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1 group-hover:text-emerald-700">
                      <span>{d.name}</span>
                      <span className="font-bold text-slate-800">{d.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full group-hover:bg-emerald-500 transition-all" style={{ width: d.pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Universities */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Universities &amp; Institutions</h3>
                <span className="text-xs text-slate-400 font-medium">Click to filter</span>
              </div>
              <div className="space-y-3.5">
                {[
                  { name: 'BIT Mesra', count: 34, pct: '90%' },
                  { name: 'NIT Jamshedpur', count: 18, pct: '52%' },
                  { name: 'IIT Ranchi', count: 14, pct: '40%' },
                  { name: 'AIIMS Ranchi', count: 10, pct: '28%' }
                ].map((u) => (
                  <div
                    key={u.name}
                    onClick={() => setUniFilter(u.name)}
                    className="group cursor-pointer"
                  >
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1 group-hover:text-amber-600">
                      <span>{u.name}</span>
                      <span className="font-bold text-slate-800">{u.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full group-hover:bg-amber-400 transition-all" style={{ width: u.pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
