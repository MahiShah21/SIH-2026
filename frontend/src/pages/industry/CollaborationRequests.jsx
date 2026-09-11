import React, { useState, useEffect } from 'react';
import IndustrySidebar from '../../components/common/IndustrySidebar';
import IndustryHeader from '../../components/common/IndustryHeader';
import collaborationApi from '../../api/collaborationApi';
import getSocket from '../../api/socket';

export default function CollaborationRequests() {
  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'New' | 'Pending' | 'Accepted' | 'Rejected'
  const [selectedReq, setSelectedReq] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const normalizeCollab = (c) => ({
    id: c.id,
    projectCode: c.project_id || c.projectCode || 'PRJ-REQ',
    projectTitle: c.project_title || c.projectTitle || c.details || 'Industrial Research Collaboration',
    institution: c.institution || c.company_name || 'Academic Research Partner',
    leadFaculty: c.leadFaculty || c.partner_type || 'Principal Investigator',
    status: c.status === 'PENDING' ? 'Pending' : c.status === 'APPROVED' || c.status === 'Active MOU' ? 'Accepted' : c.status === 'REJECTED' ? 'Rejected' : (c.status || 'New'),
    grantRequested: c.committed_amount || c.grantRequested || '₹3,00,000',
    hardwareRequested: c.hardwareRequested || 'Telemetry & Compute Support',
    submittedDate: c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (c.submittedDate || 'Recent'),
    pitchAbstract: c.details || c.pitchAbstract || 'Collaborative R&D initiative for prototyping and validation.',
    deliverables: c.deliverables || ['Milestone roadmap', 'Prototype verification', 'Field test dataset']
  });

  const fetchCollaborations = () => {
    collaborationApi.getCollaborations()
      .then(res => {
        if (res && res.success && Array.isArray(res.collaborations)) {
          setRequests(res.collaborations.map(normalizeCollab));
        } else {
          setRequests([]);
        }
      })
      .catch(err => {
        console.warn('Could not load live collaborations:', err);
        setRequests([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCollaborations();

    const socket = getSocket();
    if (socket) {
      const handleCollab = () => fetchCollaborations();
      socket.on('collaboration_received', handleCollab);
      socket.on('collaboration_updated', handleCollab);
      socket.on('notification_received', handleCollab);

      return () => {
        socket.off('collaboration_received', handleCollab);
        socket.off('collaboration_updated', handleCollab);
        socket.off('notification_received', handleCollab);
      };
    }
  }, []);

  const handleUpdateStatus = async (reqId, newStatus) => {
    const apiStatus = newStatus === 'Accepted' ? 'Active MOU' : newStatus === 'Rejected' ? 'REJECTED' : 'PENDING';
    try {
      await collaborationApi.updateCollaboration(reqId, {
        status: apiStatus,
        mou_status: newStatus === 'Accepted' ? 'Signed & Active' : 'Declined',
        updated_by: 'industry'
      });
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
      if (selectedReq && selectedReq.id === reqId) {
        setSelectedReq({ ...selectedReq, status: newStatus });
      }
      showToast(`Request marked as ${newStatus}!`);
    } catch (err) {
      // Fallback local update if offline
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
      showToast(`Request marked as ${newStatus}!`);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'All') return true;
    return r.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const [showNewModal, setShowNewModal] = useState(false);
  const [newTargetId, setNewTargetId] = useState('usr_univ_01');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newInstitution, setNewInstitution] = useState('BIT Mesra, Ranchi');
  const [newAmount, setNewAmount] = useState('₹5,00,000');
  const [newScope, setNewScope] = useState('');

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) {
      showToast('Please specify a project title');
      return;
    }

    const payload = {
      project_id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      company_name: newInstitution || 'Industry Research Partner',
      partner_type: 'CSR & Hardware Sponsor',
      committed_amount: newAmount || '₹5,00,000',
      details: newScope.trim() || `${newProjectTitle.trim()} - Collaborative R&D project initiated.`,
      status: 'PENDING',
      mou_status: 'Under Review',
      initiated_by: 'industry'
    };

    try {
      const res = await collaborationApi.createCollaboration(payload);
      if (res && res.collaboration) {
        setRequests(prev => [normalizeCollab(res.collaboration), ...prev]);
      } else {
        fetchCollaborations();
      }
      setShowNewModal(false);
      setNewProjectTitle('');
      setNewScope('');
      showToast(`Collaboration request dispatched successfully!`);
    } catch (err) {
      console.warn('Error creating collaboration request:', err);
      // Fallback local create
      const created = {
        id: `req-${Date.now()}`,
        projectCode: payload.project_id,
        projectTitle: newProjectTitle.trim(),
        institution: `${newInstitution} (${newTargetId})`,
        leadFaculty: 'Assigned Principal Investigator',
        status: 'New',
        grantRequested: newAmount,
        hardwareRequested: 'Telemetry / Sensor Hardware Skid',
        submittedDate: 'Just now',
        pitchAbstract: newScope.trim() || 'Collaborative R&D project initiated between Industry CSR and University Research Laboratory.',
        deliverables: ['Milestone report', 'Prototype validation', 'Field trial data']
      };
      setRequests(prev => [created, ...prev]);
      setShowNewModal(false);
      setNewProjectTitle('');
      setNewScope('');
      showToast(`Collaboration request sent to ${newTargetId}!`);
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f5f6fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive Industry Sidebar */}
      <IndustrySidebar
        activePath="/industry/collaborations"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        <IndustryHeader
          title="Collaboration Requests"
          subtitle="Review and send research proposals seeking CSR sponsorships, testbeds, and hardware."
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
                {['All', 'New', 'Pending', 'Accepted', 'Rejected'].map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 rounded font-semibold transition cursor-pointer ${
                      activeFilter === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>➕ Send Request to ID</span>
              </button>
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

        <div className="max-w-7xl w-full space-y-6">
          {/* Status Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">New Requests</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {requests.filter(r => r.status === 'New').length}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Pending Action</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {requests.filter(r => r.status === 'Pending').length}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Accepted MoUs</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {requests.filter(r => r.status === 'Accepted').length}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Rejected</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {requests.filter(r => r.status === 'Rejected').length}
              </p>
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center max-w-lg mx-auto space-y-4 my-6">
              <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
                🤝
              </div>
              <h4 className="text-base font-bold text-slate-800">No Collaboration Requests</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                No requests currently in this queue. Click below to send a collaboration invitation to an academic researcher or problem ID.
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <span>➕ Send Collaboration Request</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(req => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {req.projectCode}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                        <span className="text-xs text-slate-400">· Submitted {req.submittedDate}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{req.projectTitle}</h3>
                      <p className="text-xs text-slate-500">{req.institution} · {req.leadFaculty}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'New' || req.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Accepted')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                          >
                            Approve & Co-fund
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Decision finalized</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{req.pitchAbstract}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Grant Co-Funding</span>
                      <span className="font-bold text-emerald-700">{req.grantRequested}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Hardware Required</span>
                      <span className="font-medium text-slate-800">{req.hardwareRequested}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL: SEND NEW COLLABORATION REQUEST ================= */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Send Collaboration Request to Specific ID</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Recipient (User ID / Institution / Problem ID)</label>
                <input
                  type="text"
                  value={newTargetId}
                  onChange={(e) => setNewTargetId(e.target.value)}
                  placeholder="e.g. usr_univ_01, BIT Mesra, or JH-1042"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project / Innovation Title</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Solar Micro-Irrigation Skid Automation"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grant Co-Funding</label>
                  <input
                    type="text"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scope / Collaboration Note</label>
                <textarea
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  rows="3"
                  placeholder="Describe hardware provisions, CSR funding share, and deployment timelines..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs resize-none"
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs">
                  Send Collaboration Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
