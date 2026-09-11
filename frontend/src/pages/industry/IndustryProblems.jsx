import React, { useState, useEffect } from 'react';
import IndustrySidebar from '../../components/common/IndustrySidebar';
import IndustryHeader from '../../components/common/IndustryHeader';
import problemApi from '../../api/problemApi';
import ProblemDetailModal from '../../components/common/ProblemDetailModal';
import { Sparkles, RefreshCw, FolderSearch, Eye, Handshake, CheckCircle } from 'lucide-react';

export default function IndustryProblems() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'recommended'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [inspectModalProblem, setInspectModalProblem] = useState(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [interestAmount, setInterestAmount] = useState('₹5,00,000');
  const [selectedUni, setSelectedUni] = useState('BIT Mesra, Ranchi');
  const [toastMsg, setToastMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [allProblems, setAllProblems] = useState([]);

  const loadProblems = () => {
    setIsLoading(true);
    problemApi.getProblems()
      .then((res) => {
        setIsLoading(false);
        if (res && res.success && res.problems) {
          const dynamicProblems = res.problems.map((p) => ({
            id: p.id,
            title: p.title,
            domain: p.category || 'Civic Infrastructure',
            district: p.district || 'Gumla',
            urgency: p.priority === 'urgent' || p.urgency ? 'High' : 'Medium',
            match: `${p.ai_confidence || 94}% Match`,
            verifiedCount: `${p.upvotes_count || 1} Citizen Endorsements`,
            budgetEstimate: '₹5,00,000 Grant Match',
            description: p.description,
            status: p.status || 'SUBMITTED',
            aiAnalysis: {
              feasibility: '89/100 High',
              trlRecommended: 'TRL-4 (Lab Model & Field Pilot)',
              expertiseRequired: ['Environmental Engineering', 'IoT Monitoring', 'AI Triage'],
              recommendedUnis: ['BIT Mesra, Ranchi', 'IIT (ISM) Dhanbad', 'NIT Jamshedpur']
            },
            raw: p
          }));
          setAllProblems(dynamicProblems);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.warn('Industry dynamic problems fetch error:', err);
      });
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleExpressInterest = (e) => {
    e.preventDefault();
    setShowInterestModal(false);
    showToast(`CSR Expression of Interest submitted for ${selectedProblem?.id || 'Problem'}!`);
  };

  const handleSendUniCollab = (e) => {
    e.preventDefault();
    setShowCollabModal(false);
    showToast(`Collaboration invitation dispatched to ${selectedUni}!`);
  };

  const currentList = activeTab === 'recommended' 
    ? allProblems.filter(p => parseInt(p.match, 10) >= 90) 
    : allProblems;

  const filteredProblems = currentList.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q || 
      p.id.toLowerCase().includes(q) || 
      p.title.toLowerCase().includes(q) || 
      p.domain.toLowerCase().includes(q) || 
      p.district.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-[#f8fafc] font-sans antialiased text-slate-800">
      {/* Responsive Sidebar */}
      <IndustrySidebar 
        activePath="/industry/problems" 
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <IndustryHeader
          title="State Problem Statements"
          subtitle="Explore community civic challenges ready for Industry CSR co-funding and academic collaboration."
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={loadProblems}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs hover:bg-slate-50 transition"
                title="Refresh Problems"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <div className="inline-flex p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <button
                  onClick={() => { setActiveTab('all'); setSelectedProblem(null); }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                    activeTab === 'all' ? 'bg-[#0f172a] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({allProblems.length})
                </button>
                <button
                  onClick={() => { setActiveTab('recommended'); setSelectedProblem(null); }}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                    activeTab === 'recommended' ? 'bg-[#0f172a] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AI High Match ({allProblems.filter(p => parseInt(p.match, 10) >= 90).length})
                </button>
              </div>
            </div>
          }
        />

        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed top-5 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-emerald-900/90 border border-emerald-500/40 text-emerald-100 text-sm font-medium animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {!selectedProblem ? (
          /* ================= LIST VIEW ================= */
          <div className="space-y-5 max-w-7xl w-full">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <FolderSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem by keyword, district or domain..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
              />
            </div>

            {/* Problem Cards Grid or Empty State */}
            {filteredProblems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4 border border-teal-200">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No Problem Statements in Feed</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                  Civic problems submitted through the Citizen Portal will automatically synchronize here for Industry CSR co-funding, university matchmaking, and technological remediation.
                </p>
                <div className="mt-6">
                  <button
                    onClick={loadProblems}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Live Registry</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredProblems.map((prob) => (
                  <div
                    key={prob.id}
                    className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {prob.id}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {prob.match}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">{prob.domain}</span>
                      </div>

                      <h3 
                        onClick={() => setInspectModalProblem(prob)}
                        className="text-base font-bold text-slate-900 mt-1 cursor-pointer hover:text-teal-700 transition"
                      >
                        {prob.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">📍 {prob.district} · {prob.verifiedCount}</p>
                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-2">{prob.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-700">{prob.budgetEstimate}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInspectModalProblem(prob)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Evidence</span>
                        </button>
                        <button
                          onClick={() => setSelectedProblem(prob)}
                          className="px-3 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                        >
                          CSR Options →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ================= DETAIL VIEW ================= */
          <div className="space-y-6 max-w-5xl w-full animate-fadeIn">
            <button
              onClick={() => setSelectedProblem(null)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 transition"
            >
              <span>← Back to Problems</span>
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                      {selectedProblem.id}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {selectedProblem.match}
                    </span>
                    <span className="text-xs text-slate-400">· {selectedProblem.domain}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedProblem.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">📍 {selectedProblem.district} · {selectedProblem.verifiedCount}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setInspectModalProblem(selectedProblem)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Map & Evidence</span>
                  </button>
                  <button
                    onClick={() => setShowInterestModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Express CSR Interest
                  </button>
                  <button
                    onClick={() => setShowCollabModal(true)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Request University Collaboration
                  </button>
                </div>
              </div>

              {/* AI Problem Diagnostics */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
                <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  AI Problem Diagnostics & Feasibility
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Feasibility Score</span>
                    <span className="text-sm font-bold text-emerald-700">{selectedProblem.aiAnalysis?.feasibility || '88/100 High'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Recommended TRL Stage</span>
                    <span className="text-sm font-bold text-slate-800">{selectedProblem.aiAnalysis?.trlRecommended || 'TRL-4 (Lab Model & Field Pilot)'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px] mb-1">Required Expertise</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProblem.aiAnalysis?.expertiseRequired?.map((exp) => (
                      <span key={exp} className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium text-slate-700 text-[11px]">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px] mb-1">Recommended Academic Partners</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProblem.aiAnalysis?.recommendedUnis?.map((uni) => (
                      <span key={uni} className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg font-bold text-xs">
                        🎓 {uni}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: EXPRESS INTEREST ================= */}
      {showInterestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Express CSR Co-funding Interest</h3>
              <button onClick={() => setShowInterestModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-xs text-slate-600">
              Confirm your CSR sponsorship commitment for <strong>{selectedProblem?.title} ({selectedProblem?.id})</strong>.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sponsorship Amount (INR)</label>
              <input
                type="text"
                value={interestAmount}
                onChange={(e) => setInterestAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowInterestModal(false)} className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button onClick={handleExpressInterest} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs">
                Submit Expression of Interest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REQUEST UNI COLLAB ================= */}
      {showCollabModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Request University Collaboration</h3>
              <button onClick={() => setShowCollabModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select University Institution</label>
              <select
                value={selectedUni}
                onChange={(e) => setSelectedUni(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                {selectedProblem?.aiAnalysis?.recommendedUnis?.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowCollabModal(false)} className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button onClick={handleSendUniCollab} className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs">
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PROBLEM DETAIL INSPECTION ================= */}
      {inspectModalProblem && (
        <ProblemDetailModal
          problem={inspectModalProblem.raw || inspectModalProblem}
          onClose={() => setInspectModalProblem(null)}
          onStatusUpdated={(id, newStatus) => {
            setAllProblems(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
          }}
        />
      )}
    </div>
  );
}
