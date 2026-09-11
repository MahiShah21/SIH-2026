import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UniversitySidebar from '../../components/common/UniversitySidebar';
import UniversityHeader from '../../components/common/UniversityHeader';
import problemApi from '../../api/problemApi';
import projectApi from '../../api/projectApi';
import { getSocket } from '../../api/socket';
import ProblemDetailModal from '../../components/common/ProblemDetailModal';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Screen: University Challenges — JharInnovate
 * Direct implementation of Stitch Screen: 20_cad0b74218394116b30e22a85911b9f7
 */
export default function UniversityChallenges() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [inspectModalProblem, setInspectModalProblem] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [challenges, setChallenges] = useState([]);

  // Fetch live problems from backend Neon PostgreSQL
  const fetchChallenges = () => {
    problemApi.getProblems()
      .then((res) => {
        if (res && res.success && res.problems) {
          const dynamicChallenges = res.problems.map((p) => ({
            id: p.id,
            title: p.title,
            domain: p.category ? (p.category.toLowerCase().includes('water') ? 'water' : p.category.toLowerCase().includes('energy') ? 'energy' : p.category.toLowerCase().includes('health') ? 'healthcare' : 'agriculture') : 'water',
            domainLabel: p.category || 'Civic Infrastructure',
            location: `${p.district || 'Gumla'} District`,
            priority: p.priority === 'urgent' || p.urgency ? 'high' : 'medium',
            priorityLabel: p.priority === 'urgent' || p.urgency ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY',
            status: p.status === 'APPROVED' || p.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING REVIEW',
            population: '1,250 Farmers & Families',
            focus: 'AI Civic Resolution & Prototyping',
            skills: ['IoT', 'AI/ML', 'Civil Engineering', 'Jharkhand NLP'],
            matchScore: `${p.ai_confidence || 95}%`,
            matchRationale: p.ai_rationale || 'High priority problem logged by citizen with GPS coordinates and media payload.',
            desc: p.description,
            raw: p
          }));

          setChallenges(dynamicChallenges);
        }
      })
      .catch((err) => console.warn('University dynamic challenges fetch error:', err));
  };

  useEffect(() => {
    fetchChallenges();

    const socket = getSocket();
    if (socket) {
      socket.emit('join_role', 'university');
      const onProblemUpdate = () => fetchChallenges();
      const onProblemCreated = () => fetchChallenges();
      const onProjectCreated = () => fetchChallenges();

      socket.on('problem_updated', onProblemUpdate);
      socket.on('problem_created', onProblemCreated);
      socket.on('project_created', onProjectCreated);

      return () => {
        socket.off('problem_updated', onProblemUpdate);
        socket.off('problem_created', onProblemCreated);
        socket.off('project_created', onProjectCreated);
      };
    }
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleAcceptChallenge = async (item) => {
    try {
      const projectId = `PRJ-${item.id.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
      const newProjectData = {
        id: projectId,
        title: item.title,
        challenge_id: item.id,
        problem_id: item.id,
        lead_institution: 'BIT Mesra, Ranchi',
        lead_faculty: 'Dr. A. K. Sharma',
        lead_mentor_dept: 'Dept of Computer Science & AI',
        lab_location: 'IoT & Civic Innovation Lab',
        department: item.domainLabel || 'Civic Infrastructure',
        domain: item.domainLabel || 'Civic Infrastructure',
        location: item.location || 'Jharkhand',
        description: item.desc || item.title,
        status: 'IN_PROGRESS',
        stage: 'Proposal',
        next_stage: 'Prototype',
        phase: 'Solution Formulation Phase',
        progress_percent: 15,
        total_budget: '₹5,00,000',
        disbursed_amount: '₹1,50,000',
        sanctioned_grant: '₹5,00,000',
        industry_partner: 'TechNova Solutions / CSR Pool',
        is_accepted_by_university: true
      };

      // 1. Persist active project in backend Neon PostgreSQL & trigger broadcast
      await projectApi.createProject(newProjectData);

      // 2. Also ensure problem status is explicitly updated
      try {
        await problemApi.updateStatus(item.id, 'ACCEPTED', 'Accepted by University for R&D');
      } catch (err) {
        console.warn('Problem status secondary sync notice:', err);
      }

      // 3. Update local state
      setChallenges(prev => prev.map(c => c.id === item.id ? { ...c, status: 'ACCEPTED' } : c));
      if (selectedChallenge && selectedChallenge.id === item.id) {
        setSelectedChallenge(prev => ({ ...prev, status: 'ACCEPTED' }));
      }

      triggerToast(`🎉 Challenge ${item.id} accepted! Added to University Active Projects (${projectId}).`);
    } catch (err) {
      console.error('Failed to accept challenge:', err);
      setChallenges(prev => prev.map(c => c.id === item.id ? { ...c, status: 'ACCEPTED' } : c));
      triggerToast(`Challenge ${item.id} accepted! Added to Active Projects.`);
    }
  };

  const updateChallengeStatus = (id, newStatus) => {
    const target = challenges.find(c => c.id === id);
    if (target && newStatus === 'ACCEPTED') {
      handleAcceptChallenge(target);
    } else {
      setChallenges(challenges.map(c => c.id === id ? { ...c, status: newStatus } : c));
      triggerToast(`Challenge ${id} marked as ${newStatus}!`);
    }
  };

  const filterChips = [
    { id: 'all', label: t('filter_all', 'All') },
    { id: 'high-priority', label: t('filter_high_priority', 'High Priority') },
    { id: 'agriculture', label: t('domain_agriculture', 'Agriculture') },
    { id: 'healthcare', label: t('domain_healthcare', 'Healthcare') },
    { id: 'water', label: t('domain_water', 'Water') },
    { id: 'energy', label: t('domain_energy', 'Energy') },
    { id: 'sanitation', label: t('domain_sanitation', 'Sanitation') }
  ];

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchFilter =
        activeFilter === 'all' ||
        (activeFilter === 'high-priority' && c.priority === 'high') ||
        c.domain === activeFilter;

      const matchSearch =
        searchQuery.trim() === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.domainLabel.toLowerCase().includes(searchQuery.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [challenges, activeFilter, searchQuery]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f6f7fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      <UniversitySidebar
        activeNav="challenges"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6 bg-[#f6f7fa]">
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-500/40 flex items-center gap-3 animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <p className="text-xs font-semibold">{toastMsg}</p>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Bar from Stitch */}
        <UniversityHeader
          pageTitle={t('nav_challenges', 'Challenges')}
          subTitle={t('challenges_subtitle', 'Evaluate societal challenges matched to your institution.')}
          badgeText={`${challenges.length} ${t('kpi_assigned_challenges', 'Assigned')}`}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          onSearch={(q) => setSearchQuery(q)}
        />

        {/* Search & Filter Chips Bar from Stitch */}
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21 21-4.34-4.34"></path>
              <circle cx="11" cy="11" r="8"></circle>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_challenges_placeholder', 'Search challenge, location or domain...')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium custom-scrollbar">
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveFilter(chip.id)}
                className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  activeFilter === chip.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Challenge Grid */}
        {filteredChallenges.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center max-w-lg mx-auto space-y-4 my-6">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
              🎓
            </div>
            <h4 className="text-base font-bold text-slate-800">{t('no_challenges_found', 'No Grand Challenges Available')}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('no_challenges_desc', 'No problems matching the selected filter in the registry. As citizens report local challenges, AI will categorize and route them here for university research solutions.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredChallenges.map((item) => (
              <div
                key={item.id}
                onClick={() => setInspectModalProblem(item.raw || item)}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-teal-500 transition-all flex flex-col justify-between p-5 relative overflow-hidden cursor-pointer group"
              >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                      item.priority === 'high'
                        ? 'text-rose-700 bg-rose-50 border border-rose-200'
                        : 'text-amber-800 bg-amber-50 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.priority === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                      {item.priorityLabel}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    item.status === 'ACCEPTED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.status === 'EVALUATING'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h3
                  className="text-base font-bold text-slate-900 leading-snug cursor-pointer hover:text-teal-700 transition-colors"
                  onClick={() => setSelectedChallenge(item)}
                >
                  {item.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 mb-3.5">
                  <span className="font-medium text-slate-700">{item.domainLabel}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{item.location}</span>
                  </span>
                </div>

                {/* Specs Grid from Stitch */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-lg border border-slate-100 text-xs mb-3.5">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">{t('affected_population', 'Affected Population')}</span>
                    <span className="font-semibold text-slate-800">{item.population}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">{t('problem_focus', 'Problem Focus')}</span>
                    <span className="font-semibold text-slate-800 truncate block">{item.focus}</span>
                  </div>
                </div>

                {/* Required Expertise Tags */}
                <div className="mb-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t('required_expertise', 'Required Expertise')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 bg-slate-100 border border-slate-200/80 text-slate-700 text-xs rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Match Rationale Box from Stitch */}
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      {t('ai_match_rationale', 'AI Match Rationale')} ({item.matchScore})
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                    {item.matchRationale}
                  </p>
                </div>
              </div>

              {/* Action Buttons Toolbar from Stitch */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChallenge(item)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  {t('btn_view_details', 'View Details')}
                </button>

                <div className="flex items-center gap-2">
                  {item.status === 'ACCEPTED' ? (
                    <button
                      type="button"
                      disabled
                      className="px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-1 shadow-2xs cursor-default"
                    >
                      <span className="font-black text-emerald-600">✓</span>
                      <span>{t('badge_accepted', 'Accepted ✓')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptChallenge(item);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition cursor-pointer"
                    >
                      {t('btn_accept_challenge', 'Accept Challenge')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/university/projects?tab=proposals');
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0d1927] hover:bg-[#1a2b40] rounded-lg transition cursor-pointer"
                  >
                    {t('btn_draft_proposal', 'Draft Proposal')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </main>

      {/* Challenge Details Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 bg-[#0d1927] text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-800 text-teal-300 rounded">
                  {selectedChallenge.id}
                </span>
                <h3 className="text-sm font-bold text-white">{selectedChallenge.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChallenge(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Grievance Description</span>
                <p className="text-slate-700 leading-relaxed">{selectedChallenge.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Location</span>
                  <span className="font-bold text-slate-800">{selectedChallenge.location}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Beneficiaries</span>
                  <span className="font-bold text-slate-800">{selectedChallenge.population}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                <span className="text-emerald-900 font-bold block">AI Match Rationale ({selectedChallenge.matchScore})</span>
                <p className="text-emerald-800 leading-relaxed">{selectedChallenge.matchRationale}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChallenge(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                {selectedChallenge.status === 'ACCEPTED' ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold cursor-default flex items-center gap-1.5"
                  >
                    <span className="text-emerald-600 font-black">✓</span>
                    <span>Accepted by University</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleAcceptChallenge(selectedChallenge);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Accept Challenge
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChallenge(null);
                    navigate('/university/projects?tab=proposals');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0d1927] hover:bg-[#1a2b40] text-white text-xs font-bold transition cursor-pointer"
                >
                  Draft R&amp;D Proposal →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
