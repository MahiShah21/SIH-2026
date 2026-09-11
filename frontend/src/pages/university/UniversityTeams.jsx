import React, { useState, useEffect } from 'react';
import UniversitySidebar from '../../components/common/UniversitySidebar';
import UniversityHeader from '../../components/common/UniversityHeader';
import projectApi from '../../api/projectApi';
import { useAuth } from '../../context/AuthContext';

export default function UniversityTeams() {
  const { user: currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Form states for Create Team
  const [newTeamName, setNewTeamName] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newMentor, setNewMentor] = useState(currentUser?.name || 'Faculty Lead');
  const [newStudents, setNewStudents] = useState([
    { name: '', dept: 'CSE', role: 'Team Lead', skills: '' }
  ]);

  useEffect(() => {
    projectApi.getProjects({ accepted_only: 'true' })
      .then(res => {
        if (res && res.success && Array.isArray(res.projects)) {
          setAvailableProjects(res.projects);
          if (res.projects.length > 0 && !newProject) {
            setNewProject(res.projects[0].title);
          }
          // Flatten teams from accepted projects
          const extractedTeams = [];
          res.projects.forEach(p => {
            if (p.teams && Array.isArray(p.teams) && p.teams.length > 0) {
              extractedTeams.push({
                id: `team-${p.id}`,
                name: `${p.title} Innovation Squad`,
                status: p.stage || 'In Progress',
                projectName: p.title,
                mentorName: p.lead_faculty || 'Faculty Lead',
                mentorDept: p.lead_mentor_dept || 'Engineering & Technology',
                mentorVerified: true,
                students: p.teams.map((tm, idx) => ({
                  id: tm.id || `s-${idx}`,
                  name: tm.name || tm.member_name || `Member ${idx + 1}`,
                  dept: tm.department || tm.dept || 'CSE',
                  role: tm.role || tm.role_title || 'Researcher',
                  focus: tm.department || 'Applied R&D',
                  skills: tm.skills || 'Hardware & Software Engineering',
                  initial: (tm.name || tm.member_name || 'M')[0].toUpperCase()
                }))
              });
            }
          });
          setTeams(extractedTeams);
        }
      })
      .catch(err => {
        console.warn('Teams load notice:', err);
      });
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleAddStudentRow = () => {
    setNewStudents([...newStudents, { name: '', dept: 'CSE', role: 'Researcher', skills: '' }]);
  };

  const handleRemoveStudentRow = (idx) => {
    if (newStudents.length > 1) {
      setNewStudents(newStudents.filter((_, i) => i !== idx));
    }
  };

  const handleCreateTeamSubmit = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      showToast('Please enter a team name');
      return;
    }

    const createdTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      status: 'In Progress',
      projectName: newProject || 'R&D Initiative',
      mentorName: newMentor.split('(')[0].trim(),
      mentorDept: newMentor.includes('(') ? newMentor.split('(')[1].replace(')', '') : 'Engineering',
      mentorVerified: true,
      students: newStudents.map((s, idx) => ({
        id: `s-${Date.now()}-${idx}`,
        name: s.name || `Student ${idx + 1}`,
        dept: s.dept,
        role: s.role,
        focus: s.dept,
        skills: s.skills || 'Research, Prototyping',
        initial: (s.name || 'S')[0].toUpperCase()
      }))
    };

    setTeams([...teams, createdTeam]);
    setShowCreateModal(false);
    setNewTeamName('');
    setNewStudents([{ name: '', dept: 'CSE', role: 'Team Lead', skills: '' }]);
    showToast(`Team "${createdTeam.name}" created successfully!`);
  };

  const handleOpenManage = (team) => {
    setSelectedTeam(JSON.parse(JSON.stringify(team)));
    setShowManageModal(true);
  };

  const handleSaveManageChanges = () => {
    if (!selectedTeam) return;
    setTeams(teams.map(t => t.id === selectedTeam.id ? selectedTeam : t));
    setShowManageModal(false);
    showToast(`Updated "${selectedTeam.name}" successfully!`);
  };

  const totalStudents = teams.reduce((acc, t) => acc + (t.students?.length || 0), 0);
  const totalMentors = new Set(teams.map(t => t.mentorName)).size;
  const totalProjects = new Set(teams.map(t => t.projectName)).size;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive University Sidebar */}
      <UniversitySidebar
        activePath="/university/teams"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Header */}
        <UniversityHeader
          title="Teams"
          activeBadge="1 Active Team"
          subtitle="Create and manage student + faculty teams."
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          actions={
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0f1f38] hover:bg-[#162e52] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Team</span>
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

        <div className="max-w-[1400px] w-full space-y-6">
          {/* ================= SUMMARY STAT CARDS ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Active Teams */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 block">Active Teams</span>
                <span className="text-2xl font-bold text-slate-900">{teams.length}</span>
              </div>
            </div>

            {/* Card 2: Faculty Mentors */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 block">Faculty Mentors</span>
                <span className="text-2xl font-bold text-slate-900">{totalMentors}</span>
              </div>
            </div>

            {/* Card 3: Students */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 block">Students</span>
                <span className="text-2xl font-bold text-slate-900">{totalStudents}</span>
              </div>
            </div>

            {/* Card 4: Projects */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 block">Projects</span>
                <span className="text-2xl font-bold text-slate-900">{totalProjects}</span>
              </div>
            </div>
          </div>

          {/* ================= TEAMS CONTAINER ================= */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Institution Teams Registry</h2>
              <span className="text-xs text-slate-400">Showing active squads working on assigned state challenges</span>
            </div>

            {/* Team Cards Grid / Empty State */}
            {teams.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                  👥
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No Innovation Squads Registered Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  Assign faculty mentors and student researchers to active R&D projects to create multidisciplinary problem-solving squads.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 bg-[#0c3b2e] hover:bg-[#072a20] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  + Create First Innovation Squad
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {teams.map((team, idx) => (
                  <div key={team.id} className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Card Header */}
                      <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">{team.name}</h3>
                            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                              {team.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                            <span className="font-medium text-slate-600">Project:</span>
                            <span className="text-slate-800 font-semibold">{team.projectName}</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Faculty Mentor Section */}
                      <div className="px-5 py-3.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Faculty Mentor</span>
                          <span className="text-xs font-bold text-slate-800">{team.mentorName}</span>
                          <span className="text-[11px] text-slate-400 ml-1.5">({team.mentorDept})</span>
                        </div>
                        {team.mentorVerified && (
                          <span className="px-2 py-0.5 text-[10.5px] bg-blue-50 text-blue-700 font-medium rounded-md border border-blue-100">
                            Verified Faculty
                          </span>
                        )}
                      </div>

                      {/* Students Section */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Students ({team.students.length})</span>
                          <span className="text-[11px] text-teal-600 font-medium">Interdisciplinary</span>
                        </div>
                        <div className="space-y-2">
                          {team.students.map((student) => (
                            <div key={student.id} className="flex items-start justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {student.initial}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                                    {student.name} <span className="text-[10px] font-normal text-slate-400 ml-1">({student.dept})</span>
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-medium">
                                    {student.role} <span className="text-slate-300 mx-1">•</span> <span className="text-slate-400">{student.focus}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-slate-200/60 text-slate-600 rounded">
                                  {student.skills}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">{team.students.length} Students Assigned</span>
                      <button
                        onClick={() => handleOpenManage(team)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0f1f38] hover:bg-[#162e52] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Manage Team</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================= MODAL: CREATE TEAM ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create Innovation Squad</h3>
                <p className="text-xs text-slate-500 mt-0.5">Assign faculty mentorship and student scholars to a state problem</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Agri Sensors Team"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Assigned Project / Challenge</label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {availableProjects.length > 0 ? (
                    availableProjects.map(p => (
                      <option key={p.id} value={p.title}>
                        {p.title} ({p.id})
                      </option>
                    ))
                  ) : (
                    <option value="General University R&D Initiative">General University R&D Initiative</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Faculty Mentor</label>
                <input
                  type="text"
                  value={newMentor}
                  onChange={(e) => setNewMentor(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kumar (Principal Investigator)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Student Members</label>
                  <button
                    type="button"
                    onClick={handleAddStudentRow}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                  >
                    + Add Student
                  </button>
                </div>

                <div className="space-y-2.5">
                  {newStudents.map((st, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Student Name"
                        value={st.name}
                        onChange={(e) => {
                          const updated = [...newStudents];
                          updated[idx].name = e.target.value;
                          setNewStudents(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800"
                      />
                      <select
                        value={st.dept}
                        onChange={(e) => {
                          const updated = [...newStudents];
                          updated[idx].dept = e.target.value;
                          setNewStudents(updated);
                        }}
                        className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700"
                      >
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="Civil">Civil</option>
                        <option value="Mechanical">Mech</option>
                        <option value="Biotech">Biotech</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Key Skills (e.g. Python, IoT)"
                        value={st.skills}
                        onChange={(e) => {
                          const updated = [...newStudents];
                          updated[idx].skills = e.target.value;
                          setNewStudents(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800"
                      />
                      {newStudents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStudentRow(idx)}
                          className="w-6 h-6 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#0f1f38] hover:bg-[#162e52] text-white rounded-lg shadow-sm transition-all"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANAGE TEAM ================= */}
      {showManageModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Manage {selectedTeam.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Edit team details, mentor, and student roster</p>
              </div>
              <button
                onClick={() => setShowManageModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Team Name</label>
                <input
                  type="text"
                  value={selectedTeam.name}
                  onChange={(e) => setSelectedTeam({ ...selectedTeam, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Status</label>
                <select
                  value={selectedTeam.status}
                  onChange={(e) => setSelectedTeam({ ...selectedTeam, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Faculty Mentor</label>
                <input
                  type="text"
                  value={selectedTeam.mentorName}
                  onChange={(e) => setSelectedTeam({ ...selectedTeam, mentorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Student Members ({selectedTeam.students.length})</label>
                <div className="space-y-2">
                  {selectedTeam.students.map((st, idx) => (
                    <div key={st.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                          {st.initial}
                        </span>
                        <input
                          type="text"
                          value={st.name}
                          onChange={(e) => {
                            const updated = [...selectedTeam.students];
                            updated[idx].name = e.target.value;
                            setSelectedTeam({ ...selectedTeam, students: updated });
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 flex-1"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">{st.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowManageModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveManageChanges}
                  className="px-4 py-2 text-xs font-semibold bg-[#0f1f38] hover:bg-[#162e52] text-white rounded-lg shadow-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
