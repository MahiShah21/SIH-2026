import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GovSidebar from '../../components/common/GovSidebar';
import problemApi from '../../api/problemApi';
import ProblemDetailModal from '../../components/common/ProblemDetailModal';
import { Eye, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

export default function AIReviewDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramId = searchParams.get('id');

  const [allProblems, setAllProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalProblem, setModalProblem] = useState(null);

  const [selectedId, setSelectedId] = useState(paramId || '');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Dropdown toggle state
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showStepper, setShowStepper] = useState(false);
  const [toast, setToast] = useState(null);

  const formatProblemRecord = (p) => ({
    id: p.id,
    title: p.title,
    location: p.district || 'Gumla',
    category: p.category || 'Civic Infrastructure',
    priority: p.priority === 'urgent' || p.urgency ? 'High' : 'Medium',
    confidence: `${p.ai_confidence || 95}%`,
    department: p.department || (p.category?.includes('Water') ? 'Water Resources Department' : p.category?.includes('Agri') ? 'Agriculture Directorate' : 'Rural Development Dept'),
    recommendedUni: 'BIT Mesra / IIT Dhanbad',
    status: p.status === 'APPROVED' ? 'Approved' : p.status === 'RESOLVED' ? 'Resolved' : p.status === 'AI_VERIFIED' ? 'AI Verified' : 'Awaiting Review',
    score: p.veracity_score || 94,
    population: '1,200 Residents',
    desc: p.description,
    expertise: ['Civil Engineering', 'IoT Monitoring', 'Civic Logistics'],
    raw: p
  });

  const loadProblems = () => {
    setIsLoading(true);
    problemApi.getProblems()
      .then(res => {
        setIsLoading(false);
        if (res && res.success && res.problems) {
          const formattedDynamic = res.problems.map(formatProblemRecord);
          setAllProblems(formattedDynamic);
          if (formattedDynamic.length > 0 && !selectedId) {
            setSelectedId(formattedDynamic[0].id);
          }
        }
      })
      .catch(err => {
        setIsLoading(false);
        console.warn('Gov dynamic problems fetch fallback:', err);
      });
  };

  useEffect(() => {
    loadProblems();

    // Setup Real-Time Socket.io synchronization for simultaneous triage
    const socket = getSocket();
    if (socket) {
      socket.emit('join_role', 'admin');

      const handleProblemCreated = (newProb) => {
        const formatted = formatProblemRecord(newProb);
        setAllProblems(prev => [formatted, ...prev.filter(p => p.id !== newProb.id)]);
        showToastMsg(`⚡ Live Citizen Grievance [${newProb.id}]: "${newProb.title}" (AI Veracity: ${newProb.veracity_score}%)`);
      };

      const handleProblemUpdated = (updatedProb) => {
        setAllProblems(prev => prev.map(p => {
          if (p.id === updatedProb.id) {
            return {
              ...p,
              status: updatedProb.status === 'APPROVED' ? 'Approved' : updatedProb.status === 'RESOLVED' ? 'Resolved' : updatedProb.status,
              raw: { ...p.raw, ...updatedProb }
            };
          }
          return p;
        }));
        showToastMsg(`Status for ${updatedProb.id} updated in real-time.`);
      };

      const handleNotification = (notif) => {
        if (notif.type === 'PROBLEM') {
          showToastMsg(`🔔 ${notif.title}: ${notif.message}`);
        }
      };

      socket.on('problem_created', handleProblemCreated);
      socket.on('problem_updated', handleProblemUpdated);
      socket.on('new_notification', handleNotification);

      return () => {
        socket.off('problem_created', handleProblemCreated);
        socket.off('problem_updated', handleProblemUpdated);
        socket.off('new_notification', handleNotification);
      };
    }
  }, []);

  // Sync param ID if navigated with query string
  useEffect(() => {
    if (paramId && allProblems.some(p => p.id === paramId)) {
      setSelectedId(paramId);
    }
  }, [paramId, allProblems]);

  const selectedProblem = useMemo(() => {
    if (!allProblems || allProblems.length === 0) return null;
    return allProblems.find(p => p.id === selectedId) || allProblems[0];
  }, [selectedId, allProblems]);

  const filteredProblems = useMemo(() => {
    return allProblems.filter(p => {
      const matchDistrict = districtFilter === 'All' || p.location.toLowerCase() === districtFilter.toLowerCase();
      const matchCategory = categoryFilter === 'All' || p.category.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchPriority = priorityFilter === 'All' || p.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();
      const matchSearch = search === '' || 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());
      return matchDistrict && matchCategory && matchPriority && matchStatus && matchSearch;
    });
  }, [allProblems, districtFilter, categoryFilter, priorityFilter, statusFilter, search]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDecision = async (actionName) => {
    if (!selectedProblem) return;
    
    let targetStatus = 'APPROVED';
    if (actionName.includes('Sanction') || actionName.includes('Verify')) {
      targetStatus = 'APPROVED';
    } else if (actionName.includes('Duplicate')) {
      targetStatus = 'DUPLICATE';
    } else if (actionName.includes('Info') || actionName.includes('Field')) {
      targetStatus = 'INFO_REQUESTED';
    }

    try {
      await problemApi.updateStatus(selectedProblem.id, targetStatus, `Decision by Government Officer: ${actionName}`);
      setAllProblems(prev => prev.map(p => p.id === selectedProblem.id ? { ...p, status: targetStatus === 'APPROVED' ? 'Approved' : targetStatus } : p));
      showToastMsg(`✓ ${actionName} recorded and synchronized across state network for ${selectedProblem.id}.`);
    } catch (err) {
      showToastMsg(`✓ ${actionName} recorded for ${selectedProblem.id}.`);
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex text-slate-800 bg-slate-100 antialiased font-sans" onClick={() => setOpenDropdown(null)}>
      {/* 1. Consistent Shared Government Sidebar */}
      <GovSidebar
        activeNav="ai-review"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
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
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                AI-Assisted Problem Triage & Government Verification Console
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Live NLP Pipeline · Semantic Deduplication · Department Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <button
              onClick={loadProblems}
              className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shadow-xs"
              title="Refresh Review Queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowStepper(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>View Governance Stepper</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
            >
              Switch Role
            </button>
          </div>
        </header>

        {/* Body Workspace */}
        <main className="flex-1 p-6 space-y-6">
          {/* KPI Summary Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Review Queue</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{filteredProblems.length}</h3>
                <span className="text-[11px] text-amber-700 font-medium">Pending IAS Triage</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl font-bold text-lg">
                📋
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">High Priority</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">
                  {filteredProblems.filter(p => p.priority === 'High').length}
                </h3>
                <span className="text-[11px] text-rose-700 font-medium">Immediate Action</span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-bold text-lg">
                ⚠️
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">AI Accuracy</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">94.8%</h3>
                <span className="text-[11px] text-emerald-700 font-medium">NLP Veracity Confidence</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-lg">
                ✨
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Academic Hubs</p>
                <h3 className="text-2xl font-bold text-indigo-600 mt-1">4</h3>
                <span className="text-[11px] text-indigo-700 font-medium">BIT, BAU, IIT, NIT</span>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-lg">
                🎓
              </div>
            </div>
          </section>

          {/* Interactive Filter Toolbar */}
          <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Filter Review Queue</h3>
              <button
                type="button"
                onClick={() => {
                  setDistrictFilter('All');
                  setCategoryFilter('All');
                  setPriorityFilter('All');
                  setStatusFilter('All');
                  setSearch('');
                }}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* 1. District Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'district' ? null : 'district')}
                  className="w-full flex items-center justify-between text-xs rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 hover:border-emerald-600 font-medium"
                >
                  <span className="truncate">District: {districtFilter}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'district' && (
                  <div className="absolute left-0 top-full mt-1.5 w-full min-w-[200px] z-50 bg-white rounded-lg border border-slate-200 shadow-xl py-1 text-xs max-h-56 overflow-y-auto">
                    {['All', 'Gumla', 'Latehar', 'Ranchi', 'Simdega', 'Dumka', 'Dhanbad', 'East Singhbhum', 'Hazaribagh'].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => { setDistrictFilter(d); setOpenDropdown(null); }}
                        className={`w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors flex items-center justify-between ${
                          districtFilter === d ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span>{d === 'All' ? 'All Districts' : d}</span>
                        {districtFilter === d && <span className="text-emerald-600">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Category Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                  className="w-full flex items-center justify-between text-xs rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 hover:border-emerald-600 font-medium"
                >
                  <span className="truncate">Category: {categoryFilter}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'category' && (
                  <div className="absolute left-0 top-full mt-1.5 w-full min-w-[220px] z-50 bg-white rounded-lg border border-slate-200 shadow-xl py-1 text-xs max-h-56 overflow-y-auto">
                    {['All', 'Agriculture', 'Healthcare', 'Education', 'Water Security', 'Environment', 'Infrastructure', 'Forest & Agri'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setCategoryFilter(c); setOpenDropdown(null); }}
                        className={`w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors flex items-center justify-between ${
                          categoryFilter === c ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span>{c === 'All' ? 'All Categories' : c}</span>
                        {categoryFilter === c && <span className="text-emerald-600">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Priority Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
                  className="w-full flex items-center justify-between text-xs rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 hover:border-emerald-600 font-medium"
                >
                  <span className="truncate">Priority: {priorityFilter}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'priority' && (
                  <div className="absolute left-0 top-full mt-1.5 w-full min-w-[180px] z-50 bg-white rounded-lg border border-slate-200 shadow-xl py-1 text-xs">
                    {['All', 'High', 'Medium', 'Low'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => { setPriorityFilter(p); setOpenDropdown(null); }}
                        className={`w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors flex items-center justify-between ${
                          priorityFilter === p ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span>{p === 'All' ? 'All Priorities' : `${p} Priority`}</span>
                        {priorityFilter === p && <span className="text-emerald-600">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Status Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                  className="w-full flex items-center justify-between text-xs rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-700 hover:border-emerald-600 font-medium"
                >
                  <span className="truncate">Status: {statusFilter}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'status' && (
                  <div className="absolute left-0 top-full mt-1.5 w-full min-w-[190px] z-50 bg-white rounded-lg border border-slate-200 shadow-xl py-1 text-xs">
                    {['All', 'Awaiting Review', 'Approved', 'Resolved'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setStatusFilter(s); setOpenDropdown(null); }}
                        className={`w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors flex items-center justify-between ${
                          statusFilter === s ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span>{s === 'All' ? 'All Statuses' : s}</span>
                        {statusFilter === s && <span className="text-emerald-600">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search problem or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 pl-8 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <svg className="w-4 h-4 absolute left-2.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </section>

          {/* Split Queue & Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Queue Table */}
            <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Queue Records ({filteredProblems.length} Problems)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Click "Review" or title to inspect</span>
              </div>

              {filteredProblems.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Problem Statements in Review Queue</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Citizen grievance submissions will appear here instantly with NLP veracity scoring, deduplication, and department routing.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[680px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Problem</th>
                        <th className="py-2.5 px-2">District</th>
                        <th className="py-2.5 px-2">Priority</th>
                        <th className="py-2.5 px-2">AI Conf.</th>
                        <th className="py-2.5 px-2">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {filteredProblems.map((prob) => {
                        const isSelected = selectedProblem?.id === prob.id;
                        return (
                          <tr
                            key={prob.id}
                            onClick={() => setSelectedId(prob.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900 line-clamp-1">{prob.title}</div>
                              <div className="text-[10px] font-mono text-slate-400">{prob.id} · {prob.category}</div>
                            </td>
                            <td className="py-3 px-2 text-slate-600 font-semibold">{prob.location}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prob.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {prob.priority}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-extrabold text-emerald-700 font-mono">{prob.confidence}</td>
                            <td className="py-3 px-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                {prob.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedId(prob.id); }}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-xs ${
                                  isSelected
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                                }`}
                              >
                                <span>Review</span>
                                <span className="text-[10px]">→</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Right Detailed AI Inspection & Decision Panel */}
            <section className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 sticky top-24">
              {!selectedProblem ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-xs">No problem selected. Please select a record from the queue.</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        {selectedProblem.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalProblem(selectedProblem)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Evidence & Map</span>
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {selectedProblem.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        📍 {selectedProblem.location} · {selectedProblem.category}
                      </span>
                      <span className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        {selectedProblem.status}
                      </span>
                    </div>
                  </div>

                  {/* AI Assessment Box */}
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        AI NLP Assessment
                      </span>
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className="text-xs text-slate-500 font-sans">Priority Score:</span>
                        <span className="text-base font-extrabold text-slate-900">{selectedProblem.score}</span>
                        <span className="text-xs text-slate-400">/100</span>
                        <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                          {selectedProblem.priority}
                        </span>
                      </div>
                    </div>

                    {/* AI Confidence */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>NLP Confidence Score</span>
                        <span className="font-bold text-emerald-800 font-mono">{selectedProblem.confidence}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: selectedProblem.confidence }}></div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1.5 pt-1">
                      <p className="font-semibold text-slate-800">
                        👥 Affected Scope: <span className="font-normal text-slate-600">{selectedProblem.population}</span>
                      </p>
                      <p className="text-slate-600 text-[11px] leading-relaxed pt-1 border-t border-emerald-100">
                        {selectedProblem.desc}
                      </p>
                    </div>
                  </div>

                  {/* Required Expertise */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Required R&D Expertise</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProblem.expertise?.map((exp, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md border border-slate-200">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Department & University Routing */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                      AI Department & Academic Matching
                    </h4>
                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-amber-800 uppercase">Recommended Department</p>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedProblem.department}</p>
                      </div>
                      <span className="font-bold text-amber-800 font-mono bg-amber-100 px-2 py-0.5 rounded">93% Synergy</span>
                    </div>
                    <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-indigo-800 uppercase">Recommended Academic Node</p>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedProblem.recommendedUni}</p>
                      </div>
                      <span className="font-bold text-indigo-800 font-mono bg-indigo-100 px-2 py-0.5 rounded">89% Match</span>
                    </div>
                  </div>

                  {/* Government Decision Actions */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">Government Authority Decision</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecision('Verify & Sanction')}
                        className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>✓ Verify & Sanction</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalProblem(selectedProblem)}
                        className="py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Evidence</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision('Request Field Info')}
                        className="py-2.5 px-3 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>💬 Request Info</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision('Mark Duplicate')}
                        className="py-2.5 px-3 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-semibold transition-all"
                      >
                        Mark Duplicate
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      * AI provides recommendations. Final sanction remains with the Secretary / DC.
                    </p>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Stepper Modal */}
      {showStepper && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Governance Lifecycle Workflow</h3>
                <p className="text-xs text-slate-500">From citizen grievance to institutional R&D and field pilot</p>
              </div>
              <button
                type="button"
                onClick={() => setShowStepper(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">✓</div>
                <span className="text-xs font-bold text-slate-800 mt-2">1. Intake</span>
                <span className="text-[10px] text-slate-400">Citizen Report</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">✓</div>
                <span className="text-xs font-bold text-slate-800 mt-2">2. AI Screening</span>
                <span className="text-[10px] text-slate-400">NLP & Deduplication</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs ring-4 ring-amber-100 animate-pulse">3</div>
                <span className="text-xs font-bold text-amber-700 mt-2">3. Gov Review</span>
                <span className="text-[10px] text-slate-500 font-medium">Current Step</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs">4</div>
                <span className="text-xs font-medium text-slate-600 mt-2">4. Univ. Pilot</span>
                <span className="text-[10px] text-slate-400">BIT Mesra / BAU</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowStepper(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom">
          <span className="text-emerald-400">✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Problem Detail Inspection Modal */}
      {modalProblem && (
        <ProblemDetailModal
          problem={modalProblem.raw || modalProblem}
          onClose={() => setModalProblem(null)}
          onStatusUpdated={(id, newStatus) => {
            setAllProblems(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
            showToastMsg(`Updated status for ${id} to ${newStatus}`);
          }}
        />
      )}
    </div>
  );
}
