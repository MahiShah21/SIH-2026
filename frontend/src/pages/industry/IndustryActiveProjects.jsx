import React, { useState, useEffect } from 'react';
import IndustrySidebar from '../../components/common/IndustrySidebar';
import IndustryHeader from '../../components/common/IndustryHeader';
import projectApi from '../../api/projectApi';

export default function IndustryActiveProjects() {
  const [selectedStageFilter, setSelectedStageFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMsg, setContactMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    projectApi.getProjects()
      .then(res => {
        if (res && res.success && Array.isArray(res.projects)) {
          const formatted = res.projects.map(p => ({
            id: p.id,
            title: p.title,
            department: p.department || p.lead_mentor_dept || 'State Innovation Cell',
            domain: p.domain || 'Technology',
            stage: p.stage || 'Prototype',
            progress: p.progress_percent || p.progress || 0,
            university: p.lead_institution || 'BIT Mesra, Ranchi',
            leadFaculty: p.lead_faculty || 'Principal Investigator',
            studentSquad: 'Faculty & Scholars Squad',
            csrBudget: p.total_budget || '₹0 committed',
            milestoneNext: `${p.next_stage || 'Next Stage'} Verification`,
            dueDate: '15 Oct 2026',
            overview: p.description || 'Academic R&D initiative solving verified citizen grievances in Jharkhand.',
            pipeline: [
              { name: 'Proposal', status: 'Completed' },
              { name: 'Feasibility', status: p.stage === 'Proposal' ? 'In Progress' : 'Completed' },
              { name: 'Prototype', status: p.stage === 'Prototype' ? 'In Progress' : p.stage === 'Proposal' ? 'Upcoming' : 'Completed' },
              { name: 'Testing', status: p.stage === 'Testing' ? 'In Progress' : ['Proposal', 'Prototype'].includes(p.stage) ? 'Upcoming' : 'Completed' },
              { name: 'Field Pilot', status: p.stage === 'Field Pilot' ? 'In Progress' : 'Upcoming' },
              { name: 'Implementation', status: 'Upcoming' }
            ]
          }));
          setProjectsList(formatted);
        }
      })
      .catch(err => console.warn('Projects fetch notice:', err));
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSendMentorMsg = (e) => {
    e.preventDefault();
    setShowContactModal(false);
    setContactMsg('');
    showToast(`Message dispatched to ${selectedProject?.leadFaculty || 'Faculty Lead'}!`);
  };

  const filtered = projectsList.filter(p => {
    if (selectedStageFilter === 'All') return true;
    return p.stage === selectedStageFilter;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f5f6fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive Industry Sidebar */}
      <IndustrySidebar
        activePath="/industry/projects"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        <IndustryHeader
          title="Active Sponsored Projects"
          subtitle="Track progress, milestone tranches, and laboratory prototypes across university R&D partnerships."
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          actions={
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
              {['All', 'Proposal', 'Prototype', 'Testing'].map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStageFilter(st)}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    selectedStageFilter === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
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

        {!selectedProject ? (
          /* ================= PROJECTS LIST ================= */
          <div className="space-y-4 max-w-7xl w-full">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                  🚀
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No Active Sponsored Projects</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Active R&D projects and prototype telemetry updates will appear here once collaborative proposals are accepted.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(proj => (
                  <div
                    key={proj.id}
                    className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {proj.id}
                        </span>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          {proj.stage}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1">{proj.title}</h3>
                      <p className="text-xs text-slate-500">{proj.university}</p>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{proj.overview}</p>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1 font-semibold text-slate-600">
                          <span>Milestone Progress</span>
                          <span className="font-bold text-emerald-700">{proj.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${proj.progress}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{proj.csrBudget}</span>
                      <button
                        onClick={() => setSelectedProject(proj)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                      >
                        Project Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ================= PROJECT DETAIL VIEW ================= */
          <div className="space-y-6 max-w-5xl w-full animate-fadeIn">
            <button
              onClick={() => setSelectedProject(null)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs"
            >
              <span>← Back to Active Projects</span>
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {selectedProject.id}
                    </span>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {selectedProject.stage}
                    </span>
                    <span className="text-xs text-slate-400">· {selectedProject.domain}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedProject.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedProject.university} · {selectedProject.department}</p>
                </div>

                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Contact Faculty Mentors
                </button>
              </div>

              {/* Navigation Tabs in Detail */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs">
                {['overview', 'lifecycle', 'documents', 'communication'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveDetailTab(tab)}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                      activeDetailTab === tab ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {activeDetailTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-700 leading-relaxed">{selectedProject.overview}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block uppercase font-bold text-[10px]">Faculty Mentor</span>
                      <p className="font-bold text-slate-800 mt-1">{selectedProject.leadFaculty}</p>
                      <p className="text-slate-400 text-[11px]">{selectedProject.studentSquad}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block uppercase font-bold text-[10px]">CSR Co-Funding</span>
                      <p className="font-bold text-emerald-700 mt-1">{selectedProject.csrBudget}</p>
                      <p className="text-slate-400 text-[11px]">Tranche 1 Disbursed</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block uppercase font-bold text-[10px]">Next Milestone Due</span>
                      <p className="font-bold text-slate-800 mt-1">{selectedProject.dueDate}</p>
                      <p className="text-slate-400 text-[11px]">{selectedProject.milestoneNext}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Lifecycle */}
              {activeDetailTab === 'lifecycle' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-400">State Innovation Lifecycle Pipeline</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
                    {selectedProject.pipeline.map((p, idx) => (
                      <div
                        key={p.name}
                        className={`p-3 rounded-xl border ${
                          p.status === 'In Progress'
                            ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20'
                            : p.status === 'Completed'
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 block">0{idx + 1}</span>
                        <p className="font-bold text-slate-900 mt-0.5">{p.name}</p>
                        <span className="text-[10px] text-slate-500">{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Documents */}
              {activeDetailTab === 'documents' && (
                <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-slate-800 block">Project Shared Repository</span>
                  <p className="text-slate-500">Includes signed tripartite MoU, LoRaWAN firmware binaries, and calibration logs.</p>
                  <button
                    onClick={() => showToast('Downloading project document bundle...')}
                    className="mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Download Project Bundle (.zip)
                  </button>
                </div>
              )}

              {/* Tab 4: Communication */}
              {activeDetailTab === 'communication' && (
                <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-slate-800 block">Direct Channel with {selectedProject.university}</span>
                  <p className="text-slate-500">Live chat channel connected with coordinator Dr. Sharma, student researchers, and the AI CSR Copilot.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="px-3.5 py-1.5 bg-[#0d1927] text-white rounded-lg font-semibold hover:bg-slate-800 transition cursor-pointer"
                    >
                      Quick Message
                    </button>
                    <button
                      onClick={() => navigate('/industry/communication')}
                      className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Open Full Communication Hub</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: CONTACT MENTORS ================= */}
      {showContactModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Message {selectedProject.leadFaculty}</h3>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-xs text-slate-500">{selectedProject.title} ({selectedProject.id})</p>
            <form onSubmit={handleSendMentorMsg} className="space-y-3">
              <textarea
                rows={4}
                required
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                placeholder="Type your message regarding hardware parts dispatch or testing schedule..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowContactModal(false)} className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-slate-800">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
