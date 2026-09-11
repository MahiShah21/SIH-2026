import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IndustrySidebar from '../../components/common/IndustrySidebar';
import IndustryHeader from '../../components/common/IndustryHeader';
import collaborationApi from '../../api/collaborationApi';
import projectApi from '../../api/projectApi';
import problemApi from '../../api/problemApi';
import getSocket from '../../api/socket';
import { useAuth } from '../../context/AuthContext';

export default function IndustryDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [toastMsg, setToastMsg] = useState('');
  const [selectedActionModal, setSelectedActionModal] = useState(null);
  const [collaborations, setCollaborations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const orgName = currentUser?.organization || currentUser?.name || 'Industry Partner';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadData = () => {
    Promise.all([
      collaborationApi.getCollaborations().catch(() => ({ collaborations: [] })),
      projectApi.getProjects().catch(() => ({ projects: [] })),
      problemApi.getProblems().catch(() => ({ problems: [] }))
    ]).then(([collabRes, projRes, probRes]) => {
      if (collabRes && Array.isArray(collabRes.collaborations)) {
        setCollaborations(collabRes.collaborations);
      } else {
        setCollaborations([]);
      }

      if (projRes && Array.isArray(projRes.projects)) {
        setProjects(projRes.projects);
      } else {
        setProjects([]);
      }

      if (probRes && Array.isArray(probRes.problems)) {
        setProblems(probRes.problems);
      } else {
        setProblems([]);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    const socket = getSocket();
    if (socket) {
      const handleUpdate = () => loadData();
      socket.on('collaboration_received', handleUpdate);
      socket.on('collaboration_updated', handleUpdate);
      socket.on('project_created', handleUpdate);
      socket.on('problem_created', handleUpdate);
      socket.on('notification_received', handleUpdate);

      return () => {
        socket.off('collaboration_received', handleUpdate);
        socket.off('collaboration_updated', handleUpdate);
        socket.off('project_created', handleUpdate);
        socket.off('problem_created', handleUpdate);
        socket.off('notification_received', handleUpdate);
      };
    }
  }, []);

  const pendingActions = collaborations
    .filter(c => c.status === 'PENDING' || c.status === 'New' || !c.status)
    .map(c => ({
      id: c.id,
      title: c.partner_type || 'Review Collaboration Request',
      inst: c.institution || c.company_name || 'Academic Partner',
      project: `${c.project_id || 'PRJ'} · ${c.project_title || 'Collaborative R&D'}`,
      type: 'Proposal Review',
      urgency: 'Action Required',
      desc: c.details || 'Collaboration proposal awaiting industry review and grant co-funding sign-off.'
    }));

  const totalCapitalNumeric = collaborations
    .filter(c => c.status === 'APPROVED' || c.status === 'Active MOU')
    .reduce((acc, curr) => {
      const str = (curr.committed_amount || '').replace(/[^0-9]/g, '');
      const num = parseInt(str, 10);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);

  const formattedCapital = totalCapitalNumeric > 0
    ? `₹${(totalCapitalNumeric / 100000).toFixed(1)} L`
    : '₹0';

  return (
    <div className="min-h-screen flex bg-[#f5f6fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive Industry Sidebar */}
      <IndustrySidebar
        activePath="/industry/dashboard"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        <IndustryHeader
          title={`Good day, ${orgName}`}
          subtitle="Manage university collaborations, CSR grants, and industry R&D sponsorships."
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          actions={
            <button
              onClick={() => navigate('/industry/problems')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span>Browse Problems</span>
              <span>→</span>
            </button>
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

        {/* KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div
            onClick={() => navigate('/industry/collaborations')}
            className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wide block">Collab Requests</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">{collaborations.length}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {pendingActions.length} requires action
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700">View Requests →</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          <div
            onClick={() => navigate('/industry/projects')}
            className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wide block">Active Projects</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">{projects.length}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {projects.length > 0 ? `Active sponsored projects` : 'No active projects'}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700">View Projects →</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
          </div>

          <div
            onClick={() => navigate('/industry/impact')}
            className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wide block">CSR Capital</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">{formattedCapital}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Committed grants</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700">Scorecard →</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          <div
            onClick={() => navigate('/industry/communication')}
            className="bg-white rounded-xl p-4 border border-teal-200 shadow-2xs hover:shadow-md hover:border-teal-400 transition-all cursor-pointer flex flex-col justify-between bg-gradient-to-b from-teal-50/20 to-transparent"
          >
            <div>
              <span className="text-[11px] font-semibold text-teal-900 tracking-wide block">Messages &amp; Copilot</span>
              <div className="text-2xl font-extrabold text-teal-700 mt-2">Active</div>
              <p className="text-[11px] text-teal-600/90 mt-0.5">Faculty &amp; AI Copilot</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-teal-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-teal-700">Chat Hub →</span>
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            </div>
          </div>

          <div
            onClick={() => navigate('/industry/collaborations')}
            className="bg-white rounded-xl p-4 border border-amber-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between bg-gradient-to-b from-amber-50/20 to-transparent"
          >
            <div>
              <span className="text-[11px] font-semibold text-amber-900 tracking-wide block">Pending Actions</span>
              <div className="text-2xl font-extrabold text-amber-600 mt-2">{pendingActions.length}</div>
              <p className="text-[11px] text-amber-700/80 mt-0.5">Review · Sign MoU</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-600">Action Queue →</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
        </section>

        {/* 2-Column Split: Pending Actions & AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pending Actions (5 cols) */}
          <section className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Pending Actions</h3>
                <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  {pendingActions.length} items
                </span>
              </div>

              <div className="space-y-3 mt-3">
                {pendingActions.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <span className="text-2xl block">✅</span>
                    <p className="text-xs font-semibold text-slate-600">All caught up!</p>
                    <p className="text-[11px] text-slate-400">No pending collaboration proposals requiring action.</p>
                  </div>
                ) : (
                  pendingActions.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => setSelectedActionModal(act)}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{act.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {act.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-teal-700 font-semibold">{act.project}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{act.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/industry/collaborations')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Open Complete Collaboration Queue →
            </button>
          </section>

          {/* AI Recommended Problems (7 cols) */}
          <section className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI Recommended Problem Statements</h3>
                <p className="text-xs text-slate-400 mt-0.5">Matched to {orgName} focus: IoT, Telemetry &amp; Clean Tech</p>
              </div>
              <button
                onClick={() => navigate('/industry/problems')}
                className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                View all ({problems.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {problems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <span className="text-2xl block">🔍</span>
                  <p className="text-xs font-semibold text-slate-600">No open problem statements yet</p>
                  <p className="text-[11px] text-slate-400">Citizen and municipal problem statements will appear here for CSR matching.</p>
                </div>
              ) : (
                problems.slice(0, 3).map((prob) => (
                  <div
                    key={prob.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                          {prob.code || prob.id}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{prob.title}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {prob.matchScore || '92% Fit'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{prob.description || prob.desc}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">{prob.district || prob.location || 'Jharkhand'}</span>
                      <button
                        onClick={() => {
                          showToast(`Expressed interest in ${prob.code || prob.id}!`);
                        }}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
                      >
                        Express CSR Interest
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Active Projects Table */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Active Sponsored Projects</h3>
            <button
              onClick={() => navigate('/industry/projects')}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Manage Projects →
            </button>
          </div>

          <div className="overflow-x-auto">
            {projects.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <span className="text-2xl block">📂</span>
                <p className="text-xs font-semibold text-slate-600">No active sponsored projects</p>
                <p className="text-[11px] text-slate-400">Accept proposals or initiate co-funded R&D projects to track them here.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Academic Partner</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">CSR Grant</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {proj.id} · {proj.title || proj.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{proj.institution || proj.partner || 'Academic Partner'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {proj.stage || proj.lifecycle_stage || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${proj.progress || 35}%` }} />
                          </div>
                          <span className="font-bold text-slate-800">{proj.progress || 35}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">{proj.budget || proj.csrGrant || '₹5,00,000'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate('/industry/projects')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* Action Item Modal */}
      {selectedActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">{selectedActionModal.title}</h3>
              <button
                onClick={() => setSelectedActionModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs font-semibold text-teal-700">{selectedActionModal.project}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{selectedActionModal.desc}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedActionModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setSelectedActionModal(null);
                  showToast(`Action "${selectedActionModal.title}" confirmed!`);
                }}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer"
              >
                Approve & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
