import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, Plus } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';

export default function CitizenSidebar({ 
  activeNav = 'dashboard', 
  isCollapsed: propCollapsed, 
  onToggleCollapse,
  isMobileOpen: propMobileOpen,
  onCloseMobile
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof propCollapsed === 'boolean') return propCollapsed;
    return localStorage.getItem('citizen_sidebar_collapsed') === 'true';
  });

  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isMobileOpen = typeof propMobileOpen === 'boolean' ? propMobileOpen : internalMobileOpen;
  const closeMobile = onCloseMobile || (() => setInternalMobileOpen(false));

  useEffect(() => {
    if (typeof propCollapsed === 'boolean') {
      setCollapsed(propCollapsed);
    }
  }, [propCollapsed]);

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('citizen_sidebar_collapsed', String(newState));
    if (onToggleCollapse) onToggleCollapse(newState);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: t('nav_home', 'Home / Dashboard'),
      shortLabel: t('nav_home', 'Home'),
      path: '/citizen/dashboard',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'report',
      label: t('nav_report_problem', 'Report Grievance'),
      shortLabel: t('nav_report_problem', 'Report'),
      path: '/citizen/report-problem',
      badge: 'AI Fast',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'problems',
      label: t('nav_my_problems', 'My Track Record & Feedback'),
      shortLabel: t('nav_my_problems', 'Problems'),
      path: '/citizen/feedback',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30 bg-[#064e3b] text-white flex flex-col justify-between shrink-0 select-none shadow-2xl lg:shadow-xl border-r border-emerald-800 transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-emerald-800/80 bg-[#043d2e]">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => { navigate('/citizen/dashboard'); closeMobile(); }}>
              <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-extrabold text-white text-base shadow-sm shrink-0">
                JS
              </div>
              {!collapsed && (
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm font-bold tracking-tight text-white leading-tight">{t('brand_name', 'JanSetu')}</h1>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                      Citizen
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-300 font-semibold tracking-wide uppercase truncate">{t('govt_title', 'Govt. of Jharkhand')}</p>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden p-1.5 text-emerald-300 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse/Expand Button */}
            <button
              type="button"
              onClick={toggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800/80 rounded-lg transition-colors focus:outline-none"
            >
              <svg
                className={`w-4 h-4 transform transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Quick "New Report" CTA button in sidebar when expanded */}
          {!collapsed && (
            <div className="p-3 pb-1">
              <button
                type="button"
                onClick={() => {
                  navigate('/citizen/report-problem');
                  closeMobile();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('nav_report_problem', 'Report Grievance')}</span>
              </button>
            </div>
          )}

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5 text-xs font-semibold">
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
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center px-0' : 'justify-between px-3'
                  } py-2.5 rounded-xl transition-all text-left group relative cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20'
                      : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-slate-950' : 'text-emerald-300'}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-slate-950 text-emerald-300'
                          : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Streamlined Footer with Language Switcher */}
        <div className="p-3 border-t border-emerald-800/80 bg-[#043d2e] flex flex-col gap-2">
          {!collapsed ? (
            <>
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-medium text-emerald-300/80">{t('language_select', 'Language')}:</span>
                <LanguageSwitcher isCompact={true} />
              </div>
              <div className="flex items-center justify-between w-full text-xs text-emerald-300 pt-1 border-t border-emerald-800/40">
                <span className="text-[11px] font-medium text-emerald-300/80">{t('citizen_portal', 'Citizen Portal')}</span>
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
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-2">
              <LanguageSwitcher isCompact={true} />
              <button
                type="button"
                onClick={() => navigate('/login')}
                title="Logout"
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
