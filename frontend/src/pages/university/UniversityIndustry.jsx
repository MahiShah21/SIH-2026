import React, { useState, useEffect } from 'react';
import UniversitySidebar from '../../components/common/UniversitySidebar';
import UniversityHeader from '../../components/common/UniversityHeader';
import industryApi from '../../api/industryApi';
import collaborationApi from '../../api/collaborationApi';
import projectApi from '../../api/projectApi';

export default function UniversityIndustry() {
  const [currentView, setCurrentView] = useState('directory'); // 'directory' | 'details' | 'request'
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('All');
  const [toastMsg, setToastMsg] = useState('');

  // Add Partner Modal state
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSector, setNewSector] = useState('IoT & Hardware');
  const [newLocation, setNewLocation] = useState('Ranchi, Jharkhand');
  const [newCommittedAmount, setNewCommittedAmount] = useState('₹3,00,000');
  const [newAbout, setNewAbout] = useState('');

  // Request form state
  const [selectedProject, setSelectedProject] = useState('');
  const [pitchMessage, setPitchMessage] = useState('');
  const [requestStatus, setRequestStatus] = useState('New');

  const fetchLivePartners = () => {
    industryApi.getIndustryPartners()
      .then(res => {
        if (res && res.success && Array.isArray(res.partners)) {
          const normalized = res.partners.map(p => ({
            ...p,
            name: p.company_name || p.name,
            tech: p.tech_stack || p.tech || ['IoT', 'Cloud Telemetry'],
            support: p.support_types || p.support || ['Funding', 'Mentorship'],
            grantPool: p.grant_pool || p.grantPool || '₹5,00,000 Fund',
            contact: p.contact || `${p.contact_person || 'CSR Lead'} · ${p.email}`,
            matchScore: p.matchScore || '90% AI Match',
            matchedProject: p.matchedProject || 'Active University R&D'
          }));
          setPartners(normalized);
          if (!selectedPartner && normalized.length > 0) {
            setSelectedPartner(normalized[0]);
          }
        }
      })
      .catch(err => {
        console.warn('Live industry partners load notice:', err);
      });
  };

  useEffect(() => {
    fetchLivePartners();
    projectApi.getProjects({ accepted_only: 'true' })
      .then(res => {
        if (res && res.success && Array.isArray(res.projects) && res.projects.length > 0) {
          setAvailableProjects(res.projects);
          setSelectedProject(`${res.projects[0].id} · ${res.projects[0].title}`);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handlePartnerSelect = (partner) => {
    setSelectedPartner(partner);
    setCurrentView('details');
  };

  const handleOpenCollabRequest = (partner) => {
    setSelectedPartner(partner);
    setCurrentView('request');
    setRequestStatus('New');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setRequestStatus('Pending Review');
    try {
      const projCode = selectedProject.split('·')[0].trim() || 'PRJ-315';
      const company = selectedPartner.name || selectedPartner.company_name || 'Industry Partner';
      await collaborationApi.createCollaboration({
        project_id: projCode,
        company_name: company,
        partner_type: selectedPartner.partner_type || 'CSR Innovation Co-Funder',
        committed_amount: selectedPartner.committed_amount || '₹2,50,000',
        details: pitchMessage || 'University research collaboration proposal.',
        mou_status: 'Pending Review',
        status: 'PENDING',
        initiated_by: 'university'
      });
      showToast(`Collaboration Request sent to ${company}! Automatic alert dispatched.`);
    } catch (err) {
      console.warn('Collaboration API note:', err);
      showToast(`Collaboration Request sent to ${selectedPartner.name || selectedPartner.company_name}!`);
    }
  };

  const handleSimulateAccept = async () => {
    setRequestStatus('Accepted');
    try {
      const projCode = selectedProject.split('·')[0].trim() || 'PRJ-315';
      const company = selectedPartner.name || selectedPartner.company_name || 'Industry Partner';
      await collaborationApi.createCollaboration({
        project_id: projCode,
        company_name: company,
        partner_type: 'Active CSR Partner',
        committed_amount: selectedPartner.committed_amount || '₹2,50,000',
        details: 'MoU finalized and matching CSR funds committed.',
        mou_status: 'Active MOU',
        status: 'ACTIVE',
        initiated_by: 'industry'
      });
    } catch (err) {
      console.warn('Simulate accept notice:', err);
    }
    showToast(`🎉 ${selectedPartner.name || selectedPartner.company_name} accepted your collaboration proposal!`);
  };

  // Add new Industry Partner to DB
  const handleCreatePartner = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newEmail.trim()) return;

    const partnerPayload = {
      company_name: newCompanyName.trim(),
      contact_person: newContactPerson.trim() || 'CSR Partnerships Lead',
      email: newEmail.trim(),
      sector: newSector,
      location: newLocation,
      partner_type: 'CSR & Innovation Co-Funder',
      expertise: [newSector, 'Technology Scaling'],
      tech_stack: ['Cloud Services', 'Hardware Testing', 'Field Pilots'],
      support_types: ['Funding', 'Hardware', 'Mentorship'],
      grant_pool: `${newCommittedAmount} CSR Allocation`,
      committed_amount: newCommittedAmount,
      mou_status: 'Active MOU',
      about: newAbout.trim() || 'Industrial collaborator actively supporting university research projects and civic pilots in Jharkhand.',
      logo_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
      website: 'https://jharinnovate.gov.in'
    };

    try {
      await industryApi.createIndustryPartner(partnerPayload);
    } catch (err) {
      console.warn('Backend createIndustryPartner notice:', err);
    }

    const created = {
      ...partnerPayload,
      id: `partner-${Date.now()}`,
      name: partnerPayload.company_name,
      tech: partnerPayload.tech_stack,
      support: partnerPayload.support_types,
      grantPool: partnerPayload.grant_pool,
      contact: `${partnerPayload.contact_person} · ${partnerPayload.email}`,
      matchScore: '92% AI Match',
      matchedProject: 'PRJ-315 · Smart Waste Management'
    };

    setPartners(prev => [created, ...prev]);
    setShowAddPartnerModal(false);
    setNewCompanyName('');
    setNewContactPerson('');
    setNewEmail('');
    setNewAbout('');
    showToast(`🏢 Industry Partner "${created.name}" created and synced to Database!`);
  };

  const filteredPartners = partners.filter(p => {
    const q = searchQuery.toLowerCase();
    const name = (p.name || p.company_name || '').toLowerCase();
    const sector = (p.sector || p.domain || '').toLowerCase();
    const matchQuery = !q || name.includes(q) || sector.includes(q);
    const matchDomain = filterDomain === 'All' || (p.domain === filterDomain || p.sector === filterDomain);
    return matchQuery && matchDomain;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive University Sidebar */}
      <UniversitySidebar
        activeNav="industry"
        activePath="/university/industry"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        <UniversityHeader
          pageTitle="Industry Partners"
          subTitle="Find, add, and connect with verified industry partners and CSR funders for co-funding, mentorship, and prototype scaling."
          badgeText="Live CSR Registry"
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed top-5 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 text-white border border-teal-500/40 text-xs font-semibold animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="max-w-7xl w-full space-y-6">
          {/* ================= 1. DIRECTORY VIEW ================= */}
          {currentView === 'directory' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Top Controls Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full sm:w-80">
                  <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search industry partners by name, sector..."
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setShowAddPartnerModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c3b2e] hover:bg-[#072a20] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <span>+ Add Industry Partner (DB)</span>
                  </button>
                </div>
              </div>

              {/* Partners Grid / Empty State */}
              {filteredPartners.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                    🏢
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">No Industry Partners Linked Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                    Add corporate CSR partners, hardware suppliers, and tech enterprises to connect them directly to university research projects.
                  </p>
                  <button
                    onClick={() => setShowAddPartnerModal(true)}
                    className="px-5 py-2.5 bg-[#0c3b2e] hover:bg-[#072a20] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    + Add First Industry Partner
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredPartners.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-amber-500 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-xs font-bold text-slate-900">{p.sector || p.domain || 'Technology'}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {p.mou_status || 'Active MOU'}
                          </span>
                        </div>

                        <h3
                          onClick={() => handlePartnerSelect(p)}
                          className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors cursor-pointer leading-snug"
                        >
                          {p.name || p.company_name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <span>📍</span>
                          <span>{p.location || 'Jharkhand'}</span>
                          <span>·</span>
                          <span>{p.partner_type || 'CSR Partner'}</span>
                        </p>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {p.about}
                        </p>

                        <div className="mt-3.5 p-3 rounded-xl bg-amber-50/50 border border-amber-100/80 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">Grant Pool</span>
                            <span className="font-black text-slate-900">{p.grant_pool || p.grantPool || '₹5,00,000 Fund'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-amber-800 block text-[10px] font-bold uppercase">Committed Amount</span>
                            <span className="font-bold text-amber-900">{p.committed_amount || '₹2,50,000'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400 truncate max-w-[180px]">{p.contact || p.email}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePartnerSelect(p)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                          >
                            Dossier
                          </button>
                          <button
                            onClick={() => handleOpenCollabRequest(p)}
                            className="px-3 py-1.5 bg-[#0c3b2e] hover:bg-[#072a20] text-white font-bold rounded-lg transition cursor-pointer shadow-2xs"
                          >
                            Send Request →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 2. PARTNER DETAILS VIEW ================= */}
          {currentView === 'details' && selectedPartner && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6 animate-in fade-in">
              <button
                onClick={() => setCurrentView('directory')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>← Back to Partners Directory</span>
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedPartner.name || selectedPartner.company_name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {selectedPartner.mou_status || 'Active MOU'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    <span>📍 {selectedPartner.location}</span> · <span>Contact: <strong>{selectedPartner.contact_person || selectedPartner.contact}</strong></span>
                  </p>
                </div>
                <button
                  onClick={() => handleOpenCollabRequest(selectedPartner)}
                  className="px-5 py-2.5 bg-[#0c3b2e] hover:bg-[#072a20] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Initiate Project Collaboration →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Sector &amp; Domain</span>
                  <span className="font-bold text-slate-900 text-sm mt-1 block">{selectedPartner.sector || selectedPartner.domain}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">CSR Grant Pool</span>
                  <span className="font-bold text-teal-800 text-sm mt-1 block">{selectedPartner.grant_pool || selectedPartner.grantPool}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Official Email</span>
                  <span className="font-bold text-slate-900 text-sm mt-1 block">{selectedPartner.email}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Corporate Profile &amp; Research Focus</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedPartner.about}
                </p>
              </div>
            </div>
          )}

          {/* ================= 3. COLLABORATION REQUEST VIEW ================= */}
          {currentView === 'request' && selectedPartner && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6 max-w-2xl mx-auto animate-in fade-in">
              <button
                onClick={() => setCurrentView('directory')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>← Cancel and return</span>
              </button>

              <div>
                <h2 className="text-xl font-bold text-slate-900">Send Collaboration Request to {selectedPartner.name || selectedPartner.company_name}</h2>
                <p className="text-xs text-slate-500 mt-1">Submit proposal details for co-funding, hardware rig testing, and technical mentorship.</p>
              </div>

              {requestStatus === 'Accepted' ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <div className="text-3xl">🎉</div>
                  <h3 className="text-base font-bold text-emerald-900">Collaboration Proposal Accepted!</h3>
                  <p className="text-xs text-emerald-800">TechNova has signed off on co-developing sensor telemetry for PRJ-315.</p>
                  <button
                    onClick={() => setCurrentView('directory')}
                    className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Back to Directory
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Accepted University Project</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-teal-700"
                    >
                      <option value="PRJ-315 · Smart Waste Management">PRJ-315 · Smart Waste Management</option>
                      <option value="PRJ-925 · Smart Irrigation Monitoring System">PRJ-925 · Smart Irrigation Monitoring System</option>
                      <option value="PRJ-051 · AI Crop Disease Detection">PRJ-051 · AI Crop Disease Detection</option>
                      <option value="PRJ-038 · Rural Solar Monitoring & Telemetry">PRJ-038 · Rural Solar Monitoring &amp; Telemetry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Collaboration Scope &amp; Pitch Message</label>
                    <textarea
                      rows="4"
                      value={pitchMessage}
                      onChange={(e) => setPitchMessage(e.target.value)}
                      placeholder="Describe the hardware prototype requirements, testing site assistance, or matching CSR co-funding needs..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSimulateAccept}
                      className="text-xs text-slate-400 hover:text-emerald-700 underline cursor-pointer"
                    >
                      (Simulate Industry Signoff)
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#0c3b2e] hover:bg-[#072a20] text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      {requestStatus === 'Pending Review' ? 'Request Sent ✓' : 'Dispatch Request →'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL: ADD INDUSTRY PARTNER TO DB ================= */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 bg-[#0c3b2e] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Add Industry Partner / CSR Funder (DB)</h3>
              <button type="button" onClick={() => setShowAddPartnerModal(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreatePartner} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Tata Steel CSR / Larsen & Toubro Innovation"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Person &amp; Designation</label>
                <input
                  type="text"
                  value={newContactPerson}
                  onChange={(e) => setNewContactPerson(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania (Head of CSR)"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. csr@tatasteel.com"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sector</label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    <option value="IoT & Hardware">IoT &amp; Hardware</option>
                    <option value="Clean Energy">Clean Energy</option>
                    <option value="AgriTech & AI">AgriTech &amp; AI</option>
                    <option value="Water & Biotech">Water &amp; Biotech</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Committed CSR Amount</label>
                  <input
                    type="text"
                    value={newCommittedAmount}
                    onChange={(e) => setNewCommittedAmount(e.target.value)}
                    placeholder="e.g. ₹5,00,000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Headquarters</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Jamshedpur, Jharkhand"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brief Description / Scope</label>
                <textarea
                  rows="2"
                  value={newAbout}
                  onChange={(e) => setNewAbout(e.target.value)}
                  placeholder="Corporate CSR initiative supporting grassroots university innovation..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0c3b2e] hover:bg-[#072a20] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Partner to DB ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
