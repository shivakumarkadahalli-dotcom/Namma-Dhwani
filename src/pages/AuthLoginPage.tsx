import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role, Language, DEPARTMENT_OPTIONS, DepartmentOption } from '../types';
import { 
  OFFICER_DEMO_ACCOUNTS, 
  getDemoAccountsByDepartment 
} from '../services/officerAuthService';
import { 
  registerUserBackend, 
  loginUserBackend 
} from '../services/backendAuthService';
import { 
  Building2, 
  LogIn, 
  UserPlus, 
  Lock, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  Sparkles,
  AlertCircle,
  KeyRound,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AuthLoginPageProps {
  defaultRole?: Role;
}

export const AuthLoginPage: React.FC<AuthLoginPageProps> = ({ defaultRole }) => {
  const { navigate, switchRole, loginOfficer, showToast, isAuthenticated, activeRole, language, setLanguage, t } = useApp();

  const [selectedRole, setSelectedRole] = useState<Role>('citizen');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [email, setEmail] = useState('citizen@civicloop.demo');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Sign up fields
  const [fullName, setFullName] = useState('Ananya Sharma');
  const [confirmPassword, setConfirmPassword] = useState('demo123');
  const [preferredLang, setPreferredLang] = useState<Language>(language || 'en');
  const [locationWard, setLocationWard] = useState('Ward 18 (Indiranagar)');

  // Animation & Auth success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Officer Department Selection
  const [selectedOfficerDept, setSelectedOfficerDept] = useState<DepartmentOption>('Roads & Infrastructure');

  const demoAccountsByDept = getDemoAccountsByDepartment();

  // Sync role from URL params or defaultRole prop
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role') as Role;
    const tabParam = params.get('tab');

    if (roleParam && ['citizen', 'officer', 'admin'].includes(roleParam)) {
      setSelectedRole(roleParam);
      updateDefaultCredentials(roleParam, selectedOfficerDept);
    } else if (defaultRole) {
      setSelectedRole(defaultRole);
      updateDefaultCredentials(defaultRole, selectedOfficerDept);
    }

    if (tabParam === 'register' || tabParam === 'signup') {
      setAuthTab('register');
    }
  }, [defaultRole]);

  const updateDefaultCredentials = (role: Role, dept: DepartmentOption = selectedOfficerDept) => {
    setErrorMessage(null);
    if (role === 'citizen') {
      setEmail('citizen@civicloop.demo');
      setPassword('demo123');
    } else if (role === 'officer') {
      const deptAccounts = demoAccountsByDept[dept];
      if (deptAccounts && deptAccounts.length > 0) {
        setEmail(deptAccounts[0].email);
        setPassword(deptAccounts[0].password);
      } else {
        setEmail('anita@namnadhwani.gov.in');
        setPassword('Anita@123');
      }
    } else if (role === 'admin') {
      setEmail('admin@civicloop.demo');
      setPassword('demo123');
    }
  };

  const handleRoleChange = (role: Role, dept?: DepartmentOption) => {
    setSelectedRole(role);
    setAuthTab('login');
    const targetDept = dept || selectedOfficerDept;
    if (dept) setSelectedOfficerDept(dept);
    updateDefaultCredentials(role, targetDept);
  };

  const handleQuickDemoFill = (role: Role, dept?: DepartmentOption) => {
    const targetDept = dept || selectedOfficerDept;
    handleRoleChange(role, targetDept);
    executeLogin(role, targetDept);
  };

  const executeLogin = async (roleToLogin: Role, deptToLogin: DepartmentOption = selectedOfficerDept) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    if (roleToLogin === 'officer') {
      const res = loginOfficer(deptToLogin, email, password);
      setIsSubmitting(false);
      if (res.success && res.officer) {
        setAuthSuccess(true);
        showToast('Authentication Successful', `Welcome, ${res.officer.name} (${res.officer.department})`, 'success');
        setTimeout(() => {
          navigate('/officer/dashboard');
        }, 600);
      } else {
        setErrorMessage(res.error || 'Invalid officer credentials or department.');
        showToast('Authentication Failed', 'Invalid officer credentials or department.', 'error');
      }
      return;
    }

    // Call Supabase / Backend Auth endpoint
    const res = await loginUserBackend(email, password, roleToLogin);
    setIsSubmitting(false);

    if (res.success && res.user) {
      setAuthSuccess(true);
      showToast('Authentication Successful', `Welcome to NammaDhwani, ${res.user.name}`, 'success');
      setTimeout(() => {
        switchRole(roleToLogin, undefined, res.user);
        navigate(`/${roleToLogin}/dashboard`);
      }, 700);
    } else {
      setErrorMessage(res.error || 'Login failed. Please check your credentials.');
      showToast('Authentication Failed', res.error || 'Login failed', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    const res = await registerUserBackend({
      name: fullName,
      email,
      password,
      role: 'citizen',
      ward: locationWard,
    });

    setIsSubmitting(false);

    if (res.success) {
      setAuthSuccess(true);
      showToast('Account Registered', `Welcome, ${res.user?.name || fullName}! Your CivicLoop account is ready.`, 'success');
      setTimeout(() => {
        switchRole('citizen', undefined, res.user);
        navigate('/citizen/dashboard');
      }, 800);
    } else {
      setErrorMessage(res.error || 'Registration failed.');
      showToast('Registration Error', res.error || 'Could not create account', 'error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (selectedRole === 'citizen' && authTab === 'register') {
      handleRegister(e);
    } else {
      e.preventDefault();
      executeLogin(selectedRole, selectedOfficerDept);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      
      {/* Back Button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (isAuthenticated && activeRole) {
              navigate(`/${activeRole}/dashboard`);
            } else {
              navigate('/get-started');
            }
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>
            {isAuthenticated && activeRole
              ? `Back to ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Dashboard`
              : 'Back to Role Selection'}
          </span>
        </button>
      </div>

      {/* Page Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-2 text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-blue-600" /> AI Civic Intelligence
        </div>

        {/* Dynamic Role Headings */}
        {selectedRole === 'citizen' && (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              {t('auth.welcomeBack', 'Welcome back to CivicLoop')}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('auth.citizenDesc', 'Sign in to report, track and resolve civic issues in your community.')}
            </p>
          </>
        )}

        {selectedRole === 'officer' && (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              {t('auth.officerLogin', 'Government Officer Login')}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('auth.officerDesc', 'Sign in to manage assigned civic complaints and field resolution workflows.')}
            </p>
          </>
        )}

        {selectedRole === 'admin' && (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              {t('auth.adminAccess', 'Administrator Access')}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('auth.adminDesc', 'Access city-wide civic intelligence and municipal operations.')}
            </p>
          </>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 space-y-6 relative overflow-hidden">
          
          {/* Success Overlay Animation */}
          {authSuccess && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-30 flex flex-col items-center justify-center space-y-3 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 font-sans">
                Authentication Successful
              </h3>
              <p className="text-xs text-slate-600">
                Opening your <span className="font-bold text-blue-600 uppercase">{selectedRole}</span> workspace...
              </p>
            </div>
          )}

          {/* Workspace Switch Banner */}
          {isAuthenticated && activeRole && activeRole !== selectedRole && (
            <div className="bg-amber-50 border border-amber-200/90 p-3.5 rounded-xl text-xs text-amber-900 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-800 shrink-0">Workspace Switch:</span>
                <span className="text-slate-700">
                  You're switching from <strong className="capitalize text-slate-900">{activeRole} Workspace</strong> to <strong className="capitalize text-amber-900">{selectedRole} Workspace</strong>.
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/${activeRole}/dashboard`)}
                className="ml-2 text-[11px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Authentication Failed</span>
                <span className="text-[11px] text-rose-700">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Quick Demo Login Bar */}
          <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
              <span className="font-sans">⚡ Quick One-Click Demo Auth:</span>
              <span className="text-[10px] text-blue-600 font-normal">Pre-verified accounts</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('citizen')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedRole === 'citizen' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                👤 Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('officer')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedRole === 'officer' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                👮 Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('admin')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedRole === 'admin' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                🏛️ Admin
              </button>
            </div>
          </div>

          {/* Role Selection Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Workspace Role
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleRoleChange('citizen')}
                className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  selectedRole === 'citizen' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👤 Citizen</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('officer')}
                className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  selectedRole === 'officer' ? 'bg-white text-emerald-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👮 Officer</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  selectedRole === 'admin' ? 'bg-white text-amber-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🏛️ Admin</span>
              </button>
            </div>
          </div>

          {/* Department / Restrict Notices for Officer and Admin */}
          {selectedRole === 'officer' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">🔒 Department Officer Account Access</span>
                  <span className="text-[11px] text-emerald-700">Officers are strictly authorized to view & manage complaints within their assigned department.</span>
                </div>
              </div>

              {/* Department Account Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Assigned Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedOfficerDept}
                    onChange={(e) => {
                      const newDept = e.target.value as DepartmentOption;
                      setSelectedOfficerDept(newDept);
                      updateDefaultCredentials('officer', newDept);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-300 bg-white text-slate-900 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept} Officer Portal
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Demo Credentials Quick-Fill Selector */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Demo Accounts in {selectedOfficerDept}</span>
                    {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-[10px] text-slate-500">Click to fill</span>
                </div>

                {showDemoAccounts && (
                  <div className="space-y-1.5 pt-1">
                    {(demoAccountsByDept[selectedOfficerDept] || []).map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          setEmail(acc.email);
                          setPassword(acc.password);
                          setErrorMessage(null);
                        }}
                        className="bg-white border border-slate-200 hover:border-emerald-500 p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors shadow-2xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{acc.name}</p>
                          <p className="text-[10px] text-slate-500">{acc.email} • pass: <span className="font-mono font-bold text-emerald-600">{acc.password}</span></p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Use</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedRole === 'admin' && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">🔒 Restricted Administrative Access</span>
                <span className="text-[11px] text-amber-700">Admin credentials required for city executive intelligence.</span>
              </div>
            </div>
          )}

          {/* Login vs Create Account Sub-Tabs for Citizen */}
          {selectedRole === 'citizen' && (
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`pb-2.5 px-4 text-xs font-bold transition-colors border-b-2 ${
                  authTab === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className={`pb-2.5 px-4 text-xs font-bold transition-colors border-b-2 ${
                  authTab === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* FORM: Citizen Sign In / Officer Login / Admin Login */}
          {(authTab === 'login' || selectedRole !== 'citizen') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {selectedRole === 'officer' ? 'Official Email / Employee ID' : selectedRole === 'admin' ? 'Admin ID / Official Email' : 'Email / Mobile Number'}
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'officer' ? 'officer@civicloop.demo' : selectedRole === 'admin' ? 'admin@civicloop.demo' : 'citizen@civicloop.demo'}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  {selectedRole === 'citizen' && (
                    <button
                      type="button"
                      onClick={() => navigate('/auth/reset-password')}
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {selectedRole === 'citizen' && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span>Remember me</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 ${
                  selectedRole === 'officer'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : selectedRole === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Authenticating...'
                    : selectedRole === 'officer'
                    ? 'Sign In as Officer →'
                    : selectedRole === 'admin'
                    ? 'Sign In as Administrator →'
                    : 'Sign In as Citizen →'}
                </span>
              </button>
            </form>
          )}

          {/* FORM: Citizen Sign Up */}
          {selectedRole === 'citizen' && authTab === 'register' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email / Mobile Number
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('auth.preferredLang', 'Preferred Language')}
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => {
                      const newLang = e.target.value as Language;
                      setPreferredLang(newLang);
                      setLanguage(newLang);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs bg-white cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="ml">മലയാളം (Malayalam)</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t('auth.locationWard', 'Location / Ward')}
                  </label>
                  <input
                    type="text"
                    value={locationWard}
                    onChange={(e) => setLocationWard(e.target.value)}
                    placeholder={t('auth.locationWardPlaceholder', 'e.g. Ward 18 (Indiranagar)')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? t('auth.creating', 'Creating Account...') : t('auth.createAccountBtn', 'Create Citizen Account →')}</span>
              </button>
            </form>
          )}

          {/* Footer toggle prompt */}
          <div className="pt-2 text-center border-t border-slate-100">
            {selectedRole === 'citizen' && authTab === 'login' && (
              <p className="text-xs text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Create one
                </button>
              </p>
            )}

            {selectedRole === 'citizen' && authTab === 'register' && (
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthTab('login')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Log in
                </button>
              </p>
            )}

            {selectedRole !== 'citizen' && (
              <p className="text-xs text-slate-600">
                Need to switch role workspace?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/get-started')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Role Selection →
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
