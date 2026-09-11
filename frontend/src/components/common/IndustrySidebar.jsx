import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function IndustrySidebar({ 
  activePath, 
  isCollapsed: propCollapsed, 
  onToggleCollapse,
  isMobileOpen: propMobileOpen,
  onCloseMobile
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof propCollapsed === 'boolean') return propCollapsed;
    return localStorage.getItem('industry_sidebar_collapsed') === 'true';
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
    localStorage.setItem('industry_sidebar_collapsed', String(newState));
    if (onToggleCollapse) onToggleCollapse(newState);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: t('nav_dashboard', 'Dashboard'),
      path: '/industry/dashboard',
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1"></rect>
          <rect width="7" height="7" x="14" y="3" rx="1"></rect>
          <rect width="7" height="7" x="14" y="14" rx="1"></rect>
          <rect width="7" height="7" x="3" y="14" rx="1"></rect>
        </svg>
      )
    },
    {
      id: 'collaborations',
      label: t('nav_collaborations', 'Collaboration Requests'),
      path: '/industry/collaborations',
      badge: 'Active',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'projects',
      label: t('nav_projects', 'CSR Projects'),
      path: '/industry/projects',
      badge: 'R&D',
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>
        </svg>
      )
    },
    {
      id: 'problems',
      label: t('nav_bounties', 'Problems & Bounties'),
      path: '/industry/problems',
      badge: 'Feed',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      )
    },
    {
      id: 'communication',
      label: t('nav_communication', 'Communication & AI Chat'),
      path: '/industry/communication',
      badge: 'AI Copilot',
      badgeColor: 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold',
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    {
      id: 'impact',
      label: t('nav_impact', 'ESG & CSR Impact'),
      path: '/industry/impact',
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    }
  ];

  const currentPath = activePath || location.pathname;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* Responsive Fixed Sidebar on Mobile / Sticky on Desktop */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 md:z-30 w-64 md:w-[240px] md:min-w-[240px] bg-[#0c1a2c] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 select-none shadow-2xl md:shadow-none transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20 md:min-w-20' : 'md:w-[240px]'}`}
        id="industry-sidebar"
      >
        {/* Top Branding & Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
          {/* Brand Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
              onClick={() => { navigate('/industry/dashboard'); closeMobile(); }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 shrink-0 font-extrabold text-sm">
                JS
              </div>

              {!collapsed && (
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-[15px] tracking-tight">{t('brand_name', 'JanSetu')}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider text-emerald-400/90 uppercase block truncate">
                    {t('industry_portal', 'Industry CSR Hub')}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeMobile}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Collapse desktop toggle */}
            <button
              type="button"
              onClick={toggleCollapse}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden md:flex p-1 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors cursor-pointer"
            >
              <svg
                className={`w-3.5 h-3.5 transform transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 text-[13px] font-medium">
            {navItems.map((item) => {
              const isActive = currentPath.startsWith(item.path);
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
                  } py-2.5 rounded-lg transition-all text-left cursor-pointer group ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 font-semibold border-l-4 border-emerald-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-bold shrink-0 ${item.badgeColor || 'bg-emerald-500/20 text-emerald-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Streamlined Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#081321] flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center justify-between w-full text-xs text-slate-400">
              <span className="text-[11px] font-medium text-slate-400">Industry CSR</span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                title="Logout / Switch Role"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 px-2 py-1 rounded transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition cursor-pointer"
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
