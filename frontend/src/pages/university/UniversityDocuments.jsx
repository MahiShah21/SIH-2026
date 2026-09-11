import React, { useState, useEffect } from 'react';
import UniversitySidebar from '../../components/common/UniversitySidebar';
import UniversityHeader from '../../components/common/UniversityHeader';
import projectApi from '../../api/projectApi';

const categories = [
  'All',
  'Challenge Documents',
  'Solution Proposal',
  'Technical Documents',
  'Testing Reports',
  'Pilot Reports',
  'Implementation Reports'
];

export default function UniversityDocuments() {
  const [documents, setDocuments] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All projects');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Upload form state
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Technical Documents');
  const [uploadProject, setUploadProject] = useState('');

  useEffect(() => {
    projectApi.getProjects({ accepted_only: 'true' })
      .then(res => {
        if (res && res.success && Array.isArray(res.projects)) {
          setAvailableProjects(res.projects);
          if (res.projects.length > 0) {
            setUploadProject(`${res.projects[0].id} · ${res.projects[0].title}`);
          }
          const docs = [];
          res.projects.forEach(p => {
            if (p.documents && Array.isArray(p.documents)) {
              p.documents.forEach(d => {
                docs.push({
                  id: d.id,
                  name: d.name || d.title || 'Project_Document.pdf',
                  category: d.category || 'Technical Documents',
                  project: `${p.id} · ${p.title}`,
                  date: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Active Stage',
                  size: d.size || d.file_size || '1.8 MB',
                  format: d.format || 'PDF'
                });
              });
            }
          });
          setDocuments(docs);
        }
      })
      .catch(err => {
        console.warn('Documents load notice:', err);
      });
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFileName.trim()) {
      showToast('Please enter a document file name');
      return;
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: uploadFileName.endsWith('.pdf') ? uploadFileName : `${uploadFileName}.pdf`,
      category: uploadCategory,
      project: uploadProject || 'General R&D Project',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      size: '1.2 MB',
      format: 'PDF'
    };

    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setUploadFileName('');
    showToast(`Document "${newDoc.name}" uploaded successfully!`);
  };

  const handleDeleteConfirm = () => {
    if (!docToDelete) return;
    setDocuments(documents.filter(d => d.id !== docToDelete.id));
    showToast(`Deleted "${docToDelete.name}"`);
    setDocToDelete(null);
  };

  const filteredDocs = documents.filter(d => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory;
    const matchProj = selectedProject === 'All projects' || d.project.includes(selectedProject);
    return matchCat && matchProj;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] font-sans antialiased text-slate-800 overflow-x-hidden">
      {/* Responsive University Sidebar */}
      <UniversitySidebar
        activePath="/university/documents"
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Header */}
        <UniversityHeader
          title="Documents"
          activeBadge="IP & Research Vault"
          subtitle="Project documents, testing logs, and grant reports across the innovation lifecycle."
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
          actions={
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0b1329] hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload Document</span>
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
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0d1527] text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Project Dropdown Selector */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-slate-200 max-w-xs shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Project:</span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none flex-1 cursor-pointer"
            >
              <option value="All projects">All projects</option>
              {availableProjects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id} · {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Document Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Date & Size</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 font-bold text-[10px]">
                            {doc.format}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 hover:text-teal-700 cursor-pointer">
                              {doc.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {doc.project}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {doc.date} <span className="text-slate-300 mx-1">•</span> {doc.size}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => showToast(`Downloading "${doc.name}"...`)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-teal-700 transition"
                            title="Download"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDocToDelete(doc)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredDocs.length === 0 && (
                <div className="py-12 px-4 text-center">
                  <p className="text-sm font-semibold text-slate-800">No documents found.</p>
                  <p className="text-xs text-slate-400 mt-1">No project files match the selected category or project filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL: UPLOAD DOCUMENT ================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Upload Document</h2>
                <p className="text-xs text-slate-500 mt-0.5">Add research documentation, reports or IP patents to a project.</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Document File Name *</label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="e.g. Field_Testing_Report_v2.pdf"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                >
                  <option value="Challenge Documents">Challenge Documents</option>
                  <option value="Solution Proposal">Solution Proposal</option>
                  <option value="Technical Documents">Technical Documents</option>
                  <option value="Testing Reports">Testing Reports</option>
                  <option value="Pilot Reports">Pilot Reports</option>
                  <option value="Implementation Reports">Implementation Reports</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Associated Project *</label>
                <select
                  value={uploadProject}
                  onChange={(e) => setUploadProject(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                >
                  {availableProjects.length > 0 ? (
                    availableProjects.map(p => (
                      <option key={p.id} value={`${p.id} · ${p.title}`}>
                        {p.id} · {p.title}
                      </option>
                    ))
                  ) : (
                    <option value="General University R&D Project">General University R&D Project</option>
                  )}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0b1329] hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRM ================= */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete Document</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>{docToDelete.name}</strong> from project vault?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDocToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-2xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
