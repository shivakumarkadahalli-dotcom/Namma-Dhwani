import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEPARTMENT_OPTIONS, DepartmentOption } from '../types';
import { 
  OFFICER_DEMO_ACCOUNTS, 
  getDemoAccountsByDepartment, 
  authenticateOfficerCredentials 
} from '../services/officerAuthService';
import { 
  Lock, 
  ShieldCheck, 
  Building2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  ChevronDown, 
  ChevronUp,
  UserCheck,
  ArrowRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface OfficerLoginScreenProps {
  initialDepartment?: string;
  onSuccess?: () => void;
}

export const OfficerLoginScreen: React.FC<OfficerLoginScreenProps> = ({ 
  initialDepartment = 'Roads & Infrastructure',
  onSuccess
}) => {
  const { navigate, loginOfficer, showToast } = useApp();

  const [department, setDepartment] = useState<string>(initialDepartment);
  const [email, setEmail] = useState<string>('anita@namnadhwani.gov.in');
  const [password, setPassword] = useState<string>('Anita@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authSuccess, setAuthSuccess] = useState<boolean>(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState<boolean>(true);
  const [selectedDemoDeptTab, setSelectedDemoDeptTab] = useState<string>(initialDepartment);

  const demoAccountsByDept = getDemoAccountsByDepartment();

  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    setSelectedDemoDeptTab(newDept);
    setErrorMessage(null);

    // Pick first demo account in that department for convenience
    const deptAccounts = demoAccountsByDept[newDept];
    if (deptAccounts && deptAccounts.length > 0) {
      setEmail(deptAccounts[0].email);
      setPassword(deptAccounts[0].password);
    }
  };

  const handleFillCredentials = (acc: typeof OFFICER_DEMO_ACCOUNTS[0]) => {
    setDepartment(acc.department);
    setSelectedDemoDeptTab(acc.department);
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMessage(null);
    showToast('Credentials Loaded', `Loaded credentials for ${acc.name} (${acc.department})`, 'info');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!department) {
      setErrorMessage('Please select a municipal department.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both officer email and password.');
      return;
    }

    setIsSubmitting(true);

    // Realistic authentication delay
    setTimeout(() => {
      setIsSubmitting(false);

      const result = loginOfficer(department, email, password);

      if (result.success && result.officer) {
        setAuthSuccess(true);
        showToast('Login Successful', `Welcome, ${result.officer.name} (${result.officer.department})`, 'success');
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/officer/dashboard');
          }
        }, 500);
      } else {
        setErrorMessage(result.error || 'Invalid officer credentials or department.');
        showToast('Authentication Failed', 'Invalid officer credentials or department.', 'error');
      }
    }, 450);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Header & Back Navigation */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
            <Lock className="w-3 h-3 text-emerald-400" /> Municipal Duty Login
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
        
        {/* Card Box */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Title & Branding */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Municipal Officer Authentication
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Secure duty access for authorized field engineers and municipal inspectors. Enter your department credentials to access your assigned queue.
            </p>
          </div>

          {/* Success Overlay Animation */}
          {authSuccess && (
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xs z-30 flex flex-col items-center justify-center space-y-3 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-white font-sans">
                LOGIN SUCCESSFUL
              </h3>
              <p className="text-xs text-slate-300">
                Opening authenticated officer workspace...
              </p>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-100">Authentication Failed</p>
                <p className="text-rose-300 mt-0.5 text-[11px]">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Department Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Department <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden cursor-pointer"
                  disabled={isSubmitting}
                >
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Officer Email <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. anita@namnadhwani.gov.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden font-mono"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password <span className="text-emerald-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500">Case-sensitive</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter officer password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden font-mono"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Open Officer Workspace</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Expandable Card */}
          <div className="border-t border-slate-800/80 pt-5">
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Demo Credentials (Judges Quick Reference)</span>
                  {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[10px] text-slate-500 font-semibold">15 Officer Accounts</span>
              </div>

              {showDemoAccounts && (
                <div className="space-y-3 pt-2 text-xs">
                  {/* Department Tab Pills */}
                  <div className="flex flex-wrap gap-1 pb-1 border-b border-slate-800">
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDemoDeptTab(d)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          selectedDemoDeptTab === d
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {d.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Officers in Selected Department */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {(demoAccountsByDept[selectedDemoDeptTab] || []).map((acc) => (
                      <div
                        key={acc.id}
                        className="bg-slate-900/90 border border-slate-800/80 hover:border-emerald-700/60 p-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs truncate">{acc.name}</span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                              {acc.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{acc.designation}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-300 font-mono">
                            <span>Email: <strong className="text-slate-100">{acc.email}</strong></span>
                            <span>Pass: <strong className="text-emerald-300">{acc.password}</strong></span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleFillCredentials(acc)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer self-end sm:self-center"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Fill Credentials</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Security Notice */}
        <div className="text-center text-slate-500 text-xs">
          <p>
            🔒 Department isolation active: Officers can only inspect grievances within their municipal department.
          </p>
        </div>

      </div>
    </div>
  );
};
