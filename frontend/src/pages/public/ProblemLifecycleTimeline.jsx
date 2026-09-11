import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Screen ID: e1b4bb72b815407bba27fa957947c4c8
 * Title: Problem to Solution Lifecycle Visual Timeline
 * Category: Public Details
 * Persona: Public
 */
export default function ProblemLifecycleTimeline() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('public');

  return (
    <div className="w-full min-h-screen text-slate-800 antialiased font-sans">
      {/*  BEGIN: MainContainer  */}
<div className="flex-1 flex overflow-hidden">
{/*  BEGIN: CollapsibleSidebar  */}
<aside className="w-60 transition-all duration-300 ease-in-out bg-[#064e3b] text-white flex flex-col justify-between shrink-0 z-30 shadow-xl select-none" data-purpose="collapsible-navigation-sidebar" id="app-sidebar">
{/*  Top Brand Header & Navigation  */}
<div className="flex flex-col">
{/*  Logo Header  */}
<div className="h-16 flex items-center justify-between px-4 border-b border-emerald-800/60">
<div className="flex items-center gap-3 overflow-hidden">
{/*  Icon Symbol  */}
<div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300 font-bold">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
</svg>
</div>
{/*  Brand Text (Hidden when collapsed)  */}
<div className="sidebar-text flex flex-col leading-tight whitespace-nowrap overflow-hidden transition-opacity duration-200">
<span className="font-bold text-base tracking-wide text-white">JharInnovate</span>
<span className="text-[10px] text-emerald-300/80 uppercase tracking-widest font-semibold">Govt. of Jharkhand</span>
</div>
</div>
{/*  Collapse/Expand Toggle Button  */}
<button aria-label="Toggle Sidebar" className="text-emerald-300 hover:text-white p-1 rounded hover:bg-emerald-800/70 transition-colors" id="sidebar-toggle-btn">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</button>
</div>
{/*  Sidebar Nav Links  */}
<nav aria-label="Main Navigation" className="p-3 space-y-1.5">
{/*  Home  */}
<a className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-emerald-100/80 hover:text-white hover:bg-emerald-800/50 text-sm font-medium transition-colors group" href="#">
<svg className="w-5 h-5 shrink-0 text-emerald-300/80 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
</svg>
<span className="sidebar-text truncate">Home</span>
</a>
{/*  Report (Submit)  */}
<a className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-emerald-100/80 hover:text-white hover:bg-emerald-800/50 text-sm font-medium transition-colors group" href="#">
<svg className="w-5 h-5 shrink-0 text-emerald-300/80 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
</svg>
<span className="sidebar-text truncate flex-1">Report</span>
<span className="sidebar-text text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-400 text-emerald-950">LIVE</span>
</a>
{/*  Problems (Active Item)  */}
<a className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold shadow-inner transition-colors" href="javascript:showDirectoryView()">
<svg className="w-5 h-5 shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="sidebar-text truncate flex-1">Problems</span>
<span className="sidebar-text w-2 h-2 rounded-full bg-white animate-pulse"></span>
</a>
{/*  Profile  */}
<a className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-emerald-100/80 hover:text-white hover:bg-emerald-800/50 text-sm font-medium transition-colors group" href="#">
<svg className="w-5 h-5 shrink-0 text-emerald-300/80 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
</svg>
<span className="sidebar-text truncate">Profile</span>
</a>
</nav>
</div>
{/*  Bottom Log Out  */}
<div className="p-3 border-t border-emerald-800/60">
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-200/80 hover:text-white hover:bg-emerald-800/50 text-sm font-medium transition-colors group" href="#">
<svg className="w-5 h-5 shrink-0 text-emerald-300/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="sidebar-text truncate">Log Out</span>
</a>
</div>
</aside>
{/*  END: CollapsibleSidebar  */}
{/*  BEGIN: MainWrapper  */}
<div className="flex-1 flex flex-col h-full overflow-hidden">
{/*  BEGIN: TopBar  */}
<header className="h-16 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between shrink-0 z-20" data-purpose="application-header">
{/*  Breadcrumb & Department Subtitle  */}
<div className="flex items-center gap-3">
<div className="flex flex-col">
<div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
<span className="">Citizen Portal</span>
<span className="">/</span>
<span className="text-emerald-700 font-semibold" id="breadcrumb-sub">JH-C1042 Details</span>
</div>
<h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase">JHARKHAND Civic Problem Resolution</h1>
</div>
</div>
{/*  Live Sync, Notification & Profile Capsule  */}
<div className="flex items-center gap-4">
{/*  Live Civic Sync Pill  */}
<div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span className="">Live Civic Sync (08 Sep 2026)</span>
</div>
{/*  Notification Bell with Alert Dot  */}
<button aria-label="Notifications" className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors" type="button">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
</button>
{/*  User Pill  */}
<div className="flex items-center gap-2.5 pl-2 sm:border-l border-slate-200">
<div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-300 font-bold text-xs flex items-center justify-center tracking-wider">
              RK
            </div>
<div className="hidden md:flex flex-col text-left">
<span className="text-xs font-bold text-slate-800 leading-none">Rajesh Kumar</span>
<span className="text-[11px] text-slate-500 mt-0.5">Gumla Citizen</span>
</div>
</div>
</div>
</header>
{/*  END: TopBar  */}
{/*  BEGIN: ScrollableContent  */}
<main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 md:px-8">
{/*  VIEW 1: Directory Cards View  */}
<div className="max-w-7xl mx-auto space-y-6 hidden" id="directory-view">
{/*  Page Heading Header  */}
<div>
<h2 className="text-2xl font-black text-slate-900 tracking-tight">Public Problems</h2>
<p className="text-sm text-slate-500 mt-0.5">All problems reported across the JharInnovate platform</p>
</div>
{/*  BEGIN: FilterSection  */}
<section className="space-y-4" data-purpose="search-and-filtering">
{/*  Search Bar  */}
<div className="relative w-full">
<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
<input className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-shadow" id="search-input" placeholder="Search by title, ID, or district..." type="text" />
</div>
{/*  Status Filter Pills  */}
<div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm no-scrollbar">
<button className="status-btn px-4 py-1.5 rounded-full font-medium text-xs md:text-sm bg-slate-900 text-white transition-all shadow-sm" data-filter-type="status" data-value="All">
                All
              </button>
<button className="status-btn px-4 py-1.5 rounded-full font-medium text-xs md:text-sm bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all" data-filter-type="status" data-value="Active">
                Active
              </button>
<button className="status-btn px-4 py-1.5 rounded-full font-medium text-xs md:text-sm bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all" data-filter-type="status" data-value="In Progress">
                In Progress
              </button>
<button className="status-btn px-4 py-1.5 rounded-full font-medium text-xs md:text-sm bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all" data-filter-type="status" data-value="Resolved">
                Resolved
              </button>
<button className="status-btn px-4 py-1.5 rounded-full font-medium text-xs md:text-sm bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all" data-filter-type="status" data-value="Closed">
                Closed
              </button>
</div>
{/*  Category Filter Pills (2 Rows on wrap)  */}
<div className="flex flex-wrap items-center gap-2 text-xs font-medium">
<button className="category-btn px-3.5 py-1.5 rounded-full bg-amber-600 text-white shadow-sm transition-colors" data-filter-type="category" data-value="All">
                All Categories
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Education">
                Education
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Healthcare">
                Healthcare
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Agriculture">
                Agriculture
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Water">
                Water
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Environment">
                Environment
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Energy">
                Energy
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Sanitation">
                Sanitation
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Urban Development">
                Urban Development
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Accessibility">
                Accessibility
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Rural Livelihood">
                Rural Livelihood
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Public Administration">
                Public Administration
              </button>
<button className="category-btn px-3.5 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors" data-filter-type="category" data-value="Other">
                Other
              </button>
</div>
</section>
{/*  END: FilterSection  */}
{/*  Found Problems Counter  */}
<div className="flex items-center justify-between pt-1">
<span className="text-sm font-semibold text-slate-600" id="results-count">8 problems found</span>
</div>
{/*  BEGIN: ProblemsGrid  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10" data-purpose="problems-card-grid" id="problems-grid">
          <div data-id="JH-C1042" className="problem-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group">
            <div>
              {/*  Top Row: ID + Category & Priority Pill  */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono tracking-tight text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">JH-C1042</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/40">Agriculture</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50/90 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> High Priority
          </span>
              </div>

              {/*  Title  */}
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors leading-snug">
                Irrigation shortage affecting village farms
              </h3>

              {/*  Meta info: Location, Date, Supporters  */}
              <div className="mt-2.5 text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Karanjo, Bharno, Gumla, Jharkhand
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    2026-07-12
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-medium pt-0.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="">342 supporting</span>
                  
                </div>
              </div>
            </div>

            {/*  Bottom Section: Status pill, progress percentage & bar  */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                  Field Pilot
                </span>
                <span className="text-xs font-bold text-slate-700">65%</span>
              </div>

              {/*  Progress bar  */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 bg-[#064e3b]" style={{"width":"65%"}}></div>
              </div>

              {/*  View Details link  */}
              <div className="mt-3 flex justify-end">
                <button type="button" className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                  View details <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </div>
          </div>
        
          <div data-id="JH-C1043" className="problem-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group">
            <div>
              {/*  Top Row: ID + Category & Priority Pill  */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono tracking-tight text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">JH-C1043</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/40">Water</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50/90 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> High Priority
          </span>
              </div>

              {/*  Title  */}
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors leading-snug">
                Fluoride contamination in drinking water
              </h3>

              {/*  Meta info: Location, Date, Supporters  */}
              <div className="mt-2.5 text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Mahuadanr, Latehar, Jharkhand
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    2026-07-20
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-medium pt-0.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="">210 supporting</span>
                  
                </div>
              </div>
            </div>

            {/*  Bottom Section: Status pill, progress percentage & bar  */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                  University Matched
                </span>
                <span className="text-xs font-bold text-slate-700">20%</span>
              </div>

              {/*  Progress bar  */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 bg-[#064e3b]" style={{"width":"20%"}}></div>
              </div>

              {/*  View Details link  */}
              <div className="mt-3 flex justify-end">
                <button type="button" className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                  View details <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </div>
          </div>
        
          <div data-id="JH-C1044" className="problem-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group">
            <div>
              {/*  Top Row: ID + Category & Priority Pill  */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono tracking-tight text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">JH-C1044</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/40">Healthcare</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50/90 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> High Priority
          </span>
              </div>

              {/*  Title  */}
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors leading-snug">
                PHC cold chain refrigerator outage
              </h3>

              {/*  Meta info: Location, Date, Supporters  */}
              <div className="mt-2.5 text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Namkum, Ranchi, Jharkhand
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    2026-08-02
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-medium pt-0.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="">178 supporting</span>
                  
                </div>
              </div>
            </div>

            {/*  Bottom Section: Status pill, progress percentage & bar  */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-sky-50 text-sky-700 border-sky-200">
                  Project Development
                </span>
                <span className="text-xs font-bold text-slate-700">35%</span>
              </div>

              {/*  Progress bar  */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 bg-[#064e3b]" style={{"width":"35%"}}></div>
              </div>

              {/*  View Details link  */}
              <div className="mt-3 flex justify-end">
                <button type="button" className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                  View details <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </div>
          </div>
        
          <div data-id="JH-C1045" className="problem-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group">
            <div>
              {/*  Top Row: ID + Category & Priority Pill  */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono tracking-tight text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">JH-C1045</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/40">Public Administration</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50/90 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium Priority
          </span>
              </div>

              {/*  Title  */}
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors leading-snug">
                Delayed PDS ration distribution
              </h3>

              {/*  Meta info: Location, Date, Supporters  */}
              <div className="mt-2.5 text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Kanke, Ranchi, Jharkhand
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    2026-06-28
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-medium pt-0.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="">540 supporting</span>
                  
                </div>
              </div>
            </div>

            {/*  Bottom Section: Status pill, progress percentage & bar  */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                  Implemented / Scaled
                </span>
                <span className="text-xs font-bold text-slate-700">100%</span>
              </div>

              {/*  Progress bar  */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 bg-emerald-600" style={{"width":"100%"}}></div>
              </div>

              {/*  View Details link  */}
              <div className="mt-3 flex justify-end">
                <button type="button" className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                  View details <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </div>
          </div>
        
          <div data-id="JH-C1046" className="problem-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group">
            <div>
              {/*  Top Row: ID + Category & Priority Pill  */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono tracking-tight text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">JH-C1046</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/40">Rural Livelihood</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50/90 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> High Priority
          </span>
              </div>

              {/*  Title  */}
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors leading-snug">
                Forest produce transport blocked by unmet road connectivity
              </h3>

              {/*  Meta info: Location, Date, Supporters  */}
              <div className="mt-2.5 text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Goilkera, West Singhbhum, Jharkhand
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    2026-07-30
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-medium pt-0.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="">156 supporting</span>
                  
                </div>
              </div>
            </div>

            {/*  Bottom Section: Status pill, progress percentage & bar  */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-cyan-50 text-cyan-700 border-cyan-200">
                  Prototype
                </span>
                <span className="text-xs font-bold text-slate-700">55%</span>
              </div>

              {/*  Progress bar  */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 bg-[#064e3b]" style={{"width":"55%"}}></div>
              </div>

              {/*  View Details link  */}
              <div className="mt-3 flex justify-end">
                <button type="button" className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                  View details <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </div>
          </div>
        
          <div data-id="JH-C1047" className="problem-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group">
            <div>
              {/*  Top Row: ID + Category & Priority Pill  */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono tracking-tight text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">JH-C1047</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/40">Education</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50/90 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium Priority
          </span>
              </div>

              {/*  Title  */}
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors leading-snug">
                School dropout spike in tribal blocks
              </h3>

              {/*  Meta info: Location, Date, Supporters  */}
              <div className="mt-2.5 text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Torpa, Khunti, Jharkhand
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    2026-08-10
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-medium pt-0.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="">92 supporting</span>
                  
                </div>
              </div>
            </div>

            {/*  Bottom Section: Status pill, progress percentage & bar  */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
                  Reviewed / Verified
                </span>
                <span className="text-xs font-bold text-slate-700">15%</span>
              </div>

              {/*  Progress bar  */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 bg-[#064e3b]" style={{"width":"15%"}}></div>
              </div>

              {/*  View Details link  */}
              <div className="mt-3 flex justify-end">
                <button type="button" className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                  View details <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </div>
          </div>
        
          <div data-id="JH-C1048" className="problem-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group">
            <div>
              {/*  Top Row: ID + Category & Priority Pill  */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono tracking-tight text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">JH-C1048</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/40">Energy</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50/90 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium Priority
          </span>
              </div>

              {/*  Title  */}
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors leading-snug">
                Solar microgrid failure in remote hamlet
              </h3>

              {/*  Meta info: Location, Date, Supporters  */}
              <div className="mt-2.5 text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Kolebira, Simdega, Jharkhand
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    2026-08-15
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-medium pt-0.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="">64 supporting</span>
                  
                </div>
              </div>
            </div>

            {/*  Bottom Section: Status pill, progress percentage & bar  */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-sky-50 text-sky-700 border-sky-200">
                  Project Development
                </span>
                <span className="text-xs font-bold text-slate-700">40%</span>
              </div>

              {/*  Progress bar  */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 bg-[#064e3b]" style={{"width":"40%"}}></div>
              </div>

              {/*  View Details link  */}
              <div className="mt-3 flex justify-end">
                <button type="button" className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                  View details <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </div>
          </div>
        
          <div data-id="JH-C1049" className="problem-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group">
            <div>
              {/*  Top Row: ID + Category & Priority Pill  */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono tracking-tight text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">JH-C1049</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/40">Sanitation</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Low Priority
          </span>
              </div>

              {/*  Title  */}
              <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-emerald-700 transition-colors leading-snug">
                Open defecation &amp; toilet misuse in panchayat
              </h3>

              {/*  Meta info: Location, Date, Supporters  */}
              <div className="mt-2.5 text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Shikaripara, Dumka, Jharkhand
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    2026-08-22
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-medium pt-0.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span className="">28 supporting</span>
                  
                </div>
              </div>
            </div>

            {/*  Bottom Section: Status pill, progress percentage & bar  */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                  AI Screened
                </span>
                <span className="text-xs font-bold text-slate-700">5%</span>
              </div>

              {/*  Progress bar  */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 bg-[#064e3b]" style={{"width":"5%"}}></div>
              </div>

              {/*  View Details link  */}
              <div className="mt-3 flex justify-end">
                <button type="button" className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                  View details <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
{/*  END: ProblemsGrid  */}
</div>
{/*  VIEW 2: Problem Details Page (Matches Reference Screenshot IMAGE_3)  */}
<div className="max-w-5xl mx-auto space-y-4 pb-12" data-purpose="problem-details-page" id="details-view">
{/*  Top Back Navigation  */}
<div>
<button className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"  type="button">
<svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="">Back</span>
</button>
</div>
{/*  1. Problem Header Card  */}
<div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
{/*  Badges Row  */}
<div className="flex flex-wrap items-center gap-2">
<span className="px-2.5 py-0.5 rounded-md text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/80 tracking-wide font-mono" id="detail-id">JH-C1042</span>
<span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/80" id="detail-priority-badge"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> High Priority</span>
<span className="px-3 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200" id="detail-stage-badge">Field Pilot</span>
</div>
{/*  Title  */}
<h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug" id="detail-title">Irrigation shortage affecting village farms</h2>
{/*  Metadata Line with Icons  */}
<div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500">
<span className="inline-flex items-center gap-1.5">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
<path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="" id="detail-location">Karanjo, Bharno, Gumla, Jharkhand</span>
</span>
<span className="inline-flex items-center gap-1.5">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="" id="detail-date">2026-07-12</span>
</span>
<span className="inline-flex items-center gap-1.5">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="" id="detail-supporters">342 supporting</span>
</span>
</div>
{/*  Description Text  */}
<p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1" id="detail-description">Farmers in multiple villages of Gumla block rely on rain-fed agriculture. The minor irrigation canal has been damaged for two seasons, leaving paddy fields dry during the critical monsoon gap. Many small and marginal farmers report crop loss.</p>
{/*  Overall Progress Section  */}
<div className="pt-3">
<div className="flex items-center justify-between text-[11px] font-bold text-slate-500 tracking-wider mb-1.5">
<span className="">OVERALL PROGRESS</span>
<span className="text-slate-800 text-xs font-semibold" id="detail-progress-label">65%</span>
</div>
<div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
<div className="bg-[#1b4332] h-full rounded-full transition-all duration-500" id="detail-progress-bar" style={{"width":"65%"}}></div>
</div>
</div>
</div>
{/*  2. AI Analysis Card  */}
<div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
{/*  Header  */}
<div className="flex items-center gap-2">
<span className="text-base text-slate-700">✦</span>
<h3 className="text-sm sm:text-base font-bold text-slate-900">AI Analysis</h3>
</div>
{/*  Grid info  */}
<div className="space-y-4">
{/*  Row 1: Category & Subcategory  */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div>
<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CATEGORY</div>
<div className="text-sm font-semibold text-slate-900 mt-0.5" id="detail-category">Agriculture</div>
</div>
<div>
<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SUBCATEGORY</div>
<div className="text-sm font-semibold text-slate-900 mt-0.5" id="detail-subcategory">Irrigation &amp; Farming</div>
</div>
</div>
{/*  Row 2: Priority & Affected Population  */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div>
<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRIORITY</div>
<div className="text-sm font-semibold text-slate-900 mt-0.5" id="detail-priority-text">High</div>
</div>
<div>
<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AFFECTED POPULATION</div>
<div className="text-sm font-semibold text-slate-900 mt-0.5" id="detail-population">1,250</div>
</div>
</div>
{/*  Row 3: Required Expertise  */}
<div>
<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">REQUIRED EXPERTISE</div>
<div className="flex flex-wrap items-center gap-2" id="detail-expertise-container">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 bg-slate-100/90 border border-slate-200/70">Water Management</span>
        
          <span className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 bg-slate-100/90 border border-slate-200/70">Agricultural Engineering</span>
        
          <span className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 bg-slate-100/90 border border-slate-200/70">IoT</span>
        </div>
</div>
{/*  Row 4: AI Summary Container  */}
<div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">AI SUMMARY</div>
<p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed" id="detail-ai-summary">This agriculture issue in the irrigation &amp; farming domain affects an estimated 1,250 residents. AI flags it as high priority based on urgency signals and scale of affected population. Recommended expertise: Water Management, Agricultural Engineering, IoT.</p>
</div>
</div>
</div>
{/*  3. Assigned Solution Card  */}
<div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
{/*  Header  */}
<div className="flex items-center gap-2">
<span className="text-base text-slate-700">🎓</span>
<h3 className="text-sm sm:text-base font-bold text-slate-900">Assigned Solution</h3>
</div>
{/*  Grid fields  */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
<div>
<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UNIVERSITY / INSTITUTION</div>
<div className="text-sm font-semibold text-slate-900 mt-0.5" id="detail-institution">Birsa Agricultural University</div>
</div>
<div>
<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DEPARTMENT</div>
<div className="text-sm font-semibold text-slate-900 mt-0.5" id="detail-department">College of Agricultural Engineering</div>
</div>
<div>
<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PROJECT TITLE</div>
<div className="text-sm font-semibold text-slate-900 mt-0.5" id="detail-project-title">Solar-powered micro-irrigation pilot for rain-fed farms</div>
</div>
<div>
<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">FACULTY MENTOR</div>
<div className="text-sm font-semibold text-slate-900 mt-0.5" id="detail-mentor">Dr. R. K. Sahu</div>
</div>
</div>
</div>
{/*  4. Bottom Action Bar (4 Equal-width buttons row matching Screenshot)  */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">{/*  Button 1: Support Problem  */}<button className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1b4332] text-white hover:bg-[#143427] font-medium text-xs sm:text-sm shadow-sm transition-colors" id="detail-support-btn" type="button"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="" id="detail-support-text">Support Problem</span></button>{/*  Button 2: Track Status  */}<button className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm shadow-sm transition-colors" id="btn-track-status"  type="button"><svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">Track Status</span></button>{/*  Button 3: View Project  */}<button className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm shadow-sm transition-colors" id="btn-view-project"  type="button"><svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">View Project</span></button>{/*  Button 4: Give Feedback  */}<button className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm shadow-sm transition-colors" id="btn-give-feedback"  type="button"><svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">Give Feedback</span></button></div>
</div><div className="max-w-xl mx-auto space-y-4 pb-12 hidden" data-purpose="lifecycle-timeline-view" id="timeline-view"><div className="pt-1"><button className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors group cursor-pointer"  type="button"><svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">Back to Problem</span></button></div><div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4"><div className="text-xs font-bold font-mono tracking-wide text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 inline-block" id="timeline-id">JH-C1042</div><h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug" id="timeline-title">Irrigation shortage affecting village farms</h2><div className="flex items-center gap-1 text-xs text-slate-500 font-medium"><svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span id="timeline-location" className="">Gumla, Jharkhand</span></div><div className="pt-2"><div className="flex items-center justify-between text-[11px] font-bold text-slate-500 tracking-wider mb-2"><span className="">OVERALL PROGRESS</span><span className="text-slate-900 text-sm font-bold" id="timeline-progress-label">65%</span></div><div className="w-full bg-[#dae2fd]/60 rounded-full h-2.5 overflow-hidden"><div className="bg-[#005d42] h-full rounded-full transition-all duration-500" id="timeline-progress-bar" style={{"width":"65%"}}></div></div></div></div><div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm"><h3 className="text-base font-bold text-slate-900 mb-6">Lifecycle Timeline</h3><div className="relative space-y-0" id="timeline-steps-container"><div className="relative flex items-start gap-4 pb-6"><div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-[#1b4332]"></div><div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center shrink-0 z-10 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg></div><div className="pt-0.5"><div className="font-bold text-slate-800 text-xs sm:text-sm">Submitted</div><div className="text-[11px] text-slate-400">Completed</div></div></div><div className="relative flex items-start gap-4 pb-6"><div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-[#1b4332]"></div><div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center shrink-0 z-10 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg></div><div className="pt-0.5"><div className="font-bold text-slate-800 text-xs sm:text-sm">AI Screened</div><div className="text-[11px] text-slate-400">Completed</div></div></div><div className="relative flex items-start gap-4 pb-6"><div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-[#1b4332]"></div><div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center shrink-0 z-10 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg></div><div className="pt-0.5"><div className="font-bold text-slate-800 text-xs sm:text-sm">Reviewed / Verified</div><div className="text-[11px] text-slate-400">Completed</div></div></div><div className="relative flex items-start gap-4 pb-6"><div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-[#1b4332]"></div><div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center shrink-0 z-10 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg></div><div className="pt-0.5"><div className="font-bold text-slate-800 text-xs sm:text-sm">Prioritized</div><div className="text-[11px] text-slate-400">Completed</div></div></div><div className="relative flex items-start gap-4 pb-6"><div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-[#1b4332]"></div><div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center shrink-0 z-10 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg></div><div className="pt-0.5"><div className="font-bold text-slate-800 text-xs sm:text-sm">University Matched</div><div className="text-[11px] text-slate-400">Completed</div></div></div><div className="relative flex items-start gap-4 pb-6"><div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-[#1b4332]"></div><div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center shrink-0 z-10 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg></div><div className="pt-0.5"><div className="font-bold text-slate-800 text-xs sm:text-sm">Project Development</div><div className="text-[11px] text-slate-400">Completed</div></div></div><div className="relative flex items-start gap-4 pb-6"><div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-[#1b4332]"></div><div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center shrink-0 z-10 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg></div><div className="pt-0.5"><div className="font-bold text-slate-800 text-xs sm:text-sm">Prototype</div><div className="text-[11px] text-slate-400">Completed</div></div></div><div className="relative flex items-start gap-4 pb-6"><div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-slate-200"></div><div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center shrink-0 ring-4 ring-emerald-500/25 z-10 shadow-sm"><div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white"></div></div></div><div className="pt-0.5"><div className="font-bold text-slate-900 text-xs sm:text-sm">Field Pilot</div><div className="text-[11px] text-slate-500 font-medium">Current stage</div></div></div><div className="relative flex items-start gap-4 pb-6"><div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-slate-200"></div><div className="w-8 h-8 rounded-full bg-white border border-slate-300 text-slate-400 font-semibold text-xs flex items-center justify-center shrink-0 z-10">9</div><div className="pt-0.5"><div className="font-medium text-slate-600 text-xs sm:text-sm">Citizen Feedback</div><div className="text-[11px] text-slate-400">Upcoming</div></div></div><div className="relative flex items-start gap-4 pb-6"><div className="w-8 h-8 rounded-full bg-white border border-slate-300 text-slate-400 font-semibold text-xs flex items-center justify-center shrink-0 z-10">10</div><div className="pt-0.5"><div className="font-medium text-slate-600 text-xs sm:text-sm">Implemented / Scaled</div><div className="text-[11px] text-slate-400">Upcoming</div></div></div></div></div></div>{/*  VIEW 4: Give Feedback Page  */}<div className="max-w-xl mx-auto space-y-4 pb-12 hidden" data-purpose="give-feedback-view" id="feedback-view"><div className="pt-1"><button className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors group cursor-pointer"  type="button"><svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">Back to Problem</span></button></div>{/*  Summary Card  */}<div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-2"><div className="text-xs font-bold font-mono tracking-wide text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 inline-block" id="feedback-id">JH-C1042</div><h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug" id="feedback-title">Irrigation shortage affecting village farms</h2><div className="flex items-center gap-1 text-xs text-slate-500 font-medium"><svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span id="feedback-location" className="">Gumla, Jharkhand</span></div></div>{/*  Feedback Form Card  */}<div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6"><h3 className="text-base font-bold text-slate-900">Citizen Feedback</h3>{/*  Question 1: Has this problem been solved?  */}<div className="space-y-2.5"><label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">Has this problem been solved?</label><div className="grid grid-cols-3 gap-2.5" id="feedback-status-options"><button type="button"  className="feedback-status-btn py-2.5 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all text-center">Completely</button><button type="button"  className="feedback-status-btn py-2.5 px-3 rounded-xl border border-emerald-600 bg-emerald-50 text-xs sm:text-sm font-semibold text-emerald-800 transition-all text-center">Partially</button><button type="button"  className="feedback-status-btn py-2.5 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all text-center">Not Solved</button></div></div>{/*  Question 2: Satisfaction rating  */}<div className="space-y-2"><label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">Satisfaction rating (optional)</label><div className="flex items-center gap-2" id="star-rating-container"><button type="button"  className="star-btn text-2xl text-amber-500 hover:scale-110 transition-transform" aria-label="1 Star">★</button><button type="button"  className="star-btn text-2xl text-amber-500 hover:scale-110 transition-transform" aria-label="2 Stars">★</button><button type="button"  className="star-btn text-2xl text-amber-500 hover:scale-110 transition-transform" aria-label="3 Stars">★</button><button type="button"  className="star-btn text-2xl text-amber-500 hover:scale-110 transition-transform" aria-label="4 Stars">★</button><button type="button"  className="star-btn text-2xl text-slate-300 hover:scale-110 transition-transform" aria-label="5 Stars">★</button><span className="text-xs font-semibold text-slate-500 ml-2" id="star-rating-label">4 / 5</span></div></div>{/*  Question 3: Share your feedback  */}<div className="space-y-2"><div className="flex items-center justify-between"><label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">Share your feedback</label><span className="text-[11px] text-slate-400 font-medium" id="feedback-char-count">0 / 500</span></div><textarea id="feedback-textarea" rows="4" maxLength="500" oninput="handleFeedbackInput(this)" placeholder="Tell us about your experience with the solution..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 focus:bg-white transition-all leading-relaxed"></textarea></div>{/*  Question 4: Add updated photo/video  */}<div className="space-y-2"><label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">Add updated photo/video (optional)</label><div className="flex items-center gap-3"><button type="button"  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-colors"><svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>Photo</button><button type="button"  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-colors"><svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>Video</button><span className="text-[11px] text-slate-400 font-normal hidden" id="media-attached-indicator">Attachment ready</span></div></div>{/*  Submit Button  */}<div className="pt-2"><button type="button"  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#005d42] hover:bg-[#064e3b] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99]">Submit Feedback</button></div></div></div>{/*  VIEW 5: View Project (Public Status) Page  */}<div className="max-w-xl mx-auto space-y-4 pb-12 hidden" data-purpose="project-status-view" id="project-view"><div className="pt-1"><button className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors group cursor-pointer"  type="button"><svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">Back to Problem</span></button></div>{/*  Project Status Card  */}<div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4"><div className="flex items-center gap-2"><span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80 uppercase tracking-wide flex items-center gap-1.5"><span className="">🎓</span> PROJECT</span><span className="text-xs font-bold font-mono tracking-wide text-slate-500" id="project-code-label">JH-C1042</span></div><h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug" id="project-header-title">Project not yet assigned</h2><div className="flex items-center gap-1 text-xs text-slate-500 font-medium"><svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span id="project-location-label" className="">Gumla, Jharkhand</span></div><div className="pt-2"><div className="flex items-center justify-between text-[11px] font-bold text-slate-500 tracking-wider mb-2"><span className="">OVERALL PROGRESS</span><span className="text-slate-900 text-sm font-bold" id="project-progress-percent">65%</span></div><div className="w-full bg-[#dae2fd]/60 rounded-full h-2.5 overflow-hidden"><div className="bg-[#005d42] h-full rounded-full transition-all duration-500" id="project-progress-fill" style={{"width":"65%"}}></div></div></div></div>{/*  Public Milestones Card  */}<div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4"><h3 className="text-base font-bold text-slate-900">Public Milestones</h3><p className="text-xs sm:text-sm text-slate-500 leading-relaxed" id="project-milestone-text">Milestones will appear once a university project is assigned to this problem.</p><div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/80"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span className="">Private team &amp; industry details are hidden.</span></div></div>{/*  Notify Updates Button  */}<div className="pt-1"><button type="button" id="btn-project-notify"  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm shadow-sm transition-all"><svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg><span id="project-notify-text" className="">Notify me on updates</span></button></div></div>
</main>
{/*  END: ScrollableContent  */}
{/*  BEGIN: Footer  */}
<footer className="border-t border-slate-200 bg-white py-3 px-6 text-xs text-slate-500 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2" data-purpose="page-footer">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
<span className="">Jharkhand State Data &amp; Innovation Framework • Dept. of Information Technology &amp; e-Governance</span>
</div>
<div className="flex items-center gap-4 font-medium text-slate-600">
<a className="hover:text-emerald-700 transition-colors" href="#">Privacy Policy</a>
<span className="">•</span>
<a className="hover:text-emerald-700 transition-colors" href="#">Portal Guidelines</a>
<span className="">•</span>
<span className="text-slate-500">Helpline: <strong className="text-slate-700">1800 - 345 - 6789</strong></span>
</div>
</footer>
{/*  END: Footer  */}
</div>
{/*  END: MainWrapper  */}
</div>
{/*  END: MainContainer  */}
{/*  Action Feedback Toast (For Track Status, View Project, Feedback)  */}
<div className="fixed bottom-14 right-6 z-50 transform transition-all duration-300 pointer-events-none bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 translate-y-20 opacity-0" id="toast-notify">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
<span className="" id="toast-message">Feedback portal opened for ticket JH-C1042. Thank you for your input.</span>
</div>
{/*  BEGIN: ScriptHandlers  */}

{/*  END: ScriptHandlers  */}
    </div>
  );
}
