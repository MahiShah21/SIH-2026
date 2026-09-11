import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GovSidebar from '../../components/common/GovSidebar';
import problemApi from '../../api/problemApi';
import getSocket from '../../api/socket';

const DISTRICT_COORDS = {
  Dumka: { x: 500, y: 225 },
  Gumla: { x: 215, y: 360 },
  Latehar: { x: 210, y: 260 },
  Ranchi: { x: 300, y: 295 },
  Dhanbad: { x: 460, y: 245 },
  Hazaribagh: { x: 300, y: 235 },
  Simdega: { x: 235, y: 425 },
  'East Singhbhum': { x: 440, y: 375 },
  'West Singhbhum': { x: 370, y: 440 },
  Bokaro: { x: 400, y: 270 },
  Palamu: { x: 190, y: 210 },
  Garhwa: { x: 140, y: 180 },
  Deoghar: { x: 480, y: 190 },
  Giridih: { x: 420, y: 210 }
};

export default function ProblemsMapDashboard() {
  const navigate = useNavigate();

  const [problemsList, setProblemsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [district, setDistrict] = useState('All');
  const [block, setBlock] = useState('All');
  const [village, setVillage] = useState('All');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [dept, setDept] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [mapLayer, setMapLayer] = useState('markers'); // 'markers' | 'heatmap'
  const [showActiveProjects, setShowActiveProjects] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Selected Problem for Side Dossier
  const [selectedId, setSelectedId] = useState('');

  const normalizeProblem = (p) => {
    const dist = p.district || 'Ranchi';
    const baseCoords = DISTRICT_COORDS[dist] || { x: 300, y: 280 };
    // Small pseudo-random offset based on ID so markers don't overlap completely
    const hash = (p.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offsetX = (hash % 30) - 15;
    const offsetY = ((hash * 7) % 30) - 15;

    return {
      id: p.id || `JH-${Math.floor(1000 + Math.random() * 9000)}`,
      title: p.title || 'Civic Infrastructure Grievance',
      district: dist,
      block: p.block || 'Central Block',
      village: p.village || p.location || 'Rural Panchayat',
      category: p.category || 'Water & Sanitation',
      dept: p.department || (p.category?.includes('Water') ? 'Water Resources' : p.category?.includes('Agri') ? 'Agriculture' : 'Rural Dev'),
      priority: p.priority === 'urgent' || p.urgency || p.priority === 'Critical' ? 'High' : (p.priority || 'Medium'),
      status: p.status === 'APPROVED' ? 'In Pilot' : p.status === 'RESOLVED' ? 'Verified' : 'Under Review',
      affected: p.population || `${Math.floor(500 + Math.random() * 15000)} Residents`,
      affectedNum: parseInt(p.population) || 1200,
      date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
      coordinates: { x: baseCoords.x + offsetX, y: baseCoords.y + offsetY },
      description: p.description || 'Civic issue verified and registered on state portal.',
      aiUni: 'BIT Mesra / BAU Ranchi - Research Lab',
      aiSolution: 'Smart IoT Sensors & Telemetry Monitoring',
      aiConfidence: `${p.ai_confidence || 92}%`,
      aiSimilar: 'Similar regional clusters identified'
    };
  };

  const loadProblems = () => {
    problemApi.getProblems()
      .then(res => {
        if (res && Array.isArray(res.problems)) {
          const formatted = res.problems.map(normalizeProblem);
          setProblemsList(formatted);
          if (formatted.length > 0 && !selectedId) {
            setSelectedId(formatted[0].id);
          }
        } else {
          setProblemsList([]);
        }
      })
      .catch(err => {
        console.warn('Failed to load problems dynamically for map:', err);
        setProblemsList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProblems();

    const socket = getSocket();
    if (socket) {
      const handleSync = () => loadProblems();
      socket.on('problem_created', handleSync);
      socket.on('problem_updated', handleSync);

      return () => {
        socket.off('problem_created', handleSync);
        socket.off('problem_updated', handleSync);
      };
    }
  }, []);

  // Filtered dataset
  const filteredProblems = useMemo(() => {
    return problemsList.filter((item) => {
      const matchDistrict = district === 'All' || item.district.toLowerCase() === district.toLowerCase();
      const matchBlock = block === 'All' || item.block.toLowerCase() === block.toLowerCase();
      const matchVillage = village === 'All' || item.village.toLowerCase() === village.toLowerCase();
      const matchCategory = category === 'All' || item.category.toLowerCase().includes(category.toLowerCase());
      const matchPriority = priority === 'All' || item.priority.toLowerCase() === priority.toLowerCase();
      const matchStatus = status === 'All' || item.status.toLowerCase() === status.toLowerCase();
      const matchDept = dept === 'All' || item.dept.toLowerCase().includes(dept.toLowerCase());
      const matchSearch =
        search === '' ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.district.toLowerCase().includes(search.toLowerCase()) ||
        item.block.toLowerCase().includes(search.toLowerCase());

      return (
        matchDistrict &&
        matchBlock &&
        matchVillage &&
        matchCategory &&
        matchPriority &&
        matchStatus &&
        matchDept &&
        matchSearch
      );
    }).sort((a, b) => {
      if (sortBy === 'priority-desc') {
        const pOrder = { High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (sortBy === 'affected-desc') {
        return b.affectedNum - a.affectedNum;
      }
      return b.id.localeCompare(a.id);
    });
  }, [problemsList, district, block, village, category, priority, status, dept, search, sortBy]);

  // Active selected item
  const selectedProblem = useMemo(() => {
    return problemsList.find((p) => p.id === selectedId) || filteredProblems[0] || null;
  }, [selectedId, filteredProblems, problemsList]);

  // Reset Filters
  const handleResetFilters = () => {
    setDistrict('All');
    setBlock('All');
    setVillage('All');
    setCategory('All');
    setPriority('All');
    setStatus('All');
    setDept('All');
    setSearch('');
  };

  // KPI Calculations
  const totalCount = filteredProblems.length;
  const highPriorityCount = filteredProblems.filter((p) => p.priority === 'High').length;
  const pilotCount = filteredProblems.filter((p) => p.status === 'In Pilot').length;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex bg-slate-100 text-slate-800 antialiased font-sans">
      {/* 1. Consistent Shared Government Sidebar */}
      <GovSidebar
        activeNav="map"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 sticky top-0 z-20 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900">
                    Explore community challenges across Jharkhand
                  </h1>
                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                    Live GIS Sync
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500">Live GIS sync · 24 districts · priority review &amp; university match</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                  placeholder="Search ID, district, keyword..."
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center pl-3 border-l border-slate-200 text-right">
                <div className="mr-2.5 hidden md:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">Govt of Jharkhand</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Last sync: just now</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-900 text-emerald-100 flex items-center justify-center font-bold text-xs border border-emerald-700 shadow-xs">
                  JH
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filter Toolbar */}
        <section className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Administrative &amp; Thematic Filters
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            {/* District */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-md focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="All">District: All (24)</option>
                <option value="Dhanbad">Dhanbad</option>
                <option value="Gumla">Gumla</option>
                <option value="Latehar">Latehar</option>
                <option value="Ranchi">Ranchi</option>
                <option value="Simdega">Simdega</option>
                <option value="East Singhbhum">East Singhbhum</option>
                <option value="Hazaribagh">Hazaribagh</option>
                <option value="Dumka">Dumka</option>
              </select>
            </div>

            {/* Block */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Block</label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-md focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="All">Block: All</option>
                <option value="Nirsa">Nirsa</option>
                <option value="Chainpur">Chainpur</option>
                <option value="Manika">Manika</option>
                <option value="Namkum">Namkum</option>
                <option value="Kurdeg">Kurdeg</option>
                <option value="Potka">Potka</option>
                <option value="Ichak">Ichak</option>
                <option value="Daru">Daru</option>
              </select>
            </div>

            {/* Village */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Village / Ward</label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-md focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="All">Village: All</option>
                <option value="Maithon">Maithon</option>
                <option value="Daru">Daru</option>
                <option value="Kusumtoli">Kusumtoli</option>
                <option value="Sarjomda">Sarjomda</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-md focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="All">Category: All</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Agriculture & Rural">Agriculture &amp; Rural</option>
                <option value="Water Security">Water Security</option>
                <option value="Healthcare & Nutrition">Healthcare &amp; Nutrition</option>
                <option value="Forestry & Tribals">Forestry &amp; Tribals</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-md focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="All">Priority: All</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-md focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="All">Status: All</option>
                <option value="In Pilot">In Pilot</option>
                <option value="Verified">Verified</option>
                <option value="University Matched">Univ Matched</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Department</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-md focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="All">Dept: All</option>
                <option value="Energy Dept">Energy Dept (JBVNL)</option>
                <option value="Water Resources">Water Resources</option>
                <option value="Health Dept">Health Dept</option>
                <option value="Rural Dev">Rural Development</option>
                <option value="Forest Dept">Forest Dept</option>
              </select>
            </div>
          </div>
        </section>

        {/* Dashboard Content Viewport */}
        <div className="p-6 space-y-6 flex-1 flex flex-col">
          {/* KPI Summary Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Total */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm border border-emerald-100 font-bold">
                    👁️
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In View</span>
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCount}</span>
                  <span className="text-xs text-slate-500 font-medium">Recorded challenges</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  100% Geo-tagged
                </span>
              </div>
            </div>

            {/* Card 2: High Priority */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-sm border border-rose-100 font-bold">
                    ⚠️
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Priority</span>
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-rose-600 tracking-tight">{highPriorityCount}</span>
                  <span className="text-xs text-slate-500 font-medium">Critical intervention needed</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                  Avg Age: 12d
                </span>
              </div>
            </div>

            {/* Card 3: Active Pilots */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm border border-indigo-100 font-bold">
                    🧪
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pilots</span>
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">{pilotCount}</span>
                  <span className="text-xs text-slate-500 font-medium">University field prototypes</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                  BIT Sindri · IIT ISM
                </span>
              </div>
            </div>
          </section>

          {/* GIS Map & Selected Problem Detail Side-by-Side */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
            {/* Interactive SVG Map (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs relative overflow-hidden flex flex-col">
              {/* Map Top Overlay Bar */}
              <div className="absolute top-3 right-3 z-10 flex items-center space-x-2 bg-white/90 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-xs text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMapLayer('markers')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    mapLayer === 'markers'
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Markers
                </button>
                <button
                  type="button"
                  onClick={() => setMapLayer('heatmap')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    mapLayer === 'heatmap'
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Heatmap
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <label className="flex items-center space-x-1.5 text-[11px] text-slate-700 cursor-pointer pr-1">
                  <input
                    type="checkbox"
                    checked={showActiveProjects}
                    onChange={(e) => setShowActiveProjects(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 text-xs"
                  />
                  <span>Active Projects</span>
                </label>
              </div>

              {/* Map Canvas */}
              <div className="relative w-full h-[480px] flex items-center justify-center p-4 select-none overflow-hidden bg-slate-50/50">
                <svg
                  className="w-full h-full max-h-[480px] transition-transform duration-300 ease-out"
                  viewBox="0 0 700 520"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {/* Stylized Outline boundary of Jharkhand State */}
                  <path
                    className="drop-shadow-xs"
                    d="M 120,200 L 160,170 L 250,150 L 380,150 L 440,165 L 530,220 L 520,320 L 490,390 L 420,410 L 300,400 L 170,395 L 140,340 L 110,270 Z"
                    fill="#ecfdf5"
                    stroke="#059669"
                    strokeLinejoin="round"
                    strokeWidth="3"
                  />
                  {/* Internal district connecting regional lines */}
                  <path d="M 230,290 L 300,280 L 360,240 L 460,250" fill="none" stroke="#6ee7b7" strokeDasharray="4,4" strokeWidth="1.5" />
                  <path d="M 300,280 L 220,360 L 240,410" fill="none" stroke="#6ee7b7" strokeDasharray="4,4" strokeWidth="1.5" />
                  <path d="M 300,280 L 430,370" fill="none" stroke="#6ee7b7" strokeDasharray="4,4" strokeWidth="1.5" />

                  {/* District Hub Labels */}
                  <g className="district-nodes opacity-70 select-none pointer-events-none">
                    <text fill="#334155" fontSize="11" fontWeight="700" textAnchor="middle" x="300" y="295">Ranchi</text>
                    <text fill="#334155" fontSize="11" fontWeight="700" textAnchor="middle" x="460" y="245">Dhanbad</text>
                    <text fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle" x="210" y="260">Latehar</text>
                    <text fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle" x="215" y="360">Gumla</text>
                    <text fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle" x="235" y="425">Simdega</text>
                    <text fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle" x="440" y="375">East Singhbhum</text>
                    <text fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle" x="300" y="235">Hazaribagh</text>
                    <text fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle" x="500" y="225">Dumka</text>
                    <text fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle" x="380" y="265">Bokaro</text>
                  </g>

                  {/* Dynamic Interactive Problem Markers */}
                  {filteredProblems.map((prob) => {
                    const isSelected = prob.id === selectedProblem.id;
                    const fillColor =
                      prob.priority === 'High' ? '#ef4444' : prob.priority === 'Medium' ? '#f59e0b' : '#38bdf8';

                    return (
                      <g
                        key={prob.id}
                        onClick={() => setSelectedId(prob.id)}
                        className="cursor-pointer transition-transform duration-200 hover:scale-125"
                        transform={`translate(${prob.coordinates.x}, ${prob.coordinates.y})`}
                      >
                        {isSelected && (
                          <circle r="18" fill={fillColor} opacity="0.25" className="animate-ping" />
                        )}
                        <circle
                          r={isSelected ? '10' : '7'}
                          fill={fillColor}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="drop-shadow-md"
                        />
                        <text
                          y="-12"
                          textAnchor="middle"
                          fill={isSelected ? '#0f172a' : '#475569'}
                          fontSize={isSelected ? '10' : '8'}
                          fontWeight={isSelected ? 'bold' : '600'}
                          className="select-none pointer-events-none"
                        >
                          {prob.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Map Legend (Bottom-Left) */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 text-xs shadow-xs">
                  <p className="font-bold text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Priority &amp; Status</p>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                      <span className="text-slate-600">High Priority</span>
                      <span className="text-slate-400 font-semibold ml-auto pl-2">{highPriorityCount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      <span className="text-slate-600">Medium</span>
                      <span className="text-slate-400 font-semibold ml-auto pl-2">
                        {filteredProblems.filter((p) => p.priority === 'Medium').length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                      <span className="text-slate-600">Low</span>
                      <span className="text-slate-400 font-semibold ml-auto pl-2">
                        {filteredProblems.filter((p) => p.priority === 'Low').length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"></span>
                      <span className="text-slate-700 font-medium">Active Pilot</span>
                      <span className="text-emerald-700 font-semibold ml-auto pl-2">{pilotCount}</span>
                    </div>
                  </div>
                </div>

                {/* Zoom Controls (Bottom-Right) */}
                <div className="absolute bottom-3 right-3 flex flex-col space-y-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2))}
                    className="w-8 h-8 rounded-md bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold text-sm"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
                    className="w-8 h-8 rounded-md bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold text-sm"
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="w-8 h-8 rounded-md bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 text-xs font-bold"
                    title="Reset View"
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>

            {/* Right-Side Problem Dossier & AI Analysis (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full">
                {!selectedProblem ? (
                  <div className="p-12 text-center text-slate-400 space-y-3 my-auto">
                    <span className="text-3xl block">🗺️</span>
                    <p className="text-sm font-bold text-slate-700">No Problem Selected</p>
                    <p className="text-xs text-slate-500">Select a problem marker on the map or from the list below to view its GIS location, AI analysis, and citizen ground report.</p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="bg-[#064e3b] px-5 py-3.5 text-white flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">Problem ID</span>
                        <h3 className="text-lg font-black tracking-wide text-white">{selectedProblem.id}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-700/70 border border-emerald-400/40 text-emerald-100 font-semibold">
                          {selectedProblem.status}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {selectedProblem.title}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          📍 {selectedProblem.block} Block, {selectedProblem.district}
                        </span>
                        <span className={`inline-flex items-center font-semibold px-2.5 py-1 rounded-md border ${
                          selectedProblem.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : selectedProblem.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          {selectedProblem.priority} Priority
                        </span>
                        <span className="inline-flex items-center font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {selectedProblem.category}
                        </span>
                        <span className="inline-flex items-center font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                          {selectedProblem.dept}
                        </span>
                      </div>

                      {/* Demographics */}
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-md bg-emerald-100/60 text-emerald-800 flex items-center justify-center font-bold text-sm">
                            👥
                          </div>
                          <div>
                            <p className="text-slate-500 text-[11px]">Affected Community</p>
                            <p className="font-bold text-slate-800">{selectedProblem.affected}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 text-[11px]">Reported Date</p>
                          <p className="font-medium text-slate-700">{selectedProblem.date}</p>
                        </div>
                      </div>

                      {/* Ground Report */}
                      <div>
                        <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Citizen Ground Report</h5>
                        <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                          {selectedProblem.description}
                        </p>
                      </div>

                      {/* AI Recommendation & University Match Card */}
                      <div className="bg-gradient-to-br from-emerald-50/60 to-slate-50 border border-emerald-200 rounded-lg p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                            <span>✨ AI Triage &amp; Academic Match</span>
                          </div>
                          <span className="text-[10px] bg-emerald-200/60 text-emerald-900 font-semibold px-2 py-0.5 rounded">
                            {selectedProblem.aiConfidence} Confidence
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-xs">
                          <div className="flex items-start">
                            <span className="text-slate-500 w-28 shrink-0 text-[11px]">Matched University:</span>
                            <span className="font-semibold text-slate-800">{selectedProblem.aiUni}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-slate-500 w-28 shrink-0 text-[11px]">Pilot Solution:</span>
                            <span className="text-slate-800 font-medium">{selectedProblem.aiSolution}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-slate-500 w-28 shrink-0 text-[11px]">Similar Challenges:</span>
                            <span className="text-emerald-700 font-medium">{selectedProblem.aiSimilar}</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 italic pt-1 border-t border-emerald-100">
                          Disclaimer: AI-assisted triage and recommendation; Government officers hold final statutory approval.
                        </p>
                      </div>
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => navigate('/public/project-view')}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <span>📄 Full Dossier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/ai-review?id=${selectedProblem.id}`)}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Review in Detail →</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Problems List Data Table */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Header & Controls */}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <span>Problems in View</span>
                  <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {filteredProblems.length} matching
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Click "Review" on any row to open full AI analysis and verification details</p>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <label className="text-slate-500 font-medium">Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs py-1 px-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="priority-desc">Priority (High &gt; Low)</option>
                    <option value="affected-desc">Population Affected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredProblems.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <span className="text-3xl block">📍</span>
                  <p className="text-sm font-bold text-slate-700">No Problems in this Map View</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">No problem statements match the current district or search filters. Submit a new problem to see it mapped on GIS.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Problem ID</th>
                      <th className="py-3 px-4">Title &amp; Gram Panchayat</th>
                      <th className="py-3 px-4">District / Block</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Affected</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProblems.map((p) => {
                      const isSelected = selectedProblem && p.id === selectedProblem.id;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedId(p.id)}
                          className={`cursor-pointer transition-colors duration-150 ${
                            isSelected ? 'bg-emerald-50/80 font-medium text-slate-900 border-l-4 border-l-emerald-600' : 'hover:bg-slate-50/70'
                          }`}
                        >
                        <td className="py-3 px-4 font-mono font-bold text-emerald-900">{p.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 max-w-xs truncate">{p.title}</div>
                          <div className="text-[11px] text-slate-500">{p.village} Panchayat</div>
                        </td>
                        <td className="py-3 px-4">{p.district} · {p.block}</td>
                        <td className="py-3 px-4">{p.category}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                            p.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                          }`}>
                            {p.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{p.affected}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/ai-review?id=${p.id}`);
                            }}
                            title="Review problem in detail"
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-xs transition-all flex items-center gap-1 ml-auto"
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
            )}
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>Showing {filteredProblems.length} of {problemsList.length} entries</div>
              <div className="flex items-center space-x-1">
                <button className="px-2.5 py-1 border border-emerald-600 rounded bg-emerald-50 font-bold text-emerald-800">
                  1
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
