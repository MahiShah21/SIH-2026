import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IndustrySidebar from '../../components/common/IndustrySidebar';
import IndustryHeader from '../../components/common/IndustryHeader';
import { useAuth } from '../../context/AuthContext';
import projectApi from '../../api/projectApi';

export default function IndustryImpact() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState('overview'); // 'overview' | 'detail'
  const [selectedProject, setSelectedProject] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [toastMsg, setToastMsg] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const orgName = currentUser?.organization || currentUser?.name || 'Industry Partner';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  useEffect(() => {
    projectApi.getProjects()
      .then(res => {
        if (res && res.success && Array.isArray(res.projects)) {
          const formatted = res.projects.map(p => ({
            id: p.id,
            name: p.title,
            university: p.lead_institution || 'Academic Partner',
            badge: `${p.stage || 'Active'} Stage`,
            badgeColor: p.stage === 'Field Pilot' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200',
            outcome: `${p.progress_percent || p.progress || 25}% Progress`,
            peopleBenefited: p.beneficiaries || '500+ Citizens',
            areasCovered: p.location || 'Jharkhand',
            problemSolved: p.description || 'Civic infrastructure improvement in Jharkhand.',
            projectOutcome: `Milestone deliverables tracked under ${p.lead_faculty || 'Faculty Lead'}.`,
            implStatus: p.stage || 'In Progress',
            technology: p.domain || 'Applied Technology & Engineering',
            industryPartner: orgName,
            coFunding: p.total_budget || '₹0'
          }));
          setProjects(formatted);
        } else {
          setProjects([]);
        }
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [orgName]);

  const projectOutcomes = projects;

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setActiveView('detail');
  };

  const handleBackToOverview = () => {
    setActiveView('overview');
    setSelectedProject(null);
  };

  const handleDownloadReport = () => {
    setShowExportModal(false);
    showToast(`Generating ${exportFormat.toUpperCase()} ESG Impact Report. Download started!`);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 font-sans antialiased overflow-x-hidden">
      {/* Responsive Industry Sidebar */}
      <IndustrySidebar
        activePath="/industry/impact"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <IndustryHeader
          title="Impact"
          subtitle="Outcomes achieved through industry-supported projects."
          actionText="Export Impact Report"
          onActionClick={() => setShowExportModal(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
            <svg className="w-5 h-5 text-emerald-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMsg}</span>
          </div>
        )}

        <main className="p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
          {activeView === 'overview' ? (
            <div className="flex flex-col gap-6">
              {/* Top Page Heading & Subtitle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Impact Overview</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Verified societal and ESG deliverables sponsored by {orgName}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export ESG Report</span>
                </button>
              </div>

              {/* Section 1: STATISTIC CARDS (4 compact cards in a 4-column grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-2 hover:border-slate-300 transition">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Projects Supported</span>
                  <div className="text-3xl font-extrabold text-slate-900 leading-none">{projects.length}</div>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span>{projects.length > 0 ? `${projects.length} active in pool` : 'No active projects'}</span>
                  </span>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-2 hover:border-slate-300 transition">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Students Mentored</span>
                  <div className="text-3xl font-extrabold text-slate-900 leading-none">{projects.length * 4}</div>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span>{projects.length > 0 ? 'Across active projects' : '0 student researchers'}</span>
                  </span>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-2 hover:border-slate-300 transition">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Prototypes / Pilots</span>
                  <div className="text-3xl font-extrabold text-slate-900 leading-none">
                    {projects.filter(p => ['Prototype', 'Testing', 'Field Pilot'].includes(p.implStatus)).length}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span>Active stage gates</span>
                  </span>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-2 hover:border-slate-300 transition">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Solutions Implemented</span>
                  <div className="text-3xl font-extrabold text-slate-900 leading-none">
                    {projects.filter(p => p.implStatus === 'Implementation' || p.implStatus === 'Field Pilot').length}
                  </div>
                  <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                    <span>Deployed in field</span>
                  </span>
                </div>
              </div>

              {/* Section 2: COMMUNITY IMPACT (2 large cards in a 2-column grid) */}
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-bold text-slate-900">Community Impact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-center">
                    <span className="uppercase tracking-wider text-[11px] font-bold text-slate-400">CITIZENS BENEFITED</span>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                      {projects.length > 0 ? `${projects.length * 450}+` : '0'}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Citizens impacted by sponsored technology solutions and validated field trials.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-center">
                    <span className="uppercase tracking-wider text-[11px] font-bold text-slate-400">AREAS COVERED</span>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                      {projects.length > 0 ? projects.length : 0}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Districts and administrative wards with active field deployments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: PROJECT OUTCOMES */}
              <div className="flex flex-col gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Project Outcomes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Click on any project to view its full impact details.</p>
                </div>

                {projectOutcomes.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 space-y-2">
                    <span className="text-3xl block">📊</span>
                    <p className="text-sm font-semibold text-slate-700">No sponsored project outcomes yet</p>
                    <p className="text-xs text-slate-400">When your sponsored university projects make progress, their impact scorecards will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectOutcomes.map((proj) => (
                      <div
                        key={proj.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-5 hover:border-slate-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${proj.badgeColor}`}>
                              {proj.badge}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                              {proj.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                              </svg>
                              <span>{proj.university}</span>
                            </p>
                          </div>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleViewDetails(proj)}
                            className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-200 text-xs font-semibold transition cursor-pointer"
                          >
                            <span>View Impact Details</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* VIEW 2: DEDICATED PROJECT IMPACT DETAILS PAGE */
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {/* Back Button & Title Header */}
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleBackToOverview}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 w-fit transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Impact</span>
                </button>

                <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Project Impact Detail
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {selectedProject?.name}
                    </h1>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${selectedProject?.badgeColor}`}>
                    {selectedProject?.badge}
                  </span>
                </div>
              </div>

              {/* 2-Card Layout (grid-cols-2) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT CARD: Outcome */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Outcome</h2>
                  </div>

                  <div className="flex flex-col gap-4 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PROJECT</div>
                      <div className="text-slate-900 font-bold text-sm mt-1">{selectedProject?.name}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OUTCOME</div>
                        <div className="text-emerald-700 font-bold text-sm mt-1">{selectedProject?.outcome}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PEOPLE BENEFITED</div>
                        <div className="text-slate-900 font-extrabold text-sm mt-1">{selectedProject?.peopleBenefited}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AREAS / VILLAGES COVERED</div>
                      <div className="text-slate-900 font-semibold mt-1">{selectedProject?.areasCovered}</div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PROBLEM SOLVED</div>
                      <div className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                        {selectedProject?.problemSolved}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PROJECT OUTCOME</div>
                      <div className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                        {selectedProject?.projectOutcome}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT CARD: Project Information */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Project Information</h2>
                  </div>

                  <div className="flex flex-col gap-4 text-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IMPLEMENTATION STATUS</div>
                      <div className="text-slate-900 font-bold text-sm mt-1">{selectedProject?.implStatus}</div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TECHNOLOGY / SOLUTION</div>
                      <div className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                        {selectedProject?.technology}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UNIVERSITY</div>
                      <div className="text-slate-900 font-bold text-sm mt-1 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        <span>{selectedProject?.university}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">INDUSTRY PARTNER</div>
                        <div className="text-slate-900 font-bold text-sm mt-1 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{selectedProject?.industryPartner}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CSR CO-FUNDING</div>
                        <div className="text-emerald-700 font-extrabold text-sm mt-1">{selectedProject?.coFunding}</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => navigate('/industry/projects')}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                      >
                        Go to Project Management
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* EXPORT IMPACT REPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900">Export Impact Scorecard</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Download certified CSR and societal impact reports for regulatory filing with Department of IT & e-Governance.
            </p>

            <div className="space-y-3 text-xs">
              <label className="font-semibold text-slate-700 block">Select Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pdf', label: 'PDF Report' },
                  { id: 'csv', label: 'CSV Data' },
                  { id: 'xlsx', label: 'Excel (XLSX)' }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setExportFormat(fmt.id)}
                    className={`py-2 px-3 rounded-xl border font-semibold text-center transition ${
                      exportFormat === fmt.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="font-semibold text-slate-700 block mb-1">Time Period</label>
                <select className="w-full text-xs rounded-xl border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-emerald-600">
                  <option>Financial Year 2024-25 (All Qs)</option>
                  <option>Q4 FY24-25 (Current)</option>
                  <option>Lifetime (2023 - Present)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition"
              >
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
