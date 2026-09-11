import React, { useState, useEffect } from 'react';
import UniversitySidebar from '../../components/common/UniversitySidebar';
import UniversityHeader from '../../components/common/UniversityHeader';
import { useAuth } from '../../context/AuthContext';

export default function UniversityProfile() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Profile Form Data
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || 'Faculty Coordinator',
    role: currentUser?.role === 'university' ? 'University Coordinator' : 'Institution Lead',
    department: currentUser?.department || 'Applied Engineering & Technology',
    email: currentUser?.email || 'university@jansetu.gov.in',
    phone: currentUser?.phone || '+91 94311 00000',
    institution: currentUser?.organization || 'University Institute of Technology',
    campus: currentUser?.district ? `${currentUser.district} Campus` : 'Main Campus',
    state: 'Jharkhand, India',
    nirfRank: 'Recognized Higher Education Institute',
    incubationCenter: 'Atal Community Incubation Centre (ACIC Tier-1)',
    facultyResearchers: 24,
    activeGrants: 0,
    partners: 0,
    impactScore: '100%'
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        institution: currentUser.organization || prev.institution,
        phone: currentUser.phone || prev.phone,
        department: currentUser.department || prev.department
      }));
    }
  }, [currentUser]);

  const [editFormData, setEditFormData] = useState({ ...profileData });

  // Notification Preferences
  const [preferences, setPreferences] = useState({
    challenges: true,
    proposals: true,
    collaborations: true,
    milestones: false
  });

  // Password state
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSaveProfile = () => {
    setProfileData({ ...editFormData });
    setIsEditing(false);
    showToast('University profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditFormData({ ...profileData });
    setIsEditing(false);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!oldPass || !newPass) {
      showToast('Please fill all password fields');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match');
      return;
    }
    setShowPasswordModal(false);
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    showToast('Password changed successfully.');
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive University Sidebar */}
      <UniversitySidebar
        activePath="/university/profile"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Header */}
        <UniversityHeader
          title="Profile"
          activeBadge="Institution Coordinator"
          subtitle="Manage your institutional research account, coordinator information, and notification preferences."
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          actions={
            <button
              onClick={() => {
                if (isEditing) handleSaveProfile();
                else setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 bg-[#0d1527] hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-xs transition active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
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
          {/* Profile Overview Card */}
          <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-2xl flex items-center justify-center shadow-md flex-shrink-0 tracking-wider">
                ABC
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">{profileData.institution}</h2>
                </div>
                <p className="text-slate-500 font-medium text-xs mt-0.5">{profileData.role}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{profileData.email}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{profileData.state}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-center px-4 border-r border-slate-200">
                <span className="block text-2xl font-bold text-slate-900">{profileData.activeGrants}</span>
                <span className="text-xs text-slate-500 font-medium">Projects</span>
              </div>
              <div className="text-center px-4 border-r border-slate-200">
                <span className="block text-2xl font-bold text-slate-900">{profileData.partners}</span>
                <span className="text-xs text-slate-500 font-medium">Partners</span>
              </div>
              <div className="text-center px-4">
                <span className="block text-2xl font-bold text-emerald-600">{profileData.impactScore}</span>
                <span className="text-xs text-slate-500 font-medium">Impact</span>
              </div>
            </div>
          </section>

          {/* Detailed Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Personal Information & Settings */}
            <div className="lg:col-span-8 space-y-6">
              {/* Personal Info Card */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Institutional Coordinator Information
                  </h3>
                  {isEditing && (
                    <button
                      onClick={handleCancelEdit}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase text-[10px] mb-1">Coordinator Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800 text-sm">{profileData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase text-[10px] mb-1">Department</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.department}
                        onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800 text-sm">{profileData.department}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase text-[10px] mb-1">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800 text-sm">{profileData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase text-[10px] mb-1">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800 text-sm">{profileData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase text-[10px] mb-1">Institution</label>
                    <p className="font-semibold text-slate-800 text-sm">{profileData.institution}</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase text-[10px] mb-1">Campus Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.campus}
                        onChange={(e) => setEditFormData({ ...editFormData, campus: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800 text-sm">{profileData.campus}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Preferences */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Notification Preferences
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">State Grand Challenge Alerts</p>
                      <p className="text-slate-400 text-[11px]">Notify when new departmental problem statements match university focus domains</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.challenges}
                      onChange={(e) => setPreferences({ ...preferences, challenges: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">Proposal Committee Review Updates</p>
                      <p className="text-slate-400 text-[11px]">Instant alerts on grant proposal scoring and committee tranche approvals</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.proposals}
                      onChange={(e) => setPreferences({ ...preferences, proposals: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">Industry CSR Match Notifications</p>
                      <p className="text-slate-400 text-[11px]">Receive co-sponsorship requests from corporate CSR and tech sponsors</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.collaborations}
                      onChange={(e) => setPreferences({ ...preferences, collaborations: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Institutional Credentials & Security */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Accreditation & Standing
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-teal-50/60 border border-teal-200/60 rounded-lg">
                    <span className="text-[10px] font-bold uppercase text-teal-700 block">NIRF Ranking</span>
                    <span className="text-sm font-bold text-teal-900">{profileData.nirfRank}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Incubation Facility</span>
                    <span className="text-xs font-semibold text-slate-800">{profileData.incubationCenter}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Faculty R&D Scholars</span>
                    <span className="text-xs font-semibold text-slate-800">{profileData.facultyResearchers} Registered Mentors</span>
                  </div>
                </div>
              </div>

              {/* Security & Password */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Security
                </h3>
                <p className="text-xs text-slate-500">Keep your institutional credentials secure with multi-factor auth.</p>

                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL: CHANGE PASSWORD ================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0d1527] hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
