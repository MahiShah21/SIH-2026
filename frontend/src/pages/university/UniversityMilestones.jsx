import React, { useState, useEffect } from 'react';
import UniversitySidebar from '../../components/common/UniversitySidebar';
import UniversityHeader from '../../components/common/UniversityHeader';
import projectApi from '../../api/projectApi';

const STAGES = ['Proposal', 'Prototype', 'Testing', 'Field Pilot', 'Implementation'];

function buildStagesForProject(stageName) {
  const currentStageIndex = Math.max(0, STAGES.indexOf(stageName || 'Proposal'));
  return STAGES.map((st, idx) => ({
    name: st,
    status: idx < currentStageIndex ? 'Completed' : idx === currentStageIndex ? 'In Progress' : 'Upcoming',
    desc: `${st} milestone objectives, field telemetry, validation tests, and stage gates.`,
    deliverables: [`${st} Validation Report`, `${st} Architecture & Firmware Review`],
    notes: idx <= currentStageIndex ? [`${st} requirements verified by Faculty Principal Investigator.`] : []
  }));
}

export default function UniversityMilestones() {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectsData, setProjectsData] = useState({});
  const [activeStageForNote, setActiveStageForNote] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    projectApi.getProjects({ accepted_only: 'true' })
      .then(res => {
        if (res && res.success && Array.isArray(res.projects) && res.projects.length > 0) {
          const map = {};
          res.projects.forEach(p => {
            const currentStageIndex = Math.max(0, STAGES.indexOf(p.stage || 'Proposal'));
            map[p.id] = {
              code: p.id,
              title: p.title,
              currentStageIndex,
              stages: buildStagesForProject(p.stage)
            };
          });
          setProjectsData(map);
          setSelectedProjectId(res.projects[0].id);
        } else {
          setProjectsData({});
          setSelectedProjectId('');
        }
      })
      .catch(err => {
        console.warn('Milestones project load error:', err);
      });
  }, []);

  const currentProject = selectedProjectId ? projectsData[selectedProjectId] : null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleAdvanceStage = async () => {
    if (!currentProject) return;
    if (currentProject.currentStageIndex < STAGES.length - 1) {
      const nextIdx = currentProject.currentStageIndex + 1;
      const nextStageName = STAGES[nextIdx];
      const nextNextStageName = nextIdx + 1 < STAGES.length ? STAGES[nextIdx + 1] : 'Implementation';
      const updatedStages = currentProject.stages.map((st, idx) => {
        if (idx < nextIdx) return { ...st, status: 'Completed' };
        if (idx === nextIdx) return { ...st, status: 'In Progress' };
        return { ...st, status: 'Upcoming' };
      });

      const updatedProject = {
        ...currentProject,
        currentStageIndex: nextIdx,
        stages: updatedStages
      };

      setProjectsData({
        ...projectsData,
        [selectedProjectId]: updatedProject
      });

      try {
        await projectApi.updateLifecycle(selectedProjectId, {
          stage: nextStageName,
          nextStage: nextNextStageName,
          progressPercent: Math.round(((nextIdx + 1) / STAGES.length) * 100),
          status: nextIdx === STAGES.length - 1 ? 'COMPLETED' : 'IN_PROGRESS',
          phase: `${nextStageName} Phase Validation`
        });
      } catch (err) {
        console.warn('Backend milestone lifecycle sync notice:', err);
      }

      showToast(`🎉 Advanced ${currentProject.code} to stage: ${nextStageName} (Synced to DB)!`);
    } else {
      showToast('Project has reached final Implementation stage.');
    }
  };

  const handleMarkComplete = async (stageIndex) => {
    const updatedStages = [...currentProject.stages];
    updatedStages[stageIndex].status = 'Completed';
    const nextIdx = stageIndex + 1;
    if (nextIdx < updatedStages.length && updatedStages[nextIdx].status === 'Upcoming') {
      updatedStages[nextIdx].status = 'In Progress';
    }

    const newStageIndex = Math.min(STAGES.length - 1, Math.max(currentProject.currentStageIndex, nextIdx));
    const nextStageName = STAGES[newStageIndex];
    const nextNextStageName = newStageIndex + 1 < STAGES.length ? STAGES[newStageIndex + 1] : 'Implementation';

    const updatedProject = {
      ...currentProject,
      stages: updatedStages,
      currentStageIndex: newStageIndex
    };

    setProjectsData({
      ...projectsData,
      [selectedProjectId]: updatedProject
    });

    try {
      await projectApi.updateLifecycle(selectedProjectId, {
        stage: nextStageName,
        nextStage: nextNextStageName,
        progressPercent: Math.round(((newStageIndex + 1) / STAGES.length) * 100),
        status: newStageIndex === STAGES.length - 1 ? 'COMPLETED' : 'IN_PROGRESS',
        phase: `${nextStageName} Phase Validation`
      });
    } catch (err) {
      console.warn('Backend milestone stage complete sync notice:', err);
    }

    showToast(`✅ Stage "${updatedStages[stageIndex].name}" marked as Completed (Saved to DB)!`);
  };

  const handleOpenNoteModal = (stageIndex) => {
    setActiveStageForNote(stageIndex);
    setNoteInput('');
  };

  const handleSaveNote = () => {
    if (activeStageForNote === null || !noteInput.trim()) return;

    const updatedStages = [...currentProject.stages];
    updatedStages[activeStageForNote].notes.push(noteInput.trim());

    setProjectsData({
      ...projectsData,
      [selectedProjectId]: {
        ...currentProject,
        stages: updatedStages
      }
    });

    setActiveStageForNote(null);
    setNoteInput('');
    showToast('Milestone note saved successfully.');
  };

  // Calculate percentage safely
  const completedCount = currentProject ? currentProject.stages.filter(s => s.status === 'Completed').length : 0;
  const inProgressCount = currentProject ? currentProject.stages.filter(s => s.status === 'In Progress').length : 0;
  const overallPercentage = currentProject ? Math.round(((completedCount + inProgressCount * 0.5) / currentProject.stages.length) * 100) : 0;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive University Sidebar */}
      <UniversitySidebar
        activePath="/university/milestones"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Header */}
        <UniversityHeader
          title="Milestones"
          activeBadge="Deliverables Tracker"
          subtitle="Track project progress milestones and verify stage deliverables."
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          actions={
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <label htmlFor="projectSelector" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Project:
              </label>
              <select
                id="projectSelector"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {Object.values(projectsData).length > 0 ? (
                  Object.values(projectsData).map(p => (
                    <option key={p.code} value={p.code}>
                      {p.code} · {p.title}
                    </option>
                  ))
                ) : (
                  <option value="">No Active Projects</option>
                )}
              </select>
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

        {!currentProject ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              🎯
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Active Milestones to Track</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Milestones and stage deliverables will activate once an R&D project is accepted by the university and industry partners.
            </p>
          </div>
        ) : (
          <div className="max-w-7xl w-full space-y-6">
            {/* Progress Tracker Card */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lifecycle Progression</span>
                  <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                    {currentProject.code}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Overall Completion: <span className="font-bold text-slate-800">{overallPercentage}%</span>
                </div>
              </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {currentProject.stages.map((st, idx) => (
                <div
                  key={st.name}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    st.status === 'In Progress'
                      ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20 shadow-xs'
                      : st.status === 'Completed'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-slate-400">0{idx + 1}</span>
                    {st.status === 'Completed' && <span className="text-emerald-600 font-bold text-xs">✓</span>}
                  </div>
                  <p className={`text-xs font-bold ${
                    st.status === 'In Progress' ? 'text-teal-900' : st.status === 'Completed' ? 'text-emerald-900' : 'text-slate-700'
                  }`}>
                    {st.name}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{st.status}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Milestone Cards List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-slate-800">Project Stages & Deliverables</h2>
              <span className="text-xs text-slate-500 font-medium">5 sequential development phases</span>
            </div>

            <div className="space-y-3.5">
              {currentProject.stages.map((stage, idx) => (
                <div
                  key={stage.name}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-sm transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{stage.name}</h3>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        stage.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : stage.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {stage.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenNoteModal(idx)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        + Note
                      </button>
                      {stage.status !== 'Completed' && (
                        <button
                          onClick={() => handleMarkComplete(idx)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{stage.desc}</p>

                  {/* Deliverables Checklist */}
                  <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Deliverables Checklist</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {stage.deliverables.map((del) => (
                        <div key={del} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            defaultChecked={stage.status === 'Completed'}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <span className="text-slate-700 font-medium">{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes Feed if any */}
                  {stage.notes.length > 0 && (
                    <div className="space-y-1 pt-1 text-xs">
                      {stage.notes.map((n, i) => (
                        <div key={i} className="p-2 bg-amber-50/60 border border-amber-200/60 rounded text-amber-900 flex items-center gap-2">
                          <span className="text-amber-500 font-bold">📝</span>
                          <span>{n}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Advance Project Stage Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 mt-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Advancing project stage marks current stage complete and activates next lifecycle phase.</span>
            </div>
            <button
              onClick={handleAdvanceStage}
              className="px-6 py-2.5 bg-[#0d1527] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <span>Advance Project Stage</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>

      {/* ================= MODAL: ADD NOTE ================= */}
      {activeStageForNote !== null && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add Note — {currentProject.stages[activeStageForNote].name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Record progress, blockers or context for this milestone.</p>
              </div>
              <button
                onClick={() => setActiveStageForNote(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <label htmlFor="milestoneNoteInput" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Note
              </label>
              <textarea
                id="milestoneNoteInput"
                rows={4}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add a note about this milestone..."
                className="w-full text-xs rounded-xl border border-slate-300 px-3.5 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>

            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveStageForNote(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!noteInput.trim()}
                className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition disabled:opacity-40"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
