import React from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { UserCheck, ShieldAlert, Building, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export const GetStartedPage: React.FC = () => {
  const { navigate, switchRole, t } = useApp();

  const handleRoleSelect = (role: Role) => {
    navigate(`/auth/login?role=${role}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Role Selection
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
            Welcome to NammaDhwani — Let's Get You Started
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Select your workspace role to access tailored civic grievance reporting, officer resolution management, or city executive intelligence.
          </p>
        </div>

        {/* Three Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card A: Citizen */}
          <div 
            onClick={() => handleRoleSelect('citizen')}
            className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                👤
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-sans group-hover:text-blue-600 transition-colors">
                I'm a Citizen
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Report civic issues in your area, upload photo/voice evidence, auto-capture GPS, and track verified resolution step-by-step.
              </p>

              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multilingual reporting (7 languages)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI resolution verification check</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Community support & duplicate detect</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-3 bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
              <span>Continue as Citizen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card B: Officer */}
          <div 
            onClick={() => handleRoleSelect('officer')}
            className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                👮
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-sans group-hover:text-emerald-600 transition-colors">
                I'm a Government Officer
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage assigned departmental complaint queues, schedule inspections, upload work completion evidence, and satisfy SLA targets.
              </p>

              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI priority queue & SLA timers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Side-by-side before/after evidence upload</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Recurring issue alert notifications</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 justify-center bg-amber-50 py-1 rounded-md">
                <Lock className="w-3 h-3" /> Department approval required
              </span>
              <button className="w-full py-3 bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                <span>Continue as Officer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card C: Administrator */}
          <div 
            onClick={() => handleRoleSelect('admin')}
            className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-amber-600 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                🏛️
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-sans group-hover:text-amber-600 transition-colors">
                I'm an Administrator
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitor citywide grievance trends, department resolution efficiency, recurring asset risks, and generate AI executive briefings.
              </p>

              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Citywide GIS heatmap & risk pins</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI Executive Briefing Generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Civic Root Cause & Preventive Plan</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 justify-center bg-amber-50 py-1 rounded-md">
                <Lock className="w-3 h-3" /> Admin credentials required
              </span>
              <button className="w-full py-3 bg-amber-600 group-hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                <span>Continue as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Login Alternate */}
        <div className="text-center pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-600 font-medium">
            Already registered with NammaDhwani?{' '}
            <button
              onClick={() => navigate('/auth/login')}
              className="text-blue-600 font-bold hover:underline"
            >
              Log in to your account →
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
