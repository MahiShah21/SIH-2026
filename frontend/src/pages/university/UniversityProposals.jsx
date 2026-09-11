import React, { useState, useEffect } from 'react';
import UniversitySidebar from '../../components/common/UniversitySidebar';
import UniversityHeader from '../../components/common/UniversityHeader';
import problemApi from '../../api/problemApi';
import projectApi from '../../api/projectApi';

export default function UniversityProposals() {
  const [proposals, setProposals] = useState([]);
  const [availableTargets, setAvailableTargets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingProp, setEditingProp] = useState(null);
  const [pendingSubmitId, setPendingSubmitId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Form state
  const [formProject, setFormProject] = useState('');
  const [formSolution, setFormSolution] = useState('');
  const [formTech, setFormTech] = useState('');
  const [formMethodology, setFormMethodology] = useState('');
  const [formTeam, setFormTeam] = useState('Faculty Lead + Student Research Fellows');
  const [formCost, setFormCost] = useState('₹5,00,000');
  const [formTimeline, setFormTimeline] = useState('6 months');
  const [formOutcome, setFormOutcome] = useState('');
  const [formIndustry, setFormIndustry] = useState('');

  useEffect(() => {
    // Fetch live problems & projects to populate targets
    Promise.all([
      problemApi.getProblems().catch(() => ({ problems: [] })),
      projectApi.getProjects().catch(() => ({ projects: [] }))
    ]).then(([probRes, projRes]) => {
      const targets = [];
      if (probRes?.problems) {
        probRes.problems.forEach(p => {
          targets.push({ id: p.id, title: `${p.id} · ${p.title} (${p.category || 'General'})` });
        });
      }
      if (projRes?.projects) {
        projRes.projects.forEach(p => {
          if (!targets.some(t => t.id === p.id)) {
            targets.push({ id: p.id, title: `${p.id} · ${p.title} (${p.domain || 'R&D'})` });
          }
        });
      }
      setAvailableTargets(targets);
      if (targets.length > 0 && !formProject) {
        setFormProject(targets[0].title);
      }
    });
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const draftCount = proposals.filter(p => p.status === 'Draft').length;
  const submittedCount = proposals.filter(p => p.status === 'Submitted').length;
  const reviewCount = proposals.filter(p => p.status === 'Under Review').length;
  const acceptedCount = proposals.filter(p => p.status === 'Accepted').length;
  const rejectedCount = proposals.filter(p => p.status === 'Rejected').length;

  const handleCreateSubmit = (asDraft = false) => {
    if (!formSolution.trim()) {
      showToast('Please enter proposed solution description');
      return;
    }

    const newProp = {
      id: `prop-${Date.now()}`,
      project: formProject,
      status: asDraft ? 'Draft' : 'Submitted',
      solution: formSolution,
      tech: formTech || 'Edge IoT & Cloud Analytics',
      methodology: formMethodology || '3-phase lab and field validation',
      team: formTeam,
      cost: formCost,
      timeline: formTimeline,
      outcome: formOutcome || 'Enhanced operational efficiency and public service delivery',
      industry: formIndustry || 'State Innovation Partner'
    };

    setProposals([newProp, ...proposals]);
    setShowCreateModal(false);
    resetForm();
    showToast(asDraft ? 'Proposal saved as Draft.' : 'Proposal submitted successfully for state review!');
  };

  const handleOpenEdit = (prop) => {
    setEditingProp(JSON.parse(JSON.stringify(prop)));
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingProp) return;
    setProposals(proposals.map(p => p.id === editingProp.id ? editingProp : p));
    setShowEditModal(false);
    showToast('Proposal updated successfully.');
  };

  const handleTriggerSubmit = (propId) => {
    setPendingSubmitId(propId);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    if (pendingSubmitId) {
      setProposals(proposals.map(p => p.id === pendingSubmitId ? { ...p, status: 'Under Review' } : p));
      showToast('Proposal submitted for Committee Peer Review!');
    }
    setShowConfirmModal(false);
    setPendingSubmitId(null);
  };

  const resetForm = () => {
    setFormSolution('');
    setFormTech('');
    setFormMethodology('');
    setFormOutcome('');
    setFormIndustry('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive University Sidebar */}
      <UniversitySidebar
        activePath="/university/proposals"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Header */}
        <UniversityHeader
          title="Proposals"
          activeBadge="Drafting & Submissions"
          subtitle="Draft and submit R&D solution proposals for state and industry challenges."
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          actions={
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Create Proposal</span>
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

        <div className="max-w-7xl w-full space-y-6">
          {/* Status Summary Counters */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Draft</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-800">{draftCount}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Submitted</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-blue-600">{submittedCount}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Under Review</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-amber-600">{reviewCount}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Accepted</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-teal-600">{acceptedCount}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Rejected</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-rose-600">{rejectedCount}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>
            </div>
          </section>

          {/* Proposals List / Empty State */}
          <section className="space-y-4">
            {proposals.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                  📝
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No Grant Proposals Created Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  Draft and submit technical R&D proposals with budget breakdowns and milestones for state grant evaluation.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 bg-[#0c3b2e] hover:bg-[#072a20] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  + Create First Proposal
                </button>
              </div>
            ) : (
              proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 mr-2">
                        {prop.project.split('·')[0].trim()}
                      </span>
                      <span className="text-base font-bold text-slate-900">{prop.project}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(prop.status)}`}>
                        {prop.status}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(prop)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        Edit
                      </button>
                      {prop.status === 'Draft' && (
                        <button
                          onClick={() => handleTriggerSubmit(prop.id)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                        >
                          Submit Proposal
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Proposed Solution</span>
                      <p className="text-slate-700 leading-relaxed">{prop.solution}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Expected Outcome</span>
                      <p className="text-slate-700 leading-relaxed">{prop.outcome}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs bg-slate-50/60 p-3 rounded-lg">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Technology</span>
                      <span className="font-semibold text-slate-800">{prop.tech}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Cost Estimate</span>
                      <span className="font-semibold text-teal-700">{prop.cost}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Timeline</span>
                      <span className="font-semibold text-slate-800">{prop.timeline}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Industry Partner</span>
                      <span className="font-semibold text-indigo-700">{prop.industry}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      {/* ================= MODAL: CREATE PROPOSAL ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create Proposal</h2>
                <p className="text-xs text-slate-500 mt-0.5">Prepare the solution proposal for state R&D funding.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target State Project / Problem</label>
                <select
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {availableTargets.length > 0 ? (
                    availableTargets.map(t => (
                      <option key={t.id} value={t.title}>
                        {t.title}
                      </option>
                    ))
                  ) : (
                    <option value="General University R&D Proposal">General University R&D Proposal</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposed Solution Description</label>
                <textarea
                  rows={3}
                  value={formSolution}
                  onChange={(e) => setFormSolution(e.target.value)}
                  placeholder="Describe the proposed technical solution..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technology Stack</label>
                  <input
                    type="text"
                    value={formTech}
                    onChange={(e) => setFormTech(e.target.value)}
                    placeholder="e.g. LoRaWAN, Edge AI, Python"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Methodology</label>
                  <input
                    type="text"
                    value={formMethodology}
                    onChange={(e) => setFormMethodology(e.target.value)}
                    placeholder="e.g. 3-phase pilot across 20 clusters"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Budget (INR)</label>
                  <input
                    type="text"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timeline</label>
                  <input
                    type="text"
                    value={formTimeline}
                    onChange={(e) => setFormTimeline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Outcome & Beneficiaries</label>
                <textarea
                  rows={2}
                  value={formOutcome}
                  onChange={(e) => setFormOutcome(e.target.value)}
                  placeholder="Measurable impact, target beneficiaries..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Industry Support Required</label>
                <input
                  type="text"
                  value={formIndustry}
                  onChange={(e) => setFormIndustry(e.target.value)}
                  placeholder="e.g. Hardware prototyping & funding from TechNova"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => handleCreateSubmit(true)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition text-xs"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleCreateSubmit(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition text-xs shadow-sm"
              >
                Submit Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PROPOSAL ================= */}
      {showEditModal && editingProp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Edit Proposal</h2>
                <p className="text-xs text-slate-500 mt-0.5">{editingProp.project}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposed Solution</label>
                <textarea
                  rows={3}
                  value={editingProp.solution}
                  onChange={(e) => setEditingProp({ ...editingProp, solution: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technology</label>
                  <input
                    type="text"
                    value={editingProp.tech}
                    onChange={(e) => setEditingProp({ ...editingProp, tech: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Cost</label>
                  <input
                    type="text"
                    value={editingProp.cost}
                    onChange={(e) => setEditingProp({ ...editingProp, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Outcome</label>
                <textarea
                  rows={2}
                  value={editingProp.outcome}
                  onChange={(e) => setEditingProp({ ...editingProp, outcome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition text-xs shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM SUBMIT ================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Submit Proposal?</h3>
            <p className="text-xs text-slate-600">
              Once submitted, the proposal will be placed into the <strong>Under Review</strong> queue for government grant evaluation and peer panel scoring.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-3.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 shadow-2xs"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
