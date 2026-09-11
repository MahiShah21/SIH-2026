import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Key, 
  UserPlus, 
  LogIn, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { loginWithCredentials, quickDemoLogin, registerUser } = useAuth();
  
  // Tab: 'login' or 'register'
  const [authMode, setAuthMode] = useState('login');
  
  // Selected role for login
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'otp'
  
  // Login Form States
  const [identifierInput, setIdentifierInput] = useState('citizen@jansetu.gov.in');
  const [passwordInput, setPasswordInput] = useState('Password@123');
  const [otpInput, setOtpInput] = useState('123456');
  
  // Registration Form States
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'citizen',
    organizationOrDistrict: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedGovOfficer, setSelectedGovOfficer] = useState(0);

  // 3 Fixed Confidential Government / IAS Officer Accounts
  const confidentialGovOfficers = [
    {
      id: 'usr_admin_01',
      name: 'Dr. Sunita Murmu, IAS',
      title: 'Principal Secretary & State Innovation Director',
      department: 'State Innovation Directorate, Govt. of Jharkhand',
      email: 'admin@jansetu.gov.in',
      phone: '9876543213',
      badge: 'State HQ'
    },
    {
      id: 'usr_admin_02',
      name: 'Shri Manoj Kumar, IAS',
      title: 'State R&D Nodal Officer & Joint Secretary',
      department: 'Dept. of Higher & Technical Education',
      email: 'nodal.rnd@jansetu.gov.in',
      phone: '9876543214',
      badge: 'Higher Ed'
    },
    {
      id: 'usr_admin_03',
      name: 'Smt. Prerna Dixit, IAS',
      title: 'District Collector & District Magistrate',
      department: 'District Administration, Gumla',
      email: 'dc.gumla@jansetu.gov.in',
      phone: '9876543215',
      badge: 'District DM'
    }
  ];

  // 4 Standard Dashboards with direct credentials
  const dashboards = [
    {
      role: 'citizen',
      title: 'Citizen Dashboard',
      subtitle: 'Civic complaints, real map tracker & community projects',
      icon: Users,
      email: 'citizen@jansetu.gov.in',
      phone: '9876543210',
      color: 'amber',
      accent: 'border-amber-400 bg-amber-50/70 text-amber-900 ring-amber-400',
      badge: 'Citizen Portal'
    },
    {
      role: 'university',
      title: 'University Dashboard',
      subtitle: 'R&D grand challenges, proposals & academia-gov co-lab',
      icon: GraduationCap,
      email: 'university@jansetu.gov.in',
      phone: '9876543211',
      color: 'indigo',
      accent: 'border-indigo-400 bg-indigo-50/70 text-indigo-900 ring-indigo-400',
      badge: 'University Hub'
    },
    {
      role: 'industry',
      title: 'Industry Dashboard',
      subtitle: 'CSR co-funding, tech commercialization & AI matching',
      icon: Building2,
      email: 'industry@jansetu.gov.in',
      phone: '9876543212',
      color: 'emerald',
      accent: 'border-emerald-400 bg-emerald-50/70 text-emerald-900 ring-emerald-400',
      badge: 'Industry CSR'
    },
    {
      role: 'admin',
      title: 'Government Dashboard',
      subtitle: 'Confidential IAS officer AI triage, approvals & SLA dispatch',
      icon: ShieldCheck,
      email: 'admin@jansetu.gov.in',
      phone: '9876543213',
      color: 'teal',
      accent: 'border-teal-500 bg-teal-50/70 text-teal-900 ring-teal-500',
      badge: '🔒 Restricted'
    }
  ];

  // Quick Role selection autofills login fields
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMsg('');
    if (roleId === 'admin') {
      const officer = confidentialGovOfficers[selectedGovOfficer] || confidentialGovOfficers[0];
      setIdentifierInput(loginMethod === 'otp' ? officer.phone : officer.email);
    } else {
      const target = dashboards.find(d => d.role === roleId);
      if (target) {
        if (loginMethod === 'otp') {
          setIdentifierInput(target.phone);
        } else {
          setIdentifierInput(target.email);
        }
      }
    }
    setPasswordInput('Password@123');
    setOtpInput('123456');
  };

  // Select a specific confidential Government Officer
  const handleGovOfficerSelect = (index) => {
    setSelectedGovOfficer(index);
    setSelectedRole('admin');
    setErrorMsg('');
    const officer = confidentialGovOfficers[index];
    if (officer) {
      setIdentifierInput(loginMethod === 'otp' ? officer.phone : officer.email);
      setPasswordInput('Password@123');
      setOtpInput('123456');
    }
  };

  // Direct 1-Click Login
  const handleDirectLogin = async (roleId) => {
    setSelectedRole(roleId);
    setLoading(true);
    setErrorMsg('');
    try {
      const destination = await quickDemoLogin(roleId);
      setLoading(false);
      navigate(destination);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Login failed. Please try again.');
    }
  };

  // Submit Login Form
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const destination = await loginWithCredentials({
        identifier: identifierInput,
        email: identifierInput,
        phone: identifierInput,
        password: loginMethod === 'email' ? passwordInput : undefined,
        otp: loginMethod === 'otp' ? otpInput : undefined,
        role: selectedRole
      });
      setLoading(false);
      navigate(destination);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Invalid credentials. Please verify or use 1-Click Demo.');
    }
  };

  // Submit Registration Form
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.password) {
      setErrorMsg('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await registerUser(regForm);
      setLoading(false);
      if (typeof result === 'string') {
        setSuccessMsg('Account registered successfully! Redirecting...');
        setTimeout(() => navigate(result), 800);
      } else if (result?.error) {
        setErrorMsg(result.error);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 flex items-center justify-center text-white font-bold shadow-sm">
            <Sparkles className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-slate-900 tracking-tight text-lg">JanSetu</span>
              <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded border border-teal-200">
                Government of Jharkhand
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">State Innovation, R&amp;D &amp; Citizen Problem Resolution Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <LanguageSwitcher />

          <Link
            to="/public/challenges"
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 px-3.5 py-1.5 rounded-lg border border-teal-200 transition-all flex items-center gap-1.5"
          >
            <span>Explore Public Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl my-4">
          
          {/* Top Banner */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 border border-teal-300/80 text-teal-900 text-xs font-bold mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Single Sign-On (SSO) &amp; Multi-Dashboard Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select Your <span className="text-teal-700">Dashboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-1">
              Choose one of the 4 verified dashboard portals below or create a new custom account.
            </p>
          </div>

          {/* 4 Dashboard Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            {dashboards.map((dash) => {
              const Icon = dash.icon;
              const isSelected = selectedRole === dash.role && authMode === 'login';
              return (
                <div
                  key={dash.role}
                  onClick={() => {
                    setAuthMode('login');
                    handleRoleSelect(dash.role);
                  }}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative flex flex-col justify-between ${
                    isSelected
                      ? `${dash.accent} shadow-md ring-2`
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        dash.role === 'citizen' ? 'bg-amber-100 text-amber-800' :
                        dash.role === 'university' ? 'bg-indigo-100 text-indigo-800' :
                        dash.role === 'industry' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-teal-100 text-teal-800'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {dash.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900">{dash.title}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                      {dash.subtitle}
                    </p>
                  </div>

                  {/* Credentials Box */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80">
                    <div className="bg-slate-50 p-2 rounded-lg text-[11px] font-mono text-slate-600 space-y-0.5 border border-slate-200/60">
                      <div className="truncate font-semibold text-slate-800">📧 {dash.email}</div>
                      <div>🔒 Password@123</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectLogin(dash.role);
                      }}
                      className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-teal-800 text-white font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>1-Click Enter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Login / Register Container */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-200">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-center border-b border-slate-200 pb-4 mb-5">
              <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-teal-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-teal-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create New Account (Sign Up)</span>
                </button>
              </div>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Confidential Government Officer Switcher Banner */}
                {selectedRole === 'admin' && (
                  <div className="p-3.5 rounded-xl bg-teal-50/90 border border-teal-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                        <ShieldCheck className="w-4 h-4 text-teal-700" />
                        <span>Confidential Pre-Authorized Government Credentials (Select Officer):</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-200/70 text-teal-950 uppercase tracking-wide">
                        3 Fixed Accounts
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {confidentialGovOfficers.map((officer, idx) => {
                        const isOfficerSelected = selectedGovOfficer === idx && identifierInput.includes(officer.email.split('@')[0]);
                        return (
                          <button
                            key={officer.id}
                            type="button"
                            onClick={() => handleGovOfficerSelect(idx)}
                            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isOfficerSelected
                                ? 'bg-white border-teal-600 shadow-xs ring-2 ring-teal-500/20'
                                : 'bg-white/70 hover:bg-white border-teal-200/80 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900 line-clamp-1">{officer.name}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                                {officer.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">{officer.title}</p>
                            <p className="text-[10px] font-mono text-teal-700 font-semibold mt-1 truncate">📧 {officer.email}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Entering as: <strong className="text-teal-700">{dashboards.find(d => d.role === selectedRole)?.title}</strong>
                  </span>
                  
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod('email');
                        if (selectedRole === 'admin') {
                          const target = confidentialGovOfficers[selectedGovOfficer] || confidentialGovOfficers[0];
                          setIdentifierInput(target.email);
                        } else {
                          const target = dashboards.find(d => d.role === selectedRole);
                          if (target) setIdentifierInput(target.email);
                        }
                      }}
                      className={`px-3 py-1 rounded-md transition cursor-pointer ${
                        loginMethod === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod('otp');
                        if (selectedRole === 'admin') {
                          const target = confidentialGovOfficers[selectedGovOfficer] || confidentialGovOfficers[0];
                          setIdentifierInput(target.phone);
                        } else {
                          const target = dashboards.find(d => d.role === selectedRole);
                          if (target) setIdentifierInput(target.phone);
                        }
                      }}
                      className={`px-3 py-1 rounded-md transition cursor-pointer ${
                        loginMethod === 'otp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Mobile / OTP
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {loginMethod === 'email' ? 'Registered Email Address' : '10-Digit Mobile Number'}
                    </label>
                    <div className="relative">
                      {loginMethod === 'email' ? (
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      ) : (
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      )}
                      <input
                        type="text"
                        value={identifierInput}
                        onChange={(e) => setIdentifierInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
                        placeholder={loginMethod === 'email' ? 'user@jansetu.gov.in' : '9876543210'}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {loginMethod === 'email' ? 'Account Password' : '6-Digit OTP Code'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      {loginMethod === 'email' ? (
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
                          placeholder="Password@123"
                          required
                        />
                      ) : (
                        <input
                          type="text"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
                          placeholder="123456"
                          required
                        />
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 hover:from-teal-800 hover:to-black text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Authenticating with Neon PostgreSQL...</span>
                    </span>
                  ) : (
                    <>
                      <span>Enter {dashboards.find(d => d.role === selectedRole)?.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* REGISTRATION FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Confidentiality Warning Banner */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Public Registration Scope:</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Citizens, Academic Researchers, and Industry CSR Partners can create new self-registered accounts. Government Officer credentials are pre-authorized and strictly confidential.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                        placeholder="e.g. Alok Verma"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Role / Portal Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={regForm.role}
                      onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    >
                      <option value="citizen">Citizen Innovator (Citizen Portal)</option>
                      <option value="university">University Researcher / Faculty (University Hub)</option>
                      <option value="industry">Industry / CSR Partner (Industry CSR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                        placeholder="e.g. user@organization.in"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 font-mono"
                        placeholder="e.g. 9812345678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization / District Name
                    </label>
                    <input
                      type="text"
                      value={regForm.organizationOrDistrict}
                      onChange={(e) => setRegForm({ ...regForm, organizationOrDistrict: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                      placeholder="e.g. Ranchi District or BIT Mesra"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                        placeholder="Minimum 6 characters"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Account in Neon Database...</span>
                    </span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Register &amp; Enter Dashboard</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-3.5 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <p>© 2026 Government of Jharkhand • JanSetu State Innovation Network • All portals integrated via Neon PostgreSQL</p>
      </footer>
    </div>
  );
}
