import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function GovSidebar({ activeNav = 'overview', isMobileOpen: propMobileOpen, onCloseMobile }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const isMobileOpen = typeof propMobileOpen === 'boolean' ? propMobileOpen : internalMobileOpen;
  const closeMobile = onCloseMobile || (() => setInternalMobileOpen(false));

  const navItems = [
    {
      id: 'overview',
      label: t('nav_public_challenges', 'Civic Challenges'),
      path: '/public/challenges',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'map',
      label: t('nav_public_map', 'Problem Map'),
      path: '/public/map',
      badge: 'Live',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'ai-review',
      label: t('admin_portal', 'AI Review & Triage'),
      path: '/government/dashboard',
      badge: 'Queue',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'solutions',
      label: t('nav_solutions', 'Solutions & Projects'),
      path: '/public/solutions',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'impact',
      label: t('nav_impact', 'Impact & Metrics'),
      path: '/public/impact',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30 w-64 bg-[#064e3b] text-white flex flex-col justify-between shrink-0 select-none shadow-2xl lg:shadow-none border-r border-emerald-800 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-emerald-800/80 bg-[#043d2e]">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { navigate('/admin/ai-review'); closeMobile(); }}>
              <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-extrabold text-white text-base shadow-sm shrink-0">
                JS
              </div>
              <div className="truncate">
                <h1 className="text-sm font-bold tracking-tight text-white leading-tight">{t('brand_name', 'JanSetu')}</h1>
                <p className="text-[10px] text-emerald-300 font-semibold tracking-wide uppercase truncate">{t('govt_title', 'Govt. of Jharkhand')}</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden p-1.5 text-emerald-300 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-8rem)] custom-scrollbar">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    closeMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20'
                      : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={isActive ? 'text-slate-950' : 'text-emerald-300'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                      isActive ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Streamlined Footer */}
        <div className="p-3 border-t border-emerald-800/80 bg-[#043d2e] flex items-center justify-between">
          <div className="flex items-center justify-between w-full text-xs text-emerald-300">
            <span className="text-[11px] font-medium text-emerald-300/80">Gov Admin Hub</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              title="Logout / Switch Role"
              className="flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white hover:bg-emerald-800/80 px-2 py-1 rounded transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('nav_logout', 'Log Out')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
