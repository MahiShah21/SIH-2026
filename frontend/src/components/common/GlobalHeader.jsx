import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';

export default function GlobalHeader() {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinks = [
    { label: t('nav_public_challenges', 'Public Challenges'), path: '/public/challenges' },
    { label: t('nav_public_map', 'Problem Map'), path: '/public/map' },
    { label: t('nav_solutions', 'Solutions'), path: '/public/solutions' },
    { label: t('nav_impact', 'Impact Dashboard'), path: '/public/impact' },
    { label: t('citizen_portal', 'Citizen Portal'), path: '/citizen/dashboard' },
    { label: t('university_portal', 'University Hub'), path: '/university/dashboard' },
    { label: t('industry_portal', 'Industry CSR'), path: '/industry/dashboard' },
    { label: t('admin_portal', 'AI Review Console'), path: '/admin/ai-review' },
  ];

  return (
    <header className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-40 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="xl:hidden p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition"
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">{t('brand_name', 'JanSetu')}</span>
                <span className="hidden sm:inline-block bg-teal-50 text-teal-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-teal-200">
                  GovTech Portal
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">{t('govt_title', 'Govt. of Jharkhand')} • {t('state_innovation_network', 'State Innovation & Collaboration Network')}</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 pl-4 border-l border-slate-200">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <LanguageSwitcher />

          <Link
            to="/citizen/report-problem"
            className="hidden sm:inline-flex items-center space-x-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('nav_report_problem', 'Report Grievance')}</span>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 sm:px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">{t('nav_login', 'Login')}</span>
          </Link>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileNavOpen && (
        <div className="xl:hidden mt-3 pt-3 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="grid grid-cols-2 gap-1.5 pb-2">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>}
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-slate-100 flex sm:hidden gap-2">
            <Link
              to="/citizen/report-problem"
              onClick={() => setMobileNavOpen(false)}
              className="flex-1 text-center py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              + Report Grievance
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
